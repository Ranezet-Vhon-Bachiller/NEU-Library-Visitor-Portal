import React, { useEffect, useState, useMemo } from 'react';
import { collection, onSnapshot, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { VisitorLog } from '../types';
import { COLLEGES, REASONS, handleFirestoreError, OperationType } from '../utils';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { 
  Users, Calendar, Filter, Download, 
  TrendingUp, BookOpen, UserCheck, GraduationCap,
  ShieldAlert, BarChart3
} from 'lucide-react';
import { format, subDays, startOfDay, endOfDay, isWithinInterval, parseISO } from 'date-fns';
import BlockedUsers from './BlockedUsers';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

const AdminDashboard: React.FC = () => {
  const [logs, setLogs] = useState<VisitorLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<'analytics' | 'blocked'>('analytics');
  
  // Filters
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly' | 'custom'>('daily');
  const [customStart, setCustomStart] = useState(format(subDays(new Date(), 7), 'yyyy-MM-dd'));
  const [customEnd, setCustomEnd] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [filterReason, setFilterReason] = useState('All');
  const [filterCollege, setFilterCollege] = useState('All');
  const [filterType, setFilterType] = useState('All');

  useEffect(() => {
    const q = query(collection(db, 'visitorLogs'), orderBy('timestamp', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedLogs: VisitorLog[] = [];
      snapshot.forEach((doc) => {
        fetchedLogs.push({ id: doc.id, ...doc.data() } as VisitorLog);
      });
      setLogs(fetchedLogs);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'visitorLogs');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      if (!log.timestamp) return false;
      
      const logDate = log.timestamp.toDate();
      const now = new Date();
      
      // Timeframe filter
      let inTimeframe = false;
      if (timeframe === 'daily') {
        inTimeframe = isWithinInterval(logDate, { start: startOfDay(now), end: endOfDay(now) });
      } else if (timeframe === 'weekly') {
        inTimeframe = isWithinInterval(logDate, { start: startOfDay(subDays(now, 7)), end: endOfDay(now) });
      } else if (timeframe === 'monthly') {
        inTimeframe = isWithinInterval(logDate, { start: startOfDay(subDays(now, 30)), end: endOfDay(now) });
      } else if (timeframe === 'custom') {
        inTimeframe = isWithinInterval(logDate, { 
          start: startOfDay(parseISO(customStart)), 
          end: endOfDay(parseISO(customEnd)) 
        });
      }

      // Other filters
      const reasonMatch = filterReason === 'All' || log.reason === filterReason;
      const collegeMatch = filterCollege === 'All' || log.college === filterCollege;
      const typeMatch = filterType === 'All' || log.role === filterType;

      return inTimeframe && reasonMatch && collegeMatch && typeMatch;
    });
  }, [logs, timeframe, customStart, customEnd, filterReason, filterCollege, filterType]);

  // Statistics
  const stats = useMemo(() => {
    const total = filteredLogs.length;
    const students = filteredLogs.filter(l => l.role === 'Student').length;
    const faculty = filteredLogs.filter(l => l.role === 'Faculty').length;
    const employees = filteredLogs.filter(l => l.role === 'Employee').length;

    // Data for charts
    const reasonData = REASONS.map(r => ({
      name: r,
      value: filteredLogs.filter(l => l.reason === r).length
    })).filter(d => d.value > 0);

    const collegeData = COLLEGES.map(c => ({
      name: c.replace('College of ', '').replace('School of ', ''),
      value: filteredLogs.filter(l => l.college === c).length
    })).filter(d => d.value > 0);

    const typeData = [
      { name: 'Student', value: students },
      { name: 'Faculty', value: faculty },
      { name: 'Employee', value: employees }
    ].filter(d => d.value > 0);

    return { total, students, faculty, employees, reasonData, collegeData, typeData };
  }, [filteredLogs]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        <p className="mt-4 text-stone-500 font-medium">Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Sub-navigation */}
      <div className="flex gap-4 border-b border-stone-200 pb-1">
        <button
          onClick={() => setActiveSubTab('analytics')}
          className={`pb-3 px-1 text-sm font-bold transition-all flex items-center gap-2 border-b-2 ${
            activeSubTab === 'analytics' 
              ? 'border-emerald-600 text-emerald-700' 
              : 'border-transparent text-stone-500 hover:text-stone-700'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Analytics
        </button>
        <button
          onClick={() => setActiveSubTab('blocked')}
          className={`pb-3 px-1 text-sm font-bold transition-all flex items-center gap-2 border-b-2 ${
            activeSubTab === 'blocked' 
              ? 'border-red-600 text-red-700' 
              : 'border-transparent text-stone-500 hover:text-stone-700'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          Blocked Users
        </button>
      </div>

      {activeSubTab === 'analytics' ? (
        <>
          {/* Filters Header */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <Filter className="w-5 h-5 text-emerald-600" />
                <h3 className="text-lg font-bold text-stone-800">Dashboard Filters</h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:items-center gap-4">
                {/* Timeframe Select */}
                <select
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value as any)}
                  className="px-4 py-2 rounded-xl border border-stone-200 bg-stone-50 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="daily">Today</option>
                  <option value="weekly">Last 7 Days</option>
                  <option value="monthly">Last 30 Days</option>
                  <option value="custom">Custom Range</option>
                </select>

                {timeframe === 'custom' && (
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={customStart}
                      onChange={(e) => setCustomStart(e.target.value)}
                      className="px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                    <span className="text-stone-400">to</span>
                    <input
                      type="date"
                      value={customEnd}
                      onChange={(e) => setCustomEnd(e.target.value)}
                      className="px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                )}

                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-2 rounded-xl border border-stone-200 bg-stone-50 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="All">All Visitor Types</option>
                  <option value="Student">Students</option>
                  <option value="Faculty">Faculty</option>
                  <option value="Employee">Employees</option>
                </select>

                <select
                  value={filterReason}
                  onChange={(e) => setFilterReason(e.target.value)}
                  className="px-4 py-2 rounded-xl border border-stone-200 bg-stone-50 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="All">All Reasons</option>
                  {REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              title="Total Visitors" 
              value={stats.total} 
              icon={<Users className="w-6 h-6" />} 
              color="bg-emerald-50 text-emerald-600"
              trend="Real-time"
            />
            <StatCard 
              title="Students" 
              value={stats.students} 
              icon={<GraduationCap className="w-6 h-6" />} 
              color="bg-blue-50 text-blue-600"
              trend={`${stats.total > 0 ? Math.round((stats.students / stats.total) * 100) : 0}% of total`}
            />
            <StatCard 
              title="Faculty" 
              value={stats.faculty} 
              icon={<UserCheck className="w-6 h-6" />} 
              color="bg-amber-50 text-amber-600"
              trend={`${stats.total > 0 ? Math.round((stats.faculty / stats.total) * 100) : 0}% of total`}
            />
            <StatCard 
              title="Employees" 
              value={stats.employees} 
              icon={<BookOpen className="w-6 h-6" />} 
              color="bg-purple-50 text-purple-600"
              trend={`${stats.total > 0 ? Math.round((stats.employees / stats.total) * 100) : 0}% of total`}
            />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Reason Bar Chart */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-200">
              <h3 className="text-lg font-bold text-stone-800 mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                Visitors by Reason
              </h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.reasonData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      cursor={{ fill: '#f8fafc' }}
                    />
                    <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Visitor Type Pie Chart */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-200">
              <h3 className="text-lg font-bold text-stone-800 mb-6 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-emerald-600" />
                Visitor Distribution
              </h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.typeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {stats.typeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* College Bar Chart (Full Width) */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-200 lg:col-span-2">
              <h3 className="text-lg font-bold text-stone-800 mb-6 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-emerald-600" />
                Visitors by College
              </h3>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.collegeData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} width={150} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      cursor={{ fill: '#f8fafc' }}
                    />
                    <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      ) : (
        <BlockedUsers />
      )}
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  trend: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, trend }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 flex flex-col justify-between">
    <div className="flex justify-between items-start">
      <div className={`p-3 rounded-xl ${color}`}>
        {icon}
      </div>
      <span className="text-xs font-medium text-stone-400 uppercase tracking-wider">{title}</span>
    </div>
    <div className="mt-4">
      <h4 className="text-3xl font-bold text-stone-900">{value.toLocaleString()}</h4>
      <p className="text-xs text-stone-500 mt-1 font-medium">{trend}</p>
    </div>
  </div>
);

export default AdminDashboard;
