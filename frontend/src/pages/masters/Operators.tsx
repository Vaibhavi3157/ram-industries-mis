import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, User, CheckCircle, Loader2, Sun, Moon, Factory } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { operatorsApi, machinesApi, type Operator, type Machine } from '@/services/api';

type Shift = 'DAY' | 'NIGHT';

export function Operators() {
  const [operators, setOperators] = useState<Operator[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOperator, setEditingOperator] = useState<Operator | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    shift: 'DAY' as Shift,
    machineId: '',
    isActive: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const [operatorsData, machinesData] = await Promise.all([
        operatorsApi.getAll(),
        machinesApi.getAll()
      ]);
      setOperators(operatorsData);
      setMachines(machinesData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredOperators = operators.filter(
    (o) =>
      o.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.phone.includes(searchQuery)
  );

  const handleAdd = () => {
    setEditingOperator(null);
    setFormData({ name: '', phone: '', shift: 'DAY', machineId: '', isActive: true });
    setIsDialogOpen(true);
  };

  const handleEdit = (operator: Operator) => {
    setEditingOperator(operator);
    setFormData({
      name: operator.name,
      phone: operator.phone,
      shift: (operator.shift as Shift) || 'DAY',
      machineId: operator.machineId || '',
      isActive: operator.isActive
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this operator?')) return;
    try {
      await operatorsApi.delete(id);
      setOperators((prev) => prev.filter((o) => o.id !== id));
    } catch (error) {
      console.error('Failed to delete operator:', error);
      alert('Failed to delete operator');
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = {
        ...formData,
        machineId: formData.machineId || null
      };
      if (editingOperator) {
        const updated = await operatorsApi.update(editingOperator.id, payload);
        setOperators((prev) =>
          prev.map((o) => (o.id === editingOperator.id ? updated : o))
        );
      } else {
        const newOperator = await operatorsApi.create(payload);
        setOperators((prev) => [...prev, newOperator]);
      }
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Failed to save operator:', error);
      alert('Failed to save operator');
    } finally {
      setSaving(false);
    }
  };

  const stats = {
    total: operators.length,
    active: operators.filter((o) => o.isActive).length,
    dayShift: operators.filter((o) => o.shift === 'DAY').length,
    nightShift: operators.filter((o) => o.shift === 'NIGHT').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-emerald-500 mx-auto" />
          <p className="mt-3 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-4 py-5 shadow-lg">
        <h1 className="text-xl font-bold">Operators</h1>
        <p className="text-emerald-100 text-sm mt-0.5">Manage operator master data</p>
      </div>

      <div className="p-4 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-2">
          <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-md">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-emerald-100">Total</p>
            </CardContent>
          </Card>
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              <p className="text-xs text-green-600">Active</p>
            </CardContent>
          </Card>
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-amber-600">{stats.dayShift}</p>
              <p className="text-xs text-amber-600">Day</p>
            </CardContent>
          </Card>
          <Card className="bg-indigo-50 border-indigo-200">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-indigo-600">{stats.nightShift}</p>
              <p className="text-xs text-indigo-600">Night</p>
            </CardContent>
          </Card>
        </div>

        {/* Search & Add */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11"
            />
          </div>
          <Button onClick={handleAdd} className="h-11 bg-gradient-to-r from-emerald-500 to-emerald-600 px-4">
            <Plus className="h-5 w-5" />
            <span className="ml-2 hidden sm:inline">Add</span>
          </Button>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden space-y-3">
          {filteredOperators.length === 0 ? (
            <Card className="border-dashed border-2 border-slate-200">
              <CardContent className="p-8 text-center">
                <User className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No operators found</p>
                <p className="text-slate-400 text-sm mt-1">Tap the + button to add one</p>
              </CardContent>
            </Card>
          ) : (
            filteredOperators.map((operator) => {
              const machine = operator.machine;
              return (
                <Card key={operator.id} className="shadow-md border-0">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl ${operator.isActive ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                          <User className={`h-5 w-5 ${operator.isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{operator.name}</p>
                          <p className="text-sm text-slate-500">{operator.phone}</p>
                        </div>
                      </div>
                      <Badge className={operator.isActive ? 'bg-emerald-100 text-emerald-700 border-0' : 'bg-slate-100 text-slate-600 border-0'}>
                        {operator.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>

                    {/* Shift & Machine Info */}
                    <div className="flex gap-2 mt-3">
                      <Badge variant="outline" className={operator.shift === 'DAY' ? 'border-amber-300 text-amber-700 bg-amber-50' : 'border-indigo-300 text-indigo-700 bg-indigo-50'}>
                        {operator.shift === 'DAY' ? <Sun className="h-3 w-3 mr-1" /> : <Moon className="h-3 w-3 mr-1" />}
                        {operator.shift === 'DAY' ? 'Day Shift' : 'Night Shift'}
                      </Badge>
                      {machine && (
                        <Badge variant="outline" className="border-blue-300 text-blue-700 bg-blue-50">
                          <Factory className="h-3 w-3 mr-1" />
                          {machine.name}
                        </Badge>
                      )}
                    </div>

                    <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(operator)}
                        className="flex-1"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(operator.id)}
                        className="text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Desktop Table */}
        <Card className="hidden lg:block border-slate-200 shadow-md overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-slate-700 to-slate-800">
                  <TableHead className="text-white font-semibold">Name</TableHead>
                  <TableHead className="text-white font-semibold">Phone</TableHead>
                  <TableHead className="text-white font-semibold">Shift</TableHead>
                  <TableHead className="text-white font-semibold">Machine</TableHead>
                  <TableHead className="text-white font-semibold">Status</TableHead>
                  <TableHead className="text-right text-white font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOperators.map((operator) => {
                  const machine = operator.machine;
                  return (
                    <TableRow key={operator.id} className="hover:bg-slate-50">
                      <TableCell className="font-medium text-slate-800">{operator.name}</TableCell>
                      <TableCell className="text-slate-600">{operator.phone}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={operator.shift === 'DAY' ? 'border-amber-300 text-amber-700 bg-amber-50' : 'border-indigo-300 text-indigo-700 bg-indigo-50'}>
                          {operator.shift === 'DAY' ? <Sun className="h-3 w-3 mr-1" /> : <Moon className="h-3 w-3 mr-1" />}
                          {operator.shift === 'DAY' ? 'Day' : 'Night'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {machine ? (
                          <Badge variant="outline" className="border-blue-300 text-blue-700 bg-blue-50">
                            <Factory className="h-3 w-3 mr-1" />
                            {machine.name}
                          </Badge>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={operator.isActive ? 'bg-emerald-100 text-emerald-700 border-0' : 'bg-red-100 text-red-700 border-0'}>
                          {operator.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(operator)}
                          className="hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(operator.id)}
                          className="hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
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
              {editingOperator ? 'Edit Operator' : 'Add New Operator'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Operator Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Ramesh Kumar"
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="e.g., 9876543210"
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shift">Shift</Label>
              <Select
                value={formData.shift}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, shift: value as Shift }))}
              >
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DAY">
                    <div className="flex items-center gap-2">
                      <Sun className="h-4 w-4 text-amber-500" />
                      Day Shift (7AM - 7PM)
                    </div>
                  </SelectItem>
                  <SelectItem value="NIGHT">
                    <div className="flex items-center gap-2">
                      <Moon className="h-4 w-4 text-indigo-500" />
                      Night Shift (7PM - 7AM)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="machine">Assigned Machine</Label>
              <Select
                value={formData.machineId || "none"}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, machineId: value === "none" ? "" : value }))}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select machine (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    <span className="text-slate-400">No machine assigned</span>
                  </SelectItem>
                  {machines.map((machine) => (
                    <SelectItem key={machine.id} value={machine.id}>
                      <div className="flex items-center gap-2">
                        <Factory className="h-4 w-4 text-blue-500" />
                        {machine.name} - {machine.type}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
                className="h-5 w-5 rounded"
              />
              <Label htmlFor="isActive" className="flex items-center gap-2">
                <CheckCircle className={`h-4 w-4 ${formData.isActive ? 'text-emerald-500' : 'text-slate-400'}`} />
                Active Operator
              </Label>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={saving} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-emerald-600">
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
