import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Calendar, Target, Loader2, Clock, Factory, Box } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { machinesApi, mouldsApi, productionPlansApi, type Machine, type Mould, type ProductionPlan } from '@/services/api';

export function DailyPlan() {
  const [plans, setPlans] = useState<ProductionPlan[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [moulds, setMoulds] = useState<Mould[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterShift, setFilterShift] = useState<'ALL' | 'DAY' | 'NIGHT'>('ALL');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<ProductionPlan | null>(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    shift: 'DAY' as 'DAY' | 'NIGHT',
    machineId: '',
    mouldId: '',
    targetShots: 0,
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [filterDate, filterShift]);

  async function fetchData() {
    try {
      setLoading(true);
      const [machinesData, mouldsData] = await Promise.all([
        machinesApi.getAll(),
        mouldsApi.getAll()
      ]);
      setMachines(machinesData);
      setMoulds(mouldsData);
      await fetchPlans();
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchPlans() {
    try {
      const params: any = {};
      if (filterDate) params.date = filterDate;
      if (filterShift !== 'ALL') params.shift = filterShift;

      const plansData = await productionPlansApi.getAll(params);
      setPlans(plansData);
    } catch (error) {
      console.error('Failed to fetch plans:', error);
    }
  }

  const filteredPlans = plans.filter((p) => {
    const machineName = p.machine?.name?.toLowerCase() || '';
    const mouldName = p.mould?.name?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();
    return machineName.includes(query) || mouldName.includes(query);
  });

  const handleAdd = () => {
    setEditingPlan(null);
    setFormData({
      date: filterDate,
      shift: filterShift === 'ALL' ? 'DAY' : filterShift,
      machineId: '',
      mouldId: '',
      targetShots: 0,
      notes: ''
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (plan: ProductionPlan) => {
    setEditingPlan(plan);
    setFormData({
      date: plan.date.split('T')[0],
      shift: plan.shift as 'DAY' | 'NIGHT',
      machineId: plan.machineId,
      mouldId: plan.mouldId,
      targetShots: plan.targetShots,
      notes: plan.notes || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this plan?')) return;
    try {
      await productionPlansApi.delete(id);
      setPlans((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      console.error('Failed to delete plan:', error);
      alert('Failed to delete plan');
    }
  };

  const handleSave = async () => {
    if (!formData.machineId || !formData.mouldId) {
      alert('Please select machine and mould');
      return;
    }

    try {
      setSaving(true);
      if (editingPlan) {
        const updated = await productionPlansApi.update(editingPlan.id, {
          machineId: formData.machineId,
          mouldId: formData.mouldId,
          targetShots: formData.targetShots,
          notes: formData.notes
        });
        setPlans((prev) =>
          prev.map((p) => (p.id === editingPlan.id ? updated : p))
        );
      } else {
        const newPlan = await productionPlansApi.create({
          date: formData.date,
          shift: formData.shift,
          machineId: formData.machineId,
          mouldId: formData.mouldId,
          targetShots: formData.targetShots,
          notes: formData.notes,
          createdById: 'system'
        });
        setPlans((prev) => [newPlan, ...prev]);
      }
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Failed to save plan:', error);
      alert('Failed to save plan');
    } finally {
      setSaving(false);
    }
  };

  const stats = {
    total: filteredPlans.length,
    totalShots: filteredPlans.reduce((sum, p) => sum + p.targetShots, 0),
    dayShift: filteredPlans.filter((p) => p.shift === 'DAY').length,
    nightShift: filteredPlans.filter((p) => p.shift === 'NIGHT').length,
  };

  const getMachineName = (id: string) => machines.find(m => m.id === id)?.name || '-';
  const getMouldName = (id: string) => moulds.find(m => m.id === id)?.name || '-';

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
    <div className="min-h-screen bg-slate-50 pb-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-5 shadow-lg">
        <h1 className="text-xl font-bold">Daily Production Plan</h1>
        <p className="text-blue-100 text-sm mt-0.5">Plan & manage production targets</p>
      </div>

      <div className="p-4 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-2">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-md">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-blue-100">Total Plans</p>
            </CardContent>
          </Card>
          <Card className="bg-emerald-50 border-emerald-200">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-emerald-600">{stats.totalShots.toLocaleString()}</p>
              <p className="text-xs text-emerald-600">Target Shots</p>
            </CardContent>
          </Card>
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-amber-600">{stats.dayShift}</p>
              <p className="text-xs text-amber-600">Day Shift</p>
            </CardContent>
          </Card>
          <Card className="bg-indigo-50 border-indigo-200">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-indigo-600">{stats.nightShift}</p>
              <p className="text-xs text-indigo-600">Night Shift</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="shadow-md border-0">
          <CardContent className="p-3">
            <div className="grid grid-cols-3 gap-2">
              <div className="relative">
                <Calendar className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="pl-8 h-10 text-sm"
                />
              </div>
              <Select value={filterShift} onValueChange={(v) => setFilterShift(v as any)}>
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Shifts</SelectItem>
                  <SelectItem value="DAY">Day Shift</SelectItem>
                  <SelectItem value="NIGHT">Night Shift</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Add Button */}
        <Button onClick={handleAdd} className="w-full h-11 bg-gradient-to-r from-blue-500 to-blue-600">
          <Plus className="h-5 w-5 mr-2" />
          Add New Plan
        </Button>

        {/* Mobile Cards - History */}
        <div className="lg:hidden space-y-3">
          {filteredPlans.length === 0 ? (
            <Card className="border-dashed border-2 border-slate-200">
              <CardContent className="p-8 text-center">
                <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No plans found</p>
                <p className="text-slate-400 text-sm mt-1">Tap "Add New Plan" to create one</p>
              </CardContent>
            </Card>
          ) : (
            filteredPlans.map((plan) => (
              <Card key={plan.id} className="shadow-md border-0">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl ${plan.shift === 'DAY' ? 'bg-amber-100' : 'bg-indigo-100'}`}>
                        <Factory className={`h-5 w-5 ${plan.shift === 'DAY' ? 'text-amber-600' : 'text-indigo-600'}`} />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">{plan.machine?.name}</p>
                        <div className="flex items-center gap-1 text-sm text-slate-500">
                          <Box className="h-3 w-3" />
                          {plan.mould?.name}
                        </div>
                      </div>
                    </div>
                    <Badge className={plan.shift === 'DAY' ? 'bg-amber-100 text-amber-700 border-0' : 'bg-indigo-100 text-indigo-700 border-0'}>
                      {plan.shift === 'DAY' ? 'Day' : 'Night'}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 mt-3">
                    <Badge variant="outline" className="border-emerald-300 text-emerald-700 bg-emerald-50">
                      <Target className="h-3 w-3 mr-1" />
                      {plan.targetShots.toLocaleString()} shots
                    </Badge>
                    {plan.notes && (
                      <span className="text-xs text-slate-500 truncate flex-1">{plan.notes}</span>
                    )}
                  </div>

                  <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(plan)}
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(plan.id)}
                      className="text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Desktop Table */}
        <Card className="hidden lg:block border-slate-200 shadow-md overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-slate-700 to-slate-800">
                  <TableHead className="text-white font-semibold">Date</TableHead>
                  <TableHead className="text-white font-semibold">Shift</TableHead>
                  <TableHead className="text-white font-semibold">Machine</TableHead>
                  <TableHead className="text-white font-semibold">Mould</TableHead>
                  <TableHead className="text-white font-semibold">Target Shots</TableHead>
                  <TableHead className="text-white font-semibold">Notes</TableHead>
                  <TableHead className="text-right text-white font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPlans.map((plan) => (
                  <TableRow key={plan.id} className="hover:bg-slate-50">
                    <TableCell className="text-slate-600">
                      {new Date(plan.date).toLocaleDateString('en-IN')}
                    </TableCell>
                    <TableCell>
                      <Badge className={plan.shift === 'DAY' ? 'bg-amber-100 text-amber-700 border-0' : 'bg-indigo-100 text-indigo-700 border-0'}>
                        {plan.shift}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium text-slate-800">{plan.machine?.name}</TableCell>
                    <TableCell className="text-slate-600">{plan.mould?.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-emerald-300 text-emerald-700 bg-emerald-50">
                        {plan.targetShots.toLocaleString()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-500 max-w-[150px] truncate">{plan.notes || '-'}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(plan)}
                        className="hover:bg-blue-50 hover:text-blue-600"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(plan.id)}
                        className="hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="mx-4 rounded-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingPlan ? 'Edit Plan' : 'Add New Plan'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                  className="h-11"
                  disabled={!!editingPlan}
                />
              </div>
              <div className="space-y-2">
                <Label>Shift</Label>
                <Select
                  value={formData.shift}
                  onValueChange={(v) => setFormData((prev) => ({ ...prev, shift: v as 'DAY' | 'NIGHT' }))}
                  disabled={!!editingPlan}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DAY">Day Shift</SelectItem>
                    <SelectItem value="NIGHT">Night Shift</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Machine</Label>
              <Select
                value={formData.machineId}
                onValueChange={(v) => setFormData((prev) => ({ ...prev, machineId: v }))}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select machine" />
                </SelectTrigger>
                <SelectContent>
                  {machines.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      <div className="flex items-center gap-2">
                        <Factory className="h-4 w-4 text-blue-500" />
                        {m.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Mould</Label>
              <Select
                value={formData.mouldId}
                onValueChange={(v) => setFormData((prev) => ({ ...prev, mouldId: v }))}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select mould" />
                </SelectTrigger>
                <SelectContent>
                  {moulds.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      <div className="flex items-center gap-2">
                        <Box className="h-4 w-4 text-orange-500" />
                        {m.name} - {m.customerName}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Target Shots</Label>
              <Input
                type="number"
                value={formData.targetShots || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, targetShots: Number(e.target.value) }))}
                placeholder="e.g., 1000"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label>Notes (Optional)</Label>
              <Input
                value={formData.notes}
                onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="e.g., 500 shots then mould change"
                className="h-11"
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={saving} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-blue-600">
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
