import { useState, useEffect } from 'react';
import { Plus, Save, Calendar, Target, Trash2, Loader2, Clock, Factory } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { machinesApi, mouldsApi, productionPlansApi, type Machine, type Mould } from '@/services/api';

interface PlanEntry {
  id: string;
  machineId: string;
  mouldId: string;
  targetShots: number;
  notes: string;
}

export function DailyPlan() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [shift, setShift] = useState<'DAY' | 'NIGHT'>('DAY');
  const [plans, setPlans] = useState<PlanEntry[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [moulds, setMoulds] = useState<Mould[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchPlansForDate();
  }, [date, shift]);

  async function fetchData() {
    try {
      setLoading(true);
      const [machinesData, mouldsData] = await Promise.all([
        machinesApi.getAll(),
        mouldsApi.getAll()
      ]);
      setMachines(machinesData);
      setMoulds(mouldsData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchPlansForDate() {
    try {
      const plansData = await productionPlansApi.getAll({ date, shift });
      if (plansData.length > 0) {
        setPlans(plansData.map(p => ({
          id: p.id,
          machineId: p.machineId,
          mouldId: p.mouldId,
          targetShots: p.targetShots,
          notes: p.notes || ''
        })));
      } else {
        setPlans([]);
      }
    } catch (error) {
      console.error('Failed to fetch plans:', error);
    }
  }

  const addPlanEntry = () => {
    setPlans((prev) => [
      ...prev,
      { id: `temp-${Date.now()}`, machineId: '', mouldId: '', targetShots: 0, notes: '' },
    ]);
  };

  const removePlanEntry = (id: string) => {
    setPlans((prev) => prev.filter((p) => p.id !== id));
  };

  const updatePlanEntry = (id: string, field: string, value: string | number) => {
    setPlans((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const totalTargetShots = plans.reduce((s, p) => s + p.targetShots, 0);
  const machinesPlanned = plans.filter((p) => p.machineId).length;

  const handleSave = async () => {
    try {
      setSaving(true);
      const plansToSave = plans
        .filter(p => p.machineId && p.mouldId)
        .map(p => ({
          machineId: p.machineId,
          mouldId: p.mouldId,
          targetShots: p.targetShots,
          notes: p.notes
        }));

      await productionPlansApi.bulkCreate({
        date,
        shift,
        plans: plansToSave,
        createdById: 'system'
      });

      alert('Daily plan saved successfully!');
      fetchPlansForDate();
    } catch (error) {
      console.error('Failed to save plans:', error);
      alert('Failed to save daily plan');
    } finally {
      setSaving(false);
    }
  };

  const getMachineName = (machineId: string) => {
    return machines.find(m => m.id === machineId)?.name || 'Select Machine';
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

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-5 sticky top-0 z-10 shadow-lg">
        <h1 className="text-xl font-bold">Daily Production Plan</h1>
        <p className="text-blue-100 text-sm mt-0.5">Plan your production targets</p>
      </div>

      <div className="p-4 space-y-4">
        {/* Date & Shift Selection */}
        <Card className="shadow-md border-0">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-slate-500 mb-1.5 block">Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="pl-9 h-11"
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs text-slate-500 mb-1.5 block">Shift</Label>
                <Select value={shift} onValueChange={(v) => setShift(v as 'DAY' | 'NIGHT')}>
                  <SelectTrigger className="h-11">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-slate-400" />
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DAY">Day (7AM-7PM)</SelectItem>
                    <SelectItem value="NIGHT">Night (7PM-7AM)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Target className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-emerald-100 text-xs">Total Target</p>
                  <p className="text-xl font-bold">{totalTargetShots.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-violet-500 to-violet-600 text-white border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Factory className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-violet-100 text-xs">Machines</p>
                  <p className="text-xl font-bold">{machinesPlanned}/{machines.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Add Entry Button */}
        <Button
          onClick={addPlanEntry}
          className="w-full h-12 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-md"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Machine Entry
        </Button>

        {/* Plan Entries */}
        <div className="space-y-3">
          {plans.map((plan, index) => (
            <Card key={plan.id} className="shadow-md border-0 overflow-hidden">
              <CardHeader className="p-3 pb-2 bg-gradient-to-r from-slate-100 to-slate-50 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <span className="font-semibold text-slate-700">
                    {plan.machineId ? getMachineName(plan.machineId) : 'New Entry'}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removePlanEntry(plan.id)}
                  className="h-8 w-8 p-0 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </CardHeader>
              <CardContent className="p-3 space-y-3">
                {/* Machine Selection */}
                <div>
                  <Label className="text-xs text-slate-500 mb-1.5 block">Machine</Label>
                  <Select
                    value={plan.machineId}
                    onValueChange={(v) => updatePlanEntry(plan.id, 'machineId', v)}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select machine" />
                    </SelectTrigger>
                    <SelectContent>
                      {machines.map((m) => (
                        <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Mould Selection */}
                <div>
                  <Label className="text-xs text-slate-500 mb-1.5 block">Mould</Label>
                  <Select
                    value={plan.mouldId}
                    onValueChange={(v) => updatePlanEntry(plan.id, 'mouldId', v)}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select mould" />
                    </SelectTrigger>
                    <SelectContent>
                      {moulds.map((m) => (
                        <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Target & Notes in a row */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs text-slate-500 mb-1.5 block">Target Shots</Label>
                    <Input
                      type="number"
                      value={plan.targetShots || ''}
                      onChange={(e) => updatePlanEntry(plan.id, 'targetShots', Number(e.target.value))}
                      placeholder="0"
                      className="h-11 text-center font-semibold"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs text-slate-500 mb-1.5 block">Notes</Label>
                    <Input
                      value={plan.notes}
                      onChange={(e) => updatePlanEntry(plan.id, 'notes', e.target.value)}
                      placeholder="Instructions..."
                      className="h-11"
                    />
                  </div>
                </div>

                {/* Quick target badge */}
                {plan.targetShots > 0 && (
                  <div className="flex items-center justify-end">
                    <Badge className="bg-emerald-100 text-emerald-700 border-0">
                      <Target className="h-3 w-3 mr-1" />
                      {plan.targetShots.toLocaleString()} shots
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {plans.length === 0 && (
          <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50">
            <CardContent className="p-8 text-center">
              <Factory className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No plans added yet</p>
              <p className="text-slate-400 text-sm mt-1">Tap "Add Machine Entry" to start planning</p>
            </CardContent>
          </Card>
        )}

        {/* Info Note */}
        <Card className="bg-blue-50 border-blue-100">
          <CardContent className="p-3">
            <p className="text-xs text-blue-700">
              <strong>Tip:</strong> Plan your daily targets around 2-3 PM. You can add notes like "100 shots then switch mould".
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Fixed Save Button */}
      {plans.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-lg">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold shadow-md"
          >
            {saving ? (
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            ) : (
              <Save className="h-5 w-5 mr-2" />
            )}
            Save Daily Plan
          </Button>
        </div>
      )}
    </div>
  );
}
