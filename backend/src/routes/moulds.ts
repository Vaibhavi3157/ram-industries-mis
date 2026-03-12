import { Router } from 'express';
import prisma from '../prisma';

const router = Router();

// GET all moulds
router.get('/', async (req, res) => {
  try {
    const moulds = await prisma.mould.findMany({
      orderBy: { name: 'asc' },
      include: {
        component: true,
      },
    });
    res.json(moulds);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch moulds' });
  }
});

// GET single mould
router.get('/:id', async (req, res) => {
  try {
    const mould = await prisma.mould.findUnique({
      where: { id: req.params.id },
      include: {
        component: true,
      },
    });
    if (!mould) {
      return res.status(404).json({ error: 'Mould not found' });
    }
    res.json(mould);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch mould' });
  }
});

// POST create mould
router.post('/', async (req, res) => {
  try {
    const { name, componentId, customerName, totalCavity, runCavity } = req.body;
    const mould = await prisma.mould.create({
      data: { name, componentId, customerName, totalCavity, runCavity },
      include: {
        component: true,
      },
    });
    res.status(201).json(mould);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create mould' });
  }
});

// PUT update mould
router.put('/:id', async (req, res) => {
  try {
    const { name, componentId, customerName, totalCavity, runCavity } = req.body;
    const mould = await prisma.mould.update({
      where: { id: req.params.id },
      data: { name, componentId, customerName, totalCavity, runCavity },
      include: {
        component: true,
      },
    });
    res.json(mould);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update mould' });
  }
});

// DELETE mould
router.delete('/:id', async (req, res) => {
  try {
    await prisma.mould.delete({
      where: { id: req.params.id },
    });
    res.json({ message: 'Mould deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete mould' });
  }
});

export default router;
