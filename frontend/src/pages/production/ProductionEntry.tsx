import { useState, useEffect } from 'react';
import { Save, Plus, Trash2, Clock, Loader2, ChevronLeft, ChevronRight, Factory, User, Settings, Thermometer, Timer, AlertTriangle, Package, CheckCircle2, Sun, Moon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { REJECTION_TYPES, DOWNTIME_CODES } from '@/data/constants';
import { machinesApi, operatorsApi, mouldsApi, rawMaterialsApi, bomApi, productionReportsApi, type Machine, type Operator, type Mould, type RawMaterial, type BOM } from '@/services/api';

interface HourlyData {
  hour: number;
  displayHour: string;
  reading: number;
  shotPerHour: number;
  plan: number;
  rejections: { [key: string]: number };
  checkPoint: string;
  obsSample: number;
}

interface DowntimeEntry {
  id: string;
  fromTime: string;
  toTime: string;
  code: string;
  remarks: string;
}

const STEPS = [
  { id: 'header', title: 'Basic Info', icon: Factory },
  { id: 'params', title: 'Parameters', icon: Settings },
  { id: 'hourly', title: 'Hourly Data', icon: Clock },
  { id: 'downtime', title: 'Downtime', icon: AlertTriangle },
  { id: 'summary', title: 'Summary', icon: Save },
];

// Generate hours based on shift
const generateHourlySlots = (shift: 'DAY' | 'NIGHT'): { hour: number; display: string }[] => {
  const slots: { hour: number; display: string }[] = [];

  if (shift === 'DAY') {
    // Day shift: 7 AM to 7 PM (7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18)
    for (let h = 7; h <= 18; h++) {
      const displayHour = h > 12 ? h - 12 : h;
      const ampm = h >= 12 ? 'PM' : 'AM';
      slots.push({ hour: h, display: `${displayHour}:00 ${ampm}` });
    }
  } else {
    // Night shift: 7 PM to 7 AM (19, 20, 21, 22, 23, 0, 1, 2, 3, 4, 5, 6)
    for (let h = 19; h <= 23; h++) {
      const displayHour = h > 12 ? h - 12 : h;
      slots.push({ hour: h, display: `${displayHour}:00 PM` });
    }
    for (let h = 0; h <= 6; h++) {
      const displayHour = h === 0 ? 12 : h;
      const ampm = h === 0 ? 'AM' : 'AM';
      slots.push({ hour: h, display: `${displayHour}:00 ${ampm}` });
    }
  }

  return slots;
};

export function ProductionEntry() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [operators, setOperators] = useState<Operator[]>([]);
  const [moulds, setMoulds] = useState<Mould[]>([]);
  const [materials, setMaterials] = useState<RawMaterial[]>([]);
  const [boms, setBoms] = useState<BOM[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [activeHourIndex, setActiveHourIndex] = useState(0);
  const [saveAfterShift, setSaveAfterShift] = useState(false);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    shift: 'DAY' as 'DAY' | 'NIGHT',
    machineId: '',
    operatorId: '',
    mouldId: '',
    componentId: '',
    componentName: '',
    materialId: '',
    materialName: '',
    injectionTime: '',
    coolingTime: '',
    totalCavity: '',
    runCavity: '',
    temperatures: { N: '', '1': '', '2': '', '3': '', '4': '', '5': '', '6': '' },
    processParameter: '',
    remarks: '',
  });

  const hourSlots = generateHourlySlots(formData.shift);

  const [hourlyData, setHourlyData] = useState<HourlyData[]>(
    hourSlots.map((slot) => ({
      hour: slot.hour,
      displayHour: slot.display,
      reading: 0,
      shotPerHour: 0,
      plan: 0,
      rejections: Object.fromEntries(REJECTION_TYPES.map((r) => [r.code, 0])),
      checkPoint: '',
      obsSample: 0,
    }))
  );

  const [downtimeEntries, setDowntimeEntries] = useState<DowntimeEntry[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  // Reset hourly data when shift changes
  useEffect(() => {
    const slots = generateHourlySlots(formData.shift);
    setHourlyData(
      slots.map((slot) => ({
        hour: slot.hour,
        displayHour: slot.display,
        reading: 0,
        shotPerHour: 0,
        plan: 0,
        rejections: Object.fromEntries(REJECTION_TYPES.map((r) => [r.code, 0])),
        checkPoint: '',
        obsSample: 0,
      }))
    );
    setActiveHourIndex(0);
  }, [formData.shift]);

  async function fetchData() {
    try {
      setLoading(true);
      const [machinesData, operatorsData, mouldsData, materialsData, bomsData] = await Promise.all([
        machinesApi.getAll(),
        operatorsApi.getAll(),
        mouldsApi.getAll(),
        rawMaterialsApi.getAll(),
        bomApi.getAll()
      ]);
      setMachines(machinesData);
      setOperators(operatorsData.filter(o => o.isActive));
      setMoulds(mouldsData);
      setMaterials(materialsData);
      setBoms(bomsData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleMouldChange = (mouldId: string) => {
    const mould = moulds.find((m) => m.id === mouldId);

    // Find BOM entry for this mould's component to auto-fill raw material
    const bomEntry = boms.find((b) => b.componentId === mould?.componentId);
    const autoMaterial = bomEntry ? materials.find((m) => m.id === bomEntry.rawMaterialId) : null;

    setFormData((prev) => ({
      ...prev,
      mouldId,
      componentId: mould?.componentId || '',
      componentName: mould?.component?.name || '',
      totalCavity: mould?.totalCavity?.toString() || '',
      runCavity: mould?.runCavity?.toString() || '',
      // Auto-fill material from BOM
      materialId: autoMaterial?.id || prev.materialId,
      materialName: autoMaterial?.name || prev.materialName,
    }));
  };

  const handleMaterialChange = (materialId: string) => {
    const material = materials.find((m) => m.id === materialId);
    setFormData((prev) => ({
      ...prev,
      materialId,
      materialName: material?.name || '',
    }));
  };

  const handleHourlyDataChange = (index: number, field: string, value: number | string) => {
    setHourlyData((prev) => {
      const updated = [...prev];
      if (field.startsWith('rejection_')) {
        const code = field.replace('rejection_', '');
        updated[index] = {
          ...updated[index],
          rejections: { ...updated[index].rejections, [code]: Number(value) },
        };
      } else {
        updated[index] = { ...updated[index], [field]: value };
      }
      return updated;
    });
  };

  const addDowntimeEntry = () => {
    setDowntimeEntries((prev) => [
      ...prev,
      { id: Date.now().toString(), fromTime: '', toTime: '', code: '', remarks: '' },
    ]);
  };

  const removeDowntimeEntry = (id: string) => {
    setDowntimeEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const updateDowntimeEntry = (id: string, field: string, value: string) => {
    setDowntimeEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, [field]: value } : e))
    );
  };

  // Calculate totals
  const totalProduction = hourlyData.reduce((sum, h) => sum + h.shotPerHour, 0);
  const totalRejection = hourlyData.reduce(
    (sum, h) => sum + Object.values(h.rejections).reduce((s, v) => s + v, 0),
    0
  );
  const okProduction = totalProduction - totalRejection;

  const handleSave = async () => {
    try {
      setSaving(true);

      const reportData = {
        date: formData.date,
        shift: formData.shift,
        machineId: formData.machineId,
        operatorId: formData.operatorId,
        mouldId: formData.mouldId,
        componentId: formData.componentId,
        materialId: formData.materialId,
        injectionTime: formData.injectionTime ? Number(formData.injectionTime) : 0,
        coolingTime: formData.coolingTime ? Number(formData.coolingTime) : 0,
        totalCavity: formData.totalCavity ? Number(formData.totalCavity) : 1,
        runCavity: formData.runCavity ? Number(formData.runCavity) : 1,
        temperatureN: formData.temperatures.N ? Number(formData.temperatures.N) : undefined,
        temperature1: formData.temperatures['1'] ? Number(formData.temperatures['1']) : undefined,
        temperature2: formData.temperatures['2'] ? Number(formData.temperatures['2']) : undefined,
        temperature3: formData.temperatures['3'] ? Number(formData.temperatures['3']) : undefined,
        temperature4: formData.temperatures['4'] ? Number(formData.temperatures['4']) : undefined,
        temperature5: formData.temperatures['5'] ? Number(formData.temperatures['5']) : undefined,
        temperature6: formData.temperatures['6'] ? Number(formData.temperatures['6']) : undefined,
        processParameter: formData.processParameter,
        okProduction,
        totalRejection,
        remarks: formData.remarks,
        hourlyData: hourlyData.map(h => ({
          hour: h.hour,
          reading: h.reading,
          shotPerHour: h.shotPerHour,
          plan: h.plan,
          rejectionL: h.rejections['L'] || 0,
          rejectionM: h.rejections['M'] || 0,
          rejectionN: h.rejections['N'] || 0,
          rejectionO: h.rejections['O'] || 0,
          rejectionP: h.rejections['P'] || 0,
          rejectionQ: h.rejections['Q'] || 0,
          rejectionR: h.rejections['R'] || 0,
          rejectionS: h.rejections['S'] || 0,
          rejectionT: h.rejections['T'] || 0,
          rejectionU: h.rejections['U'] || 0,
          rejectionW: h.rejections['W'] || 0,
          checkPoint: h.checkPoint,
          obsSample: h.obsSample
        })),
        downtimeLogs: downtimeEntries.map(d => ({
          fromTime: d.fromTime,
          toTime: d.toTime,
          downtimeCodeId: d.code,
          remarks: d.remarks
        }))
      };

      await productionReportsApi.create(reportData);
      alert('Production report saved successfully!');

      // Reset form
      const slots = generateHourlySlots('DAY');
      setFormData({
        date: new Date().toISOString().split('T')[0],
        shift: 'DAY',
        machineId: '',
        operatorId: '',
        mouldId: '',
        componentId: '',
        componentName: '',
        materialId: '',
        materialName: '',
        injectionTime: '',
        coolingTime: '',
        totalCavity: '',
        runCavity: '',
        temperatures: { N: '', '1': '', '2': '', '3': '', '4': '', '5': '', '6': '' },
        processParameter: '',
        remarks: '',
      });
      setHourlyData(slots.map((slot) => ({
        hour: slot.hour,
        displayHour: slot.display,
        reading: 0,
        shotPerHour: 0,
        plan: 0,
        rejections: Object.fromEntries(REJECTION_TYPES.map((r) => [r.code, 0])),
        checkPoint: '',
        obsSample: 0,
      })));
      setDowntimeEntries([]);
      setCurrentStep(0);
      setSaveAfterShift(false);
    } catch (error) {
      console.error('Failed to save production report:', error);
      alert('Failed to save production report');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-blue-500 mx-auto" />
          <p className="mt-3 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  const renderHeaderStep = () => (
    <div className="space-y-4">
      {/* Date & Shift */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Date</Label>
          <Input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
            className="h-12"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium">Shift (12 Hours)</Label>
          <Select
            value={formData.shift}
            onValueChange={(v) => setFormData((prev) => ({ ...prev, shift: v as 'DAY' | 'NIGHT' }))}
          >
            <SelectTrigger className="h-12">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DAY">
                <div className="flex items-center gap-2">
                  <Sun className="h-4 w-4 text-amber-500" />
                  Day (7 AM - 7 PM)
                </div>
              </SelectItem>
              <SelectItem value="NIGHT">
                <div className="flex items-center gap-2">
                  <Moon className="h-4 w-4 text-indigo-500" />
                  Night (7 PM - 7 AM)
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 12 Hour Shift Option */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-blue-900">Submit after 12hr shift</p>
                <p className="text-xs text-blue-600">Save report at end of shift</p>
              </div>
            </div>
            <Switch
              checked={saveAfterShift}
              onCheckedChange={setSaveAfterShift}
            />
          </div>
        </CardContent>
      </Card>

      {/* Machine */}
      <div className="space-y-2">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Factory className="h-4 w-4 text-blue-500" />
          Machine
        </Label>
        <Select
          value={formData.machineId}
          onValueChange={(v) => setFormData((prev) => ({ ...prev, machineId: v }))}
        >
          <SelectTrigger className="h-12">
            <SelectValue placeholder="Select machine" />
          </SelectTrigger>
          <SelectContent>
            {machines.map((m) => (
              <SelectItem key={m.id} value={m.id}>{m.name} - {m.type}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Operator */}
      <div className="space-y-2">
        <Label className="text-sm font-medium flex items-center gap-2">
          <User className="h-4 w-4 text-emerald-500" />
          Operator Name
        </Label>
        <Select
          value={formData.operatorId}
          onValueChange={(v) => setFormData((prev) => ({ ...prev, operatorId: v }))}
        >
          <SelectTrigger className="h-12">
            <SelectValue placeholder="Select operator" />
          </SelectTrigger>
          <SelectContent>
            {operators.map((o) => (
              <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Mould & Component */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Mould</Label>
        <Select value={formData.mouldId} onValueChange={handleMouldChange}>
          <SelectTrigger className="h-12">
            <SelectValue placeholder="Select mould" />
          </SelectTrigger>
          <SelectContent>
            {moulds.map((m) => (
              <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {formData.componentName && (
        <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
          <p className="text-xs text-blue-600 font-medium">Component (Auto-filled)</p>
          <p className="text-sm font-semibold text-blue-800">{formData.componentName}</p>
        </div>
      )}

      {/* Material - Auto-filled from BOM */}
      <div className="space-y-2">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Package className="h-4 w-4 text-violet-500" />
          Raw Material
          {formData.materialId && formData.mouldId && (
            <Badge className="bg-green-100 text-green-700 border-0 text-xs ml-2">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Auto-filled from BOM
            </Badge>
          )}
        </Label>
        <Select value={formData.materialId} onValueChange={handleMaterialChange}>
          <SelectTrigger className="h-12">
            <SelectValue placeholder="Select material" />
          </SelectTrigger>
          <SelectContent>
            {materials.map((m) => (
              <SelectItem key={m.id} value={m.id}>{m.name} ({m.grade})</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderParamsStep = () => (
    <div className="space-y-4">
      {/* Injection & Cooling Time */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Timer className="h-4 w-4 text-violet-500" />
            Injection Time (sec)
          </Label>
          <Input
            type="number"
            value={formData.injectionTime}
            onChange={(e) => setFormData((prev) => ({ ...prev, injectionTime: e.target.value }))}
            className="h-12"
            placeholder="e.g., 12"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Timer className="h-4 w-4 text-cyan-500" />
            Cooling Time (sec)
          </Label>
          <Input
            type="number"
            value={formData.coolingTime}
            onChange={(e) => setFormData((prev) => ({ ...prev, coolingTime: e.target.value }))}
            className="h-12"
            placeholder="e.g., 25"
          />
        </div>
      </div>

      {/* Cavity Info */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Total Cavity</Label>
          <Input
            type="number"
            value={formData.totalCavity}
            onChange={(e) => setFormData((prev) => ({ ...prev, totalCavity: e.target.value }))}
            className="h-12"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium">Run Cavity</Label>
          <Input
            type="number"
            value={formData.runCavity}
            onChange={(e) => setFormData((prev) => ({ ...prev, runCavity: e.target.value }))}
            className="h-12"
          />
        </div>
      </div>

      {/* Temperature Zones */}
      <Card className="border-orange-200 bg-orange-50/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2 text-orange-700">
            <Thermometer className="h-4 w-4" />
            Temperature Zones (°C)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-2">
            {['N', '1', '2', '3', '4', '5', '6'].map((zone) => (
              <div key={zone} className="space-y-1">
                <Label className="text-xs text-center block text-orange-600">
                  {zone === 'N' ? 'Nozzle' : `Z${zone}`}
                </Label>
                <Input
                  type="number"
                  placeholder="-"
                  value={formData.temperatures[zone as keyof typeof formData.temperatures]}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      temperatures: { ...prev.temperatures, [zone]: e.target.value },
                    }))
                  }
                  className="h-10 text-center text-sm bg-white"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Process Parameter */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Process Parameter</Label>
        <Input
          value={formData.processParameter}
          onChange={(e) => setFormData((prev) => ({ ...prev, processParameter: e.target.value }))}
          placeholder="Enter process parameters"
          className="h-12"
        />
      </div>
    </div>
  );

  const renderHourlyStep = () => {
    const data = hourlyData[activeHourIndex];
    const hourRejectionTotal = Object.values(data.rejections).reduce((s, v) => s + v, 0);

    return (
      <div className="space-y-4">
        {/* Hour Selector - Improved UI */}
        <Card className="border-0 shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setActiveHourIndex((prev) => Math.max(0, prev - 1))}
                disabled={activeHourIndex === 0}
                className="text-white hover:bg-white/20 disabled:opacity-50 h-12 w-12"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  {formData.shift === 'DAY' ? (
                    <Sun className="h-5 w-5 text-amber-300" />
                  ) : (
                    <Moon className="h-5 w-5 text-blue-200" />
                  )}
                  <span className="text-sm text-blue-100">
                    {formData.shift === 'DAY' ? 'Day Shift' : 'Night Shift'}
                  </span>
                </div>
                <p className="text-3xl font-bold">{data.displayHour}</p>
                <p className="text-sm text-blue-200 mt-1">
                  Hour {activeHourIndex + 1} of {hourlyData.length}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setActiveHourIndex((prev) => Math.min(hourlyData.length - 1, prev + 1))}
                disabled={activeHourIndex === hourlyData.length - 1}
                className="text-white hover:bg-white/20 disabled:opacity-50 h-12 w-12"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>
          </div>

          {/* Hour Pills */}
          <div className="p-3 bg-slate-50 border-t">
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {hourlyData.map((h, i) => {
                const hasData = h.reading > 0 || h.shotPerHour > 0;
                const shortDisplay = h.displayHour.replace(':00', '').replace(' ', '');
                return (
                  <button
                    key={i}
                    onClick={() => setActiveHourIndex(i)}
                    className={`px-3 py-2 text-xs font-medium rounded-lg flex-shrink-0 transition-all ${
                      i === activeHourIndex
                        ? 'bg-blue-600 text-white shadow-md scale-105'
                        : hasData
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300'
                    }`}
                  >
                    {shortDisplay}
                  </button>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Production Data */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="border-slate-200">
            <CardContent className="p-3 text-center">
              <Label className="text-xs text-slate-500 block mb-2">Previous Reading</Label>
              <Input
                type="number"
                value={data.reading || ''}
                onChange={(e) => {
                  const prevReading = Number(e.target.value);
                  handleHourlyDataChange(activeHourIndex, 'reading', prevReading);
                  // Auto-calculate shot
                  const shot = data.plan - prevReading;
                  if (shot >= 0) {
                    handleHourlyDataChange(activeHourIndex, 'shotPerHour', shot);
                  }
                }}
                className="h-14 text-center text-xl font-bold border-2 focus:border-blue-500"
                placeholder="0"
              />
            </CardContent>
          </Card>
          <Card className="border-blue-200">
            <CardContent className="p-3 text-center">
              <Label className="text-xs text-blue-600 block mb-2">Current Reading</Label>
              <Input
                type="number"
                value={data.plan || ''}
                onChange={(e) => {
                  const currReading = Number(e.target.value);
                  handleHourlyDataChange(activeHourIndex, 'plan', currReading);
                  // Auto-calculate shot
                  const shot = currReading - data.reading;
                  if (shot >= 0) {
                    handleHourlyDataChange(activeHourIndex, 'shotPerHour', shot);
                  }
                }}
                className="h-14 text-center text-xl font-bold border-2 border-blue-300 focus:border-blue-500 bg-white"
                placeholder="0"
              />
            </CardContent>
          </Card>
          <Card className="border-emerald-200 bg-emerald-50/50">
            <CardContent className="p-3 text-center">
              <Label className="text-xs text-emerald-600 block mb-2">Shot (Auto)</Label>
              <div className="h-14 flex items-center justify-center text-2xl font-bold text-emerald-600 bg-emerald-100 rounded-lg border-2 border-emerald-300">
                {data.shotPerHour || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rejections */}
        <Card className="border-red-200">
          <CardHeader className="py-3 px-4 bg-red-50 border-b border-red-200">
            <CardTitle className="text-sm flex items-center justify-between text-red-700">
              <span className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Rejections
              </span>
              <Badge variant="destructive" className="text-sm px-3">
                {hourRejectionTotal}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-4 gap-2">
              {REJECTION_TYPES.map((r) => (
                <div key={r.code} className="space-y-1">
                  <Label className="text-xs text-center block text-slate-500 font-medium" title={r.name}>
                    {r.code}
                  </Label>
                  <Input
                    type="number"
                    value={data.rejections[r.code] || ''}
                    onChange={(e) =>
                      handleHourlyDataChange(activeHourIndex, `rejection_${r.code}`, Number(e.target.value))
                    }
                    className="h-11 text-center font-semibold"
                  />
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-slate-50 rounded-xl">
              <p className="text-xs text-slate-600 leading-relaxed">
                <span className="font-semibold">L</span>-Silver Mark,
                <span className="font-semibold ml-1">M</span>-Warpage,
                <span className="font-semibold ml-1">N</span>-Weldline,
                <span className="font-semibold ml-1">O</span>-Black Spot,
                <span className="font-semibold ml-1">P</span>-Dent Mark,
                <span className="font-semibold ml-1">Q</span>-Silk Mark,
                <span className="font-semibold ml-1">R</span>-Shade,
                <span className="font-semibold ml-1">S</span>-Half Shot,
                <span className="font-semibold ml-1">T</span>-Flow Mark,
                <span className="font-semibold ml-1">U</span>-Scratches,
                <span className="font-semibold ml-1">W</span>-Ejector Pin
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Check Point & Obs Sample */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs text-slate-500">Check Point</Label>
            <Input
              value={data.checkPoint}
              onChange={(e) => handleHourlyDataChange(activeHourIndex, 'checkPoint', e.target.value)}
              className="h-12"
              placeholder="OK/NG"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-slate-500">Obs Sample</Label>
            <Input
              type="number"
              value={data.obsSample || ''}
              onChange={(e) => handleHourlyDataChange(activeHourIndex, 'obsSample', Number(e.target.value))}
              className="h-12 text-center"
            />
          </div>
        </div>

        {/* Running Totals */}
        <div className="grid grid-cols-3 gap-2">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-4 text-center">
              <p className="text-blue-100 text-xs">Total Production</p>
              <p className="text-2xl font-bold">{totalProduction.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0">
            <CardContent className="p-4 text-center">
              <p className="text-red-100 text-xs">Total Rejection</p>
              <p className="text-2xl font-bold">{totalRejection.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0">
            <CardContent className="p-4 text-center">
              <p className="text-emerald-100 text-xs">OK Production</p>
              <p className="text-2xl font-bold">{okProduction.toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const renderDowntimeStep = () => (
    <div className="space-y-4">
      <Button
        onClick={addDowntimeEntry}
        className="w-full h-12 bg-gradient-to-r from-amber-500 to-amber-600"
      >
        <Plus className="h-5 w-5 mr-2" />
        Add Downtime Entry
      </Button>

      {downtimeEntries.length === 0 ? (
        <Card className="border-dashed border-2 border-slate-200">
          <CardContent className="p-8 text-center">
            <Clock className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No downtime recorded</p>
            <p className="text-slate-400 text-sm mt-1">Tap the button above to add downtime</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {downtimeEntries.map((entry, index) => (
            <Card key={entry.id} className="border-amber-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <Badge className="bg-amber-100 text-amber-700 border-0">
                    Entry #{index + 1}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeDowntimeEntry(entry.id)}
                    className="text-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-slate-500">From</Label>
                    <Input
                      type="time"
                      value={entry.fromTime}
                      onChange={(e) => updateDowntimeEntry(entry.id, 'fromTime', e.target.value)}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-slate-500">To</Label>
                    <Input
                      type="time"
                      value={entry.toTime}
                      onChange={(e) => updateDowntimeEntry(entry.id, 'toTime', e.target.value)}
                      className="h-11"
                    />
                  </div>
                </div>

                <div className="space-y-1 mb-3">
                  <Label className="text-xs text-slate-500">Code</Label>
                  <Select
                    value={entry.code}
                    onValueChange={(v) => updateDowntimeEntry(entry.id, 'code', v)}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select code" />
                    </SelectTrigger>
                    <SelectContent>
                      {DOWNTIME_CODES.map((c) => (
                        <SelectItem key={c.code} value={c.code}>
                          {c.code} - {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-slate-500">Remarks</Label>
                  <Input
                    value={entry.remarks}
                    onChange={(e) => updateDowntimeEntry(entry.id, 'remarks', e.target.value)}
                    placeholder="Optional remarks"
                    className="h-11"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Downtime Code Reference */}
      <Card className="bg-slate-50">
        <CardHeader className="py-2 px-3">
          <CardTitle className="text-xs text-slate-600">Downtime Codes Reference</CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3">
          <div className="grid grid-cols-2 gap-1 text-xs text-slate-600">
            {DOWNTIME_CODES.map((c) => (
              <span key={c.code}>
                <strong>{c.code}</strong>: {c.name}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSummaryStep = () => {
    const selectedMachine = machines.find(m => m.id === formData.machineId);
    const selectedOperator = operators.find(o => o.id === formData.operatorId);
    const totalDowntime = downtimeEntries.reduce((total, entry) => {
      if (entry.fromTime && entry.toTime) {
        const from = new Date(`2000-01-01T${entry.fromTime}`);
        const to = new Date(`2000-01-01T${entry.toTime}`);
        return total + (to.getTime() - from.getTime()) / 60000;
      }
      return total;
    }, 0);

    return (
      <div className="space-y-4">
        {/* Production Summary Cards */}
        <div className="grid grid-cols-3 gap-2">
          <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0">
            <CardContent className="p-4 text-center">
              <p className="text-emerald-100 text-xs">OK Production</p>
              <p className="text-3xl font-bold">{okProduction.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0">
            <CardContent className="p-4 text-center">
              <p className="text-red-100 text-xs">Rejection</p>
              <p className="text-3xl font-bold">{totalRejection.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-4 text-center">
              <p className="text-blue-100 text-xs">Total</p>
              <p className="text-3xl font-bold">{totalProduction.toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>

        {/* Report Info */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-slate-500 text-sm">Date</span>
              <span className="font-semibold">{formData.date}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-slate-500 text-sm">Shift</span>
              <Badge className={formData.shift === 'DAY' ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'}>
                {formData.shift === 'DAY' ? (
                  <><Sun className="h-3 w-3 mr-1" />Day (12hr)</>
                ) : (
                  <><Moon className="h-3 w-3 mr-1" />Night (12hr)</>
                )}
              </Badge>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-slate-500 text-sm">Machine</span>
              <span className="font-semibold">{selectedMachine?.name || '-'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-slate-500 text-sm">Operator</span>
              <span className="font-semibold">{selectedOperator?.name || '-'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-slate-500 text-sm">Component</span>
              <span className="font-semibold">{formData.componentName || '-'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-slate-500 text-sm">Raw Material</span>
              <span className="font-semibold">{formData.materialName || '-'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-slate-500 text-sm">Downtime</span>
              <span className="font-semibold text-amber-600">{totalDowntime} min ({downtimeEntries.length} entries)</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-slate-500 text-sm">Efficiency</span>
              <span className="font-semibold text-emerald-600">
                {totalProduction > 0 ? ((okProduction / totalProduction) * 100).toFixed(1) : 0}%
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Remarks */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Remarks</Label>
          <textarea
            className="flex min-h-24 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={formData.remarks}
            onChange={(e) => setFormData((prev) => ({ ...prev, remarks: e.target.value }))}
            placeholder="Enter any remarks or notes..."
          />
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="border-slate-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <input type="checkbox" id="operatorSign" className="h-5 w-5 rounded" />
                <Label htmlFor="operatorSign" className="text-sm">Operator Sign</Label>
              </div>
            </CardContent>
          </Card>
          <Card className="border-slate-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <input type="checkbox" id="supervisorSign" className="h-5 w-5 rounded" />
                <Label htmlFor="supervisorSign" className="text-sm">Supervisor Sign</Label>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const renderCurrentStep = () => {
    switch (STEPS[currentStep].id) {
      case 'header': return renderHeaderStep();
      case 'params': return renderParamsStep();
      case 'hourly': return renderHourlyStep();
      case 'downtime': return renderDowntimeStep();
      case 'summary': return renderSummaryStep();
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-5 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Production Entry</h1>
            <p className="text-blue-100 text-sm mt-0.5">Daily Production Cum Inspection Report</p>
          </div>
          {formData.shift && (
            <Badge className={`${formData.shift === 'DAY' ? 'bg-amber-500' : 'bg-indigo-500'} text-white border-0`}>
              {formData.shift === 'DAY' ? (
                <><Sun className="h-3 w-3 mr-1" />12hr Day</>
              ) : (
                <><Moon className="h-3 w-3 mr-1" />12hr Night</>
              )}
            </Badge>
          )}
        </div>
      </div>

      {/* Step Progress */}
      <div className="bg-white border-b px-4 py-3 shadow-sm sticky top-0 z-20">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-slate-600">Step {currentStep + 1} of {STEPS.length}</p>
          <Badge className="bg-blue-100 text-blue-700 border-0">
            {STEPS[currentStep].title}
          </Badge>
        </div>
        <div className="flex gap-1">
          {STEPS.map((step, index) => (
            <button
              key={step.id}
              onClick={() => setCurrentStep(index)}
              className={`flex-1 h-2 rounded-full transition-colors ${
                index <= currentStep ? 'bg-blue-500' : 'bg-slate-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="p-4">
        {renderCurrentStep()}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 lg:ml-72">
        <div className="flex gap-3">
          {currentStep > 0 && (
            <Button
              variant="outline"
              onClick={() => setCurrentStep(prev => prev - 1)}
              className="flex-1 h-12"
            >
              <ChevronLeft className="h-5 w-5 mr-1" />
              Back
            </Button>
          )}

          {currentStep < STEPS.length - 1 ? (
            <Button
              onClick={() => setCurrentStep(prev => prev + 1)}
              className="flex-1 h-12 bg-gradient-to-r from-blue-500 to-blue-600"
            >
              Next
              <ChevronRight className="h-5 w-5 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600"
            >
              {saving && <Loader2 className="h-5 w-5 mr-2 animate-spin" />}
              <Save className="h-5 w-5 mr-2" />
              Save Report
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
