// Machine
export interface Machine {
  id: string;
  name: string;
  type: string;
  status: 'running' | 'idle' | 'maintenance';
  createdAt: Date;
}

// Operator
export interface Operator {
  id: string;
  name: string;
  phone: string;
  isActive: boolean;
  createdAt: Date;
}

// Raw Material
export interface RawMaterial {
  id: string;
  name: string;
  unit: 'kg' | 'pcs' | 'ltr';
  currentStock: number;
  minStock: number;
  createdAt: Date;
}

// Component/Part
export interface Component {
  id: string;
  name: string;
  customerName: string;
  totalCavity: number;
  createdAt: Date;
}

// Mould
export interface Mould {
  id: string;
  name: string;
  componentId: string;
  componentName?: string;
  customerName: string;
  totalCavity: number;
  runCavity: number;
  createdAt: Date;
}

// BOM (Bill of Materials)
export interface BOM {
  id: string;
  componentId: string;
  componentName?: string;
  rawMaterialId: string;
  rawMaterialName?: string;
  weightPerPiece: number;
  runnerWeight: number;
  cycleTime: number;
  packingMaterial: string;
}

// Rejection Type
export interface RejectionType {
  code: string;
  name: string;
}

// Downtime Code
export interface DowntimeCode {
  code: string;
  name: string;
}

// User
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'plant_head' | 'supervisor' | 'operator';
  shift: 'day' | 'night';
  isActive: boolean;
}

// Production Plan
export interface ProductionPlan {
  id: string;
  date: Date;
  shift: 'day' | 'night';
  machineId: string;
  machineName?: string;
  mouldId: string;
  mouldName?: string;
  targetShots: number;
  notes: string;
  createdBy: string;
  createdAt: Date;
}

// Production Report (Main form)
export interface ProductionReport {
  id: string;
  date: Date;
  shift: 'day' | 'night';
  machineId: string;
  machineName?: string;
  operatorId: string;
  operatorName?: string;
  mouldId: string;
  mouldName?: string;
  componentId: string;
  componentName?: string;
  materialId: string;
  materialName?: string;
  injectionTime: number;
  coolingTime: number;
  totalCavity: number;
  runCavity: number;
  temperatureN: number;
  temperature1: number;
  temperature2: number;
  temperature3: number;
  temperature4: number;
  temperature5: number;
  temperature6: number;
  processParameter: string;
  okProduction: number;
  totalRejection: number;
  remarks: string;
  operatorSign: boolean;
  supervisorSign: boolean;
  supervisorId: string;
  hourlyData: HourlyProduction[];
  downtimeLogs: DowntimeLog[];
  createdAt: Date;
}

// Hourly Production Data
export interface HourlyProduction {
  id: string;
  reportId: string;
  hour: number; // 7, 8, 9, 10, 11, 12, 1, 2, 3, 4, 5, 6
  reading: number;
  shotPerHour: number;
  plan: number;
  rejectionL: number; // Silver Mark
  rejectionM: number; // Warpage
  rejectionN: number; // Weldline
  rejectionO: number; // Black Spot
  rejectionP: number; // Dent Mark
  rejectionQ: number; // Silk Mark
  rejectionR: number; // Shade Variation
  rejectionS: number; // Half Shot
  rejectionT: number; // Flow Mark
  rejectionU: number; // Scratches/Cracks
  rejectionW: number; // Ejector Pin Mark
  checkPoint: string;
  obsSample: number;
}

// Downtime Log
export interface DowntimeLog {
  id: string;
  reportId: string;
  fromTime: string;
  toTime: string;
  totalMinutes: number;
  downtimeCodeId: string;
  downtimeCode?: string;
  remarks: string;
}

// Dashboard Stats
export interface DashboardStats {
  todayProduction: number;
  todayTarget: number;
  todayEfficiency: number;
  todayRejection: number;
  machinesRunning: number;
  machinesIdle: number;
  machinesMaintenance: number;
  totalDowntime: number;
}
