import { Router } from 'express';
import prisma from '../prisma';

const router = Router();

// GET all production reports
router.get('/', async (req, res) => {
  try {
    const { date, shift, machineId } = req.query;
    const where: any = {};

    if (date) where.date = new Date(date as string);
    if (shift) where.shift = shift;
    if (machineId) where.machineId = machineId;

    const reports = await prisma.productionReport.findMany({
      where,
      include: {
        machine: true,
        operator: true,
        mould: true,
        component: true,
        material: true,
      },
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
    });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch production reports' });
  }
});

// GET single production report with all details
router.get('/:id', async (req, res) => {
  try {
    const report = await prisma.productionReport.findUnique({
      where: { id: req.params.id },
      include: {
        machine: true,
        operator: true,
        mould: {
          include: { component: true },
        },
        component: true,
        material: true,
        hourlyData: {
          orderBy: { hour: 'asc' },
        },
        downtimeLogs: {
          include: { downtimeCode: true },
        },
        supervisor: {
          select: { id: true, name: true },
        },
      },
    });

    if (!report) {
      return res.status(404).json({ error: 'Production report not found' });
    }
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch production report' });
  }
});

// POST create production report
router.post('/', async (req, res) => {
  try {
    const {
      date, shift, machineId, operatorId, mouldId, componentId, materialId,
      injectionTime, coolingTime, totalCavity, runCavity,
      temperatureN, temperature1, temperature2, temperature3, temperature4, temperature5, temperature6,
      processParameter, okProduction, totalRejection, remarks,
      operatorSign, supervisorSign, supervisorId,
      hourlyData, downtimeLogs
    } = req.body;

    // Process downtime logs - look up or create downtime codes
    let processedDowntimeLogs: any[] = [];
    if (downtimeLogs && downtimeLogs.length > 0) {
      for (const d of downtimeLogs) {
        // Find or create the downtime code
        let downtimeCode = await prisma.downtimeCode.findUnique({
          where: { code: d.downtimeCodeId }
        });

        if (!downtimeCode) {
          // Create the downtime code if it doesn't exist
          const codeNames: Record<string, string> = {
            'A': 'No Power',
            'B': 'Mould Change',
            'C': 'No Raw Material',
            'D': 'No Man Power',
            'E': 'No Programme',
            'F': 'Machine Maintenance',
            'G': 'Mould Maintenance',
            'H': 'Trial',
            'I': 'Barrel Heating',
            'J': 'Nozzle Block',
            'K': 'Color Change',
            'L': 'Other'
          };
          downtimeCode = await prisma.downtimeCode.create({
            data: {
              code: d.downtimeCodeId,
              name: codeNames[d.downtimeCodeId] || 'Unknown'
            }
          });
        }

        processedDowntimeLogs.push({
          fromTime: d.fromTime,
          toTime: d.toTime,
          totalMinutes: d.totalMinutes || 0,
          downtimeCodeId: downtimeCode.id,
          remarks: d.remarks,
        });
      }
    }

    const report = await prisma.productionReport.create({
      data: {
        date: new Date(date),
        shift,
        machineId,
        operatorId,
        mouldId,
        componentId,
        materialId,
        injectionTime,
        coolingTime,
        totalCavity,
        runCavity,
        temperatureN,
        temperature1,
        temperature2,
        temperature3,
        temperature4,
        temperature5,
        temperature6,
        processParameter,
        okProduction,
        totalRejection,
        remarks,
        operatorSign,
        supervisorSign,
        supervisorId,
        hourlyData: {
          create: hourlyData?.map((h: any) => ({
            hour: h.hour,
            reading: h.reading || 0,
            shotPerHour: h.shotPerHour || 0,
            plan: h.plan || 0,
            rejectionL: h.rejectionL || 0,
            rejectionM: h.rejectionM || 0,
            rejectionN: h.rejectionN || 0,
            rejectionO: h.rejectionO || 0,
            rejectionP: h.rejectionP || 0,
            rejectionQ: h.rejectionQ || 0,
            rejectionR: h.rejectionR || 0,
            rejectionS: h.rejectionS || 0,
            rejectionT: h.rejectionT || 0,
            rejectionU: h.rejectionU || 0,
            rejectionW: h.rejectionW || 0,
            checkPoint: h.checkPoint,
            obsSample: h.obsSample || 0,
          })) || [],
        },
        downtimeLogs: {
          create: processedDowntimeLogs,
        },
      },
      include: {
        machine: true,
        operator: true,
        mould: true,
        component: true,
        material: true,
        hourlyData: true,
        downtimeLogs: true,
      },
    });

    res.status(201).json(report);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create production report' });
  }
});

// PUT update production report
router.put('/:id', async (req, res) => {
  try {
    const { hourlyData, downtimeLogs, ...reportData } = req.body;

    // Update main report
    const report = await prisma.productionReport.update({
      where: { id: req.params.id },
      data: {
        ...reportData,
        date: reportData.date ? new Date(reportData.date) : undefined,
      },
    });

    // Update hourly data if provided
    if (hourlyData) {
      await prisma.hourlyProduction.deleteMany({
        where: { reportId: req.params.id },
      });
      await prisma.hourlyProduction.createMany({
        data: hourlyData.map((h: any) => ({
          reportId: req.params.id,
          hour: h.hour,
          reading: h.reading || 0,
          shotPerHour: h.shotPerHour || 0,
          plan: h.plan || 0,
          rejectionL: h.rejectionL || 0,
          rejectionM: h.rejectionM || 0,
          rejectionN: h.rejectionN || 0,
          rejectionO: h.rejectionO || 0,
          rejectionP: h.rejectionP || 0,
          rejectionQ: h.rejectionQ || 0,
          rejectionR: h.rejectionR || 0,
          rejectionS: h.rejectionS || 0,
          rejectionT: h.rejectionT || 0,
          rejectionU: h.rejectionU || 0,
          rejectionW: h.rejectionW || 0,
          checkPoint: h.checkPoint,
          obsSample: h.obsSample || 0,
        })),
      });
    }

    // Update downtime logs if provided
    if (downtimeLogs) {
      await prisma.downtimeLog.deleteMany({
        where: { reportId: req.params.id },
      });
      await prisma.downtimeLog.createMany({
        data: downtimeLogs.map((d: any) => ({
          reportId: req.params.id,
          fromTime: d.fromTime,
          toTime: d.toTime,
          totalMinutes: d.totalMinutes || 0,
          downtimeCodeId: d.downtimeCodeId,
          remarks: d.remarks,
        })),
      });
    }

    // Fetch updated report with all relations
    const updatedReport = await prisma.productionReport.findUnique({
      where: { id: req.params.id },
      include: {
        machine: true,
        operator: true,
        mould: true,
        component: true,
        material: true,
        hourlyData: true,
        downtimeLogs: true,
      },
    });

    res.json(updatedReport);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update production report' });
  }
});

// DELETE production report
router.delete('/:id', async (req, res) => {
  try {
    await prisma.productionReport.delete({
      where: { id: req.params.id },
    });
    res.json({ message: 'Production report deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete production report' });
  }
});

export default router;
