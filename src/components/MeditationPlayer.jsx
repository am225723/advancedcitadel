import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { getPersona } from '@/lib/personaConfig';

const MeditationPlayer = ({ meditation, audioUrl, onComplete, onClose }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState('inhale');

  const persona = getPersona(meditation.guideId);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      setIsPlaying(false);
      if (!hasCompleted) {
        setHasCompleted(true);
        onComplete(meditation, audio.duration);
      }
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [meditation, onComplete, hasCompleted]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const completionThreshold = duration * 0.9;
    if (currentTime >= completionThreshold && duration > 0 && !hasCompleted) {
      setHasCompleted(true);
      onComplete(meditation, currentTime);
    }
  }, [currentTime, duration, hasCompleted, meditation, onComplete]);

  useEffect(() => {
    const breathingInterval = setInterval(() => {
      setBreathingPhase(prev => {
        if (prev === 'inhale') return 'hold';
        if (prev === 'hold') return 'exhale';
        return 'inhale';
      });
    }, 4000);

    return () => clearInterval(breathingInterval);
  }, []);

  const togglePlayPause = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      try {
        setIsPlaying(true);
        await audio.play();
      } catch (error) {
        console.log('Audio playback prevented:', error.message);
        setIsPlaying(false);
      }
    }
  };

  const handleSeek = (newValue) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const seekTime = (newValue[0] / 100) * duration;
    audio.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const handleVolumeChange = (newValue) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const newVolume = newValue[0] / 100;
    audio.volume = newVolume;
    setVolume(newVolume);
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    if (isMuted) {
      audio.volume = volume;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  };

  const skip = (seconds) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    audio.currentTime = Math.max(0, Math.min(duration, audio.currentTime + seconds));
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const breathingScale = {
    inhale: 1.2,
    hold: 1.2,
    exhale: 0.8
  };

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl">
        <Button
          onClick={onClose}
          variant="ghost"
          className="absolute top-4 right-4 text-slate-400 hover:text-gold-accent z-10"
        >
          Exit Sanctuary
        </Button>

        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-cinzel font-bold text-gold-accent mb-2">
              {meditation.title}
            </h1>
            <p className="text-xl text-slate-300 font-garamond mb-4">
              {meditation.subtitle}
            </p>
            <p className="text-sm text-slate-400">
              Guided by {persona?.name || meditation.guideId}
            </p>
          </motion.div>
        </div>

        <div className="flex justify-center mb-12">
          <motion.div
            animate={{
              scale: breathingScale[breathingPhase],
              opacity: isPlaying ? 1 : 0.5
            }}
            transition={{
              duration: 4,
              ease: "easeInOut"
            }}
            className="relative"
          >
            <div
              className="w-48 h-48 rounded-full"
              style={{
                background: `radial-gradient(circle, ${persona?.color || '#FFD700'}40, transparent)`,
                boxShadow: `0 0 60px ${persona?.color || '#FFD700'}60`
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="w-32 h-32 rounded-full border-4"
                style={{
                  borderColor: persona?.color || '#FFD700',
                  background: `radial-gradient(circle, ${persona?.color || '#FFD700'}20, transparent)`
                }}
              />
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={breathingPhase}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <span className="text-2xl font-cinzel text-gold-accent">
                  {isPlaying ? breathingPhase : 'paused'}
                </span>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-md rounded-lg p-6 border-2 border-slate-800">
          <div className="mb-4">
            <Slider
              value={[progress]}
              onValueChange={handleSeek}
              max={100}
              step={0.1}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-slate-400 mt-2">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 mb-4">
            <Button
              onClick={() => skip(-10)}
              variant="ghost"
              size="icon"
              className="text-slate-400 hover:text-gold-accent"
            >
              <SkipBack className="w-5 h-5" />
            </Button>

            <Button
              onClick={togglePlayPause}
              size="icon"
              className="w-16 h-16 rounded-full bg-gradient-to-br from-gold-accent to-amber-600 hover:from-gold-accent/90 hover:to-amber-600/90"
              style={{
                boxShadow: `0 0 20px ${persona?.color || '#FFD700'}60`
              }}
            >
              {isPlaying ? (
                <Pause className="w-8 h-8 text-black" />
              ) : (
                <Play className="w-8 h-8 text-black ml-1" />
              )}
            </Button>

            <Button
              onClick={() => skip(10)}
              variant="ghost"
              size="icon"
              className="text-slate-400 hover:text-gold-accent"
            >
              <SkipForward className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex items-center justify-center gap-2">
            <Button
              onClick={toggleMute}
              variant="ghost"
              size="icon"
              className="text-slate-400 hover:text-gold-accent"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </Button>
            <Slider
              value={[isMuted ? 0 : volume * 100]}
              onValueChange={handleVolumeChange}
              max={100}
              step={1}
              className="w-24"
            />
          </div>

          {hasCompleted && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 text-center"
            >
              <p className="text-gold-accent font-cinzel text-lg">
                ✨ Meditation Complete ✨
              </p>
              <p className="text-sm text-slate-400 mt-1">
                You have earned {meditation.xpReward} XP and a {meditation.moodBuffType} buff
              </p>
            </motion.div>
          )}
        </div>

        <audio ref={audioRef} src={audioUrl} preload="auto" />
      </div>
    </div>
  );
};

export default MeditationPlayer;
