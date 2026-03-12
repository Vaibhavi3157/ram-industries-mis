import { useState, useEffect } from 'react';
import {
  Factory,
  TrendingUp,
  AlertTriangle,
  Clock,
  Users,
  Gauge,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { dashboardApi } from '@/services/api';

// Default/fallback data
const defaultStats = {
  todayProduction: 0,
  todayTarget: 0,
  efficiency: 0,
  todayRejection: 0,
  rejectionRate: 0,
  machinesRunning: 0,
  machinesIdle: 0,
  machinesMaintenance: 0,
  totalDowntime: 0,
  activeOperators: 0,
};

const COLORS = {
  primary: '#3B82F6',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  purple: '#8B5CF6',
  pink: '#EC4899',
  cyan: '#06B6D4',
  slate: '#64748B',
};

const REJECTION_COLORS = ['#EF4444', '#F59E0B', '#8B5CF6', '#06B6D4', '#EC4899', '#10B981'];

function formatHour(hour: number): string {
  if (hour === 12) return '12PM';
  if (hour > 12) return `${hour - 12}PM`;
  return `${hour}AM`;
}

export function Dashboard() {
  const [stats, setStats] = useState(defaultStats);
  const [hourlyProduction, setHourlyProduction] = useState<{ hour: string; production: number; target: number }[]>([]);
  const [machineData, setMachineData] = useState<{ name: string; production: number; status: string }[]>([]);
  const [rejectionData, setRejectionData] = useState<{ name: string; value: number; color: string }[]>([]);
  const [downtimeData, setDowntimeData] = useState<{ code: string; name: string; minutes: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        const [statsData, hourlyData, machineProductionData, rejectionAnalysis, downtimeAnalysis] = await Promise.all([
          dashboardApi.getStats(),
          dashboardApi.getHourlyProduction(),
          dashboardApi.getMachineProduction(),
          dashboardApi.getRejectionAnalysis(),
          dashboardApi.getDowntimeAnalysis(),
        ]);

        setStats({
          ...statsData,
          rejectionRate: typeof statsData.rejectionRate === 'string' ? parseFloat(statsData.rejectionRate) : statsData.rejectionRate,
        });

        setHourlyProduction(
          hourlyData.map((h) => ({
            hour: formatHour(h.hour),
            production: h.production,
            target: h.target,
          }))
        );

        setMachineData(
          machineProductionData.map((m) => ({
            name: m.name.replace('Machine ', 'M'),
            production: m.production,
            status: m.status.toLowerCase(),
          }))
        );

        setRejectionData(
          rejectionAnalysis.map((r, index) => ({
            name: r.name,
            value: r.count,
            color: REJECTION_COLORS[index % REJECTION_COLORS.length],
          }))
        );

        setDowntimeData(
          downtimeAnalysis.map((d) => ({
            code: d.code,
            name: d.name,
            minutes: d.minutes,
          }))
        );
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-blue-500 mx-auto" />
          <p className="mt-3 text-slate-600">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  const totalMachines = stats.machinesRunning + stats.machinesIdle + stats.machinesMaintenance;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
            <p className="text-slate-500 text-sm mt-0.5">Production Overview - Today</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-500">Last Updated</p>
            <p className="font-semibold text-slate-700">{new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Stats Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Production Card */}
          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-blue-100">
                  <Factory className="h-5 w-5 text-blue-600" />
                </div>
                <span className="flex items-center text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  <ArrowUpRight className="h-3 w-3 mr-0.5" />
                  12%
                </span>
              </div>
              <div className="mt-4">
                <p className="text-sm text-slate-500 font-medium">Today's Production</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">{stats.todayProduction.toLocaleString()}</p>
                <p className="text-xs text-slate-400 mt-1">Target: {stats.todayTarget.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>

          {/* Efficiency Card */}
          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-green-100">
                  <Gauge className="h-5 w-5 text-green-600" />
                </div>
                <span className="flex items-center text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  <ArrowUpRight className="h-3 w-3 mr-0.5" />
                  2.5%
                </span>
              </div>
              <div className="mt-4">
                <p className="text-sm text-slate-500 font-medium">Efficiency</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">{stats.efficiency}%</p>
                <div className="mt-2 bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all"
                    style={{ width: `${stats.efficiency}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rejection Card */}
          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-red-100">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <span className="flex items-center text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full">
                  <ArrowDownRight className="h-3 w-3 mr-0.5" />
                  {stats.rejectionRate}%
                </span>
              </div>
              <div className="mt-4">
                <p className="text-sm text-slate-500 font-medium">Total Rejection</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">{stats.todayRejection}</p>
                <p className="text-xs text-slate-400 mt-1">Rejection Rate: {stats.rejectionRate}%</p>
              </div>
            </CardContent>
          </Card>

          {/* Downtime Card */}
          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-amber-100">
                  <Clock className="h-5 w-5 text-amber-600" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-slate-500 font-medium">Total Downtime</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">{stats.totalDowntime} min</p>
                <p className="text-xs text-slate-400 mt-1">Operators: {stats.activeOperators} active</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Machine Status Row */}
        <Card className="bg-white border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-800">Machine Status</h3>
              <span className="text-sm text-slate-500">{totalMachines} Total Machines</span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-green-50 rounded-xl p-4 text-center border border-green-100">
                <div className="text-3xl font-bold text-green-600">{stats.machinesRunning}</div>
                <p className="text-sm text-green-700 mt-1 font-medium">Running</p>
              </div>
              <div className="bg-amber-50 rounded-xl p-4 text-center border border-amber-100">
                <div className="text-3xl font-bold text-amber-600">{stats.machinesIdle}</div>
                <p className="text-sm text-amber-700 mt-1 font-medium">Idle</p>
              </div>
              <div className="bg-red-50 rounded-xl p-4 text-center border border-red-100">
                <div className="text-3xl font-bold text-red-600">{stats.machinesMaintenance}</div>
                <p className="text-sm text-red-700 mt-1 font-medium">Maintenance</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Hourly Production Chart */}
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-slate-800">Hourly Production Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={hourlyProduction}>
                    <defs>
                      <linearGradient id="productionGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                    <XAxis
                      dataKey="hour"
                      tick={{ fill: '#64748B', fontSize: 11 }}
                      axisLine={{ stroke: '#CBD5E1' }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: '#64748B', fontSize: 11 }}
                      axisLine={{ stroke: '#CBD5E1' }}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1E293B',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: 12,
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="production"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      fill="url(#productionGradient)"
                      name="Production"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Machine Production Chart */}
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-slate-800">Machine-wise Production</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={machineData} barCategoryGap="25%">
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: '#64748B', fontSize: 11, fontWeight: 500 }}
                      axisLine={{ stroke: '#CBD5E1' }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: '#64748B', fontSize: 11 }}
                      axisLine={{ stroke: '#CBD5E1' }}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1E293B',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: 12,
                      }}
                      cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }}
                    />
                    <Bar
                      dataKey="production"
                      fill="#8B5CF6"
                      radius={[4, 4, 0, 0]}
                      name="Production"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Rejection Analysis */}
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-slate-800">Rejection Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={rejectionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                    >
                      {rejectionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1E293B',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: 12,
                      }}
                    />
                    <Legend
                      iconType="circle"
                      iconSize={8}
                      formatter={(value) => <span style={{ color: '#475569', fontSize: 12 }}>{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Downtime Breakdown */}
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-slate-800">Downtime Breakdown</CardTitle>
                <span className="text-sm font-semibold text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                  {stats.totalDowntime} min total
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {downtimeData.slice(0, 5).map((item, index) => {
                  const percentage = stats.totalDowntime > 0 ? Math.round((item.minutes / stats.totalDowntime) * 100) : 0;
                  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
                  return (
                    <div key={item.code} className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                        style={{ backgroundColor: colors[index % colors.length] }}
                      >
                        {item.code}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-slate-700 font-medium">{item.name}</span>
                          <span className="text-sm font-semibold text-slate-800">{item.minutes} min</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: colors[index % colors.length]
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
