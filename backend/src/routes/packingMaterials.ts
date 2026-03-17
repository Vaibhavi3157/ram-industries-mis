import { Router } from 'express';
import prisma from '../prisma';

const router = Router();

// GET all packing materials
router.get('/', async (req, res) => {
  try {
    const packingMaterials = await prisma.packingMaterial.findMany({
      orderBy: { name: 'asc' },
    });
    res.json(packingMaterials);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch packing materials' });
  }
});

// GET single packing material
router.get('/:id', async (req, res) => {
  try {
    const packingMaterial = await prisma.packingMaterial.findUnique({
      where: { id: req.params.id },
    });
    if (!packingMaterial) {
      return res.status(404).json({ error: 'Packing material not found' });
    }
    res.json(packingMaterial);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch packing material' });
  }
});

// POST create packing material
router.post('/', async (req, res) => {
  try {
    const { name, type, description } = req.body;
    const packingMaterial = await prisma.packingMaterial.create({
      data: { name, type, description },
    });
    res.status(201).json(packingMaterial);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create packing material' });
  }
});

// PUT update packing material
router.put('/:id', async (req, res) => {
  try {
    const { name, type, description } = req.body;
    const packingMaterial = await prisma.packingMaterial.update({
      where: { id: req.params.id },
      data: { name, type, description },
    });
    res.json(packingMaterial);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update packing material' });
  }
});

// DELETE packing material
router.delete('/:id', async (req, res) => {
  try {
    await prisma.packingMaterial.delete({
      where: { id: req.params.id },
    });
    res.json({ message: 'Packing material deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete packing material' });
  }
});

export default router;
