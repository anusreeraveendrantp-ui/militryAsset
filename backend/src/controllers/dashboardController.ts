import { Response } from 'express';
import { AuthRequest } from '../types';
import prisma from '../lib/prisma';

export const getMetrics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { baseId: queryBaseId, startDate, endDate, equipmentTypeId } = req.query;

    // Determine which base(s) to query
    let baseFilter: { baseId?: string } = {};
    if (req.user!.role !== 'ADMIN') {
      baseFilter = { baseId: req.user!.baseId! };
    } else if (queryBaseId) {
      baseFilter = { baseId: queryBaseId as string };
    }

    const dateFilter =
      startDate && endDate
        ? {
            gte: new Date(startDate as string),
            lte: new Date(endDate as string),
          }
        : undefined;

    const equipmentFilter = equipmentTypeId ? { equipmentTypeId: equipmentTypeId as string } : {};

    // Total purchases
    const purchasesAgg = await prisma.purchase.aggregate({
      _sum: { quantity: true },
      where: {
        ...baseFilter,
        ...equipmentFilter,
        ...(dateFilter ? { purchaseDate: dateFilter } : {}),
      },
    });

    // Transfers In
    const transfersInAgg = await prisma.transfer.aggregate({
      _sum: { quantity: true },
      where: {
        toBaseId: baseFilter.baseId,
        ...equipmentFilter,
        status: 'COMPLETED',
        ...(dateFilter ? { transferDate: dateFilter } : {}),
      },
    });

    // Transfers Out
    const transfersOutAgg = await prisma.transfer.aggregate({
      _sum: { quantity: true },
      where: {
        fromBaseId: baseFilter.baseId,
        ...equipmentFilter,
        status: 'COMPLETED',
        ...(dateFilter ? { transferDate: dateFilter } : {}),
      },
    });

    // Assigned count
    const assignedAgg = await prisma.assignment.aggregate({
      _sum: { quantity: true },
      where: {
        ...baseFilter,
        ...equipmentFilter,
        status: 'ASSIGNED',
      },
    });

    // Expended count
    const expendedAgg = await prisma.expenditure.aggregate({
      _sum: { quantity: true },
      where: {
        ...baseFilter,
        ...equipmentFilter,
        ...(dateFilter ? { expenditureDate: dateFilter } : {}),
      },
    });

    const purchases = purchasesAgg._sum.quantity ?? 0;
    const transfersIn = transfersInAgg._sum.quantity ?? 0;
    const transfersOut = transfersOutAgg._sum.quantity ?? 0;
    const assigned = assignedAgg._sum.quantity ?? 0;
    const expended = expendedAgg._sum.quantity ?? 0;
    const netMovement = purchases + transfersIn - transfersOut;

    // Opening balance (before start date) — sum of all purchases + transfers before period
    let openingBalance = 0;
    if (dateFilter) {
      const obPurchases = await prisma.purchase.aggregate({
        _sum: { quantity: true },
        where: {
          ...baseFilter,
          ...equipmentFilter,
          purchaseDate: { lt: new Date(startDate as string) },
        },
      });
      const obTransfersIn = await prisma.transfer.aggregate({
        _sum: { quantity: true },
        where: {
          toBaseId: baseFilter.baseId,
          ...equipmentFilter,
          status: 'COMPLETED',
          transferDate: { lt: new Date(startDate as string) },
        },
      });
      const obTransfersOut = await prisma.transfer.aggregate({
        _sum: { quantity: true },
        where: {
          fromBaseId: baseFilter.baseId,
          ...equipmentFilter,
          status: 'COMPLETED',
          transferDate: { lt: new Date(startDate as string) },
        },
      });
      const obExpended = await prisma.expenditure.aggregate({
        _sum: { quantity: true },
        where: {
          ...baseFilter,
          ...equipmentFilter,
          expenditureDate: { lt: new Date(startDate as string) },
        },
      });
      openingBalance =
        (obPurchases._sum.quantity ?? 0) +
        (obTransfersIn._sum.quantity ?? 0) -
        (obTransfersOut._sum.quantity ?? 0) -
        (obExpended._sum.quantity ?? 0);
    }

    const closingBalance = openingBalance + netMovement - expended;

    res.json({
      openingBalance,
      closingBalance,
      netMovement,
      purchases,
      transfersIn,
      transfersOut,
      assigned,
      expended,
    });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getNetMovementByBase = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { baseId } = req.params;
    const { startDate, endDate } = req.query;

    // Scope check
    if (req.user!.role !== 'ADMIN' && req.user!.baseId !== baseId) {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }

    const dateFilter =
      startDate && endDate
        ? { gte: new Date(startDate as string), lte: new Date(endDate as string) }
        : undefined;

    // Group purchases by equipment type
    const purchasesByType = await prisma.purchase.groupBy({
      by: ['equipmentTypeId'],
      _sum: { quantity: true },
      where: {
        baseId,
        ...(dateFilter ? { purchaseDate: dateFilter } : {}),
      },
    });

    const transfersInByType = await prisma.transfer.groupBy({
      by: ['equipmentTypeId'],
      _sum: { quantity: true },
      where: {
        toBaseId: baseId,
        status: 'COMPLETED',
        ...(dateFilter ? { transferDate: dateFilter } : {}),
      },
    });

    const transfersOutByType = await prisma.transfer.groupBy({
      by: ['equipmentTypeId'],
      _sum: { quantity: true },
      where: {
        fromBaseId: baseId,
        status: 'COMPLETED',
        ...(dateFilter ? { transferDate: dateFilter } : {}),
      },
    });

    const expendituresByType = await prisma.expenditure.groupBy({
      by: ['equipmentTypeId'],
      _sum: { quantity: true },
      where: {
        baseId,
        ...(dateFilter ? { expenditureDate: dateFilter } : {}),
      },
    });

    const equipmentTypes = await prisma.equipmentType.findMany();

    const result = equipmentTypes.map((et) => {
      const purchases = purchasesByType.find((p) => p.equipmentTypeId === et.id)?._sum.quantity ?? 0;
      const transfersIn =
        transfersInByType.find((t) => t.equipmentTypeId === et.id)?._sum.quantity ?? 0;
      const transfersOut =
        transfersOutByType.find((t) => t.equipmentTypeId === et.id)?._sum.quantity ?? 0;
      const expended =
        expendituresByType.find((e) => e.equipmentTypeId === et.id)?._sum.quantity ?? 0;
      const netMovement = purchases + transfersIn - transfersOut;

      return {
        equipmentTypeId: et.id,
        equipmentTypeName: et.name,
        category: et.category,
        purchases,
        transfersIn,
        transfersOut,
        expended,
        netMovement,
        closingBalance: netMovement - expended,
      };
    });

    res.json(result.filter((r) => r.purchases > 0 || r.transfersIn > 0 || r.transfersOut > 0));
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
};
