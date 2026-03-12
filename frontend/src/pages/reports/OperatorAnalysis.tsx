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
import { Users, Download, TrendingUp, Award, Star } from 'lucide-react';
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

export function OperatorAnalysis() {
  const [dateFrom, setDateFrom] = useState(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);

  const handleExport = () => {
    const headers = ['Operator', 'Production', 'Efficiency %', 'Shifts', 'Rejection %', 'Rating'];
    const csvData = operatorData.map(o => [o.name, o.production, o.efficiency, o.shifts, o.rejection, o.rating]);

    const csvContent = [headers.join(','), ...csvData.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `operator_analysis_${dateFrom}_to_${dateTo}.csv`;
    link.click();
  };

  const operatorData = [
    { name: 'Ramesh Kumar', production: 3200, efficiency: 94, shifts: 6, rejection: 0.8, rating: 5 },
    { name: 'Suresh Sharma', production: 2900, efficiency: 91, shifts: 6, rejection: 1.2, rating: 4 },
    { name: 'Mahesh Patel', production: 3100, efficiency: 93, shifts: 6, rejection: 1.0, rating: 5 },
    { name: 'Dinesh Singh', production: 2600, efficiency: 86, shifts: 5, rejection: 1.8, rating: 3 },
    { name: 'Rajesh Verma', production: 2850, efficiency: 89, shifts: 6, rejection: 1.5, rating: 4 },
    { name: 'Anil Kumar', production: 2750, efficiency: 88, shifts: 5, rejection: 1.6, rating: 4 },
    { name: 'Vijay Yadav', production: 2200, efficiency: 78, shifts: 4, rejection: 2.5, rating: 2 },
    { name: 'Sanjay Gupta', production: 2950, efficiency: 90, shifts: 6, rejection: 1.3, rating: 4 },
  ];

  const chartData = operatorData.map(o => ({
    name: o.name.split(' ')[0],
    Production: o.production,
    Efficiency: o.efficiency,
  }));

  const totalProduction = operatorData.reduce((sum, o) => sum + o.production, 0);
  const avgEfficiency = (operatorData.reduce((sum, o) => sum + o.efficiency, 0) / operatorData.length).toFixed(1);
  const topPerformer = operatorData.reduce((best, o) => o.efficiency > best.efficiency ? o : best, operatorData[0]);

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'}`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-pink-800 bg-clip-text text-transparent">
            Operator Analysis
          </h1>
          <p className="text-slate-600 mt-1">Performance analysis by operator</p>
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
        <Card className="bg-gradient-to-br from-pink-500 to-pink-600 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-pink-100 text-sm font-medium">Total Production</p>
                <p className="text-3xl font-bold mt-1">{totalProduction.toLocaleString()}</p>
                <p className="text-pink-200 text-sm mt-1">units by all operators</p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl">
                <Users className="h-8 w-8" />
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
                <p className="text-emerald-200 text-sm mt-1">across all operators</p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl">
                <TrendingUp className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm font-medium">Top Performer</p>
                <p className="text-2xl font-bold mt-1">{topPerformer.name}</p>
                <p className="text-amber-200 text-sm mt-1">{topPerformer.efficiency}% efficiency</p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl">
                <Award className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card className="shadow-lg border-slate-200">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b">
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <Users className="h-5 w-5 text-pink-600" />
            Operator Production & Efficiency
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
                <Bar yAxisId="left" dataKey="Production" fill="#EC4899" radius={[6, 6, 0, 0]} />
                <Bar yAxisId="right" dataKey="Efficiency" fill="#10B981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Operator Details Table */}
      <Card className="shadow-lg border-slate-200">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b">
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <Award className="h-5 w-5 text-pink-600" />
            Operator Performance Details
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="font-semibold">Operator</TableHead>
                <TableHead className="font-semibold text-right">Production</TableHead>
                <TableHead className="font-semibold">Efficiency</TableHead>
                <TableHead className="font-semibold text-center">Shifts</TableHead>
                <TableHead className="font-semibold text-right">Rejection %</TableHead>
                <TableHead className="font-semibold">Rating</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {operatorData.map((operator) => (
                <TableRow key={operator.name} className="hover:bg-slate-50">
                  <TableCell className="font-medium text-pink-600">{operator.name}</TableCell>
                  <TableCell className="text-right font-medium">{operator.production.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={operator.efficiency} className="w-20 h-2" />
                      <span className="text-sm font-medium">{operator.efficiency}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">{operator.shifts}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={operator.rejection > 2 ? "destructive" : operator.rejection > 1.5 ? "warning" : "success"}>
                      {operator.rejection}%
                    </Badge>
                  </TableCell>
                  <TableCell>{renderStars(operator.rating)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
