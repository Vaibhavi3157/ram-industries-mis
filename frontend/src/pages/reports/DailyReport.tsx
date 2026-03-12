import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Calendar, Download, TrendingUp, Factory, AlertTriangle, Target } from 'lucide-react';

export function DailyReport() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const handleExport = () => {
    const headers = ['Machine', 'Component', 'Operator', 'Planned', 'Produced', 'Rejected', 'Efficiency'];
    const csvData = productionEntries.map(entry => {
      const efficiency = ((entry.produced / entry.planned) * 100).toFixed(1);
      return [entry.machine, entry.component, entry.operator, entry.planned, entry.produced, entry.rejected, `${efficiency}%`];
    });

    const csvContent = [headers.join(','), ...csvData.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `daily_report_${selectedDate}.csv`;
    link.click();
  };

  const summaryData = {
    totalProduction: 2450,
    totalPlanned: 2800,
    efficiency: 87.5,
    totalRejection: 45,
    rejectionRate: 1.8,
    machinesActive: 8,
    totalMachines: 10,
    operatorsWorking: 12,
  };

  const productionEntries = [
    { id: 1, machine: 'IMM-001', component: 'Housing Cover', planned: 400, produced: 380, rejected: 8, operator: 'Ramesh Kumar' },
    { id: 2, machine: 'IMM-002', component: 'Base Plate', planned: 350, produced: 345, rejected: 5, operator: 'Suresh Sharma' },
    { id: 3, machine: 'IMM-003', component: 'Connector Body', planned: 500, produced: 485, rejected: 12, operator: 'Mahesh Patel' },
    { id: 4, machine: 'IMM-004', component: 'Cap Assembly', planned: 300, produced: 290, rejected: 4, operator: 'Dinesh Singh' },
    { id: 5, machine: 'IMM-005', component: 'Shaft Cover', planned: 450, produced: 420, rejected: 9, operator: 'Rajesh Verma' },
    { id: 6, machine: 'IMM-006', component: 'Terminal Block', planned: 400, produced: 395, rejected: 3, operator: 'Anil Kumar' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-5 shadow-lg">
        <h1 className="text-xl font-bold">Daily Production Report</h1>
        <p className="text-blue-100 text-sm mt-0.5">View and export daily summary</p>
      </div>

      <div className="p-4 space-y-4">
        {/* Date Selection */}
        <Card className="shadow-md border-0">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Calendar className="h-5 w-5 text-blue-500" />
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="flex-1 sm:w-40 h-11"
                />
              </div>
              <Button onClick={handleExport} className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-emerald-600 h-11">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Factory className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-blue-100 text-xs">Production</p>
                  <p className="text-xl font-bold">{summaryData.totalProduction.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-emerald-100 text-xs">Efficiency</p>
                  <p className="text-xl font-bold">{summaryData.efficiency}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-red-100 text-xs">Rejection</p>
                  <p className="text-xl font-bold">{summaryData.totalRejection}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-violet-500 to-violet-600 text-white border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Target className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-violet-100 text-xs">Machines</p>
                  <p className="text-xl font-bold">{summaryData.machinesActive}/{summaryData.totalMachines}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Production Details - Mobile Cards */}
        <div className="lg:hidden space-y-3">
          <h3 className="font-semibold text-slate-700 px-1">Production Details</h3>
          {productionEntries.map((entry) => {
            const efficiency = ((entry.produced / entry.planned) * 100).toFixed(1);
            const efficiencyNum = parseFloat(efficiency);
            return (
              <Card key={entry.id} className="shadow-md border-0">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">
                        {entry.machine.slice(-2)}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">{entry.machine}</p>
                        <p className="text-xs text-slate-500">{entry.operator}</p>
                      </div>
                    </div>
                    <Badge variant={efficiencyNum >= 95 ? "success" : efficiencyNum >= 85 ? "warning" : "destructive"}>
                      {efficiency}%
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600 mb-2">{entry.component}</p>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-slate-50 rounded-lg p-2">
                      <p className="text-xs text-slate-500">Planned</p>
                      <p className="font-semibold">{entry.planned}</p>
                    </div>
                    <div className="bg-emerald-50 rounded-lg p-2">
                      <p className="text-xs text-slate-500">Produced</p>
                      <p className="font-semibold text-emerald-600">{entry.produced}</p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-2">
                      <p className="text-xs text-slate-500">Rejected</p>
                      <p className="font-semibold text-red-600">{entry.rejected}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Production Table - Desktop */}
        <Card className="hidden lg:block shadow-lg border-slate-200">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b">
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <Calendar className="h-5 w-5 text-blue-600" />
              Production Details - {new Date(selectedDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="font-semibold">Machine</TableHead>
                  <TableHead className="font-semibold">Component</TableHead>
                  <TableHead className="font-semibold">Operator</TableHead>
                  <TableHead className="font-semibold text-right">Planned</TableHead>
                  <TableHead className="font-semibold text-right">Produced</TableHead>
                  <TableHead className="font-semibold text-right">Rejected</TableHead>
                  <TableHead className="font-semibold text-right">Efficiency</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productionEntries.map((entry) => {
                  const efficiency = ((entry.produced / entry.planned) * 100).toFixed(1);
                  const efficiencyNum = parseFloat(efficiency);
                  return (
                    <TableRow key={entry.id} className="hover:bg-slate-50">
                      <TableCell className="font-medium text-blue-600">{entry.machine}</TableCell>
                      <TableCell>{entry.component}</TableCell>
                      <TableCell>{entry.operator}</TableCell>
                      <TableCell className="text-right">{entry.planned}</TableCell>
                      <TableCell className="text-right font-medium">{entry.produced}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant={entry.rejected > 5 ? "destructive" : "success"}>
                          {entry.rejected}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant={efficiencyNum >= 95 ? "success" : efficiencyNum >= 85 ? "warning" : "destructive"}>
                          {efficiency}%
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
    </div>
  );
}
