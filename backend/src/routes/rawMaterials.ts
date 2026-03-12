import { Router } from 'express';
import prisma from '../prisma';

const router = Router();

// GET all raw materials
router.get('/', async (req, res) => {
  try {
    const materials = await prisma.rawMaterial.findMany({
      orderBy: { name: 'asc' },
    });
    res.json(materials);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch raw materials' });
  }
});

// GET single raw material
router.get('/:id', async (req, res) => {
  try {
    const material = await prisma.rawMaterial.findUnique({
      where: { id: req.params.id },
    });
    if (!material) {
      return res.status(404).json({ error: 'Raw material not found' });
    }
    res.json(material);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch raw material' });
  }
});

// POST create raw material
router.post('/', async (req, res) => {
  try {
    const { name, grade, unit, currentStock, minStock } = req.body;
    const material = await prisma.rawMaterial.create({
      data: { name, grade: grade || '', unit, currentStock, minStock },
    });
    res.status(201).json(material);
  } catch (error) {
    console.error('Failed to create raw material:', error);
    res.status(500).json({ error: 'Failed to create raw material' });
  }
});

// PUT update raw material
router.put('/:id', async (req, res) => {
  try {
    const { name, grade, unit, currentStock, minStock } = req.body;
    const material = await prisma.rawMaterial.update({
      where: { id: req.params.id },
      data: { name, grade, unit, currentStock, minStock },
    });
    res.json(material);
  } catch (error) {
    console.error('Failed to update raw material:', error);
    res.status(500).json({ error: 'Failed to update raw material' });
  }
});

// DELETE raw material
router.delete('/:id', async (req, res) => {
  try {
    await prisma.rawMaterial.delete({
      where: { id: req.params.id },
    });
    res.json({ message: 'Raw material deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete raw material' });
  }
});

export default router;
