import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import path from 'path';

const dbPath = path.join(__dirname, 'dev.db');
const adapter = new PrismaLibSql({
  url: `file:${dbPath}`,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  // Seed Rejection Types (11 types from PDF)
  const rejectionTypes = [
    { code: 'L', name: 'Silver Mark' },
    { code: 'M', name: 'Warpage' },
    { code: 'N', name: 'Weldline' },
    { code: 'O', name: 'Black Spot' },
    { code: 'P', name: 'Dent Mark' },
    { code: 'Q', name: 'Silk Mark' },
    { code: 'R', name: 'Shade Variation' },
    { code: 'S', name: 'Half Shot' },
    { code: 'T', name: 'Flow Mark' },
    { code: 'U', name: 'Scratches/Cracks' },
    { code: 'W', name: 'Ejector Pin Mark' },
  ];

  for (const rt of rejectionTypes) {
    await prisma.rejectionType.upsert({
      where: { code: rt.code },
      update: {},
      create: rt,
    });
  }
  console.log('Rejection types seeded');

  // Seed Downtime Codes (12 types from PDF)
  const downtimeCodes = [
    { code: 'A', name: 'No Power' },
    { code: 'B', name: 'Mould Change' },
    { code: 'C', name: 'No Raw Material' },
    { code: 'D', name: 'No Man Power' },
    { code: 'E', name: 'No Programme' },
    { code: 'F', name: 'Machine Maintenance' },
    { code: 'G', name: 'Mould Maintenance' },
    { code: 'H', name: 'Trial' },
    { code: 'I', name: 'Barrel Heating' },
    { code: 'J', name: 'Nozzle Block' },
    { code: 'K', name: 'Color Change' },
    { code: 'L', name: 'Other' },
  ];

  for (const dc of downtimeCodes) {
    await prisma.downtimeCode.upsert({
      where: { code: dc.code },
      update: {},
      create: dc,
    });
  }
  console.log('Downtime codes seeded');

  // Seed Machines (9 machines)
  const machines = [
    { name: 'Machine 1', type: 'Injection Molding', status: 'RUNNING' as const },
    { name: 'Machine 2', type: 'Injection Molding', status: 'RUNNING' as const },
    { name: 'Machine 3', type: 'Injection Molding', status: 'IDLE' as const },
    { name: 'Machine 4', type: 'Injection Molding', status: 'RUNNING' as const },
    { name: 'Machine 5', type: 'Injection Molding', status: 'RUNNING' as const },
    { name: 'Machine 6', type: 'Injection Molding', status: 'MAINTENANCE' as const },
    { name: 'Machine 7', type: 'Injection Molding', status: 'RUNNING' as const },
    { name: 'Machine 8', type: 'Injection Molding', status: 'IDLE' as const },
    { name: 'Machine 9', type: 'Injection Molding', status: 'RUNNING' as const },
  ];

  for (const machine of machines) {
    await prisma.machine.upsert({
      where: { name: machine.name },
      update: {},
      create: machine,
    });
  }
  console.log('Machines seeded');

  // Seed Operators (18 rotating operators)
  const operators = [
    { name: 'Ramesh Kumar', phone: '9876543210', isActive: true },
    { name: 'Suresh Sharma', phone: '9876543211', isActive: true },
    { name: 'Mahesh Verma', phone: '9876543212', isActive: true },
    { name: 'Dinesh Patel', phone: '9876543213', isActive: true },
    { name: 'Ganesh Singh', phone: '9876543214', isActive: true },
    { name: 'Rajesh Yadav', phone: '9876543215', isActive: true },
    { name: 'Vikas Gupta', phone: '9876543216', isActive: true },
    { name: 'Anil Mishra', phone: '9876543217', isActive: true },
    { name: 'Sanjay Tiwari', phone: '9876543218', isActive: true },
    { name: 'Vijay Pandey', phone: '9876543219', isActive: true },
    { name: 'Mukesh Dubey', phone: '9876543220', isActive: true },
    { name: 'Sunil Shukla', phone: '9876543221', isActive: true },
    { name: 'Kamal Joshi', phone: '9876543222', isActive: true },
    { name: 'Mohan Das', phone: '9876543223', isActive: true },
    { name: 'Ravi Prasad', phone: '9876543224', isActive: true },
    { name: 'Ashok Chauhan', phone: '9876543225', isActive: true },
    { name: 'Prakash Rawat', phone: '9876543226', isActive: true },
    { name: 'Deepak Negi', phone: '9876543227', isActive: true },
  ];

  for (const operator of operators) {
    await prisma.operator.upsert({
      where: { phone: operator.phone },
      update: {},
      create: operator,
    });
  }
  console.log('Operators seeded');

  // Seed Raw Materials (7-8 types)
  const rawMaterials = [
    { name: 'ABS Black', unit: 'KG', currentStock: 500, minStock: 100 },
    { name: 'ABS White', unit: 'KG', currentStock: 350, minStock: 100 },
    { name: 'PP Natural', unit: 'KG', currentStock: 800, minStock: 150 },
    { name: 'PP Black', unit: 'KG', currentStock: 600, minStock: 150 },
    { name: 'HDPE', unit: 'KG', currentStock: 400, minStock: 100 },
    { name: 'Nylon', unit: 'KG', currentStock: 200, minStock: 50 },
    { name: 'PC Clear', unit: 'KG', currentStock: 150, minStock: 50 },
    { name: 'POM', unit: 'KG', currentStock: 100, minStock: 30 },
  ];

  for (const rm of rawMaterials) {
    await prisma.rawMaterial.upsert({
      where: { name: rm.name },
      update: {},
      create: rm,
    });
  }
  console.log('Raw materials seeded');

  // Seed Components
  const components = [
    { name: 'Housing Cover', customerName: 'ABC Motors', totalCavity: 4 },
    { name: 'Base Plate', customerName: 'ABC Motors', totalCavity: 2 },
    { name: 'Switch Panel', customerName: 'XYZ Electronics', totalCavity: 8 },
    { name: 'Connector Body', customerName: 'XYZ Electronics', totalCavity: 16 },
    { name: 'Gear Housing', customerName: 'PQR Auto', totalCavity: 2 },
    { name: 'Cap Assembly', customerName: 'LMN Industries', totalCavity: 12 },
  ];

  const createdComponents = [];
  for (const comp of components) {
    const created = await prisma.component.upsert({
      where: { name: comp.name },
      update: {},
      create: comp,
    });
    createdComponents.push(created);
  }
  console.log('Components seeded');

  // Get raw materials for BOM mapping
  const createdMaterials = await prisma.rawMaterial.findMany();
  const getMaterialId = (name: string) => createdMaterials.find(m => m.name === name)?.id || createdMaterials[0].id;

  // Seed Moulds (linked to components)
  const moulds = [
    { name: 'MLD-001', componentId: createdComponents[0].id, customerName: 'ABC Motors', totalCavity: 4, runCavity: 4 },
    { name: 'MLD-002', componentId: createdComponents[1].id, customerName: 'ABC Motors', totalCavity: 2, runCavity: 2 },
    { name: 'MLD-003', componentId: createdComponents[2].id, customerName: 'XYZ Electronics', totalCavity: 8, runCavity: 8 },
    { name: 'MLD-004', componentId: createdComponents[3].id, customerName: 'XYZ Electronics', totalCavity: 16, runCavity: 14 },
    { name: 'MLD-005', componentId: createdComponents[4].id, customerName: 'PQR Auto', totalCavity: 2, runCavity: 2 },
    { name: 'MLD-006', componentId: createdComponents[5].id, customerName: 'LMN Industries', totalCavity: 12, runCavity: 10 },
  ];

  for (const mould of moulds) {
    await prisma.mould.upsert({
      where: { name: mould.name },
      update: {},
      create: mould,
    });
  }
  console.log('Moulds seeded');

  // Seed BOM (Component to Raw Material mapping)
  const bomEntries = [
    { componentId: createdComponents[0].id, rawMaterialId: getMaterialId('ABS Black'), weightPerPiece: 45.5, runnerWeight: 8.2, cycleTime: 35 },
    { componentId: createdComponents[1].id, rawMaterialId: getMaterialId('ABS White'), weightPerPiece: 62.0, runnerWeight: 12.5, cycleTime: 42 },
    { componentId: createdComponents[2].id, rawMaterialId: getMaterialId('PP Natural'), weightPerPiece: 18.3, runnerWeight: 4.5, cycleTime: 25 },
    { componentId: createdComponents[3].id, rawMaterialId: getMaterialId('PP Black'), weightPerPiece: 8.5, runnerWeight: 2.8, cycleTime: 18 },
    { componentId: createdComponents[4].id, rawMaterialId: getMaterialId('Nylon'), weightPerPiece: 85.0, runnerWeight: 15.0, cycleTime: 55 },
    { componentId: createdComponents[5].id, rawMaterialId: getMaterialId('HDPE'), weightPerPiece: 12.0, runnerWeight: 3.2, cycleTime: 22 },
  ];

  for (const bom of bomEntries) {
    await prisma.bOM.upsert({
      where: { componentId_rawMaterialId: { componentId: bom.componentId, rawMaterialId: bom.rawMaterialId } },
      update: {},
      create: bom,
    });
  }
  console.log('BOM entries seeded');

  // Seed Users (Plant Head, Supervisors)
  const users = [
    { name: 'Plant Head', email: 'planthead@ramindustries.com', password: 'admin123', role: 'PLANT_HEAD' as const, shift: 'DAY' as const, isActive: true },
    { name: 'Supervisor Day', email: 'supervisor.day@ramindustries.com', password: 'super123', role: 'SUPERVISOR' as const, shift: 'DAY' as const, isActive: true },
    { name: 'Supervisor Night', email: 'supervisor.night@ramindustries.com', password: 'super123', role: 'SUPERVISOR' as const, shift: 'NIGHT' as const, isActive: true },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user,
    });
  }
  console.log('Users seeded');

  console.log('Database seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
