import { Router } from 'express';
import prisma from '../prisma';

const router = Router();

// GET all production plans
router.get('/', async (req, res) => {
  try {
    const { date, shift } = req.query;
    const where: any = {};

    if (date) {
      where.date = new Date(date as string);
    }
    if (shift) {
      where.shift = shift;
    }

    const plans = await prisma.productionPlan.findMany({
      where,
      include: {
        machine: true,
        mould: {
          include: {
            component: true,
          },
        },
        createdBy: {
          select: { id: true, name: true },
        },
      },
      orderBy: [{ date: 'desc' }, { machine: { name: 'asc' } }],
    });
    res.json(plans);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch production plans' });
  }
});

// GET plans for a specific date
router.get('/date/:date', async (req, res) => {
  try {
    const plans = await prisma.productionPlan.findMany({
      where: {
        date: new Date(req.params.date),
      },
      include: {
        machine: true,
        mould: {
          include: {
            component: true,
          },
        },
      },
      orderBy: { machine: { name: 'asc' } },
    });
    res.json(plans);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch production plans' });
  }
});

// POST create production plan
router.post('/', async (req, res) => {
  try {
    const { date, shift, machineId, mouldId, targetShots, notes, createdById } = req.body;

    // Get a valid user ID (use first user if 'system' is passed)
    let userId = createdById;
    if (!createdById || createdById === 'system') {
      const defaultUser = await prisma.user.findFirst();
      if (!defaultUser) {
        return res.status(400).json({ error: 'No users found in the system' });
      }
      userId = defaultUser.id;
    }

    const plan = await prisma.productionPlan.create({
      data: {
        date: new Date(date),
        shift,
        machineId,
        mouldId,
        targetShots,
        notes,
        createdById: userId,
      },
      include: {
        machine: true,
        mould: true,
      },
    });
    res.status(201).json(plan);
  } catch (error) {
    console.error('Create plan error:', error);
    res.status(500).json({ error: 'Failed to create production plan' });
  }
});

// POST bulk create/update plans for a day
router.post('/bulk', async (req, res) => {
  try {
    const { date, shift, plans, createdById } = req.body;

    // Get a valid user ID (use first user if 'system' is passed)
    let userId = createdById;
    if (!createdById || createdById === 'system') {
      const defaultUser = await prisma.user.findFirst();
      if (!defaultUser) {
        return res.status(400).json({ error: 'No users found in the system' });
      }
      userId = defaultUser.id;
    }

    // Delete existing plans for the date and shift
    await prisma.productionPlan.deleteMany({
      where: {
        date: new Date(date),
        shift,
      },
    });

    // Create new plans
    const createdPlans = await prisma.productionPlan.createMany({
      data: plans.map((plan: any) => ({
        date: new Date(date),
        shift,
        machineId: plan.machineId,
        mouldId: plan.mouldId,
        targetShots: plan.targetShots,
        notes: plan.notes,
        createdById: userId,
      })),
    });

    res.status(201).json({ message: 'Plans saved successfully', count: createdPlans.count });
  } catch (error) {
    console.error('Bulk create error:', error);
    res.status(500).json({ error: 'Failed to save production plans' });
  }
});

// PUT update production plan
router.put('/:id', async (req, res) => {
  try {
    const { machineId, mouldId, targetShots, notes } = req.body;
    const plan = await prisma.productionPlan.update({
      where: { id: req.params.id },
      data: { machineId, mouldId, targetShots, notes },
      include: {
        machine: true,
        mould: true,
      },
    });
    res.json(plan);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update production plan' });
  }
});

// DELETE production plan
router.delete('/:id', async (req, res) => {
  try {
    await prisma.productionPlan.delete({
      where: { id: req.params.id },
    });
    res.json({ message: 'Production plan deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete production plan' });
  }
});

export default router;
