// src/pages/AIJournalWithGuide.jsx
// Enhanced AI Journal with Guide Integration

import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { BookOpen, Sparkles, Trash2, PlusCircle, ChevronsRight, Users, Heart } from 'lucide-react';
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
import { 
  getActiveGuide, 
  getGuideJournalResponse, 
  saveGuideInteraction 
} from '@/lib/guideService';
import { getPersona } from '@/lib/personaConfig';
import JournalFeelingsPanel from '@/components/JournalFeelingsPanel';

const AIJournalWithGuide = () => {
  const [title, setTitle] = useState('');
  const [entry, setEntry] = useState('');
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(null);
  const [activeGuideId, setActiveGuideId] = useState('solaire');
  const [activeGuide, setActiveGuide] = useState(getPersona('solaire'));
  const { user, addXP, unlockPart, recordExerciseType, updateJournalStreak } = useUser();
  const { session } = useAuth();

  useEffect(() => {
    fetchEntries();
    loadActiveGuide();
  }, []);

  const loadActiveGuide = async () => {
    if (session?.user?.id) {
      const guideId = await getActiveGuide(session.user.id);
      setActiveGuideId(guideId);
      setActiveGuide(getPersona(guideId) || getPersona('solaire'));
    }
  };

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
          }
        ])
        .select();

      if (error) throw error;

      toast({
        title: "Entry Saved!",
        description: "Entry saved! Getting guide analysis..."
      });
      
      recordExerciseType('Journal');
      updateJournalStreak();

      const savedEntry = data[0];
      setTitle('');
      setEntry('');
      setTags('');
      
      // Automatically analyze the new entry
      await handleAnalyzeExisting(savedEntry.id, savedEntry.content);
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

  const handleAnalyzeExisting = async (entryId, entryContent) => {
    setAnalysisLoading(entryId);
    try {
      // 1. Get Perplexity feelings analysis
      const { data: analysisData, error: analysisError } = await supabase.functions.invoke('perplexity-journal-ai', {
        body: { content: entryContent, mode: 'feelings' },
      });

      if (analysisError) throw new Error(analysisError.message);
      
      // 2. Store the feelings analysis in insights column
      const feelingsInsight = {
        title: "Emotional Analysis",
        response: "",
        type: 'feelings',
        data: analysisData
      };

      const { error: updateInsightsError } = await supabase
        .from('journal_entries')
        .update({ insights: feelingsInsight })
        .eq('id', entryId);

      if (updateInsightsError) throw updateInsightsError;

      // 3. Get guide response with analysis context
      const response = await getGuideJournalResponse(
        activeGuideId,
        entryContent,
        {
          level: user?.level,
          xp: user?.xp,
          displayName: user?.display_name,
          completedExercises: user?.completed_exercises,
          emotions: analysisData?.primary_emotions || [],
          secondaryEmotions: analysisData?.secondary_emotions || [],
          emotionalIntensity: analysisData?.intensity,
          cognitiveThemes: analysisData?.themes || [],
          somaticCues: analysisData?.somatic_cues || [],
        }
      );

      // 4. Save the guide interaction
      await saveGuideInteraction(
        session.user.id,
        activeGuideId,
        'journal',
        entryContent,
        response
      );

      // 5. Update journal entry with guide's response in ai_insights
      const { error: updateAIError } = await supabase
        .from('journal_entries')
        .update({
          ai_insights: [
            {
              guide: activeGuide?.name || 'Guide',
              title: `${activeGuide?.name || 'Guide'}'s Guidance`,
              response: response,
              timestamp: new Date().toISOString(),
            }
          ]
        })
        .eq('id', entryId);

      if (updateAIError) throw updateAIError;

      toast({
        title: `Analysis Complete!`,
        description: `${activeGuide?.name || 'Your guide'} has reviewed your emotional analysis. +30 XP earned.`,
      });

      // Award XP for getting both analysis and guide response
      addXP(30, 'Journal');
      
      fetchEntries();
    } catch (error) {
      console.error('Error getting guide analysis:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to get guidance: ${error.message}`,
      });
    } finally {
      setAnalysisLoading(null);
    }
  };

  return (
    <>
      <Helmet>
        <title>The Scribe's Chronicle - The Citadel</title>
        <meta name="description" content="Journal your thoughts with guidance from your chosen mentor" />
      </Helmet>

      <div className="max-w-4xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-3">
            <BookOpen className="w-12 h-12 text-gold-accent" />
            <h1 className="text-4xl font-bold text-gradient-gold font-cinzel">The Scribe's Chronicle</h1>
          </div>
          <p className="text-xl text-slate-400 font-garamond max-w-2xl mx-auto">
            Record your journey and receive wisdom from your guide
          </p>
        </motion.div>

        {/* Active Guide Display */}
        {activeGuide && (
          <Card className="bg-gradient-to-r from-dark-steel/50 to-transparent border-slate-800 p-4">
            <div className="flex items-center gap-4">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${activeGuide.color}20` }}
              >
                <Users className="w-6 h-6" style={{ color: activeGuide.color }} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500">Your Active Guide:</span>
                  <span className="font-semibold text-white">{activeGuide.name}</span>
                </div>
                <p className="text-xs text-slate-400">{activeGuide.description}</p>
              </div>
            </div>
          </Card>
        )}

        {/* New Entry Form */}
        <Card className="bg-dark-steel/50 border-slate-800 p-8 space-y-6">
          <h2 className="text-2xl font-bold text-white font-cinzel">New Entry</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="title-input" className="text-lg font-semibold text-white">Title</label>
              <Input 
                id="title-input"
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="Give your entry a title..." 
                className="bg-dark-steel/70 border-slate-700 mt-2" 
              />
            </div>
            
            <div>
              <label htmlFor="entry-input" className="text-lg font-semibold text-white">Your Thoughts</label>
              <Textarea 
                id="entry-input"
                value={entry} 
                onChange={(e) => setEntry(e.target.value)} 
                placeholder="What's on your mind today? Write freely..." 
                className="bg-dark-steel/70 border-slate-700 min-h-[200px] mt-2" 
              />
            </div>
            
            <div>
              <label htmlFor="tags-input" className="text-lg font-semibold text-white">Tags (Optional)</label>
              <Input 
                id="tags-input"
                value={tags} 
                onChange={(e) => setTags(e.target.value)} 
                placeholder="e.g., anxiety, work, relationships" 
                className="bg-dark-steel/70 border-slate-700 mt-2" 
              />
            </div>
          </div>
          
          <Button 
            onClick={handleSaveEntry} 
            disabled={loading} 
            className="w-full bg-gradient-to-r from-gold-accent to-yellow-600 text-black font-bold py-6 text-lg hover:from-yellow-600 hover:to-gold-accent"
          >
            {loading ? 'Saving...' : <><PlusCircle className="w-5 h-5 mr-2" />Save Entry</>}
          </Button>
        </Card>

        {/* Previous Entries */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white font-cinzel">Your Chronicle</h2>
          
          {entries.length === 0 ? (
            <Card className="bg-dark-steel/30 border-slate-800 p-12 text-center">
              <BookOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 font-garamond">Your journal entries will appear here</p>
            </Card>
          ) : (
            entries.map((entryItem) => (
              <Card key={entryItem.id} className="bg-dark-steel/30 border-slate-800 p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white">{entryItem.title}</h3>
                    <p className="text-sm text-slate-500">
                      {new Date(entryItem.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleDeleteEntry(entryItem.id)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                
                <p className="text-slate-300 whitespace-pre-wrap font-garamond">{entryItem.content}</p>
                
                {entryItem.tags && (
                  <div className="flex flex-wrap gap-2">
                    {entryItem.tags.split(',').map((tag, i) => (
                      <span key={i} className="px-3 py-1 text-xs rounded-full bg-slate-700 text-slate-300">
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                )}

                {/* Feelings Analysis Panel */}
                {entryItem.insights && (
                  <div className="mt-4">
                    <JournalFeelingsPanel insights={entryItem.insights} />
                  </div>
                )}

                {/* Guide Insights */}
                {entryItem.ai_insights && entryItem.ai_insights.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-700 space-y-3">
                    {entryItem.ai_insights.map((insight, i) => (
                      <div key={i} className="bg-black/20 rounded-lg p-4 border-l-4" style={{ borderColor: activeGuide?.color || '#FFD700' }}>
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="w-4 h-4 text-gold-accent" />
                          <span className="font-semibold text-gold-accent">{insight.guide}'s Guidance</span>
                        </div>
                        <p className="text-slate-300 italic font-garamond whitespace-pre-wrap">{insight.response}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Analyze with Guide Button - only show for entries without insights */}
                {!entryItem.insights && (
                  <Button
                    onClick={() => handleAnalyzeExisting(entryItem.id, entryItem.content)}
                    disabled={analysisLoading === entryItem.id}
                    className="w-full bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700"
                  >
                    {analysisLoading === entryItem.id ? (
                      'Consulting your guide...'
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Analyze with {activeGuide?.name}
                      </>
                    )}
                  </Button>
                )}
              </Card>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default AIJournalWithGuide;