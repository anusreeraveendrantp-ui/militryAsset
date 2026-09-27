import { Response } from 'express';
import { AuthRequest } from '../types';
import prisma from '../lib/prisma';

export const list = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { baseId, equipmentTypeId, status, page = '1', limit = '20' } = req.query;

    const where: Record<string, unknown> = {};

    if (req.user!.role !== 'ADMIN') {
      where.baseId = req.user!.baseId;
    } else if (baseId) {
      where.baseId = baseId;
    }

    if (equipmentTypeId) where.equipmentTypeId = equipmentTypeId;
    if (status) where.status = status;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const [assignments, total] = await Promise.all([
      prisma.assignment.findMany({
        where,
        include: {
          base: { select: { id: true, name: true } },
          equipmentType: { select: { id: true, name: true, category: true } },
          creator: { select: { id: true, username: true } },
        },
        orderBy: { assignedDate: 'desc' },
        skip,
        take: parseInt(limit as string),
      }),
      prisma.assignment.count({ where }),
    ]);

    res.json({ data: assignments, total, page: parseInt(page as string), limit: parseInt(limit as string) });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const create = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { baseId, equipmentTypeId, assignedTo, quantity, assignedDate } = req.body;

    const effectiveBaseId = req.user!.role !== 'ADMIN' ? req.user!.baseId! : baseId;

    const assignment = await prisma.assignment.create({
      data: {
        baseId: effectiveBaseId,
        equipmentTypeId,
        assignedTo,
        quantity: parseInt(quantity),
        assignedDate: new Date(assignedDate),
        status: 'ASSIGNED',
        createdBy: req.user!.id,
      },
      include: {
        base: { select: { id: true, name: true } },
        equipmentType: { select: { id: true, name: true, category: true } },
        creator: { select: { id: true, username: true } },
      },
    });

    res.status(201).json(assignment);
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    const validStatuses = ['ASSIGNED', 'RETURNED', 'EXPENDED'];

    if (!validStatuses.includes(status)) {
      res.status(400).json({ message: 'Invalid status' });
      return;
    }

    const assignment = await prisma.assignment.findUnique({ where: { id: req.params.id } });
    if (!assignment) {
      res.status(404).json({ message: 'Assignment not found' });
      return;
    }

    if (req.user!.role !== 'ADMIN' && assignment.baseId !== req.user!.baseId) {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }

    const updated = await prisma.assignment.update({
      where: { id: req.params.id },
      data: { status },
      include: {
        base: { select: { id: true, name: true } },
        equipmentType: { select: { id: true, name: true, category: true } },
      },
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
};
