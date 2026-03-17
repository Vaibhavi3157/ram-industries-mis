import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, FileSpreadsheet, Loader2, Package, Layers, Scale, Timer, Box } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { bomApi, componentsApi, rawMaterialsApi, packingMaterialsApi, type BOM, type Component, type RawMaterial, type PackingMaterial } from '@/services/api';

export function BOMPage() {
  const [boms, setBoms] = useState<BOM[]>([]);
  const [components, setComponents] = useState<Component[]>([]);
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);
  const [packingMaterials, setPackingMaterials] = useState<PackingMaterial[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBOM, setEditingBOM] = useState<BOM | null>(null);
  const [formData, setFormData] = useState({
    componentId: '', rawMaterialId: '', weightPerPiece: 0, runnerWeight: 0, cycleTime: 0, packingMaterialId: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const [bomsData, componentsData, materialsData, packingData] = await Promise.all([
        bomApi.getAll(),
        componentsApi.getAll(),
        rawMaterialsApi.getAll(),
        packingMaterialsApi.getAll()
      ]);
      setBoms(bomsData);
      setComponents(componentsData);
      setRawMaterials(materialsData);
      setPackingMaterials(packingData);
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
    setFormData({ componentId: '', rawMaterialId: '', weightPerPiece: 0, runnerWeight: 0, cycleTime: 0, packingMaterialId: '' });
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
      packingMaterialId: bom.packingMaterialId || ''
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

  const getPackingMaterialName = (id: string | null | undefined) => {
    if (!id) return '-';
    return packingMaterials.find(p => p.id === id)?.name || '-';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-500 mx-auto" />
          <p className="mt-3 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-4 py-5 shadow-lg">
        <h1 className="text-xl font-bold">Bill of Materials</h1>
        <p className="text-indigo-100 text-sm mt-0.5">Component to Raw Material mapping</p>
      </div>

      <div className="p-4 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white border-0 shadow-md">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold">{boms.length}</p>
              <p className="text-xs text-indigo-100">Total BOM</p>
            </CardContent>
          </Card>
          <Card className="bg-violet-50 border-violet-200">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-violet-600">{components.length}</p>
              <p className="text-xs text-violet-600">Components</p>
            </CardContent>
          </Card>
          <Card className="bg-cyan-50 border-cyan-200">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-cyan-600">{rawMaterials.length}</p>
              <p className="text-xs text-cyan-600">Materials</p>
            </CardContent>
          </Card>
        </div>

        {/* Search & Add */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search BOM..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11"
            />
          </div>
          <Button onClick={handleAdd} className="h-11 bg-gradient-to-r from-indigo-500 to-indigo-600 px-4">
            <Plus className="h-5 w-5" />
            <span className="ml-2 hidden sm:inline">Add</span>
          </Button>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden space-y-3">
          {filteredBOMs.length === 0 ? (
            <Card className="border-dashed border-2 border-slate-200">
              <CardContent className="p-8 text-center">
                <FileSpreadsheet className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No BOM entries found</p>
                <p className="text-slate-400 text-sm mt-1">Tap the + button to add one</p>
              </CardContent>
            </Card>
          ) : (
            filteredBOMs.map((bom) => (
              <Card key={bom.id} className="shadow-md border-0">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-indigo-100">
                        <Layers className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">{bom.component?.name}</p>
                        <p className="text-sm text-slate-500">{bom.rawMaterial?.name}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="bg-slate-50 rounded-lg p-2 text-center">
                      <Scale className="h-3 w-3 text-slate-400 mx-auto mb-1" />
                      <p className="text-xs text-slate-500">Weight</p>
                      <p className="font-semibold text-slate-800 text-sm">{bom.weightPerPiece}g</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-2 text-center">
                      <Package className="h-3 w-3 text-slate-400 mx-auto mb-1" />
                      <p className="text-xs text-slate-500">Runner</p>
                      <p className="font-semibold text-slate-800 text-sm">{bom.runnerWeight}g</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-2 text-center">
                      <Timer className="h-3 w-3 text-slate-400 mx-auto mb-1" />
                      <p className="text-xs text-slate-500">Cycle</p>
                      <p className="font-semibold text-slate-800 text-sm">{bom.cycleTime}s</p>
                    </div>
                  </div>

                  {bom.packingMaterialId && (
                    <Badge variant="outline" className="border-orange-300 text-orange-700 bg-orange-50 mb-3">
                      <Box className="h-3 w-3 mr-1" />
                      {getPackingMaterialName(bom.packingMaterialId)}
                    </Badge>
                  )}

                  <div className="flex gap-2 pt-3 border-t border-slate-100">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(bom)}
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(bom.id)}
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
                  <TableHead className="text-white font-semibold">Component</TableHead>
                  <TableHead className="text-white font-semibold">Raw Material</TableHead>
                  <TableHead className="text-white font-semibold">Weight/Piece (g)</TableHead>
                  <TableHead className="text-white font-semibold">Runner Weight (g)</TableHead>
                  <TableHead className="text-white font-semibold">Cycle Time (sec)</TableHead>
                  <TableHead className="text-white font-semibold">Packing Material</TableHead>
                  <TableHead className="text-right text-white font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBOMs.map((bom) => (
                  <TableRow key={bom.id} className="hover:bg-slate-50">
                    <TableCell className="font-medium text-slate-800">{bom.component?.name || '-'}</TableCell>
                    <TableCell className="text-slate-600">{bom.rawMaterial?.name || '-'}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-indigo-300 text-indigo-700 bg-indigo-50">
                        {bom.weightPerPiece} g
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-violet-300 text-violet-700 bg-violet-50">
                        {bom.runnerWeight} g
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-cyan-300 text-cyan-700 bg-cyan-50">
                        {bom.cycleTime} sec
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {bom.packingMaterialId ? (
                        <Badge variant="outline" className="border-orange-300 text-orange-700 bg-orange-50">
                          {getPackingMaterialName(bom.packingMaterialId)}
                        </Badge>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(bom)}
                        className="hover:bg-blue-50 hover:text-blue-600"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(bom.id)}
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
        <DialogContent className="mx-4 rounded-2xl max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-indigo-600" />
              {editingBOM ? 'Edit BOM Entry' : 'Add New BOM Entry'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Component */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-indigo-500" />
                Component
              </Label>
              <Select
                value={formData.componentId}
                onValueChange={(v) => setFormData((prev) => ({ ...prev, componentId: v }))}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select component" />
                </SelectTrigger>
                <SelectContent>
                  {components.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      <div className="flex items-center gap-2">
                        <Layers className="h-4 w-4 text-indigo-500" />
                        {c.name} - {c.customerName}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Raw Material */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Package className="h-4 w-4 text-violet-500" />
                Raw Material
              </Label>
              <Select
                value={formData.rawMaterialId}
                onValueChange={(v) => setFormData((prev) => ({ ...prev, rawMaterialId: v }))}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select raw material" />
                </SelectTrigger>
                <SelectContent>
                  {rawMaterials.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-violet-500" />
                        {m.name} ({m.grade})
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Weight & Timing */}
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label className="text-xs flex items-center gap-1">
                  <Scale className="h-3 w-3" />
                  Weight/Piece (g)
                </Label>
                <Input
                  type="number"
                  value={formData.weightPerPiece || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, weightPerPiece: Number(e.target.value) }))}
                  className="h-11 text-center"
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs flex items-center gap-1">
                  <Package className="h-3 w-3" />
                  Runner (g)
                </Label>
                <Input
                  type="number"
                  value={formData.runnerWeight || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, runnerWeight: Number(e.target.value) }))}
                  className="h-11 text-center"
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs flex items-center gap-1">
                  <Timer className="h-3 w-3" />
                  Cycle (sec)
                </Label>
                <Input
                  type="number"
                  value={formData.cycleTime || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, cycleTime: Number(e.target.value) }))}
                  className="h-11 text-center"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Packing Material Dropdown */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Box className="h-4 w-4 text-orange-500" />
                Packing Material
              </Label>
              <Select
                value={formData.packingMaterialId || "none"}
                onValueChange={(v) => setFormData((prev) => ({ ...prev, packingMaterialId: v === "none" ? "" : v }))}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select packing material" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    <span className="text-slate-400">No packing material</span>
                  </SelectItem>
                  {packingMaterials.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      <div className="flex items-center gap-2">
                        <Box className="h-4 w-4 text-orange-500" />
                        {p.name} ({p.type})
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={saving} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto bg-gradient-to-r from-indigo-500 to-indigo-600">
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
