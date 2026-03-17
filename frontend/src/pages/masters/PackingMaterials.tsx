import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Package, Loader2, Layers } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { packingMaterialsApi, type PackingMaterial } from '@/services/api';

type PackingMaterialType = 'Box' | 'Polybag' | 'Carton' | 'Tray' | 'Wrapper' | 'Other';

const typeConfig: Record<PackingMaterialType, { color: string; bgColor: string }> = {
  Box: { color: 'text-orange-600', bgColor: 'bg-orange-100' },
  Polybag: { color: 'text-amber-600', bgColor: 'bg-amber-100' },
  Carton: { color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  Tray: { color: 'text-orange-700', bgColor: 'bg-orange-50' },
  Wrapper: { color: 'text-amber-700', bgColor: 'bg-amber-50' },
  Other: { color: 'text-slate-600', bgColor: 'bg-slate-100' },
};

export function PackingMaterials() {
  const [packingMaterials, setPackingMaterials] = useState<PackingMaterial[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<PackingMaterial | null>(null);
  const [formData, setFormData] = useState({ name: '', type: 'Box' as PackingMaterialType, description: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPackingMaterials();
  }, []);

  async function fetchPackingMaterials() {
    try {
      setLoading(true);
      const data = await packingMaterialsApi.getAll();
      setPackingMaterials(data);
    } catch (error) {
      console.error('Failed to fetch packing materials:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredMaterials = packingMaterials.filter((m) =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (m.description && m.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAdd = () => {
    setEditingMaterial(null);
    setFormData({ name: '', type: 'Box', description: '' });
    setIsDialogOpen(true);
  };

  const handleEdit = (material: PackingMaterial) => {
    setEditingMaterial(material);
    setFormData({
      name: material.name,
      type: material.type as PackingMaterialType,
      description: material.description || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this packing material?')) return;
    try {
      await packingMaterialsApi.delete(id);
      setPackingMaterials((prev) => prev.filter((m) => m.id !== id));
    } catch (error) {
      console.error('Failed to delete packing material:', error);
      alert('Failed to delete packing material');
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      if (editingMaterial) {
        const updated = await packingMaterialsApi.update(editingMaterial.id, formData);
        setPackingMaterials((prev) =>
          prev.map((m) => (m.id === editingMaterial.id ? updated : m))
        );
      } else {
        const newMaterial = await packingMaterialsApi.create(formData);
        setPackingMaterials((prev) => [...prev, newMaterial]);
      }
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Failed to save packing material:', error);
      alert('Failed to save packing material');
    } finally {
      setSaving(false);
    }
  };

  const uniqueTypes = [...new Set(packingMaterials.map((m) => m.type))];

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
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-5 shadow-lg">
        <h1 className="text-xl font-bold">Packing Materials</h1>
        <p className="text-orange-100 text-sm mt-0.5">Manage packing material master data</p>
      </div>

      <div className="p-4 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-gradient-to-br from-orange-500 to-amber-500 text-white border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Package className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-orange-100 text-xs">Total Materials</p>
                  <p className="text-2xl font-bold">{packingMaterials.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-amber-500 to-yellow-500 text-white border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Layers className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-amber-100 text-xs">Types</p>
                  <p className="text-2xl font-bold">{uniqueTypes.length}</p>
                </div>
              </div>
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
          <Button onClick={handleAdd} className="h-11 bg-gradient-to-r from-orange-500 to-amber-500 px-4">
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
                <p className="text-slate-500">No packing materials found</p>
                <p className="text-slate-400 text-sm mt-1">Tap the + button to add one</p>
              </CardContent>
            </Card>
          ) : (
            filteredMaterials.map((material) => {
              const typeStyle = typeConfig[material.type as PackingMaterialType] || typeConfig.Other;
              return (
                <Card key={material.id} className="shadow-md border-0">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl ${typeStyle.bgColor}`}>
                          <Package className={`h-5 w-5 ${typeStyle.color}`} />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{material.name}</p>
                          <Badge className={`mt-1 ${typeStyle.bgColor} ${typeStyle.color} border-0`}>
                            {material.type}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    {material.description && (
                      <p className="text-sm text-slate-500 mt-2 line-clamp-2">{material.description}</p>
                    )}
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
                  <TableHead className="text-white font-semibold">Type</TableHead>
                  <TableHead className="text-white font-semibold">Description</TableHead>
                  <TableHead className="text-right text-white font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMaterials.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                      No packing materials found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMaterials.map((material) => {
                    const typeStyle = typeConfig[material.type as PackingMaterialType] || typeConfig.Other;
                    return (
                      <TableRow key={material.id} className="hover:bg-slate-50">
                        <TableCell className="font-medium text-slate-800">{material.name}</TableCell>
                        <TableCell>
                          <Badge className={`${typeStyle.bgColor} ${typeStyle.color} border-0`}>
                            {material.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-600 max-w-xs truncate">
                          {material.description || '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(material)}
                            className="hover:bg-orange-50 hover:text-orange-600"
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
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="mx-4 rounded-2xl">
          <DialogHeader>
            <DialogTitle>{editingMaterial ? 'Edit Packing Material' : 'Add New Packing Material'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Small Box 10x10"
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, type: value as PackingMaterialType }))}
              >
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Box">Box</SelectItem>
                  <SelectItem value="Polybag">Polybag</SelectItem>
                  <SelectItem value="Carton">Carton</SelectItem>
                  <SelectItem value="Tray">Tray</SelectItem>
                  <SelectItem value="Wrapper">Wrapper</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Optional description..."
                className="min-h-[80px]"
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={saving} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-amber-500">
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
