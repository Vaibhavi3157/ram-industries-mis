import { Router } from 'express';
import prisma from '../prisma';

const router = Router();

// GET all BOMs
router.get('/', async (req, res) => {
  try {
    const boms = await prisma.bOM.findMany({
      include: {
        component: true,
        rawMaterial: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(boms);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch BOMs' });
  }
});

// GET BOMs by component
router.get('/component/:componentId', async (req, res) => {
  try {
    const boms = await prisma.bOM.findMany({
      where: { componentId: req.params.componentId },
      include: {
        rawMaterial: true,
      },
    });
    res.json(boms);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch BOMs' });
  }
});

// POST create BOM
router.post('/', async (req, res) => {
  try {
    const { componentId, rawMaterialId, weightPerPiece, runnerWeight, cycleTime, packingMaterial } = req.body;
    const bom = await prisma.bOM.create({
      data: { componentId, rawMaterialId, weightPerPiece, runnerWeight, cycleTime, packingMaterial },
      include: {
        component: true,
        rawMaterial: true,
      },
    });
    res.status(201).json(bom);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create BOM' });
  }
});

// PUT update BOM
router.put('/:id', async (req, res) => {
  try {
    const { componentId, rawMaterialId, weightPerPiece, runnerWeight, cycleTime, packingMaterial } = req.body;
    const bom = await prisma.bOM.update({
      where: { id: req.params.id },
      data: { componentId, rawMaterialId, weightPerPiece, runnerWeight, cycleTime, packingMaterial },
      include: {
        component: true,
        rawMaterial: true,
      },
    });
    res.json(bom);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update BOM' });
  }
});

// DELETE BOM
router.delete('/:id', async (req, res) => {
  try {
    await prisma.bOM.delete({
      where: { id: req.params.id },
    });
    res.json({ message: 'BOM deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete BOM' });
  }
});

export default router;
