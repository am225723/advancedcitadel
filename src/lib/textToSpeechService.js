// src/lib/textToSpeechService.js
// ElevenLabs Text-to-Speech Service for Meditation Audio Generation

const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';

const VOICE_RECOMMENDATIONS = {
  solaire: {
    name: 'Solaire of Astora',
    recommendedVoice: 'Josh - Warm, uplifting male voice with a friendly, optimistic tone',
    voiceSettings: {
      stability: 0.7,
      similarity_boost: 0.8,
      style: 0.3,
      use_speaker_boost: true
    }
  },
  siegward: {
    name: 'Siegward of Catarina',
    recommendedVoice: 'Antoni - Calm, reassuring male voice with a patient, fatherly quality',
    voiceSettings: {
      stability: 0.8,
      similarity_boost: 0.7,
      style: 0.2,
      use_speaker_boost: true
    }
  },
  artorias: {
    name: 'Artorias the Abysswalker',
    recommendedVoice: 'Arnold - Deep, resonant male voice with gravitas and strength',
    voiceSettings: {
      stability: 0.75,
      similarity_boost: 0.75,
      style: 0.4,
      use_speaker_boost: true
    }
  },
  alonne: {
    name: 'Sir Alonne',
    recommendedVoice: 'Callum - Disciplined, precise male voice with authority',
    voiceSettings: {
      stability: 0.8,
      similarity_boost: 0.75,
      style: 0.35,
      use_speaker_boost: true
    }
  },
  patches: {
    name: 'Patches the Hyena',
    recommendedVoice: 'Charlie - Slightly raspy, cunning male voice with character',
    voiceSettings: {
      stability: 0.65,
      similarity_boost: 0.8,
      style: 0.5,
      use_speaker_boost: true
    }
  }
};

const CACHE_PREFIX = 'meditation_audio_';
const CACHE_VERSION = 'v1';

export const processScriptForTTS = (script) => {
  const segments = [];
  const lines = script.split('\n').filter(line => line.trim());
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    if (trimmedLine === '[pause]') {
      segments.push({ type: 'pause', duration: 2000 });
    } else if (trimmedLine === '[long pause]') {
      segments.push({ type: 'pause', duration: 5000 });
    } else if (trimmedLine && !trimmedLine.startsWith('[')) {
      segments.push({ type: 'speech', text: trimmedLine });
    }
  }
  
  return segments;
};

export const getCachedAudioPath = (meditationId) => {
  if (typeof window === 'undefined') return null;
  const cacheKey = `${CACHE_PREFIX}${meditationId}_${CACHE_VERSION}`;
  return localStorage.getItem(cacheKey);
};

export const setCachedAudioPath = (meditationId, audioPath) => {
  if (typeof window === 'undefined') return;
  const cacheKey = `${CACHE_PREFIX}${meditationId}_${CACHE_VERSION}`;
  localStorage.setItem(cacheKey, audioPath);
};

export const generateMeditationAudio = async (meditation, apiKey, voiceId) => {
  if (typeof window === 'undefined') {
    throw new Error('Audio generation must run in browser context');
  }

  if (!apiKey) {
    throw new Error('ElevenLabs API key is required. Please add ELEVENLABS_API_KEY to your secrets.');
  }

  const cachedPath = getCachedAudioPath(meditation.id);
  if (cachedPath) {
    try {
      const response = await fetch(cachedPath);
      if (response.ok) {
        return cachedPath;
      }
    } catch (error) {
      console.log('Cached audio not accessible, regenerating...');
      localStorage.removeItem(`${CACHE_PREFIX}${meditation.id}_${CACHE_VERSION}`);
    }
  }

  const segments = processScriptForTTS(meditation.script);
  
  const textSegments = segments
    .filter(seg => seg.type === 'speech')
    .map(seg => seg.text)
    .join(' ... ');

  const voiceSettings = VOICE_RECOMMENDATIONS[meditation.guideId]?.voiceSettings || {
    stability: 0.75,
    similarity_boost: 0.75,
    style: 0.3,
    use_speaker_boost: true
  };

  try {
    const response = await fetch(`${ELEVENLABS_API_URL}/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey
      },
      body: JSON.stringify({
        text: textSegments,
        model_id: 'eleven_monolingual_v1',
        voice_settings: voiceSettings
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail?.message || `ElevenLabs API error: ${response.status}`);
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    
    setCachedAudioPath(meditation.id, audioUrl);
    
    return audioUrl;
  } catch (error) {
    console.error('Error generating meditation audio:', error);
    throw error;
  }
};

export const getVoiceRecommendation = (guideId) => {
  return VOICE_RECOMMENDATIONS[guideId] || null;
};

export const listAvailableVoices = async (apiKey) => {
  if (!apiKey) {
    throw new Error('ElevenLabs API key is required');
  }

  try {
    const response = await fetch(`${ELEVENLABS_API_URL}/voices`, {
      headers: {
        'xi-api-key': apiKey
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch voices: ${response.status}`);
    }

    const data = await response.json();
    return data.voices;
  } catch (error) {
    console.error('Error fetching available voices:', error);
    throw error;
  }
};

export const createSilentAudio = (durationMs) => {
  if (typeof window === 'undefined') return null;
  
  const sampleRate = 44100;
  const numChannels = 1;
  const numSamples = Math.floor((durationMs / 1000) * sampleRate);
  
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const audioBuffer = audioContext.createBuffer(numChannels, numSamples, sampleRate);
  
  const source = audioContext.createBufferSource();
  source.buffer = audioBuffer;
  
  return audioBuffer;
};

export { VOICE_RECOMMENDATIONS };
