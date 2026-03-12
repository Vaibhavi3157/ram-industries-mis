import { Router } from 'express';
import prisma from '../prisma';

const router = Router();

// GET all components
router.get('/', async (req, res) => {
  try {
    const components = await prisma.component.findMany({
      orderBy: { name: 'asc' },
      include: {
        moulds: true,
      },
    });
    res.json(components);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch components' });
  }
});

// GET single component
router.get('/:id', async (req, res) => {
  try {
    const component = await prisma.component.findUnique({
      where: { id: req.params.id },
      include: {
        moulds: true,
        boms: {
          include: {
            rawMaterial: true,
          },
        },
      },
    });
    if (!component) {
      return res.status(404).json({ error: 'Component not found' });
    }
    res.json(component);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch component' });
  }
});

// POST create component
router.post('/', async (req, res) => {
  try {
    const { name, customerName, totalCavity } = req.body;
    const component = await prisma.component.create({
      data: { name, customerName, totalCavity },
    });
    res.status(201).json(component);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create component' });
  }
});

// PUT update component
router.put('/:id', async (req, res) => {
  try {
    const { name, customerName, totalCavity } = req.body;
    const component = await prisma.component.update({
      where: { id: req.params.id },
      data: { name, customerName, totalCavity },
    });
    res.json(component);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update component' });
  }
});

// DELETE component
router.delete('/:id', async (req, res) => {
  try {
    await prisma.component.delete({
      where: { id: req.params.id },
    });
    res.json({ message: 'Component deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete component' });
  }
});

export default router;
