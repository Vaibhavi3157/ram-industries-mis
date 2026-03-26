import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, Eye, FileText, Calendar, Loader2, Printer } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { productionReportsApi, type ProductionReport } from '@/services/api';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function ProductionList() {
  const navigate = useNavigate();
  const [reports, setReports] = useState<ProductionReport[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [shiftFilter, setShiftFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, [dateFilter, shiftFilter]);

  async function fetchReports() {
    try {
      setLoading(true);
      const params: { date?: string; shift?: string } = {};
      if (dateFilter) params.date = dateFilter;
      if (shiftFilter !== 'all') params.shift = shiftFilter.toUpperCase();
      const data = await productionReportsApi.getAll(params);
      setReports(data);
    } catch (error) {
      console.error('Failed to fetch production reports:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredReports = reports.filter((r) => {
    const matchesSearch =
      r.machine?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.operator?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.component?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const totalProduction = filteredReports.reduce((s, r) => s + r.okProduction, 0);
  const totalRejection = filteredReports.reduce((s, r) => s + r.totalRejection, 0);
  const avgEfficiency = filteredReports.length > 0 && totalProduction > 0
    ? Math.round((totalProduction / (totalProduction + totalRejection)) * 100)
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc]">
        <Header title="Production Reports" subtitle="View all production reports" />
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Header title="Production Reports" subtitle="View all production reports" />

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <motion.div variants={itemVariants}>
            <Card className="border border-slate-200 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-100">Total Reports</p>
                    <p className="text-2xl font-bold">{filteredReports.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={itemVariants}>
            <Card className="border border-emerald-200 bg-emerald-50">
              <CardContent className="p-4">
                <p className="text-sm text-emerald-700">Total OK Production</p>
                <p className="text-2xl font-bold text-emerald-600">{totalProduction.toLocaleString()}</p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={itemVariants}>
            <Card className="border border-red-200 bg-red-50">
              <CardContent className="p-4">
                <p className="text-sm text-red-700">Total Rejection</p>
                <p className="text-2xl font-bold text-red-600">{totalRejection}</p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={itemVariants}>
            <Card className="border border-violet-200 bg-violet-50">
              <CardContent className="p-4">
                <p className="text-sm text-violet-700">Avg Efficiency</p>
                <p className="text-2xl font-bold text-violet-600">{avgEfficiency}%</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Filters */}
        <motion.div variants={itemVariants} className="flex gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by machine, operator, component..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-40"
            />
          </div>
          <Select value={shiftFilter} onValueChange={setShiftFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Shifts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Shifts</SelectItem>
              <SelectItem value="day">Day Shift</SelectItem>
              <SelectItem value="night">Night Shift</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        {/* Table */}
        <motion.div variants={itemVariants}>
          <Card className="border border-slate-200 overflow-hidden">
            <CardContent className="p-0">
              <div className="max-h-[calc(100vh-320px)] overflow-auto relative">
                <Table>
                  <TableHeader className="[&_tr]:border-b-0" style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                    <TableRow className="bg-slate-800 hover:bg-slate-800">
                      <TableHead className="text-white font-semibold bg-slate-800" style={{ position: 'sticky', top: 0 }}>Date</TableHead>
                      <TableHead className="text-white font-semibold bg-slate-800" style={{ position: 'sticky', top: 0 }}>Shift</TableHead>
                      <TableHead className="text-white font-semibold bg-slate-800" style={{ position: 'sticky', top: 0 }}>Machine</TableHead>
                      <TableHead className="text-white font-semibold bg-slate-800" style={{ position: 'sticky', top: 0 }}>Operator</TableHead>
                      <TableHead className="text-white font-semibold bg-slate-800" style={{ position: 'sticky', top: 0 }}>Component</TableHead>
                      <TableHead className="text-white font-semibold bg-slate-800" style={{ position: 'sticky', top: 0 }}>OK Production</TableHead>
                      <TableHead className="text-white font-semibold bg-slate-800" style={{ position: 'sticky', top: 0 }}>Rejection</TableHead>
                      <TableHead className="text-white font-semibold bg-slate-800" style={{ position: 'sticky', top: 0 }}>Efficiency</TableHead>
                      <TableHead className="text-right text-white font-semibold bg-slate-800" style={{ position: 'sticky', top: 0 }}>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                  {filteredReports.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        No production reports found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredReports.map((report) => {
                      const efficiency = report.okProduction > 0
                        ? Math.round((report.okProduction / (report.okProduction + report.totalRejection)) * 100)
                        : 0;
                      return (
                        <TableRow key={report.id} className="hover:bg-slate-50 transition-colors">
                          <TableCell className="font-medium">
                            {new Date(report.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant={report.shift === 'DAY' ? 'secondary' : 'outline'}>
                              {report.shift === 'DAY' ? 'Day' : 'Night'}
                            </Badge>
                          </TableCell>
                          <TableCell>{report.machine?.name || '-'}</TableCell>
                          <TableCell>{report.operator?.name || '-'}</TableCell>
                          <TableCell>{report.component?.name || '-'}</TableCell>
                          <TableCell className="text-green-600 font-medium">{report.okProduction}</TableCell>
                          <TableCell className="text-red-600">{report.totalRejection}</TableCell>
                          <TableCell>
                            <Badge
                              variant={efficiency >= 90 ? 'success' : efficiency >= 80 ? 'warning' : 'destructive'}
                            >
                              {efficiency}%
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="hover:bg-blue-50 hover:text-blue-600"
                              onClick={() => navigate(`/production/view/${report.id}`)}
                              title="View Report"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="hover:bg-green-50 hover:text-green-600"
                              onClick={() => navigate(`/production/print/${report.id}?autoPrint=true`)}
                              title="Print Report"
                            >
                              <Printer className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
