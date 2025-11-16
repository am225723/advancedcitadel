# The Citadel (Therapeutic Garage)

## Overview
The Citadel is a mental health and therapeutic web application that provides a gamified mental health support experience. It uses a medieval fortress/garage metaphor to make therapeutic tools and techniques more engaging and accessible, offering features like a virtual garage, AI-powered journaling, mindfulness exercises, and cognitive reframing tools. The project aims to provide an immersive and interactive platform for mental wellness.

## User Preferences
None documented yet.

## System Architecture
The application is built with a modern web stack:
- **Frontend:** React 18.2.0 with Vite 7.1.9, styled using Tailwind CSS and Radix UI primitives.
- **3D Graphics:** Three.js integrated via React Three Fiber for immersive 3D environments, including a virtual garage and advanced shader-based visualizations for mindfulness exercises.
- **State Management & Routing:** React Context for global state (authentication, user), and React Router DOM v6 for navigation.
- **Backend & Database:** Supabase (PostgreSQL) for user authentication and data storage.
- **Data Visualization:** Recharts for data representation.
- **Animations:** Framer Motion for UI animations.

**Key Architectural Features:**
- **Gamified Engagement:** Therapeutic mini-games and a progression system where users unlock "car parts" based on therapeutic activity completion and XP.
- **AI Integration:** AI-powered journaling ("Scribe's Chronicle") and cognitive reframing ("The Reforge") with a dual-response system. This system involves structured analysis (e.g., emotion identification, CBT analysis) followed by character-driven therapeutic feedback from various "Guide Personas" (e.g., Solaire, Siegward) each embodying different therapeutic approaches.
- **Immersive 3D Experiences:** Custom GLSL shaders are used for realistic visualizations, such as the "Bonfire of Breath" mindfulness exercise, featuring procedural flame generation and dynamic breathing animations.
- **Modular Component Design:** Organized into `components/` (UI, games), `contexts/`, `lib/` (utilities), and `pages/` for maintainability.
- **Environment Configuration:** Relies on environment variables for sensitive data like Supabase credentials, configured for a Replit development environment (port 5000, host 0.0.0.0).

## External Dependencies
- **Supabase:** Used for PostgreSQL database services and user authentication.
- **Perplexity AI:** Integrated for AI-driven feelings analysis, cognitive theme identification, and structured CBT analysis within the journaling and reframing features.
- **ElevenLabs TTS (Optional):** Text-to-speech API for generating character-voiced meditation audio. Requires API key for full audio experience.

## Character-Voiced Meditation Feature

### Overview
The **Sanctuary of Stillness** is a guided meditation feature where users can practice mindfulness and emotional regulation techniques with character-voiced guidance from the Dark Souls-inspired personas. Each meditation is designed to address specific emotional challenges and therapeutic needs.

### Available Meditations

1. **Solaire - "Finding Your Sun"** (Level 1)
   - Duration: 8 minutes
   - Theme: Self-compassion and inner light
   - Therapeutic Focus: Positive Psychology, Self-Compassion, Behavioral Activation
   - XP Reward: 25
   - Mood Buff: Confidence (4 hours)
   - Recommended for: anxiety, hopelessness, low self-worth, despair

2. **Siegward - "A Moment's Respite"** (Level 1)
   - Duration: 7 minutes
   - Theme: Mindfulness and the importance of rest
   - Therapeutic Focus: Mindfulness, Self-Compassion, Present-Moment Awareness
   - XP Reward: 25
   - Mood Buff: Calm (4 hours)
   - Recommended for: stress, overwhelm, burnout, restlessness, racing thoughts

3. **Artorias - "Facing the Abyss"** (Level 2)
   - Duration: 9 minutes
   - Theme: Acknowledging darkness without being consumed
   - Therapeutic Focus: Radical Acceptance, Emotion Regulation, Trauma-Informed Care
   - XP Reward: 30
   - Mood Buff: Resilience (4 hours)
   - Recommended for: depression, trauma, grief, anger, fear, emotional numbness

4. **Sir Alonne - "The Honorable Path"** (Level 2)
   - Duration: 7.5 minutes
   - Theme: Aligning actions with personal values
   - Therapeutic Focus: Values-Based Action, Self-Discipline, Integrity
   - XP Reward: 30
   - Mood Buff: Focus (4 hours)
   - Recommended for: lack of direction, guilt, shame, procrastination, self-betrayal

5. **Patches - "Spotting the Traps"** (Level 3)
   - Duration: 6.5 minutes
   - Theme: Identifying and disengaging from mental traps
   - Therapeutic Focus: Cognitive Distortion Identification, Cognitive Defusion, Mindfulness
   - XP Reward: 30
   - Mood Buff: Clarity (4 hours)
   - Recommended for: catastrophizing, black-and-white thinking, mind reading, rumination

### Meditation Unlock Levels
- **Level 1:** Solaire, Siegward
- **Level 2:** Artorias, Sir Alonne
- **Level 3:** Patches

