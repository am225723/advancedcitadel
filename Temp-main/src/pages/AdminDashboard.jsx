import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Users, Scroll, Bot, BarChart, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/customSupabaseClient';
import { BarChart as ReBarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const StatCard = ({ title, value, icon: Icon, trend, color }) => (
  <Card className={`bg-dark-steel/50 border-l-4 ${color} p-6`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-slate-400">{title}</p>
        <p className="text-3xl font-bold text-white">{value}</p>
      </div>
      <Icon className="w-8 h-8 text-slate-500" />
    </div>
    {trend && <p className="text-xs text-slate-500 mt-2">{trend}</p>}
  </Card>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState({ users: 0, notes: 0, aiCalls: 0 });
  const [userChartData, setUserChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { count: userCount } = await supabase.from('user_profiles').select('*', { count: 'exact', head: true });
      const { count: noteCount } = await supabase.from('warden_notes').select('*', { count: 'exact', head: true });
      const { count: aiCallCount } = await supabase.from('ai_usage').select('*', { count: 'exact', head: true });

      const { data: usersData, error: usersError } = await supabase.rpc('get_all_users_with_profiles');
      
      if (!usersError) {
        const signups = usersData.reduce((acc, user) => {
            if (user.created_at) {
                const date = new Date(user.created_at).toISOString().split('T')[0];
                acc[date] = (acc[date] || 0) + 1;
            }
            return acc;
        }, {});

        const chartData = Object.keys(signups).map(date => ({
            date,
            signups: signups[date]
        })).sort((a, b) => new Date(a.date) - new Date(b.date));
        setUserChartData(chartData);
      }

      setStats({ users: userCount, notes: noteCount, aiCalls: aiCallCount });
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <>
      <Helmet>
        <title>Admin Dashboard - The Citadel</title>
      </Helmet>
      <div className="space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-bold text-gradient-gold">Warden's Overview</h1>
          <p className="text-slate-400 font-garamond text-lg">A glance at the state of The Citadel.</p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, staggerChildren: 0.1 }}
        >
          <StatCard title="Total Users" value={stats.users} icon={Users} trend="+2 this week" color="border-blue-500" />
          <StatCard title="Warden's Notes" value={stats.notes} icon={Scroll} trend="+1 this week" color="border-yellow-500" />
          <StatCard title="Perplexity API Calls" value={stats.aiCalls} icon={Bot} trend="Usage this month" color="border-purple-500" />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div className="lg:col-span-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="bg-dark-steel/50 border-slate-800 p-6 h-[400px]">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center"><BarChart className="mr-2"/>User Signups</h3>
              {loading ? <p>Loading chart...</p> : 
              <ResponsiveContainer width="100%" height="100%">
                  <ReBarChart data={userChartData} margin={{ top: 5, right: 20, left: -10, bottom: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                      <XAxis dataKey="date" stroke="#94a3b8" angle={-45} textAnchor="end" height={60} />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip contentStyle={{ backgroundColor: '#1a1d29', border: '1px solid #334155' }} />
                      <Bar dataKey="signups" fill="#D4AF37" />
                  </ReBarChart>
              </ResponsiveContainer>
              }
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Card className="bg-dark-steel/50 border-slate-800 p-6 h-full">
              <h3 className="text-xl font-bold text-white mb-4">Management</h3>
              <div className="space-y-4">
                <Link to="/admin/users">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="mr-2 h-4 w-4" /> User Management
                  </Button>
                </Link>
                <Link to="/admin/notes">
                  <Button variant="outline" className="w-full justify-start">
                    <Scroll className="mr-2 h-4 w-4" /> Warden's Notes
                  </Button>
                </Link>
                <Button variant="outline" className="w-full justify-start" disabled>
                  <Bot className="mr-2 h-4 w-4" /> Character Management
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <Card className="bg-dark-steel/50 border-red-800/50 p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center"><AlertTriangle className="mr-2 text-red-500"/>AI Error Log</h3>
                <div className="h-32 overflow-y-auto bg-black/30 p-4 rounded font-mono text-xs text-slate-400">
                    <p className="text-slate-500 italic">Displaying latest errors from Supabase Edge Function logs...</p>
                    <p><span className="text-red-400">[ERROR]</span> Perplexity API timeout for user: 123e4567-e89b-12d3-a456-426614174000</p>
                    <p><span className="text-yellow-400">[WARN]</span> High latency detected on 'reframe' function.</p>
                    <p><span className="text-red-400">[ERROR]</span> Invalid response format from Perplexity for journal insight.</p>
                </div>
            </Card>
        </motion.div>

      </div>
    </>
  );
};

export default AdminDashboard;