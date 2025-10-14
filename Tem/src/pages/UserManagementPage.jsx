import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Users, Shield, UserCheck, UserX, Search } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/customSupabaseClient';
import { toast } from '@/components/ui/use-toast';

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc('get_all_users_with_profiles');
    if (error) {
      toast({ title: "Error", description: "Could not fetch users.", variant: "destructive" });
    } else {
      setUsers(data);
    }
    setLoading(false);
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const updateUserRole = async (userId, newRole) => {
    const { error } = await supabase
      .from('user_profiles')
      .update({ role: newRole })
      .eq('id', userId);

    if (error) {
      toast({ title: "Update Failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Role Updated", description: `User role set to ${newRole}.` });
      fetchUsers(); // Refresh the list
    }
  };

  return (
    <>
      <Helmet>
        <title>User Management - The Citadel</title>
      </Helmet>
      <div className="max-w-6xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <h1 className="text-4xl font-bold text-gradient-gold">User Management</h1>
          <p className="text-slate-400 font-garamond">Oversee the warriors of The Citadel.</p>
        </motion.div>

        <Card className="bg-dark-steel/50 border-gold-accent/30 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl text-white">All Users ({filteredUsers.length})</h2>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Search by email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-dark-steel/70 border-slate-700 pl-10"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Level</th>
                  <th className="p-4">Joined</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="5" className="text-center p-8">Loading users...</td></tr>
                ) : (
                  filteredUsers.map(user => (
                    <tr key={user.id} className="border-b border-slate-800 hover:bg-dark-steel/40">
                      <td className="p-4 font-semibold">{user.email}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${user.role === 'admin' ? 'bg-gold-accent/20 text-gold-accent' : 'bg-slate-700 text-slate-300'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="p-4">{user.level}</td>
                      <td className="p-4 text-slate-400">{new Date(user.created_at).toLocaleDateString()}</td>
                      <td className="p-4 text-right">
                        {user.role !== 'admin' ? (
                          <Button size="sm" onClick={() => updateUserRole(user.id, 'admin')}>Make Admin</Button>
                        ) : (
                          <Button size="sm" variant="secondary" onClick={() => updateUserRole(user.id, 'user')}>Revoke Admin</Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </>
  );
};

export default UserManagementPage;