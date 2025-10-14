import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const SecureVault = () => {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState({ title: '', content: '' });
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchNotes = async () => {
      if (!user) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('secure_notes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching secure notes:', error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch secure notes.' });
      } else {
        setNotes(data);
      }
      setLoading(false);
    };

    fetchNotes();
  }, [user]);

  const saveNote = async () => {
    if (!newNote.title.trim() || !newNote.content.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in both title and content",
        variant: "destructive"
      });
      return;
    }

    const { data, error } = await supabase
      .from('secure_notes')
      .insert([{ ...newNote, user_id: user.id }])
      .select()
      .single();

    if (error) {
      console.error('Error saving note:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not save note.' });
    } else {
      setNotes([data, ...notes]);
      setNewNote({ title: '', content: '' });
      setIsAdding(false);
      toast({
        title: "Note Saved! 🔒",
        description: "Your secure note has been stored"
      });
    }
  };

  const deleteNote = async (id) => {
    const { error } = await supabase
      .from('secure_notes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting note:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not delete note.' });
    } else {
      setNotes(notes.filter(note => note.id !== id));
      toast({
        title: "Note Deleted",
        description: "The note has been removed from your vault"
      });
    }
  };

  return (
    <div className="space-y-6">
      {!isAdding ? (
        <Button
          onClick={() => setIsAdding(true)}
          className="w-full bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 text-white font-bold py-6"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Secure Note
        </Button>
      ) : (
        <Card className="bg-slate-950/50 border-green-700 p-6 space-y-4">
          <Input
            value={newNote.title}
            onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
            placeholder="Note Title"
            className="bg-slate-900 border-slate-700 text-white"
          />
          <Textarea
            value={newNote.content}
            onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
            placeholder="Note Content"
            className="min-h-32 bg-slate-900 border-slate-700 text-white"
          />
          <div className="flex space-x-2">
            <Button
              onClick={saveNote}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              Save Note
            </Button>
            <Button
              onClick={() => {
                setIsAdding(false);
                setNewNote({ title: '', content: '' });
              }}
              variant="outline"
              className="border-slate-600"
            >
              Cancel
            </Button>
          </div>
        </Card>
      )}

      <div className="space-y-4">
        {loading ? (
          <p>Loading notes...</p>
        ) : notes.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>No secure notes yet. Add your first note!</p>
          </div>
        ) : (
          notes.map((note, index) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-slate-950/50 border-slate-700 p-6 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-white">{note.title}</h4>
                    <p className="text-sm text-slate-400">
                      {new Date(note.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    onClick={() => deleteNote(note.id)}
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-400 hover:bg-red-950/30"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-slate-300 whitespace-pre-wrap">{note.content}</p>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default SecureVault;