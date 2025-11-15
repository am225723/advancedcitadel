import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Play, Clock, Star, Sparkles, Award, Timer, Mic2, Info, ExternalLink } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUser } from '@/contexts/UserContext';
import { supabase } from '@/lib/customSupabaseClient';
import { toast } from '@/components/ui/use-toast';
import MeditationPlayer from '@/components/MeditationPlayer';
import { MEDITATIONS, getUnlockedMeditations, getRecommendedMeditations } from '@/lib/meditationConfig';
import { getPersona } from '@/lib/personaConfig';
import { VOICE_RECOMMENDATIONS, VOICE_IDS, generateMeditationAudio, getCachedAudioPath } from '@/lib/textToSpeechService';

const MoodBuffIcon = ({ buffType }) => {
  const icons = {
    confidence: '☀️',
    calm: '🕊️',
    resilience: '🛡️',
    focus: '🎯',
    clarity: '💎'
  };
  return <span className="text-2xl">{icons[buffType] || '✨'}</span>;
};

const TTSInfoBanner = () => {
  const hasApiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <Card className="border-2 border-blue-900/50 bg-gradient-to-r from-blue-950/40 via-slate-900/40 to-purple-950/40 backdrop-blur-md">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <Mic2 className="w-6 h-6 text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-cinzel text-blue-300 mb-2 flex items-center gap-2">
                <Info className="w-4 h-4" />
                Voice-Guided Meditations Available
              </h3>
              <p className="text-sm text-slate-300 mb-3">
                {hasApiKey ? (
                  <>
                    <span className="text-green-400 font-semibold">✓ ElevenLabs TTS Enabled</span> - Your meditations can be narrated by character-specific voices for a more immersive experience.
                  </>
                ) : (
                  <>
                    Enhance your meditation experience with <strong>character-voiced audio</strong> using ElevenLabs TTS. 
                    Each guide has a unique voice tailored to their personality. <span className="text-amber-400">Optional - meditations work great without audio too!</span>
                  </>
                )}
              </p>
              {!hasApiKey && (
                <div className="bg-slate-800/50 border border-slate-700 rounded-md p-3 text-xs text-slate-400">
                  <p className="mb-2"><strong className="text-slate-300">To enable voice meditation:</strong></p>
                  <ol className="list-decimal list-inside space-y-1 ml-2">
                    <li>Get a free API key from <a href="https://elevenlabs.io" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline inline-flex items-center gap-1">ElevenLabs <ExternalLink className="w-3 h-3" /></a></li>
                    <li>Add <code className="bg-slate-900 px-1 py-0.5 rounded text-amber-400">VITE_ELEVENLABS_API_KEY</code> to your Replit Secrets</li>
                    <li>See <code className="bg-slate-900 px-1 py-0.5 rounded text-amber-400">ELEVENLABS_VOICE_SETUP.md</code> for detailed instructions</li>
                  </ol>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const MeditationCard = ({ meditation, isLocked, completionCount, onStart }) => {
  const persona = getPersona(meditation.guideId);
  const voiceInfo = VOICE_RECOMMENDATIONS[meditation.guideId];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={!isLocked ? { y: -4, scale: 1.02 } : {}}
      className={`relative ${isLocked ? 'opacity-60' : ''}`}
    >
      <Card className="h-full border-2 border-slate-800 bg-gradient-to-br from-black/60 via-slate-900/50 to-black/70 backdrop-blur-md hover:border-gold-accent/50 transition-all duration-300">
        {isLocked && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-10 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Lock className="w-12 h-12 text-gold-accent mx-auto mb-2" />
              <p className="text-gold-accent font-cinzel text-sm">
                Unlocks at Level {meditation.unlockLevel}
              </p>
            </div>
          </div>
        )}
        
        <CardHeader>
          <div className="flex items-start justify-between mb-2">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
              style={{
                background: `radial-gradient(circle, ${persona?.color || '#FFD700'}40, transparent)`,
                border: `2px solid ${persona?.color || '#FFD700'}`
              }}
            >
              <MoodBuffIcon buffType={meditation.moodBuffType} />
            </div>
            {completionCount > 0 && (
              <div className="flex items-center gap-1 text-gold-accent text-xs">
                <Star className="w-4 h-4 fill-current" />
                <span>{completionCount}</span>
              </div>
            )}
          </div>
          
          <CardTitle className="text-xl font-cinzel text-gold-accent mb-1">
            {meditation.title}
          </CardTitle>
          <CardDescription className="text-slate-300 font-garamond text-sm mb-2">
            {meditation.subtitle}
          </CardDescription>
          
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{Math.floor(meditation.duration / 60)} min</span>
            </div>
            <div className="flex items-center gap-1">
              <Award className="w-3 h-3" />
              <span>{meditation.xpReward} XP</span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="mb-3 space-y-2">
            <p className="text-xs text-slate-500 italic">
              Guided by {persona?.name}
            </p>
            {voiceInfo && (
              <div className="bg-slate-800/40 border border-slate-700/50 rounded-md p-2">
                <div className="flex items-start gap-2">
                  <Mic2 className="w-3 h-3 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-blue-300 font-semibold mb-0.5">
                      {voiceInfo.recommendedVoice.split(' - ')[0]}
                    </p>
                    <p className="text-xs text-slate-400">
                      {voiceInfo.recommendedVoice.split(' - ')[1]}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          <Button
            onClick={onStart}
            disabled={isLocked}
            className="w-full bg-gradient-to-r from-gold-accent/80 to-amber-600/80 hover:from-gold-accent hover:to-amber-600 text-black font-cinzel"
            style={!isLocked ? {
              boxShadow: `0 0 15px ${persona?.color || '#FFD700'}40`
            } : {}}
          >
            <Play className="w-4 h-4 mr-2" />
            Begin Meditation
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const MeditationsPage = () => {
  const { user, completeMeditation, getActiveMoodBuff } = useUser();
  const [activeMeditation, setActiveMeditation] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [meditationStats, setMeditationStats] = useState({});
  const [completionCounts, setCompletionCounts] = useState({});
  const [recommendedMeditations, setRecommendedMeditations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadMeditationData();
    }
  }, [user]);

  const loadMeditationData = async () => {
    setLoading(true);
    try {
      const { data: sessions, error } = await supabase
        .from('meditation_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false });

      if (error) throw error;

      const counts = {};
      sessions?.forEach(session => {
        counts[session.meditation_id] = (counts[session.meditation_id] || 0) + 1;
      });
      setCompletionCounts(counts);

      const totalMeditations = sessions?.length || 0;
      const totalXP = sessions?.reduce((sum, s) => sum + (s.xp_earned || 0), 0) || 0;
      setMeditationStats({ totalMeditations, totalXP });

      const { data: journalEntries } = await supabase
        .from('journal_entries')
        .select('emotions')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (journalEntries && journalEntries[0]?.emotions) {
        const emotions = journalEntries[0].emotions;
        const recommended = getRecommendedMeditations(emotions);
        setRecommendedMeditations(recommended.slice(0, 3));
      }
    } catch (error) {
      console.error('Error loading meditation data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartMeditation = async (meditation) => {
    const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
    
    if (!apiKey) {
      toast({
        title: "Silent Meditation Mode",
        description: `"${meditation.title}" will play without audio. Add VITE_ELEVENLABS_API_KEY for character-voiced meditation.`,
        duration: 4000,
      });
      setActiveMeditation(meditation);
      setAudioUrl(null);
      return;
    }

    const cachedAudio = getCachedAudioPath(meditation.id);
    if (cachedAudio) {
      setAudioUrl(cachedAudio);
      setActiveMeditation(meditation);
      toast({
        title: "Sanctuary Ready",
        description: `"${meditation.title}" loaded with character voice.`,
        duration: 2000,
      });
      return;
    }

    toast({
      title: "Generating Voice Meditation...",
      description: `Creating character-voiced audio for "${meditation.title}". This may take a moment.`,
      duration: 5000,
    });

    try {
      const voiceId = VOICE_IDS[meditation.guideId];
      if (!voiceId) {
        throw new Error(`No voice ID configured for ${meditation.guideId}`);
      }

      const generatedAudioUrl = await generateMeditationAudio(meditation, apiKey, voiceId);
      
      setAudioUrl(generatedAudioUrl);
      setActiveMeditation(meditation);
      
      toast({
        title: "Voice Meditation Ready! ✨",
        description: `"${meditation.title}" is ready with ${getPersona(meditation.guideId)?.name}'s voice.`,
        duration: 3000,
      });
    } catch (error) {
      console.error('Error generating meditation audio:', error);
      toast({
        variant: "destructive",
        title: "Voice Generation Failed",
        description: `Could not generate audio: ${error.message}. Opening silent meditation mode.`,
        duration: 5000,
      });
      setActiveMeditation(meditation);
      setAudioUrl(null);
    }
  };

  const handleMeditationComplete = async (meditation, durationSeconds) => {
    if (!user) return;

    try {
      await completeMeditation(meditation.id, Math.floor(durationSeconds));
      await loadMeditationData();
      
      toast({
        title: "Meditation Complete! ✨",
        description: `You have earned ${meditation.xpReward} XP and gained a ${meditation.moodBuffType} buff for 4 hours.`,
        duration: 5000,
      });
    } catch (error) {
      console.error('Error completing meditation:', error);
      toast({
        title: "Error",
        description: "Failed to save meditation progress.",
        variant: "destructive",
      });
    }
  };

  const handleCloseMeditation = () => {
    setActiveMeditation(null);
    setAudioUrl(null);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gold-accent font-cinzel text-2xl">Loading...</p>
      </div>
    );
  }

  const unlockedMeditations = getUnlockedMeditations(user.level);
  const allMeditationsList = Object.values(MEDITATIONS);
  const activeMoodBuff = getActiveMoodBuff ? getActiveMoodBuff() : user.active_mood_buff;

  return (
    <div className="min-h-screen p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center"
      >
        <h1 className="text-4xl md:text-6xl font-cinzel font-bold text-gradient-gold mb-2">
          The Sanctuary of Stillness
        </h1>
        <p className="text-xl text-slate-300 font-garamond">
          Find peace within through guided meditation with the ancient guides
        </p>
      </motion.div>

      <TTSInfoBanner />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-2 border-slate-800 bg-gradient-to-br from-black/60 via-slate-900/50 to-black/70 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-lg font-cinzel text-gold-accent flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Total Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-200">
              {meditationStats.totalMeditations || 0}
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-slate-800 bg-gradient-to-br from-black/60 via-slate-900/50 to-black/70 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-lg font-cinzel text-gold-accent flex items-center gap-2">
              <Award className="w-5 h-5" />
              XP Earned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-200">
              {meditationStats.totalXP || 0}
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-slate-800 bg-gradient-to-br from-black/60 via-slate-900/50 to-black/70 backdrop-blur-md lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-cinzel text-gold-accent flex items-center gap-2">
              <Timer className="w-5 h-5" />
              Active Mood Buff
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeMoodBuff && new Date(activeMoodBuff.expires_at) > new Date() ? (
              <div className="flex items-center gap-3">
                <MoodBuffIcon buffType={activeMoodBuff.type} />
                <div>
                  <p className="text-lg font-bold text-slate-200 capitalize">
                    {activeMoodBuff.type}
                  </p>
                  <p className="text-xs text-slate-400">
                    Expires: {new Date(activeMoodBuff.expires_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-slate-400 italic">No active buff</p>
            )}
          </CardContent>
        </Card>
      </div>

      {recommendedMeditations.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-cinzel text-gold-accent mb-4 flex items-center gap-2">
            <Sparkles className="w-6 h-6" />
            Your Guide Recommends
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedMeditations.map(meditation => (
              <MeditationCard
                key={meditation.id}
                meditation={meditation}
                isLocked={meditation.unlockLevel > user.level}
                completionCount={completionCounts[meditation.id] || 0}
                onStart={() => handleStartMeditation(meditation)}
              />
            ))}
          </div>
        </motion.div>
      )}

      <div className="mb-8">
        <h2 className="text-2xl font-cinzel text-gold-accent mb-4">
          All Meditations
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allMeditationsList.map(meditation => (
            <MeditationCard
              key={meditation.id}
              meditation={meditation}
              isLocked={meditation.unlockLevel > user.level}
              completionCount={completionCounts[meditation.id] || 0}
              onStart={() => handleStartMeditation(meditation)}
            />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {activeMeditation && (
          <MeditationPlayer
            meditation={activeMeditation}
            audioUrl={audioUrl}
            onComplete={handleMeditationComplete}
            onClose={handleCloseMeditation}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default MeditationsPage;
