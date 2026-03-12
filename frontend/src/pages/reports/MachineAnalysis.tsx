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
import { Settings, Download, TrendingUp, Clock, AlertCircle } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export function MachineAnalysis() {
  const [dateFrom, setDateFrom] = useState(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);

  const handleExport = () => {
    const headers = ['Machine', 'Production', 'Efficiency %', 'Downtime %', 'Rejection %', 'Status'];
    const csvData = machineData.map(m => {
      const status = m.efficiency >= 90 ? 'Excellent' : m.efficiency >= 80 ? 'Good' : 'Needs Attention';
      return [m.name, m.production, m.efficiency, m.downtime, m.rejection, status];
    });

    const csvContent = [headers.join(','), ...csvData.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `machine_analysis_${dateFrom}_to_${dateTo}.csv`;
    link.click();
  };

  const machineData = [
    { name: 'IMM-001', production: 2800, efficiency: 92, downtime: 4.5, rejection: 1.2 },
    { name: 'IMM-002', production: 2650, efficiency: 88, downtime: 6.2, rejection: 1.8 },
    { name: 'IMM-003', production: 3100, efficiency: 95, downtime: 2.1, rejection: 0.9 },
    { name: 'IMM-004', production: 2200, efficiency: 82, downtime: 8.5, rejection: 2.4 },
    { name: 'IMM-005', production: 2900, efficiency: 91, downtime: 3.8, rejection: 1.5 },
    { name: 'IMM-006', production: 2750, efficiency: 89, downtime: 5.2, rejection: 1.6 },
    { name: 'IMM-007', production: 1800, efficiency: 75, downtime: 12.5, rejection: 3.2 },
    { name: 'IMM-008', production: 2400, efficiency: 85, downtime: 7.0, rejection: 2.0 },
  ];

  const chartData = machineData.map(m => ({
    name: m.name,
    Production: m.production,
    Efficiency: m.efficiency,
  }));

  const totalProduction = machineData.reduce((sum, m) => sum + m.production, 0);
  const avgEfficiency = (machineData.reduce((sum, m) => sum + m.efficiency, 0) / machineData.length).toFixed(1);
  const avgDowntime = (machineData.reduce((sum, m) => sum + m.downtime, 0) / machineData.length).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-violet-800 bg-clip-text text-transparent">
            Machine Analysis
          </h1>
          <p className="text-slate-600 mt-1">Performance analysis by machine</p>
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
        <Card className="bg-gradient-to-br from-violet-500 to-violet-600 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-violet-100 text-sm font-medium">Total Production</p>
                <p className="text-3xl font-bold mt-1">{totalProduction.toLocaleString()}</p>
                <p className="text-violet-200 text-sm mt-1">units this period</p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl">
                <Settings className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm font-medium">Avg Efficiency</p>
                <p className="text-3xl font-bold mt-1">{avgEfficiency}%</p>
                <p className="text-emerald-200 text-sm mt-1">across all machines</p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl">
                <TrendingUp className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Avg Downtime</p>
                <p className="text-3xl font-bold mt-1">{avgDowntime}%</p>
                <p className="text-orange-200 text-sm mt-1">average across machines</p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl">
                <Clock className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card className="shadow-lg border-slate-200">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b">
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <Settings className="h-5 w-5 text-violet-600" />
            Machine Production & Efficiency
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barCategoryGap="25%">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="#64748b"
                  tick={{ fill: '#475569', fontSize: 12, fontWeight: 500 }}
                  axisLine={{ stroke: '#cbd5e1' }}
                />
                <YAxis
                  yAxisId="left"
                  stroke="#64748b"
                  tick={{ fill: '#475569', fontSize: 12 }}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
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
                <Bar yAxisId="left" dataKey="Production" fill="#6366F1" radius={[6, 6, 0, 0]} />
                <Bar yAxisId="right" dataKey="Efficiency" fill="#10B981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Machine Details Table */}
      <Card className="shadow-lg border-slate-200">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b">
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <AlertCircle className="h-5 w-5 text-violet-600" />
            Machine Performance Details
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="font-semibold">Machine</TableHead>
                <TableHead className="font-semibold text-right">Production</TableHead>
                <TableHead className="font-semibold">Efficiency</TableHead>
                <TableHead className="font-semibold text-right">Downtime %</TableHead>
                <TableHead className="font-semibold text-right">Rejection %</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {machineData.map((machine) => (
                <TableRow key={machine.name} className="hover:bg-slate-50">
                  <TableCell className="font-medium text-violet-600">{machine.name}</TableCell>
                  <TableCell className="text-right font-medium">{machine.production.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={machine.efficiency} className="w-20 h-2" />
                      <span className="text-sm font-medium">{machine.efficiency}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant={machine.downtime > 10 ? "destructive" : machine.downtime > 5 ? "warning" : "success"}>
                      {machine.downtime}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant={machine.rejection > 2 ? "destructive" : machine.rejection > 1.5 ? "warning" : "success"}>
                      {machine.rejection}%
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={machine.efficiency >= 90 ? "success" : machine.efficiency >= 80 ? "warning" : "destructive"}>
                      {machine.efficiency >= 90 ? "Excellent" : machine.efficiency >= 80 ? "Good" : "Needs Attention"}
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
