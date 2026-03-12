import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Wrench, Activity, PauseCircle, Loader2, Settings } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { machinesApi, type Machine } from '@/services/api';

type MachineStatus = 'RUNNING' | 'IDLE' | 'MAINTENANCE';

const statusConfig: Record<string, { label: string; color: string; bgColor: string; icon: typeof Activity }> = {
  RUNNING: { label: 'Running', color: 'text-emerald-600', bgColor: 'bg-emerald-100', icon: Activity },
  IDLE: { label: 'Idle', color: 'text-amber-600', bgColor: 'bg-amber-100', icon: PauseCircle },
  MAINTENANCE: { label: 'Maintenance', color: 'text-red-600', bgColor: 'bg-red-100', icon: Wrench },
};

export function Machines() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null);
  const [formData, setFormData] = useState({ name: '', type: '', status: 'IDLE' as MachineStatus });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchMachines();
  }, []);

  async function fetchMachines() {
    try {
      setLoading(true);
      const data = await machinesApi.getAll();
      setMachines(data);
    } catch (error) {
      console.error('Failed to fetch machines:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredMachines = machines.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAdd = () => {
    setEditingMachine(null);
    setFormData({ name: '', type: '', status: 'IDLE' });
    setIsDialogOpen(true);
  };

  const handleEdit = (machine: Machine) => {
    setEditingMachine(machine);
    setFormData({ name: machine.name, type: machine.type, status: machine.status });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this machine?')) return;
    try {
      await machinesApi.delete(id);
      setMachines((prev) => prev.filter((m) => m.id !== id));
    } catch (error) {
      console.error('Failed to delete machine:', error);
      alert('Failed to delete machine');
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      if (editingMachine) {
        const updated = await machinesApi.update(editingMachine.id, formData);
        setMachines((prev) =>
          prev.map((m) => (m.id === editingMachine.id ? updated : m))
        );
      } else {
        const newMachine = await machinesApi.create(formData);
        setMachines((prev) => [...prev, newMachine]);
      }
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Failed to save machine:', error);
      alert('Failed to save machine');
    } finally {
      setSaving(false);
    }
  };

  const stats = {
    total: machines.length,
    running: machines.filter((m) => m.status === 'RUNNING').length,
    idle: machines.filter((m) => m.status === 'IDLE').length,
    maintenance: machines.filter((m) => m.status === 'MAINTENANCE').length,
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
    <div className="min-h-screen bg-slate-50 pb-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-violet-700 text-white px-4 py-5 shadow-lg">
        <h1 className="text-xl font-bold">Machines</h1>
        <p className="text-violet-100 text-sm mt-0.5">Manage machine master data</p>
      </div>

      <div className="p-4 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-2">
          <Card className="bg-gradient-to-br from-violet-500 to-violet-600 text-white border-0 shadow-md">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-violet-100">Total</p>
            </CardContent>
          </Card>
          <Card className="bg-emerald-50 border-emerald-200">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-emerald-600">{stats.running}</p>
              <p className="text-xs text-emerald-600">Running</p>
            </CardContent>
          </Card>
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-amber-600">{stats.idle}</p>
              <p className="text-xs text-amber-600">Idle</p>
            </CardContent>
          </Card>
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-red-600">{stats.maintenance}</p>
              <p className="text-xs text-red-600">Maint.</p>
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
          <Button onClick={handleAdd} className="h-11 bg-gradient-to-r from-blue-500 to-blue-600 px-4">
            <Plus className="h-5 w-5" />
            <span className="ml-2 hidden sm:inline">Add</span>
          </Button>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden space-y-3">
          {filteredMachines.length === 0 ? (
            <Card className="border-dashed border-2 border-slate-200">
              <CardContent className="p-8 text-center">
                <Settings className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No machines found</p>
                <p className="text-slate-400 text-sm mt-1">Tap the + button to add one</p>
              </CardContent>
            </Card>
          ) : (
            filteredMachines.map((machine) => {
              const status = statusConfig[machine.status];
              const StatusIcon = status.icon;
              return (
                <Card key={machine.id} className="shadow-md border-0">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl ${status.bgColor}`}>
                          <StatusIcon className={`h-5 w-5 ${status.color}`} />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{machine.name}</p>
                          <p className="text-sm text-slate-500">{machine.type}</p>
                        </div>
                      </div>
                      <Badge className={`${status.bgColor} ${status.color} border-0`}>
                        {status.label}
                      </Badge>
                    </div>
                    <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(machine)}
                        className="flex-1"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(machine.id)}
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
                  <TableHead className="text-white font-semibold">Type</TableHead>
                  <TableHead className="text-white font-semibold">Status</TableHead>
                  <TableHead className="text-right text-white font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMachines.map((machine) => {
                  const status = statusConfig[machine.status];
                  const StatusIcon = status.icon;
                  return (
                    <TableRow key={machine.id} className="hover:bg-slate-50">
                      <TableCell className="font-medium text-slate-800">{machine.name}</TableCell>
                      <TableCell className="text-slate-600">{machine.type}</TableCell>
                      <TableCell>
                        <Badge className={`${status.bgColor} ${status.color} border-0`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(machine)}
                          className="hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(machine.id)}
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
              {editingMachine ? 'Edit Machine' : 'Add New Machine'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Machine Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., IMM-010"
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Machine Type</Label>
              <Input
                id="type"
                value={formData.type}
                onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value }))}
                placeholder="e.g., Injection Molding 100T"
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value as Machine['status'] }))}
              >
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RUNNING">Running</SelectItem>
                  <SelectItem value="IDLE">Idle</SelectItem>
                  <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                </SelectContent>
              </Select>
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
