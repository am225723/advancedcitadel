import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Users, Shield, UserCheck, UserX, Search, Edit } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import * as Dialog from '@radix-ui/react-dialog';
import { supabase } from '@/lib/customSupabaseClient';
import { toast } from '@/components/ui/use-toast';

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editXp, setEditXp] = useState(0);
  const [editLevel, setEditLevel] = useState(1);
  const [updating, setUpdating] = useState(false);

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
      fetchUsers();
    }
  };

  const openEditDialog = (user) => {
    setSelectedUser(user);
    setEditXp(user.xp || 0);
    setEditLevel(user.level || 1);
    setDialogOpen(true);
  };

  const handleUpdateProgress = async () => {
    if (!selectedUser) return;

    if (editXp < 0 || editXp > 10000) {
      toast({ 
        title: "Validation Error", 
        description: "XP must be between 0 and 10,000.", 
        variant: "destructive" 
      });
      return;
    }

    if (editLevel < 1 || editLevel > 100) {
      toast({ 
        title: "Validation Error", 
        description: "Level must be between 1 and 100.", 
        variant: "destructive" 
      });
      return;
    }

    setUpdating(true);
    
    const { data, error } = await supabase.rpc('admin_set_user_progress', {
      p_user_id: selectedUser.id,
      p_xp: editXp,
      p_level: editLevel
    });

    if (error) {
      toast({ 
        title: "Update Failed", 
        description: error.message || "Failed to update user progress.", 
        variant: "destructive" 
      });
    } else {
      toast({ 
        title: "Success", 
        description: `Updated ${selectedUser.email}: Level ${editLevel}, XP ${editXp}` 
      });
      setDialogOpen(false);
      fetchUsers();
    }
    
    setUpdating(false);
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
                  <th className="p-4">XP</th>
                  <th className="p-4">Level</th>
                  <th className="p-4">Joined</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="6" className="text-center p-8">Loading users...</td></tr>
                ) : (
                  filteredUsers.map(user => (
                    <tr key={user.id} className="border-b border-slate-800 hover:bg-dark-steel/40">
                      <td className="p-4 font-semibold">{user.email}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${user.role === 'admin' ? 'bg-gold-accent/20 text-gold-accent' : 'bg-slate-700 text-slate-300'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="p-4 text-slate-300">{user.xp || 0}</td>
                      <td className="p-4 text-slate-300">{user.level || 1}</td>
                      <td className="p-4 text-slate-400">{new Date(user.created_at).toLocaleDateString()}</td>
                      <td className="p-4 text-right">
                        <div className="flex gap-2 justify-end">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => openEditDialog(user)}
                            className="border-gold-accent/30 hover:bg-gold-accent/10"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit XP/Level
                          </Button>
                          {user.role !== 'admin' ? (
                            <Button size="sm" onClick={() => updateUserRole(user.id, 'admin')}>Make Admin</Button>
                          ) : (
                            <Button size="sm" variant="secondary" onClick={() => updateUserRole(user.id, 'user')}>Revoke Admin</Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
            <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-dark-steel border border-gold-accent/30 rounded-lg p-6 w-full max-w-md z-50 shadow-2xl">
              <Dialog.Title className="text-2xl font-bold text-gradient-gold mb-2">
                Edit User Progress
              </Dialog.Title>
              <Dialog.Description className="text-slate-400 mb-6">
                {selectedUser && `Update XP and Level for ${selectedUser.email}`}
              </Dialog.Description>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="xp" className="text-white mb-2 block">
                    Experience Points (XP)
                  </Label>
                  <Input
                    id="xp"
                    type="number"
                    min="0"
                    max="10000"
                    value={editXp}
                    onChange={(e) => setEditXp(parseInt(e.target.value) || 0)}
                    placeholder={`Current: ${selectedUser?.xp || 0}`}
                    className="bg-dark-steel/70 border-slate-700 text-white"
                    disabled={updating}
                  />
                  <p className="text-xs text-slate-500 mt-1">Min: 0, Max: 10,000</p>
                </div>

                <div>
                  <Label htmlFor="level" className="text-white mb-2 block">
                    Level
                  </Label>
                  <Input
                    id="level"
                    type="number"
                    min="1"
                    max="100"
                    value={editLevel}
                    onChange={(e) => setEditLevel(parseInt(e.target.value) || 1)}
                    placeholder={`Current: ${selectedUser?.level || 1}`}
                    className="bg-dark-steel/70 border-slate-700 text-white"
                    disabled={updating}
                  />
                  <p className="text-xs text-slate-500 mt-1">Min: 1, Max: 100</p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  onClick={handleUpdateProgress}
                  disabled={updating}
                  className="flex-1"
                >
                  {updating ? 'Updating...' : 'Save Changes'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  disabled={updating}
                  className="border-slate-700"
                >
                  Cancel
                </Button>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </>
  );
};

export default UserManagementPage;