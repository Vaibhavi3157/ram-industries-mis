import type { RejectionType, DowntimeCode } from '@/types';

// Rejection Types (from PDF)
export const REJECTION_TYPES: RejectionType[] = [
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

// Downtime Codes (from PDF)
export const DOWNTIME_CODES: DowntimeCode[] = [
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

// Shift Hours (12 hour shift)
export const SHIFT_HOURS = {
  day: [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18], // 7 AM to 7 PM
  night: [19, 20, 21, 22, 23, 0, 1, 2, 3, 4, 5, 6], // 7 PM to 7 AM
};

// Display hours for the form
export const DISPLAY_HOURS = ['7', '8', '9', '10', '11', '12', '01', '02', '03', '04', '05', '06'];

// Temperature zones
export const TEMPERATURE_ZONES = ['N', '1', '2', '3', '4', '5', '6'];

// Machine statuses
export const MACHINE_STATUSES = [
  { value: 'running', label: 'Running', color: 'green' },
  { value: 'idle', label: 'Idle', color: 'amber' },
  { value: 'maintenance', label: 'Maintenance', color: 'red' },
];

// Shifts
export const SHIFTS = [
  { value: 'day', label: 'Day Shift (7 AM - 7 PM)' },
  { value: 'night', label: 'Night Shift (7 PM - 7 AM)' },
];

// User roles
export const USER_ROLES = [
  { value: 'plant_head', label: 'Plant Head' },
  { value: 'supervisor', label: 'Supervisor' },
  { value: 'operator', label: 'Operator' },
];
