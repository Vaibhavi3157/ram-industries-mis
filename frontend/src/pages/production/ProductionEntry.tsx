import { useState, useEffect } from 'react';
import { Save, Plus, Trash2, Clock, Loader2, ChevronLeft, ChevronRight, Factory, User, Settings, Thermometer, Timer, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { REJECTION_TYPES, DOWNTIME_CODES, DISPLAY_HOURS } from '@/data/constants';
import { machinesApi, operatorsApi, mouldsApi, rawMaterialsApi, productionReportsApi, type Machine, type Operator, type Mould, type RawMaterial } from '@/services/api';

interface HourlyData {
  hour: string;
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

export function ProductionEntry() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [operators, setOperators] = useState<Operator[]>([]);
  const [moulds, setMoulds] = useState<Mould[]>([]);
  const [materials, setMaterials] = useState<RawMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [activeHourIndex, setActiveHourIndex] = useState(0);

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

  const [hourlyData, setHourlyData] = useState<HourlyData[]>(
    DISPLAY_HOURS.map((hour) => ({
      hour,
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

  async function fetchData() {
    try {
      setLoading(true);
      const [machinesData, operatorsData, mouldsData, materialsData] = await Promise.all([
        machinesApi.getAll(),
        operatorsApi.getAll(),
        mouldsApi.getAll(),
        rawMaterialsApi.getAll()
      ]);
      setMachines(machinesData);
      setOperators(operatorsData.filter(o => o.isActive));
      setMoulds(mouldsData);
      setMaterials(materialsData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleMouldChange = (mouldId: string) => {
    const mould = moulds.find((m) => m.id === mouldId);
    setFormData((prev) => ({
      ...prev,
      mouldId,
      componentId: mould?.componentId || '',
      componentName: mould?.component?.name || '',
      totalCavity: mould?.totalCavity?.toString() || '',
      runCavity: mould?.runCavity?.toString() || '',
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
          hour: parseInt(h.hour, 10),
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
      setHourlyData(DISPLAY_HOURS.map((hour) => ({
        hour,
        reading: 0,
        shotPerHour: 0,
        plan: 0,
        rejections: Object.fromEntries(REJECTION_TYPES.map((r) => [r.code, 0])),
        checkPoint: '',
        obsSample: 0,
      })));
      setDowntimeEntries([]);
      setCurrentStep(0);
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
          <Label className="text-sm font-medium">Shift</Label>
          <Select
            value={formData.shift}
            onValueChange={(v) => setFormData((prev) => ({ ...prev, shift: v as 'DAY' | 'NIGHT' }))}
          >
            <SelectTrigger className="h-12">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DAY">Day (7AM-7PM)</SelectItem>
              <SelectItem value="NIGHT">Night (7PM-7AM)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

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
          <p className="text-xs text-blue-600 font-medium">Component</p>
          <p className="text-sm font-semibold text-blue-800">{formData.componentName}</p>
        </div>
      )}

      {/* Material */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Material Name</Label>
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
        {/* Hour Selector */}
        <div className="flex items-center justify-between bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl p-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setActiveHourIndex((prev) => Math.max(0, prev - 1))}
            disabled={activeHourIndex === 0}
            className="text-white hover:bg-white/20 disabled:opacity-50"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="text-center">
            <p className="text-xs text-blue-100">Hour</p>
            <p className="text-2xl font-bold">{data.hour}</p>
            <p className="text-xs text-blue-100">{activeHourIndex + 1} of {hourlyData.length}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setActiveHourIndex((prev) => Math.min(hourlyData.length - 1, prev + 1))}
            disabled={activeHourIndex === hourlyData.length - 1}
            className="text-white hover:bg-white/20 disabled:opacity-50"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Quick Hour Navigation */}
        <div className="flex gap-1 overflow-x-auto pb-2">
          {hourlyData.map((h, i) => {
            const hasData = h.reading > 0 || h.shotPerHour > 0;
            return (
              <button
                key={h.hour}
                onClick={() => setActiveHourIndex(i)}
                className={`px-2 py-1 text-xs rounded-lg flex-shrink-0 transition-colors ${
                  i === activeHourIndex
                    ? 'bg-blue-500 text-white'
                    : hasData
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {h.hour}
              </button>
            );
          })}
        </div>

        {/* Production Data */}
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1">
            <Label className="text-xs text-slate-500">Reading</Label>
            <Input
              type="number"
              value={data.reading || ''}
              onChange={(e) => handleHourlyDataChange(activeHourIndex, 'reading', Number(e.target.value))}
              className="h-12 text-center text-lg font-semibold"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-slate-500">Shot/Hour</Label>
            <Input
              type="number"
              value={data.shotPerHour || ''}
              onChange={(e) => handleHourlyDataChange(activeHourIndex, 'shotPerHour', Number(e.target.value))}
              className="h-12 text-center text-lg font-semibold bg-emerald-50 border-emerald-200"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-slate-500">Plan</Label>
            <Input
              type="number"
              value={data.plan || ''}
              onChange={(e) => handleHourlyDataChange(activeHourIndex, 'plan', Number(e.target.value))}
              className="h-12 text-center text-lg font-semibold"
            />
          </div>
        </div>

        {/* Rejections */}
        <Card className="border-red-200">
          <CardHeader className="py-2 px-3 bg-red-50 border-b border-red-200">
            <CardTitle className="text-sm flex items-center justify-between text-red-700">
              <span>Rejections</span>
              <Badge variant="destructive">{hourRejectionTotal}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <div className="grid grid-cols-4 gap-2">
              {REJECTION_TYPES.map((r) => (
                <div key={r.code} className="space-y-1">
                  <Label className="text-xs text-center block text-slate-500" title={r.name}>
                    {r.code}
                  </Label>
                  <Input
                    type="number"
                    value={data.rejections[r.code] || ''}
                    onChange={(e) =>
                      handleHourlyDataChange(activeHourIndex, `rejection_${r.code}`, Number(e.target.value))
                    }
                    className="h-10 text-center text-sm"
                  />
                </div>
              ))}
            </div>
            <div className="mt-3 p-2 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500 leading-relaxed">
                <strong>L</strong>-Silver, <strong>M</strong>-Warpage, <strong>N</strong>-Weldline, <strong>O</strong>-Black Spot,
                <strong>P</strong>-Dent, <strong>Q</strong>-Silk, <strong>R</strong>-Shade, <strong>S</strong>-Half Shot,
                <strong>T</strong>-Flow, <strong>U</strong>-Scratch, <strong>W</strong>-Ejector Pin
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
          <div className="p-3 bg-blue-50 rounded-xl text-center">
            <p className="text-xs text-blue-600">Total Prod.</p>
            <p className="text-xl font-bold text-blue-700">{totalProduction}</p>
          </div>
          <div className="p-3 bg-red-50 rounded-xl text-center">
            <p className="text-xs text-red-600">Total Rej.</p>
            <p className="text-xl font-bold text-red-700">{totalRejection}</p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl text-center">
            <p className="text-xs text-emerald-600">OK Prod.</p>
            <p className="text-xl font-bold text-emerald-700">{okProduction}</p>
          </div>
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
        return total + (to.getTime() - from.getTime()) / 60000; // minutes
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
              <p className="text-3xl font-bold">{okProduction}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0">
            <CardContent className="p-4 text-center">
              <p className="text-red-100 text-xs">Rejection</p>
              <p className="text-3xl font-bold">{totalRejection}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-4 text-center">
              <p className="text-blue-100 text-xs">Total</p>
              <p className="text-3xl font-bold">{totalProduction}</p>
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
              <Badge>{formData.shift === 'DAY' ? 'Day Shift' : 'Night Shift'}</Badge>
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
        <h1 className="text-xl font-bold">Production Entry</h1>
        <p className="text-blue-100 text-sm mt-0.5">Daily Production Cum Inspection Report</p>
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
