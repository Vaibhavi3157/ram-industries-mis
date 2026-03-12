import { Router } from 'express';
import prisma from '../prisma';

const router = Router();

// GET all machines
router.get('/', async (req, res) => {
  try {
    const machines = await prisma.machine.findMany({
      orderBy: { name: 'asc' },
    });
    res.json(machines);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch machines' });
  }
});

// GET single machine
router.get('/:id', async (req, res) => {
  try {
    const machine = await prisma.machine.findUnique({
      where: { id: req.params.id },
    });
    if (!machine) {
      return res.status(404).json({ error: 'Machine not found' });
    }
    res.json(machine);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch machine' });
  }
});

// POST create machine
router.post('/', async (req, res) => {
  try {
    const { name, type, status } = req.body;
    const machine = await prisma.machine.create({
      data: { name, type, status },
    });
    res.status(201).json(machine);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create machine' });
  }
});

// PUT update machine
router.put('/:id', async (req, res) => {
  try {
    const { name, type, status } = req.body;
    const machine = await prisma.machine.update({
      where: { id: req.params.id },
      data: { name, type, status },
    });
    res.json(machine);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update machine' });
  }
});

// DELETE machine
router.delete('/:id', async (req, res) => {
  try {
    await prisma.machine.delete({
      where: { id: req.params.id },
    });
    res.json({ message: 'Machine deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete machine' });
  }
});

export default router;
