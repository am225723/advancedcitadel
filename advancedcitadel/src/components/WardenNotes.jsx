import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scroll } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';

const WardenNotes = () => {
  const [notes, setNotes] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchNotes = async () => {
      const { data } = await supabase.from('warden_notes').select('*').eq('is_active', true).order('created_at', { ascending: false });
      setNotes(data || []);
    };
    fetchNotes();

    const channel = supabase.channel('warden-notes-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'warden_notes' }, payload => {
        fetchNotes();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (notes.length === 0) return null;

  return (
    <div className="px-2">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center text-left text-sm font-cinzel text-gold-accent/70 hover:text-gold-accent">
        <span>From Warden Aleix</span>
        <Scroll className="w-4 h-4" />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-2 space-y-2 text-xs text-slate-400 border-l-2 border-gold-accent/20 pl-3 max-h-32 overflow-y-auto"
          >
            {notes.map(note => (
              <div key={note.id}>
                <p className="font-bold text-gold-accent/80">{note.title}</p>
                <p className="font-garamond">{note.content}</p>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WardenNotes;