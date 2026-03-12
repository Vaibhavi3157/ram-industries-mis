import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Package, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { rawMaterialsApi, type RawMaterial } from '@/services/api';

export function RawMaterials() {
  const [materials, setMaterials] = useState<RawMaterial[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<RawMaterial | null>(null);
  const [formData, setFormData] = useState({
    name: '', grade: '', unit: 'KG', currentStock: 0, minStock: 0
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchMaterials();
  }, []);

  async function fetchMaterials() {
    try {
      setLoading(true);
      const data = await rawMaterialsApi.getAll();
      setMaterials(data);
    } catch (error) {
      console.error('Failed to fetch materials:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredMaterials = materials.filter((m) =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.grade?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAdd = () => {
    setEditingMaterial(null);
    setFormData({ name: '', grade: '', unit: 'KG', currentStock: 0, minStock: 0 });
    setIsDialogOpen(true);
  };

  const handleEdit = (material: RawMaterial) => {
    setEditingMaterial(material);
    setFormData({
      name: material.name,
      grade: material.grade || '',
      unit: material.unit,
      currentStock: material.currentStock,
      minStock: material.minStock
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this material?')) return;
    try {
      await rawMaterialsApi.delete(id);
      setMaterials((prev) => prev.filter((m) => m.id !== id));
    } catch (error) {
      console.error('Failed to delete material:', error);
      alert('Failed to delete material');
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      if (editingMaterial) {
        const updated = await rawMaterialsApi.update(editingMaterial.id, formData);
        setMaterials((prev) =>
          prev.map((m) => (m.id === editingMaterial.id ? updated : m))
        );
      } else {
        const newMaterial = await rawMaterialsApi.create(formData);
        setMaterials((prev) => [...prev, newMaterial]);
      }
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Failed to save material:', error);
      alert('Failed to save material');
    } finally {
      setSaving(false);
    }
  };

  const lowStockMaterials = materials.filter((m) => m.currentStock < m.minStock);
  const totalStock = materials.reduce((sum, m) => sum + m.currentStock, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-orange-500 mx-auto" />
          <p className="mt-3 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-5 shadow-lg">
        <h1 className="text-xl font-bold">Raw Materials</h1>
        <p className="text-orange-100 text-sm mt-0.5">Manage raw material inventory</p>
      </div>

      <div className="p-4 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-md">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold">{materials.length}</p>
              <p className="text-xs text-orange-100">Total</p>
            </CardContent>
          </Card>
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-amber-600">{lowStockMaterials.length}</p>
              <p className="text-xs text-amber-600">Low Stock</p>
            </CardContent>
          </Card>
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-green-600">{totalStock.toFixed(0)}</p>
              <p className="text-xs text-green-600">Total KG</p>
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
          <Button onClick={handleAdd} className="h-11 bg-gradient-to-r from-orange-500 to-orange-600 px-4">
            <Plus className="h-5 w-5" />
            <span className="ml-2 hidden sm:inline">Add</span>
          </Button>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden space-y-3">
          {filteredMaterials.length === 0 ? (
            <Card className="border-dashed border-2 border-slate-200">
              <CardContent className="p-8 text-center">
                <Package className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No materials found</p>
                <p className="text-slate-400 text-sm mt-1">Tap the + button to add one</p>
              </CardContent>
            </Card>
          ) : (
            filteredMaterials.map((material) => {
              const isLowStock = material.currentStock < material.minStock;
              return (
                <Card key={material.id} className="shadow-md border-0">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl ${isLowStock ? 'bg-amber-100' : 'bg-orange-100'}`}>
                          <Package className={`h-5 w-5 ${isLowStock ? 'text-amber-600' : 'text-orange-600'}`} />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{material.name}</p>
                          <p className="text-sm text-slate-500">{material.grade || '-'}</p>
                        </div>
                      </div>
                      <Badge className={isLowStock ? 'bg-amber-100 text-amber-700 border-0' : 'bg-green-100 text-green-700 border-0'}>
                        {isLowStock ? 'Low Stock' : 'In Stock'}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <div className="bg-slate-50 rounded-lg p-2 text-center">
                        <p className="text-xs text-slate-500">Current</p>
                        <p className="font-semibold text-slate-800">{material.currentStock} {material.unit}</p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-2 text-center">
                        <p className="text-xs text-slate-500">Min Stock</p>
                        <p className="font-semibold text-slate-800">{material.minStock} {material.unit}</p>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(material)}
                        className="flex-1"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(material.id)}
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
                  <TableHead className="text-white font-semibold">Grade</TableHead>
                  <TableHead className="text-white font-semibold">Unit</TableHead>
                  <TableHead className="text-white font-semibold">Current Stock</TableHead>
                  <TableHead className="text-white font-semibold">Min Stock</TableHead>
                  <TableHead className="text-white font-semibold">Status</TableHead>
                  <TableHead className="text-right text-white font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMaterials.map((material) => {
                  const isLowStock = material.currentStock < material.minStock;
                  return (
                    <TableRow key={material.id} className="hover:bg-slate-50">
                      <TableCell className="font-medium text-slate-800">{material.name}</TableCell>
                      <TableCell className="text-slate-600">{material.grade || '-'}</TableCell>
                      <TableCell className="text-slate-600">{material.unit}</TableCell>
                      <TableCell className="text-slate-600">{material.currentStock}</TableCell>
                      <TableCell className="text-slate-600">{material.minStock}</TableCell>
                      <TableCell>
                        <Badge className={isLowStock ? 'bg-amber-100 text-amber-700 border-0' : 'bg-green-100 text-green-700 border-0'}>
                          {isLowStock ? 'Low Stock' : 'In Stock'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(material)}
                          className="hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(material.id)}
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

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="mx-4 rounded-2xl">
          <DialogHeader>
            <DialogTitle>{editingMaterial ? 'Edit Material' : 'Add New Material'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Material Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., ABS Plastic"
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="grade">Grade</Label>
              <Input
                id="grade"
                value={formData.grade}
                onChange={(e) => setFormData((prev) => ({ ...prev, grade: e.target.value }))}
                placeholder="e.g., ABS-HG-101"
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Select
                value={formData.unit}
                onValueChange={(v) => setFormData((prev) => ({ ...prev, unit: v }))}
              >
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="KG">Kilogram (KG)</SelectItem>
                  <SelectItem value="LTR">Litre (LTR)</SelectItem>
                  <SelectItem value="PCS">Pieces (PCS)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="currentStock">Current Stock</Label>
                <Input
                  id="currentStock"
                  type="number"
                  value={formData.currentStock}
                  onChange={(e) => setFormData((prev) => ({ ...prev, currentStock: Number(e.target.value) }))}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minStock">Min Stock</Label>
                <Input
                  id="minStock"
                  type="number"
                  value={formData.minStock}
                  onChange={(e) => setFormData((prev) => ({ ...prev, minStock: Number(e.target.value) }))}
                  className="h-11"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={saving} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-orange-600">
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
