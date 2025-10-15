import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { BookOpen, Sparkles, Trash2, PlusCircle, ChevronsRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useUser } from '@/contexts/UserContext';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.jsx";

const AIJournal = () => {
  const [title, setTitle] = useState('');
  const [entry, setEntry] = useState('');
  const [tags, setTags] = useState('');
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(null);
  const { user, addXP, unlockPart, recordExerciseType, updateJournalStreak } = useUser();
  const { session } = useAuth();

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', session?.user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to fetch entries: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEntry = async () => {
    if (!title.trim() || !entry.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Title and entry content are required."
      });
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('journal_entries')
        .insert([
          {
            user_id: session?.user?.id,
            title: title.trim(),
            content: entry.trim(),
            tags: tags.trim() || null,
          }
        ])
        .select();

      if (error) throw error;

      toast({
        title: "Entry Saved!",
        description: "Your journal entry has been saved. +10 XP earned."
      });
      
      addXP(10);
      recordExerciseType('Journal');
      updateJournalStreak();

      setTitle('');
      setEntry('');
      setTags('');
      fetchEntries();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to save entry: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEntry = async (id) => {
    try {
      const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Entry Deleted",
        description: "Journal entry has been removed."
      });
      fetchEntries();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to delete entry: ${error.message}`
      });
    }
  };

  const getAnalysis = async (entryId, entryContent, analysisType) => {
    setAnalysisLoading(entryId);
    try {
      const { data, error } = await supabase.functions.invoke('perplexity-journal-ai', {
        body: { content: entryContent, mode: analysisType },
      });

      if (error) throw new Error(error.message);
      if (!data) {
        throw new Error("Received an unexpected response from the AI.");
      }

      let insightToSave = { title: "AI Analysis", response: "" };
      switch (analysisType) {
        case 'summarize':
          insightToSave = { title: "AI Summary", response: data.summary };
          break;
        case 'insights':
          insightToSave = { title: "Key Insights", response: data.insights.join('\n• ') };
          break;
        case 'next_steps':
          insightToSave = { title: "Suggested Next Steps", response: data.actions.join('\n• ') };
          break;
        case 'mechanic_question':
          insightToSave = { title: "Key Insights", response: data.insights.join('\n• ') };
          break;
        default:
          insightToSave.response = "Analysis complete.";
      }

      const { error: updateError } = await supabase
        .from('journal_entries')
        .update({ insights: insightToSave })
        .match({ id: entryId });

      if (updateError) throw updateError;

      addXP(25);
      toast({ title: "Analysis Complete!", description: "AI insights unlocked. +25 XP earned." });
      fetchEntries();
    } catch (error) {
      toast({ variant: "destructive", title: "AI Error", description: `Failed to get insights. ${error.message}` });
    } finally {
      setAnalysisLoading(null);
    }
  };

  return (
    <>
      <Helmet>
        <title>Journal - The Citadel</title>
        <meta name="description" content="Chronicle your journey through The Citadel." />
      </Helmet>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <div className="flex items-center gap-3 mb-8">
          <BookOpen className="w-8 h-8 text-gold-accent" />
          <h1 className="text-4xl font-cinzel text-gold-accent">The Chronicle</h1>
        </div>

        {/* New Entry Form */}
        <Card className="p-6 mb-8 bg-dark-steel/50 border-gold-accent/20">
          <h2 className="text-2xl font-cinzel text-gold-accent mb-4">New Entry</h2>
          <div className="space-y-4">
            <Input
              placeholder="Entry Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-dark-steel border-gold-accent/30 text-slate-200"
            />
            <Textarea
              placeholder="Write your thoughts..."
              value={entry}
              onChange={(e) => setEntry(e.target.value)}
              rows={6}
              className="bg-dark-steel border-gold-accent/30 text-slate-200"
            />
            <Input
              placeholder="Tags (comma-separated)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="bg-dark-steel border-gold-accent/30 text-slate-200"
            />
            <Button
              onClick={handleSaveEntry}
              disabled={loading}
              className="w-full bg-gold-accent hover:bg-gold-accent/80 text-dark-steel"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              {loading ? 'Saving...' : 'Save Entry'}
            </Button>
          </div>
        </Card>

        {/* Entries List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-cinzel text-gold-accent mb-4">Past Entries</h2>
          {loading && entries.length === 0 ? (
            <p className="text-slate-400 text-center py-8">Loading entries...</p>
          ) : entries.length === 0 ? (
            <p className="text-slate-400 text-center py-8">No entries yet. Start writing!</p>
          ) : (
            entries.map((item) => (
              <Card key={item.id} className="p-6 bg-dark-steel/50 border-gold-accent/20">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-cinzel text-gold-accent">{item.title}</h3>
                    <p className="text-sm text-slate-400">
                      {new Date(item.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={analysisLoading === item.id}
                          className="text-gold-accent hover:text-gold-accent/80"
                        >
                          <Sparkles className="w-4 h-4 mr-2" />
                          {analysisLoading === item.id ? 'Analyzing...' : 'AI Insights'}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-dark-steel border-gold-accent/30">
                        <DropdownMenuItem
                          onClick={() => getAnalysis(item.id, item.content, 'summarize')}
                          className="text-slate-200 hover:text-gold-accent"
                        >
                          Summarize
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => getAnalysis(item.id, item.content, 'insights')}
                          className="text-slate-200 hover:text-gold-accent"
                        >
                          Key Insights
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => getAnalysis(item.id, item.content, 'next_steps')}
                          className="text-slate-200 hover:text-gold-accent"
                        >
                          Next Steps
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteEntry(item.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <p className="text-slate-300 mb-4 whitespace-pre-wrap">{item.content}</p>

                {item.tags && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {item.tags.split(',').map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 text-xs bg-gold-accent/20 text-gold-accent rounded"
                      >
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                )}

                {item.insights && (
                  <Card className="p-4 bg-dark-steel/80 border-gold-accent/30 mt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-gold-accent" />
                      <h4 className="font-semibold text-gold-accent">{item.insights.title}</h4>
                    </div>
                    <p className="text-slate-300 text-sm whitespace-pre-wrap">{item.insights.response}</p>
                  </Card>
                )}
              </Card>
            ))
          )}
        </div>
      </motion.div>
    </>
  );
};

export default AIJournal;
