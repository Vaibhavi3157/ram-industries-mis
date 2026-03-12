import { Router } from 'express';
import prisma from '../prisma';

const router = Router();

// GET dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get machine counts by status
    const machineStats = await prisma.machine.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    const machinesRunning = machineStats.find(m => m.status === 'RUNNING')?._count.id || 0;
    const machinesIdle = machineStats.find(m => m.status === 'IDLE')?._count.id || 0;
    const machinesMaintenance = machineStats.find(m => m.status === 'MAINTENANCE')?._count.id || 0;

    // Get today's production summary
    const todayReports = await prisma.productionReport.findMany({
      where: {
        date: today,
      },
      select: {
        okProduction: true,
        totalRejection: true,
      },
    });

    const todayProduction = todayReports.reduce((sum, r) => sum + r.okProduction, 0);
    const todayRejection = todayReports.reduce((sum, r) => sum + r.totalRejection, 0);

    // Get today's target from plans
    const todayPlans = await prisma.productionPlan.findMany({
      where: {
        date: today,
      },
      select: {
        targetShots: true,
      },
    });

    const todayTarget = todayPlans.reduce((sum, p) => sum + p.targetShots, 0);
    const efficiency = todayTarget > 0 ? Math.round((todayProduction / todayTarget) * 100) : 0;

    // Get total downtime for today
    const todayDowntime = await prisma.downtimeLog.aggregate({
      where: {
        report: {
          date: today,
        },
      },
      _sum: {
        totalMinutes: true,
      },
    });

    // Active operators count
    const activeOperators = await prisma.operator.count({
      where: { isActive: true },
    });

    res.json({
      todayProduction,
      todayTarget,
      efficiency,
      todayRejection,
      rejectionRate: todayProduction > 0 ? ((todayRejection / (todayProduction + todayRejection)) * 100).toFixed(1) : 0,
      machinesRunning,
      machinesIdle,
      machinesMaintenance,
      totalDowntime: todayDowntime._sum.totalMinutes || 0,
      activeOperators,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// GET hourly production for today
router.get('/hourly', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const hourlyData = await prisma.hourlyProduction.findMany({
      where: {
        report: {
          date: today,
        },
      },
      select: {
        hour: true,
        shotPerHour: true,
        plan: true,
      },
    });

    // Aggregate by hour
    const aggregated: { [key: number]: { production: number; target: number } } = {};
    hourlyData.forEach(h => {
      if (!aggregated[h.hour]) {
        aggregated[h.hour] = { production: 0, target: 0 };
      }
      aggregated[h.hour].production += h.shotPerHour;
      aggregated[h.hour].target += h.plan;
    });

    const result = Object.entries(aggregated).map(([hour, data]) => ({
      hour: parseInt(hour),
      production: data.production,
      target: data.target,
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch hourly production' });
  }
});

// GET machine-wise production for today
router.get('/machine-production', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const machineProduction = await prisma.productionReport.groupBy({
      by: ['machineId'],
      where: {
        date: today,
      },
      _sum: {
        okProduction: true,
      },
    });

    // Get machine names
    const machines = await prisma.machine.findMany({
      select: { id: true, name: true, status: true },
    });

    const result = machines.map(machine => ({
      id: machine.id,
      name: machine.name,
      status: machine.status,
      production: machineProduction.find(p => p.machineId === machine.id)?._sum.okProduction || 0,
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch machine production' });
  }
});

// GET rejection analysis for today
router.get('/rejection-analysis', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const hourlyData = await prisma.hourlyProduction.findMany({
      where: {
        report: {
          date: today,
        },
      },
    });

    const rejectionSummary = {
      L: { name: 'Silver Mark', count: 0 },
      M: { name: 'Warpage', count: 0 },
      N: { name: 'Weldline', count: 0 },
      O: { name: 'Black Spot', count: 0 },
      P: { name: 'Dent Mark', count: 0 },
      Q: { name: 'Silk Mark', count: 0 },
      R: { name: 'Shade Variation', count: 0 },
      S: { name: 'Half Shot', count: 0 },
      T: { name: 'Flow Mark', count: 0 },
      U: { name: 'Scratches/Cracks', count: 0 },
      W: { name: 'Ejector Pin Mark', count: 0 },
    };

    hourlyData.forEach(h => {
      rejectionSummary.L.count += h.rejectionL;
      rejectionSummary.M.count += h.rejectionM;
      rejectionSummary.N.count += h.rejectionN;
      rejectionSummary.O.count += h.rejectionO;
      rejectionSummary.P.count += h.rejectionP;
      rejectionSummary.Q.count += h.rejectionQ;
      rejectionSummary.R.count += h.rejectionR;
      rejectionSummary.S.count += h.rejectionS;
      rejectionSummary.T.count += h.rejectionT;
      rejectionSummary.U.count += h.rejectionU;
      rejectionSummary.W.count += h.rejectionW;
    });

    const result = Object.entries(rejectionSummary)
      .map(([code, data]) => ({
        code,
        name: data.name,
        count: data.count,
      }))
      .filter(r => r.count > 0)
      .sort((a, b) => b.count - a.count);

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch rejection analysis' });
  }
});

// GET downtime analysis for today
router.get('/downtime-analysis', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const downtimeLogs = await prisma.downtimeLog.findMany({
      where: {
        report: {
          date: today,
        },
      },
      include: {
        downtimeCode: true,
      },
    });

    // Aggregate by code
    const aggregated: { [key: string]: { code: string; name: string; minutes: number } } = {};

    downtimeLogs.forEach(log => {
      const code = log.downtimeCode.code;
      if (!aggregated[code]) {
        aggregated[code] = {
          code,
          name: log.downtimeCode.name,
          minutes: 0,
        };
      }
      aggregated[code].minutes += log.totalMinutes;
    });

    const result = Object.values(aggregated).sort((a, b) => b.minutes - a.minutes);

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch downtime analysis' });
  }
});

export default router;
