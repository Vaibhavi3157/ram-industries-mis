import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { AlertTriangle, Download, TrendingDown, Target, XCircle } from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export function RejectionAnalysis() {
  const [dateFrom, setDateFrom] = useState(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);

  const handleExport = () => {
    const headers = ['Machine', 'Total', 'Short Shot', 'Flash', 'Sink Marks', 'Warpage', 'Others', 'Status'];
    const csvData = rejectionByMachine.map(m => {
      const status = m.total > 70 ? 'Critical' : m.total > 50 ? 'Moderate' : 'Normal';
      return [m.machine, m.total, m.shortShot, m.flash, m.sinkMarks, m.warpage, m.others, status];
    });

    const csvContent = [headers.join(','), ...csvData.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `rejection_analysis_${dateFrom}_to_${dateTo}.csv`;
    link.click();
  };

  const rejectionByReason = [
    { name: 'Short Shot', value: 35, color: '#EF4444' },
    { name: 'Flash', value: 25, color: '#F59E0B' },
    { name: 'Sink Marks', value: 18, color: '#0EA5E9' },
    { name: 'Warpage', value: 12, color: '#8B5CF6' },
    { name: 'Burn Marks', value: 6, color: '#EC4899' },
    { name: 'Others', value: 4, color: '#6B7280' },
  ];

  const rejectionByMachine = [
    { machine: 'IMM-001', total: 45, shortShot: 15, flash: 12, sinkMarks: 8, warpage: 5, others: 5 },
    { machine: 'IMM-002', total: 62, shortShot: 22, flash: 18, sinkMarks: 10, warpage: 7, others: 5 },
    { machine: 'IMM-003', total: 28, shortShot: 8, flash: 6, sinkMarks: 6, warpage: 4, others: 4 },
    { machine: 'IMM-004', total: 85, shortShot: 30, flash: 25, sinkMarks: 15, warpage: 8, others: 7 },
    { machine: 'IMM-005', total: 52, shortShot: 18, flash: 15, sinkMarks: 9, warpage: 6, others: 4 },
    { machine: 'IMM-006', total: 38, shortShot: 12, flash: 10, sinkMarks: 8, warpage: 5, others: 3 },
    { machine: 'IMM-007', total: 95, shortShot: 35, flash: 28, sinkMarks: 18, warpage: 8, others: 6 },
    { machine: 'IMM-008', total: 48, shortShot: 16, flash: 14, sinkMarks: 10, warpage: 5, others: 3 },
  ];

  const totalRejection = rejectionByMachine.reduce((sum, m) => sum + m.total, 0);
  const highestRejectionMachine = rejectionByMachine.reduce((max, m) => m.total > max.total ? m : max, rejectionByMachine[0]);
  const topReason = rejectionByReason.reduce((max, r) => r.value > max.value ? r : max, rejectionByReason[0]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
            Rejection Analysis
          </h1>
          <p className="text-slate-600 mt-1">Analyze rejection patterns and causes</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Label className="text-slate-600">From:</Label>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-36"
            />
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-slate-600">To:</Label>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-36"
            />
          </div>
          <Button onClick={handleExport} className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium">Total Rejections</p>
                <p className="text-3xl font-bold mt-1">{totalRejection}</p>
                <p className="text-red-200 text-sm mt-1">units this period</p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl">
                <XCircle className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Top Rejection Reason</p>
                <p className="text-2xl font-bold mt-1">{topReason.name}</p>
                <p className="text-orange-200 text-sm mt-1">{topReason.value}% of rejections</p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl">
                <AlertTriangle className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-violet-500 to-violet-600 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-violet-100 text-sm font-medium">Highest Rejection Machine</p>
                <p className="text-2xl font-bold mt-1">{highestRejectionMachine.machine}</p>
                <p className="text-violet-200 text-sm mt-1">{highestRejectionMachine.total} rejections</p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl">
                <Target className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <Card className="shadow-lg border-slate-200">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b">
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Rejection by Reason
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={rejectionByReason}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                    label={({ value }) => `${value}%`}
                    labelLine={{ stroke: '#64748b', strokeWidth: 1 }}
                  >
                    {rejectionByReason.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                      color: '#fff'
                    }}
                    formatter={(value: number, name: string) => [`${value}%`, name]}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    iconSize={10}
                    formatter={(value) => <span style={{ color: '#475569', fontWeight: 500 }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Bar Chart */}
        <Card className="shadow-lg border-slate-200">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b">
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <TrendingDown className="h-5 w-5 text-red-600" />
              Rejection by Machine
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rejectionByMachine} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis
                    dataKey="machine"
                    stroke="#64748b"
                    tick={{ fill: '#475569', fontSize: 12, fontWeight: 500 }}
                    axisLine={{ stroke: '#cbd5e1' }}
                  />
                  <YAxis
                    stroke="#64748b"
                    tick={{ fill: '#475569', fontSize: 12 }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                      color: '#fff'
                    }}
                    cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={10}
                    formatter={(value) => <span style={{ color: '#475569', fontWeight: 500, fontSize: 12 }}>{value}</span>}
                  />
                  <Bar dataKey="shortShot" name="Short Shot" stackId="a" fill="#EF4444" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="flash" name="Flash" stackId="a" fill="#F59E0B" />
                  <Bar dataKey="sinkMarks" name="Sink Marks" stackId="a" fill="#0EA5E9" />
                  <Bar dataKey="warpage" name="Warpage" stackId="a" fill="#8B5CF6" />
                  <Bar dataKey="others" name="Others" stackId="a" fill="#6B7280" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Details Table */}
      <Card className="shadow-lg border-slate-200">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b">
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <XCircle className="h-5 w-5 text-red-600" />
            Machine-wise Rejection Details
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="font-semibold">Machine</TableHead>
                <TableHead className="font-semibold text-right">Total</TableHead>
                <TableHead className="font-semibold text-right">Short Shot</TableHead>
                <TableHead className="font-semibold text-right">Flash</TableHead>
                <TableHead className="font-semibold text-right">Sink Marks</TableHead>
                <TableHead className="font-semibold text-right">Warpage</TableHead>
                <TableHead className="font-semibold text-right">Others</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rejectionByMachine.map((machine) => (
                <TableRow key={machine.machine} className="hover:bg-slate-50">
                  <TableCell className="font-medium text-red-600">{machine.machine}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={machine.total > 70 ? "destructive" : machine.total > 50 ? "warning" : "success"}>
                      {machine.total}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{machine.shortShot}</TableCell>
                  <TableCell className="text-right">{machine.flash}</TableCell>
                  <TableCell className="text-right">{machine.sinkMarks}</TableCell>
                  <TableCell className="text-right">{machine.warpage}</TableCell>
                  <TableCell className="text-right">{machine.others}</TableCell>
                  <TableCell>
                    <Badge variant={machine.total > 70 ? "destructive" : machine.total > 50 ? "warning" : "success"}>
                      {machine.total > 70 ? "Critical" : machine.total > 50 ? "Moderate" : "Normal"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
