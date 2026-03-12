import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit, Trash2, Box, Loader2 } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mouldsApi, componentsApi, type Mould, type Component } from '@/services/api';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function Moulds() {
  const [moulds, setMoulds] = useState<Mould[]>([]);
  const [components, setComponents] = useState<Component[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMould, setEditingMould] = useState<Mould | null>(null);
  const [formData, setFormData] = useState({
    name: '', componentId: '', customerName: '', totalCavity: 1, runCavity: 1
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const [mouldsData, componentsData] = await Promise.all([
        mouldsApi.getAll(),
        componentsApi.getAll()
      ]);
      setMoulds(mouldsData);
      setComponents(componentsData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredMoulds = moulds.filter((m) =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.customerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAdd = () => {
    setEditingMould(null);
    setFormData({ name: '', componentId: '', customerName: '', totalCavity: 1, runCavity: 1 });
    setIsDialogOpen(true);
  };

  const handleEdit = (mould: Mould) => {
    setEditingMould(mould);
    setFormData({
      name: mould.name,
      componentId: mould.componentId,
      customerName: mould.customerName,
      totalCavity: mould.totalCavity,
      runCavity: mould.runCavity
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this mould?')) return;
    try {
      await mouldsApi.delete(id);
      setMoulds((prev) => prev.filter((m) => m.id !== id));
    } catch (error) {
      console.error('Failed to delete mould:', error);
      alert('Failed to delete mould');
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      if (editingMould) {
        const updated = await mouldsApi.update(editingMould.id, formData);
        setMoulds((prev) =>
          prev.map((m) => (m.id === editingMould.id ? updated : m))
        );
      } else {
        const newMould = await mouldsApi.create(formData);
        setMoulds((prev) => [...prev, newMould]);
      }
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Failed to save mould:', error);
      alert('Failed to save mould');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header title="Moulds" subtitle="Manage mould/die master data (customer provided)" />
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header title="Moulds" subtitle="Manage mould/die master data (customer provided)" />

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="p-6 space-y-6">
        {/* Stats */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Box className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Moulds</p>
                  <p className="text-2xl font-bold">{moulds.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Search & Add */}
        <motion.div variants={itemVariants} className="flex justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search moulds..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Add Mould
          </Button>
        </motion.div>

        {/* Table */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mould Name</TableHead>
                    <TableHead>Component</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Total Cavity</TableHead>
                    <TableHead>Run Cavity</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMoulds.map((mould) => (
                    <TableRow key={mould.id}>
                      <TableCell className="font-medium">{mould.name}</TableCell>
                      <TableCell>{mould.component?.name || '-'}</TableCell>
                      <TableCell>{mould.customerName}</TableCell>
                      <TableCell>{mould.totalCavity}</TableCell>
                      <TableCell>{mould.runCavity}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(mould)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(mould.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingMould ? 'Edit Mould' : 'Add New Mould'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Mould Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Samsung S23 Mould"
              />
            </div>
            <div className="space-y-2">
              <Label>Component</Label>
              <Select
                value={formData.componentId}
                onValueChange={(v) => setFormData((prev) => ({ ...prev, componentId: v }))}
              >
                <SelectTrigger><SelectValue placeholder="Select component" /></SelectTrigger>
                <SelectContent>
                  {components.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Customer Name</Label>
              <Input
                value={formData.customerName}
                onChange={(e) => setFormData((prev) => ({ ...prev, customerName: e.target.value }))}
                placeholder="e.g., Samsung"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Total Cavity</Label>
                <Input
                  type="number"
                  value={formData.totalCavity}
                  onChange={(e) => setFormData((prev) => ({ ...prev, totalCavity: Number(e.target.value) }))}
                  min={1}
                />
              </div>
              <div className="space-y-2">
                <Label>Run Cavity</Label>
                <Input
                  type="number"
                  value={formData.runCavity}
                  onChange={(e) => setFormData((prev) => ({ ...prev, runCavity: Number(e.target.value) }))}
                  min={1}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={saving}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
