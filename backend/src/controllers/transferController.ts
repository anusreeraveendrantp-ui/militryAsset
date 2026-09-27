import { Response } from 'express';
import { AuthRequest } from '../types';
import prisma from '../lib/prisma';

export const list = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { baseId, equipmentTypeId, status, startDate, endDate, page = '1', limit = '20' } = req.query;

    const where: Record<string, unknown> = {};

    if (req.user!.role !== 'ADMIN') {
      where.OR = [{ fromBaseId: req.user!.baseId }, { toBaseId: req.user!.baseId }];
    } else if (baseId) {
      where.OR = [{ fromBaseId: baseId }, { toBaseId: baseId }];
    }

    if (equipmentTypeId) where.equipmentTypeId = equipmentTypeId;
    if (status) where.status = status;

    if (startDate && endDate) {
      where.transferDate = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string),
      };
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const [transfers, total] = await Promise.all([
      prisma.transfer.findMany({
        where,
        include: {
          fromBase: { select: { id: true, name: true } },
          toBase: { select: { id: true, name: true } },
          equipmentType: { select: { id: true, name: true, category: true } },
          creator: { select: { id: true, username: true } },
        },
        orderBy: { transferDate: 'desc' },
        skip,
        take: parseInt(limit as string),
      }),
      prisma.transfer.count({ where }),
    ]);

    res.json({ data: transfers, total, page: parseInt(page as string), limit: parseInt(limit as string) });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const create = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { equipmentTypeId, quantity, fromBaseId, toBaseId, transferDate } = req.body;

    const effectiveFromBaseId = req.user!.role !== 'ADMIN' ? req.user!.baseId! : fromBaseId;

    if (effectiveFromBaseId === toBaseId) {
      res.status(400).json({ message: 'Source and destination base cannot be the same' });
      return;
    }

    const transfer = await prisma.transfer.create({
      data: {
        equipmentTypeId,
        quantity: parseInt(quantity),
        fromBaseId: effectiveFromBaseId,
        toBaseId,
        transferDate: new Date(transferDate),
        status: 'PENDING',
        createdBy: req.user!.id,
      },
      include: {
        fromBase: { select: { id: true, name: true } },
        toBase: { select: { id: true, name: true } },
        equipmentType: { select: { id: true, name: true, category: true } },
        creator: { select: { id: true, username: true } },
      },
    });

    res.status(201).json(transfer);
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const complete = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const transfer = await prisma.transfer.findUnique({ where: { id: req.params.id } });

    if (!transfer) {
      res.status(404).json({ message: 'Transfer not found' });
      return;
    }

    if (transfer.status !== 'PENDING') {
      res.status(400).json({ message: `Transfer is already ${transfer.status}` });
      return;
    }

    const updated = await prisma.transfer.update({
      where: { id: req.params.id },
      data: { status: 'COMPLETED' },
      include: {
        fromBase: { select: { id: true, name: true } },
        toBase: { select: { id: true, name: true } },
        equipmentType: { select: { id: true, name: true, category: true } },
      },
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const cancel = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const transfer = await prisma.transfer.findUnique({ where: { id: req.params.id } });

    if (!transfer) {
      res.status(404).json({ message: 'Transfer not found' });
      return;
    }

    if (transfer.status !== 'PENDING') {
      res.status(400).json({ message: `Transfer is already ${transfer.status}` });
      return;
    }

    const updated = await prisma.transfer.update({
      where: { id: req.params.id },
      data: { status: 'CANCELLED' },
      include: {
        fromBase: { select: { id: true, name: true } },
        toBase: { select: { id: true, name: true } },
        equipmentType: { select: { id: true, name: true, category: true } },
      },
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
};
