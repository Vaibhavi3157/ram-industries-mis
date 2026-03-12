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
import { Progress } from '@/components/ui/progress';
import { Clock, Download, AlertOctagon, Wrench, Settings } from 'lucide-react';
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

export function DowntimeAnalysis() {
  const [dateFrom, setDateFrom] = useState(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);

  const handleExport = () => {
    const headers = ['Machine', 'Total (hrs)', 'Breakdown', 'Mould Change', 'Maintenance', 'Material', 'Others', 'Status'];
    const csvData = downtimeByMachine.map(m => {
      const status = m.total > 10 ? 'Critical' : m.total > 5 ? 'Moderate' : 'Normal';
      return [m.machine, m.total, m.breakdown, m.mouldChange, m.maintenance, m.material, m.others, status];
    });

    const csvContent = [headers.join(','), ...csvData.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `downtime_analysis_${dateFrom}_to_${dateTo}.csv`;
    link.click();
  };

  const downtimeByReason = [
    { name: 'Mould Change', value: 28, color: '#0EA5E9', hours: 14.5 },
    { name: 'Breakdown', value: 22, color: '#EF4444', hours: 11.2 },
    { name: 'Material Shortage', value: 18, color: '#F59E0B', hours: 9.4 },
    { name: 'Maintenance', value: 15, color: '#8B5CF6', hours: 7.8 },
    { name: 'Setup', value: 10, color: '#10B981', hours: 5.2 },
    { name: 'Others', value: 7, color: '#6B7280', hours: 3.6 },
  ];

  const downtimeByMachine = [
    { machine: 'IMM-001', total: 4.5, breakdown: 1.2, mouldChange: 1.5, maintenance: 0.8, material: 0.5, others: 0.5 },
    { machine: 'IMM-002', total: 6.2, breakdown: 2.0, mouldChange: 1.8, maintenance: 1.2, material: 0.7, others: 0.5 },
    { machine: 'IMM-003', total: 2.1, breakdown: 0.5, mouldChange: 0.8, maintenance: 0.4, material: 0.2, others: 0.2 },
    { machine: 'IMM-004', total: 8.5, breakdown: 3.2, mouldChange: 2.0, maintenance: 1.5, material: 1.2, others: 0.6 },
    { machine: 'IMM-005', total: 3.8, breakdown: 1.0, mouldChange: 1.2, maintenance: 0.8, material: 0.4, others: 0.4 },
    { machine: 'IMM-006', total: 5.2, breakdown: 1.5, mouldChange: 1.5, maintenance: 1.0, material: 0.8, others: 0.4 },
    { machine: 'IMM-007', total: 12.5, breakdown: 4.5, mouldChange: 3.0, maintenance: 2.5, material: 1.5, others: 1.0 },
    { machine: 'IMM-008', total: 7.0, breakdown: 2.2, mouldChange: 2.0, maintenance: 1.3, material: 1.0, others: 0.5 },
  ];

  const totalDowntimeHours = downtimeByMachine.reduce((sum, m) => sum + m.total, 0);
  const highestDowntimeMachine = downtimeByMachine.reduce((max, m) => m.total > max.total ? m : max, downtimeByMachine[0]);
  const topReason = downtimeByReason.reduce((max, r) => r.value > max.value ? r : max, downtimeByReason[0]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">
            Downtime Analysis
          </h1>
          <p className="text-slate-600 mt-1">Analyze machine downtime patterns and causes</p>
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
        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Total Downtime</p>
                <p className="text-3xl font-bold mt-1">{totalDowntimeHours.toFixed(1)}h</p>
                <p className="text-orange-200 text-sm mt-1">this period</p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl">
                <Clock className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Top Downtime Reason</p>
                <p className="text-2xl font-bold mt-1">{topReason.name}</p>
                <p className="text-blue-200 text-sm mt-1">{topReason.hours}h ({topReason.value}%)</p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl">
                <Wrench className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium">Highest Downtime Machine</p>
                <p className="text-2xl font-bold mt-1">{highestDowntimeMachine.machine}</p>
                <p className="text-red-200 text-sm mt-1">{highestDowntimeMachine.total}h downtime</p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl">
                <AlertOctagon className="h-8 w-8" />
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
              <Clock className="h-5 w-5 text-orange-600" />
              Downtime by Reason
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={downtimeByReason}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                    label={({ name, value }) => `${value}%`}
                    labelLine={{ stroke: '#64748b', strokeWidth: 1 }}
                  >
                    {downtimeByReason.map((entry, index) => (
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
              <Settings className="h-5 w-5 text-orange-600" />
              Downtime by Machine (Hours)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={downtimeByMachine} barCategoryGap="20%">
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
                  <Bar dataKey="breakdown" name="Breakdown" stackId="a" fill="#EF4444" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="mouldChange" name="Mould Change" stackId="a" fill="#0EA5E9" />
                  <Bar dataKey="maintenance" name="Maintenance" stackId="a" fill="#8B5CF6" />
                  <Bar dataKey="material" name="Material" stackId="a" fill="#F59E0B" />
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
            <AlertOctagon className="h-5 w-5 text-orange-600" />
            Machine-wise Downtime Details (Hours)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="font-semibold">Machine</TableHead>
                <TableHead className="font-semibold">Total Downtime</TableHead>
                <TableHead className="font-semibold text-right">Breakdown</TableHead>
                <TableHead className="font-semibold text-right">Mould Change</TableHead>
                <TableHead className="font-semibold text-right">Maintenance</TableHead>
                <TableHead className="font-semibold text-right">Material</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {downtimeByMachine.map((machine) => {
                const maxDowntime = Math.max(...downtimeByMachine.map(m => m.total));
                const percentage = (machine.total / maxDowntime) * 100;
                return (
                  <TableRow key={machine.machine} className="hover:bg-slate-50">
                    <TableCell className="font-medium text-orange-600">{machine.machine}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={percentage} className="w-20 h-2" />
                        <span className="text-sm font-medium">{machine.total}h</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{machine.breakdown}h</TableCell>
                    <TableCell className="text-right">{machine.mouldChange}h</TableCell>
                    <TableCell className="text-right">{machine.maintenance}h</TableCell>
                    <TableCell className="text-right">{machine.material}h</TableCell>
                    <TableCell>
                      <Badge variant={machine.total > 10 ? "destructive" : machine.total > 5 ? "warning" : "success"}>
                        {machine.total > 10 ? "Critical" : machine.total > 5 ? "Moderate" : "Normal"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
