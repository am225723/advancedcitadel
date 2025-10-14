import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Scroll, PlusCircle, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

const WardenNotesPage = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteIsActive, setNewNoteIsActive] = useState(true);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editNoteTitle, setEditNoteTitle] = useState('');
  const [editNoteContent, setEditNoteContent] = useState('');
  const [editNoteIsActive, setEditNoteIsActive] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('warden_notes')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      toast({ variant: "destructive", title: "Error", description: "Could not fetch warden notes." });
    } else {
      setNotes(data);
    }
    setLoading(false);
  };

  const handleAddNote = async () => {
    if (!newNoteTitle.trim() || !newNoteContent.trim()) {
      toast({ variant: "destructive", title: "Empty Fields", description: "Title and content cannot be empty." });
      return;
    }
    const { error } = await supabase.from('warden_notes').insert([{ title: newNoteTitle, content: newNoteContent, is_active: newNoteIsActive }]);
    if (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to add note." });
    } else {
      setNewNoteTitle('');
      setNewNoteContent('');
      setNewNoteIsActive(true);
      toast({ title: "Note Added", description: "Warden's note successfully added." });
      fetchNotes();
    }
  };

  const handleEditNote = (note) => {
    setEditingNoteId(note.id);
    setEditNoteTitle(note.title);
    setEditNoteContent(note.content);
    setEditNoteIsActive(note.is_active);
  };

  const handleUpdateNote = async (id) => {
    if (!editNoteTitle.trim() || !editNoteContent.trim()) {
      toast({ variant: "destructive", title: "Empty Fields", description: "Title and content cannot be empty." });
      return;
    }
    const { error } = await supabase
      .from('warden_notes')
      .update({ title: editNoteTitle, content: editNoteContent, is_active: editNoteIsActive })
      .match({ id });
    if (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to update note." });
    } else {
      setEditingNoteId(null);
      toast({ title: "Note Updated", description: "Warden's note successfully updated." });
      fetchNotes();
    }
  };

  const handleDeleteNote = async (id) => {
    const { error } = await supabase.from('warden_notes').delete().match({ id });
    if (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete note." });
    } else {
      toast({ title: "Note Deleted", description: "Warden's note removed." });
      fetchNotes();
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen text-gold-accent font-cinzel text-2xl">Loading Warden Notes...</div>;
  }

  return (
    <>
      <Helmet>
        <title>Warden Notes - The Citadel</title>
        <meta name="description" content="Manage important notes and directives for the Citadel." />
      </Helmet>

      <div className="max-w-4xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-3"><Scroll className="w-12 h-12 text-gold-accent" /><h1 className="text-4xl font-bold text-gradient-gold">Warden Notes</h1></div>
          <p className="text-xl text-slate-400 font-garamond">Manage the directives and important messages for the Citadel.</p>
        </motion.div>

        <Card className="bg-dark-steel/50 border-slate-800 p-8 space-y-6">
          <h2 className="text-2xl font-bold text-white">Add New Note</h2>
          <Input
            placeholder="Note Title"
            value={newNoteTitle}
            onChange={(e) => setNewNoteTitle(e.target.value)}
            className="bg-dark-steel/70 border-slate-700"
          />
          <Textarea
            placeholder="Note Content"
            value={newNoteContent}
            onChange={(e) => setNewNoteContent(e.target.value)}
            className="bg-dark-steel/70 border-slate-700 min-h-[100px]"
          />
          <div className="flex items-center space-x-2">
            <Checkbox
              id="new-note-active"
              checked={newNoteIsActive}
              onCheckedChange={setNewNoteIsActive}
              className="border-gold-accent data-[state=checked]:bg-gold-accent data-[state=checked]:text-dark-steel"
            />
            <label htmlFor="new-note-active" className="text-sm font-medium text-slate-300">
              Active (visible in sidebar)
            </label>
          </div>
          <Button onClick={handleAddNote} className="w-full bg-gradient-to-r from-gold-accent/80 to-gold-accent text-dark-steel font-bold py-6 text-lg">
            <PlusCircle className="w-5 h-5 mr-2" /> Add Note
          </Button>
        </Card>

        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Existing Notes</h2>
          {notes.length === 0 ? (
            <p className="text-slate-400 text-center">No warden notes found.</p>
          ) : (
            notes.map((note) => (
              <motion.div key={note.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="bg-dark-steel/30 border-slate-800 p-6 space-y-4">
                  {editingNoteId === note.id ? (
                    <>
                      <Input
                        value={editNoteTitle}
                        onChange={(e) => setEditNoteTitle(e.target.value)}
                        className="bg-dark-steel/70 border-slate-700"
                      />
                      <Textarea
                        value={editNoteContent}
                        onChange={(e) => setEditNoteContent(e.target.value)}
                        className="bg-dark-steel/70 border-slate-700 min-h-[80px]"
                      />
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`edit-note-active-${note.id}`}
                          checked={editNoteIsActive}
                          onCheckedChange={setEditNoteIsActive}
                          className="border-gold-accent data-[state=checked]:bg-gold-accent data-[state=checked]:text-dark-steel"
                        />
                        <label htmlFor={`edit-note-active-${note.id}`} className="text-sm font-medium text-slate-300">
                          Active (visible in sidebar)
                        </label>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button onClick={() => handleUpdateNote(note.id)} variant="ghost" className="text-green-500 hover:bg-green-500/10">
                          <CheckCircle className="w-4 h-4 mr-2" /> Save
                        </Button>
                        <Button onClick={() => setEditingNoteId(null)} variant="ghost" className="text-red-500 hover:bg-red-500/10">
                          <XCircle className="w-4 h-4 mr-2" /> Cancel
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <h3 className="text-xl font-bold text-white">{note.title}</h3>
                      <p className="text-slate-300 font-garamond">{note.content}</p>
                      <div className="flex justify-between items-center text-sm text-slate-400">
                        <span>{new Date(note.created_at).toLocaleString()}</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${note.is_active ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'}`}>
                          {note.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button onClick={() => handleEditNote(note)} variant="ghost" size="icon" className="text-gold-accent hover:bg-gold-accent/10">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button onClick={() => handleDeleteNote(note.id)} variant="ghost" size="icon" className="text-blood-red hover:bg-blood-red/10">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default WardenNotesPage;