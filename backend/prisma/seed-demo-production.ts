import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import path from 'path';

const dbPath = path.join(__dirname, 'dev.db');
const adapter = new PrismaLibSql({
  url: `file:${dbPath}`,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Adding demo production data...');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get existing data
  const machines = await prisma.machine.findMany({ take: 5 });
  const operators = await prisma.operator.findMany({ take: 5 });
  const moulds = await prisma.mould.findMany({ include: { component: true }, take: 5 });
  const rawMaterials = await prisma.rawMaterial.findMany({ take: 3 });
  const downtimeCodes = await prisma.downtimeCode.findMany();

  if (machines.length === 0 || operators.length === 0 || moulds.length === 0) {
    console.log('Please run the main seed first to create master data');
    return;
  }

  console.log(`Found ${machines.length} machines, ${operators.length} operators, ${moulds.length} moulds`);

  // Create production reports for today - Day Shift
  for (let i = 0; i < Math.min(5, machines.length); i++) {
    const machine = machines[i];
    const operator = operators[i % operators.length];
    const mould = moulds[i % moulds.length];
    const material = rawMaterials[i % rawMaterials.length];

    // Random production values
    const baseProduction = 800 + Math.floor(Math.random() * 400); // 800-1200 per hour
    const totalOk = baseProduction * 10; // ~10 hours of production
    const totalRejection = Math.floor(totalOk * (0.02 + Math.random() * 0.03)); // 2-5% rejection

    try {
      // Check if report already exists for this machine/date/shift
      const existing = await prisma.productionReport.findFirst({
        where: {
          date: today,
          shift: 'DAY',
          machineId: machine.id
        }
      });

      if (existing) {
        console.log(`Report already exists for ${machine.name} - skipping`);
        continue;
      }

      const report = await prisma.productionReport.create({
        data: {
          date: today,
          shift: 'DAY',
          machineId: machine.id,
          operatorId: operator.id,
          mouldId: mould.id,
          componentId: mould.componentId,
          materialId: material.id,
          injectionTime: 2.5 + Math.random() * 1.5,
          coolingTime: 8 + Math.random() * 4,
          totalCavity: mould.totalCavity,
          runCavity: mould.runCavity,
          temperatureN: 180 + Math.random() * 20,
          temperature1: 200 + Math.random() * 20,
          temperature2: 210 + Math.random() * 20,
          temperature3: 220 + Math.random() * 20,
          temperature4: 215 + Math.random() * 20,
          temperature5: 210 + Math.random() * 20,
          okProduction: totalOk,
          totalRejection: totalRejection,
          remarks: `Demo production data for ${machine.name}`,
          operatorSign: true,
          supervisorSign: true,
        },
      });

      // Add hourly production data (7 AM to 6 PM = 12 hours)
      const hourlyData = [];
      for (let hour = 7; hour <= 18; hour++) {
        const hourlyProduction = baseProduction + Math.floor(Math.random() * 200 - 100);
        hourlyData.push({
          reportId: report.id,
          hour: hour,
          reading: hour * 1000 + Math.floor(Math.random() * 500),
          shotPerHour: hourlyProduction,
          plan: baseProduction,
          rejectionL: Math.floor(Math.random() * 5), // Silver Mark
          rejectionM: Math.floor(Math.random() * 3), // Warpage
          rejectionN: Math.floor(Math.random() * 4), // Weldline
          rejectionO: Math.floor(Math.random() * 2), // Black Spot
          rejectionP: Math.floor(Math.random() * 3), // Dent Mark
          rejectionQ: Math.floor(Math.random() * 2), // Silk Mark
          rejectionR: Math.floor(Math.random() * 2), // Shade Variation
          rejectionS: Math.floor(Math.random() * 1), // Half Shot
          rejectionT: Math.floor(Math.random() * 2), // Flow Mark
          rejectionU: Math.floor(Math.random() * 3), // Scratches
          rejectionW: Math.floor(Math.random() * 2), // Ejector Pin Mark
        });
      }

      await prisma.hourlyProduction.createMany({ data: hourlyData });

      // Add some downtime logs
      if (i < 3 && downtimeCodes.length > 0) {
        const randomCode = downtimeCodes[Math.floor(Math.random() * downtimeCodes.length)];
        await prisma.downtimeLog.create({
          data: {
            reportId: report.id,
            fromTime: '10:00',
            toTime: '10:30',
            totalMinutes: 30,
            downtimeCodeId: randomCode.id,
            remarks: `${randomCode.name} - resolved`,
          },
        });
      }

      console.log(`Created production report for ${machine.name}: ${totalOk} OK, ${totalRejection} rejected`);
    } catch (error) {
      console.error(`Failed to create report for ${machine.name}:`, error);
    }
  }

  // Also add some Night shift data for previous machines
  for (let i = 0; i < Math.min(3, machines.length); i++) {
    const machine = machines[i];
    const operator = operators[(i + 2) % operators.length];
    const mould = moulds[i % moulds.length];
    const material = rawMaterials[i % rawMaterials.length];

    const baseProduction = 750 + Math.floor(Math.random() * 350);
    const totalOk = baseProduction * 10;
    const totalRejection = Math.floor(totalOk * (0.02 + Math.random() * 0.03));

    try {
      const existing = await prisma.productionReport.findFirst({
        where: {
          date: today,
          shift: 'NIGHT',
          machineId: machine.id
        }
      });

      if (existing) {
        console.log(`Night report already exists for ${machine.name} - skipping`);
        continue;
      }

      const report = await prisma.productionReport.create({
        data: {
          date: today,
          shift: 'NIGHT',
          machineId: machine.id,
          operatorId: operator.id,
          mouldId: mould.id,
          componentId: mould.componentId,
          materialId: material.id,
          injectionTime: 2.5 + Math.random() * 1.5,
          coolingTime: 8 + Math.random() * 4,
          totalCavity: mould.totalCavity,
          runCavity: mould.runCavity,
          temperatureN: 180 + Math.random() * 20,
          temperature1: 200 + Math.random() * 20,
          temperature2: 210 + Math.random() * 20,
          okProduction: totalOk,
          totalRejection: totalRejection,
          remarks: `Night shift demo for ${machine.name}`,
          operatorSign: true,
        },
      });

      // Add hourly data for night shift (7 PM to 6 AM)
      const hourlyData = [];
      for (let hour = 19; hour <= 23; hour++) {
        hourlyData.push({
          reportId: report.id,
          hour: hour,
          reading: hour * 1000,
          shotPerHour: baseProduction + Math.floor(Math.random() * 150 - 75),
          plan: baseProduction,
          rejectionL: Math.floor(Math.random() * 4),
          rejectionM: Math.floor(Math.random() * 3),
          rejectionO: Math.floor(Math.random() * 2),
        });
      }
      for (let hour = 0; hour <= 6; hour++) {
        hourlyData.push({
          reportId: report.id,
          hour: hour,
          reading: (hour + 24) * 1000,
          shotPerHour: baseProduction + Math.floor(Math.random() * 150 - 75),
          plan: baseProduction,
          rejectionL: Math.floor(Math.random() * 3),
          rejectionN: Math.floor(Math.random() * 2),
        });
      }

      await prisma.hourlyProduction.createMany({ data: hourlyData });
      console.log(`Created NIGHT report for ${machine.name}: ${totalOk} OK`);
    } catch (error) {
      console.error(`Failed to create night report for ${machine.name}:`, error);
    }
  }

  // Update machine statuses to make it more realistic
  await prisma.machine.updateMany({
    where: { name: { in: ['Machine 1', 'Machine 2', 'Machine 4', 'Machine 5', 'Machine 7'] } },
    data: { status: 'RUNNING' }
  });
  await prisma.machine.updateMany({
    where: { name: { in: ['Machine 3', 'Machine 8'] } },
    data: { status: 'IDLE' }
  });
  await prisma.machine.updateMany({
    where: { name: 'Machine 6' },
    data: { status: 'MAINTENANCE' }
  });

  console.log('Demo production data added successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
