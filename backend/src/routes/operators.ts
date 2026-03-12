import { Router } from 'express';
import prisma from '../prisma';

const router = Router();

// GET all operators
router.get('/', async (req, res) => {
  try {
    const operators = await prisma.operator.findMany({
      include: {
        machine: true,
      },
      orderBy: { name: 'asc' },
    });
    res.json(operators);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch operators' });
  }
});

// GET single operator
router.get('/:id', async (req, res) => {
  try {
    const operator = await prisma.operator.findUnique({
      where: { id: req.params.id },
      include: {
        machine: true,
      },
    });
    if (!operator) {
      return res.status(404).json({ error: 'Operator not found' });
    }
    res.json(operator);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch operator' });
  }
});

// POST create operator
router.post('/', async (req, res) => {
  try {
    const { name, phone, shift, machineId, isActive } = req.body;
    const operator = await prisma.operator.create({
      data: {
        name,
        phone,
        shift: shift || 'DAY',
        machineId: machineId || null,
        isActive
      },
      include: {
        machine: true,
      },
    });
    res.status(201).json(operator);
  } catch (error) {
    console.error('Failed to create operator:', error);
    res.status(500).json({ error: 'Failed to create operator' });
  }
});

// PUT update operator
router.put('/:id', async (req, res) => {
  try {
    const { name, phone, shift, machineId, isActive } = req.body;
    const operator = await prisma.operator.update({
      where: { id: req.params.id },
      data: {
        name,
        phone,
        shift,
        machineId: machineId || null,
        isActive
      },
      include: {
        machine: true,
      },
    });
    res.json(operator);
  } catch (error) {
    console.error('Failed to update operator:', error);
    res.status(500).json({ error: 'Failed to update operator' });
  }
});

// DELETE operator
router.delete('/:id', async (req, res) => {
  try {
    await prisma.operator.delete({
      where: { id: req.params.id },
    });
    res.json({ message: 'Operator deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete operator' });
  }
});

export default router;
