const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Generic fetch wrapper with error handling
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP error ${response.status}`);
  }

  return response.json();
}

// ============ MACHINES API ============
export const machinesApi = {
  getAll: () => fetchApi<Machine[]>('/machines'),
  getById: (id: string) => fetchApi<Machine>(`/machines/${id}`),
  create: (data: Partial<Machine>) =>
    fetchApi<Machine>('/machines', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<Machine>) =>
    fetchApi<Machine>(`/machines/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    fetchApi<{ message: string }>(`/machines/${id}`, {
      method: 'DELETE',
    }),
};

// ============ OPERATORS API ============
export const operatorsApi = {
  getAll: () => fetchApi<Operator[]>('/operators'),
  getById: (id: string) => fetchApi<Operator>(`/operators/${id}`),
  create: (data: Partial<Operator>) =>
    fetchApi<Operator>('/operators', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<Operator>) =>
    fetchApi<Operator>(`/operators/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    fetchApi<{ message: string }>(`/operators/${id}`, {
      method: 'DELETE',
    }),
};

// ============ RAW MATERIALS API ============
export const rawMaterialsApi = {
  getAll: () => fetchApi<RawMaterial[]>('/raw-materials'),
  getById: (id: string) => fetchApi<RawMaterial>(`/raw-materials/${id}`),
  create: (data: Partial<RawMaterial>) =>
    fetchApi<RawMaterial>('/raw-materials', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<RawMaterial>) =>
    fetchApi<RawMaterial>(`/raw-materials/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    fetchApi<{ message: string }>(`/raw-materials/${id}`, {
      method: 'DELETE',
    }),
};

// ============ COMPONENTS API ============
export const componentsApi = {
  getAll: () => fetchApi<Component[]>('/components'),
  getById: (id: string) => fetchApi<Component>(`/components/${id}`),
  create: (data: Partial<Component>) =>
    fetchApi<Component>('/components', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<Component>) =>
    fetchApi<Component>(`/components/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    fetchApi<{ message: string }>(`/components/${id}`, {
      method: 'DELETE',
    }),
};

// ============ MOULDS API ============
export const mouldsApi = {
  getAll: () => fetchApi<Mould[]>('/moulds'),
  getById: (id: string) => fetchApi<Mould>(`/moulds/${id}`),
  create: (data: Partial<Mould>) =>
    fetchApi<Mould>('/moulds', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<Mould>) =>
    fetchApi<Mould>(`/moulds/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    fetchApi<{ message: string }>(`/moulds/${id}`, {
      method: 'DELETE',
    }),
};

// ============ BOM API ============
export const bomApi = {
  getAll: () => fetchApi<BOM[]>('/bom'),
  getByComponent: (componentId: string) =>
    fetchApi<BOM[]>(`/bom/component/${componentId}`),
  create: (data: Partial<BOM>) =>
    fetchApi<BOM>('/bom', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<BOM>) =>
    fetchApi<BOM>(`/bom/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    fetchApi<{ message: string }>(`/bom/${id}`, {
      method: 'DELETE',
    }),
};

// ============ PRODUCTION PLANS API ============
export const productionPlansApi = {
  getAll: (params?: { date?: string; shift?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.date) searchParams.append('date', params.date);
    if (params?.shift) searchParams.append('shift', params.shift);
    const query = searchParams.toString();
    return fetchApi<ProductionPlan[]>(`/production-plans${query ? `?${query}` : ''}`);
  },
  getByDate: (date: string) =>
    fetchApi<ProductionPlan[]>(`/production-plans/date/${date}`),
  create: (data: Partial<ProductionPlan>) =>
    fetchApi<ProductionPlan>('/production-plans', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  bulkCreate: (data: { date: string; shift: string; plans: any[]; createdById: string }) =>
    fetchApi<{ message: string; count: number }>('/production-plans/bulk', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<ProductionPlan>) =>
    fetchApi<ProductionPlan>(`/production-plans/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    fetchApi<{ message: string }>(`/production-plans/${id}`, {
      method: 'DELETE',
    }),
};

// ============ PRODUCTION REPORTS API ============
export const productionReportsApi = {
  getAll: (params?: { date?: string; shift?: string; machineId?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.date) searchParams.append('date', params.date);
    if (params?.shift) searchParams.append('shift', params.shift);
    if (params?.machineId) searchParams.append('machineId', params.machineId);
    const query = searchParams.toString();
    return fetchApi<ProductionReport[]>(`/production-reports${query ? `?${query}` : ''}`);
  },
  getById: (id: string) => fetchApi<ProductionReport>(`/production-reports/${id}`),
  create: (data: Partial<ProductionReport>) =>
    fetchApi<ProductionReport>('/production-reports', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<ProductionReport>) =>
    fetchApi<ProductionReport>(`/production-reports/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    fetchApi<{ message: string }>(`/production-reports/${id}`, {
      method: 'DELETE',
    }),
};

// ============ DASHBOARD API ============
export const dashboardApi = {
  getStats: () =>
    fetchApi<{
      todayProduction: number;
      todayTarget: number;
      efficiency: number;
      todayRejection: number;
      rejectionRate: number | string;
      machinesRunning: number;
      machinesIdle: number;
      machinesMaintenance: number;
      totalDowntime: number;
      activeOperators: number;
    }>('/dashboard/stats'),
  getHourlyProduction: () =>
    fetchApi<{ hour: number; production: number; target: number }[]>('/dashboard/hourly'),
  getMachineProduction: () =>
    fetchApi<{ id: string; name: string; status: string; production: number }[]>(
      '/dashboard/machine-production'
    ),
  getRejectionAnalysis: () =>
    fetchApi<{ code: string; name: string; count: number }[]>('/dashboard/rejection-analysis'),
  getDowntimeAnalysis: () =>
    fetchApi<{ code: string; name: string; minutes: number }[]>('/dashboard/downtime-analysis'),
};

// Types (matching backend models)
export interface Machine {
  id: string;
  name: string;
  type: string;
  status: 'RUNNING' | 'IDLE' | 'MAINTENANCE';
  createdAt: string;
  updatedAt: string;
}

export interface Operator {
  id: string;
  name: string;
  phone: string;
  shift: 'DAY' | 'NIGHT';
  machineId?: string | null;
  machine?: Machine | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RawMaterial {
  id: string;
  name: string;
  grade: string;
  unit: string;
  currentStock: number;
  minStock: number;
  createdAt: string;
  updatedAt: string;
}

export interface Component {
  id: string;
  name: string;
  customerName: string;
  totalCavity: number;
  createdAt: string;
  updatedAt: string;
}

export interface Mould {
  id: string;
  name: string;
  componentId: string;
  component?: Component;
  customerName: string;
  totalCavity: number;
  runCavity: number;
  createdAt: string;
  updatedAt: string;
}

export interface BOM {
  id: string;
  componentId: string;
  component?: Component;
  rawMaterialId: string;
  rawMaterial?: RawMaterial;
  weightPerPiece: number;
  runnerWeight: number;
  cycleTime: number;
  packingMaterial?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductionPlan {
  id: string;
  date: string;
  shift: 'DAY' | 'NIGHT';
  machineId: string;
  machine?: Machine;
  mouldId: string;
  mould?: Mould;
  targetShots: number;
  notes?: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface HourlyProduction {
  id?: string;
  reportId?: string;
  hour: number | string;
  reading: number;
  shotPerHour: number;
  plan: number;
  rejectionL: number;
  rejectionM: number;
  rejectionN: number;
  rejectionO: number;
  rejectionP: number;
  rejectionQ: number;
  rejectionR: number;
  rejectionS: number;
  rejectionT: number;
  rejectionU: number;
  rejectionW: number;
  checkPoint?: string;
  obsSample: number;
}

export interface DowntimeLog {
  id?: string;
  reportId?: string;
  fromTime: string;
  toTime: string;
  totalMinutes?: number;
  downtimeCodeId: string;
  downtimeCode?: { id: string; code: string; name: string };
  remarks?: string;
}

export interface ProductionReport {
  id: string;
  date: string;
  shift: 'DAY' | 'NIGHT';
  machineId: string;
  machine?: Machine;
  operatorId: string;
  operator?: Operator;
  mouldId: string;
  mould?: Mould;
  componentId: string;
  component?: Component;
  materialId: string;
  material?: RawMaterial;
  injectionTime?: number;
  coolingTime?: number;
  totalCavity?: number;
  runCavity?: number;
  temperatureN?: number;
  temperature1?: number;
  temperature2?: number;
  temperature3?: number;
  temperature4?: number;
  temperature5?: number;
  temperature6?: number;
  processParameter?: string;
  okProduction: number;
  totalRejection: number;
  remarks?: string;
  operatorSign: boolean;
  supervisorSign: boolean;
  supervisorId?: string;
  hourlyData?: HourlyProduction[];
  downtimeLogs?: DowntimeLog[];
  createdAt: string;
  updatedAt: string;
}
