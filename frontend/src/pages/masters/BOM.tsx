import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit, Trash2, FileSpreadsheet, Loader2 } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { bomApi, componentsApi, rawMaterialsApi, type BOM, type Component, type RawMaterial } from '@/services/api';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function BOMPage() {
  const [boms, setBoms] = useState<BOM[]>([]);
  const [components, setComponents] = useState<Component[]>([]);
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBOM, setEditingBOM] = useState<BOM | null>(null);
  const [formData, setFormData] = useState({
    componentId: '', rawMaterialId: '', weightPerPiece: 0, runnerWeight: 0, cycleTime: 0, packingMaterial: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const [bomsData, componentsData, materialsData] = await Promise.all([
        bomApi.getAll(),
        componentsApi.getAll(),
        rawMaterialsApi.getAll()
      ]);
      setBoms(bomsData);
      setComponents(componentsData);
      setRawMaterials(materialsData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredBOMs = boms.filter((b) =>
    b.component?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.rawMaterial?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAdd = () => {
    setEditingBOM(null);
    setFormData({ componentId: '', rawMaterialId: '', weightPerPiece: 0, runnerWeight: 0, cycleTime: 0, packingMaterial: '' });
    setIsDialogOpen(true);
  };

  const handleEdit = (bom: BOM) => {
    setEditingBOM(bom);
    setFormData({
      componentId: bom.componentId,
      rawMaterialId: bom.rawMaterialId,
      weightPerPiece: bom.weightPerPiece,
      runnerWeight: bom.runnerWeight,
      cycleTime: bom.cycleTime,
      packingMaterial: bom.packingMaterial || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this BOM entry?')) return;
    try {
      await bomApi.delete(id);
      setBoms((prev) => prev.filter((b) => b.id !== id));
    } catch (error) {
      console.error('Failed to delete BOM:', error);
      alert('Failed to delete BOM entry');
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      if (editingBOM) {
        const updated = await bomApi.update(editingBOM.id, formData);
        setBoms((prev) =>
          prev.map((b) => (b.id === editingBOM.id ? updated : b))
        );
      } else {
        const newBOM = await bomApi.create(formData);
        setBoms((prev) => [...prev, newBOM]);
      }
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Failed to save BOM:', error);
      alert('Failed to save BOM entry');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header title="Bill of Materials" subtitle="Component to Raw Material mapping with production parameters" />
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header title="Bill of Materials" subtitle="Component to Raw Material mapping with production parameters" />

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="p-6 space-y-6">
        {/* Stats */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <FileSpreadsheet className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total BOM Entries</p>
                  <p className="text-2xl font-bold">{boms.length}</p>
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
              placeholder="Search BOM..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Add BOM Entry
          </Button>
        </motion.div>

        {/* Table */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Component</TableHead>
                    <TableHead>Raw Material</TableHead>
                    <TableHead>Weight/Piece (g)</TableHead>
                    <TableHead>Runner Weight (g)</TableHead>
                    <TableHead>Cycle Time (sec)</TableHead>
                    <TableHead>Packing</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBOMs.map((bom) => (
                    <TableRow key={bom.id}>
                      <TableCell className="font-medium">{bom.component?.name || '-'}</TableCell>
                      <TableCell>{bom.rawMaterial?.name || '-'}</TableCell>
                      <TableCell>{bom.weightPerPiece} g</TableCell>
                      <TableCell>{bom.runnerWeight} g</TableCell>
                      <TableCell>{bom.cycleTime} sec</TableCell>
                      <TableCell>{bom.packingMaterial || '-'}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(bom)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(bom.id)}>
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingBOM ? 'Edit BOM Entry' : 'Add New BOM Entry'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
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
              <Label>Raw Material</Label>
              <Select
                value={formData.rawMaterialId}
                onValueChange={(v) => setFormData((prev) => ({ ...prev, rawMaterialId: v }))}
              >
                <SelectTrigger><SelectValue placeholder="Select raw material" /></SelectTrigger>
                <SelectContent>
                  {rawMaterials.map((m) => (
                    <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Weight/Piece (g)</Label>
                <Input
                  type="number"
                  value={formData.weightPerPiece}
                  onChange={(e) => setFormData((prev) => ({ ...prev, weightPerPiece: Number(e.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Runner Weight (g)</Label>
                <Input
                  type="number"
                  value={formData.runnerWeight}
                  onChange={(e) => setFormData((prev) => ({ ...prev, runnerWeight: Number(e.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Cycle Time (sec)</Label>
                <Input
                  type="number"
                  value={formData.cycleTime}
                  onChange={(e) => setFormData((prev) => ({ ...prev, cycleTime: Number(e.target.value) }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Packing Material</Label>
              <Input
                value={formData.packingMaterial}
                onChange={(e) => setFormData((prev) => ({ ...prev, packingMaterial: e.target.value }))}
                placeholder="e.g., Plastic Bag, Foam Tray"
              />
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

// Keep export as BOM for backwards compatibility
export { BOMPage as BOM };