### Mood Buff System
After completing a meditation (90%+ completion), users receive a mood buff that lasts 4 hours:
- **Confidence** ☀️ - Yellow glow, increases sense of self-worth
- **Calm** 🕊️ - Blue glow, reduces perceived stress
- **Resilience** 🛡️ - Purple glow, strengthens emotional endurance
- **Focus** 🎯 - Silver glow, enhances concentration and clarity
- **Clarity** 💎 - Brown glow, improves perspective and insight

Active mood buffs are displayed on the Dashboard and in the Sanctuary of Stillness page with remaining time.

### Database Schema

#### meditation_sessions table
```sql
CREATE TABLE meditation_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  meditation_id TEXT NOT NULL,
  guide_id TEXT NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  duration_seconds INTEGER,
  mood_buff_type TEXT,
  mood_buff_expires_at TIMESTAMP WITH TIME ZONE,
  xp_earned INTEGER DEFAULT 25
);
```

#### user_profiles additions
- `meditation_count` (INTEGER): Total number of completed meditations
- `active_mood_buff` (JSONB): Current active mood buff with type and expiry timestamp
  - Format: `{"type": "confidence", "expires_at": "2024-11-14T12:00:00Z"}`

### ElevenLabs TTS Setup (Optional)

The meditation feature can use ElevenLabs Text-to-Speech API to generate character-voiced audio for an immersive experience.

**Setup Instructions:**
1. Sign up for ElevenLabs account at https://elevenlabs.io
2. Get your API key from the ElevenLabs dashboard
3. Add `ELEVENLABS_API_KEY` to your secrets in Replit

**Voice Recommendations:**
- **Solaire:** Josh - Warm, uplifting male voice with friendly, optimistic tone
- **Siegward:** Antoni - Calm, reassuring male voice with patient, fatherly quality
- **Artorias:** Arnold - Deep, resonant male voice with gravitas and strength
- **Sir Alonne:** Callum - Disciplined, precise male voice with authority
- **Patches:** Charlie - Slightly raspy, cunning male voice with character

**Note:** ElevenLabs is a paid service. The meditation feature works without TTS (silent meditation with visual breathing guide), but audio enhances the experience.

### Personalized Recommendations
The system analyzes emotions from recent journal entries and recommends meditations that address those emotional states. For example:
- Journal entry with "anxiety, stress" → Recommends Siegward's "A Moment's Respite"
- Journal entry with "hopelessness, despair" → Recommends Solaire's "Finding Your Sun"

### User Experience Flow
1. User navigates to "Sanctuary of Stillness" via navigation menu
2. Sees meditation library with locked/unlocked status based on level
3. Views personalized recommendations based on recent emotions
4. Selects a meditation to begin
5. Full-screen meditation player with:
   - Animated breathing circle synced to guide's voice
   - Audio controls (play/pause, seek, volume)
   - Character-themed visual styling
6. Upon 90%+ completion, receives:
   - XP reward (25-30 XP)
   - Mood buff (4 hours)
   - Toast notification
   - Session recorded in database

### File Structure
- `src/lib/meditationConfig.js` - Meditation scripts and metadata
- `src/lib/textToSpeechService.js` - ElevenLabs TTS integration
- `src/components/MeditationPlayer.jsx` - Audio player component
- `src/pages/MeditationsPage.jsx` - Main meditation interface
- `database_migrations_meditations.sql` - Database schema migration

### Recent Changes
- **2024-11-16:** Updated Sanctuary of Stillness navigation tile:
  - Added custom medieval book cover image with ornate gold corners
  - Features decorative crescent moon and "Sanctuary of Stillness" text in gothic font
  - Image displays on Dashboard navigation tile with hover effects

- **2024-11-15:** Tachometer complete redesign to authentic Mitsubishi Evolution IX specifications:
  - Changed number scale from 0-9 to 1-9 (matching reference photo exactly)
  - Red redzone numbers (7-9) with bright red highlighting
  - Repositioned redzone band to start precisely at 7 marker
  - Implemented authentic tick mark pattern: 9 fine ticks (0-1 range), major ticks at each number (1-9), 3 quarter ticks between numbers
  - Red needle with glow effect starting at 0 position (7 o'clock)
  - Orange LCD display with TRIP A (dynamic RPM/1000) and static odometer (003914)
  - Drive mode indicator panel (TARMAC lit, GRAVEL/SNOW unlit)
  - Matte black gauge face with authentic styling
  
- **2024-11-14:** Major system updates and fixes:
  - Fixed database schema (removed tags column, added admin RPC functions)
  - Created Perplexity persona chat edge function for AI Knight companion
  - Updated navigation tiles (Forge→/reframe-guided, Chronicle→/journal-guided, added Sanctuary)
  - Implemented auto-collapsing responsive sidepanel with localStorage persistence
  - Moved Warden's Notes from sidebar to Dashboard page with enhanced styling
  - Added ElevenLabs voice configuration documentation and UI
  - Created comprehensive deployment guides for Supabase Edge Functions
  - Implemented admin XP/level management UI (requires secure backend deployment)
  - Verified and documented all XP tracking across features (22 XP-awarding actions)
  
- **2024-11-13:** Added character-voiced meditation feature with 5 meditations, mood buff system, personalized recommendations, and optional ElevenLabs TTS integration.