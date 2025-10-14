import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Settings, Plus, Trash2, Edit, ToggleLeft, ToggleRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useUser } from '@/contexts/UserContext';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

const AdminNotesPage = () => {
  const { user } = useUser();
  const [notes, setNotes] = useState([]);
  const [currentNote, setCurrentNote] = useState({ id: null, title: '', content: '' });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    const { data, error } = await supabase.from('warden_notes').select('*').order('created_at', { ascending: false });
    if (error) {
      toast({ title: "Error", description: "Could not fetch Warden's notes.", variant: "destructive" });
    } else {
      setNotes(data);
    }
  };

  const handleSave = async () => {
    const noteData = { title: currentNote.title, content: currentNote.content };
    let error;

    if (isEditing) {
      ({ error } = await supabase.from('warden_notes').update(noteData).eq('id', currentNote.id));
    } else {
      ({ error } = await supabase.from('warden_notes').insert(noteData));
    }

    if (error) {
      toast({ title: "Save Failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: `Note ${isEditing ? 'updated' : 'created'}.` });
      resetForm();
      fetchNotes();
    }
  };

  const handleDelete = async (id) => {
    const { error } = await supabase.from('warden_notes').delete().eq('id', id);
    if (error) {
      toast({ title: "Delete Failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Note Deleted" });
      fetchNotes();
    }
  };

  const handleToggleActive = async (note) => {
    const { error } = await supabase.from('warden_notes').update({ is_active: !note.is_active }).eq('id', note.id);
    if (error) {
      toast({ title: "Toggle Failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Status Updated" });
      fetchNotes();
    }
  };

  const editNote = (note) => {
    setIsEditing(true);
    setCurrentNote({ id: note.id, title: note.title, content: note.content });
  };

  const resetForm = () => {
    setIsEditing(false);
    setCurrentNote({ id: null, title: '', content: '' });
  };

  if (user?.role !== 'admin') {
    return (
      <div className="text-center">
        <h1 className="text-2xl text-blood-red">Access Denied</h1>
        <p>Only the Warden may access this area.</p>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Warden's Desk - The Citadel</title>
      </Helmet>
      <div className="max-w-4xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <h1 className="text-4xl font-bold text-gradient-gold">Warden's Desk</h1>
          <p className="text-slate-400 font-garamond">Manage messages from the Citadel.</p>
        </motion.div>

        <Card className="bg-dark-steel/50 border-gold-accent/30 p-6 space-y-4">
          <h2 className="text-2xl text-white">{isEditing ? 'Edit Note' : 'Create New Note'}</h2>
          <Input
            placeholder="Title"
            value={currentNote.title}
            onChange={(e) => setCurrentNote({ ...currentNote, title: e.target.value })}
            className="bg-dark-steel/70 border-slate-700"
          />
          <Textarea
            placeholder="Content"
            value={currentNote.content}
            onChange={(e) => setCurrentNote({ ...currentNote, content: e.target.value })}
            className="bg-dark-steel/70 border-slate-700"
          />
          <div className="flex space-x-2">
            <Button onClick={handleSave}>{isEditing ? 'Update Note' : 'Save Note'}</Button>
            {isEditing && <Button variant="ghost" onClick={resetForm}>Cancel</Button>}
          </div>
        </Card>

        <div className="space-y-4">
          <h2 className="text-2xl text-white">Existing Notes</h2>
          {notes.map(note => (
            <Card key={note.id} className="bg-dark-steel/30 border-slate-800 p-4 flex justify-between items-center">
              <div>
                <p className="font-bold text-lg text-white">{note.title}</p>
                <p className="text-slate-400 text-sm">{note.content.substring(0, 50)}...</p>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon" onClick={() => handleToggleActive(note)}>
                  {note.is_active ? <ToggleRight className="text-green-500" /> : <ToggleLeft className="text-slate-500" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => editNote(note)}><Edit className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(note.id)} className="text-blood-red"><Trash2 className="w-4 h-4" /></Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
};

export default AdminNotesPage;