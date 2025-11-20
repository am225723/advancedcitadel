# The Citadel (Therapeutic Garage)

## Overview
The Citadel is a mental health and therapeutic web application that provides a gamified mental health support experience. It uses a medieval fortress/garage metaphor to make therapeutic tools and techniques more engaging and accessible, offering features like a virtual garage, AI-powered journaling, mindfulness exercises, and cognitive reframing tools. The project aims to provide an immersive and interactive platform for mental wellness with a business vision to make therapeutic practices more engaging and accessible.

## User Preferences
None documented yet.

## System Architecture
The application is built with a modern web stack:
- **Frontend:** React 18.2.0 with Vite 7.1.9, styled using Tailwind CSS and Radix UI primitives.
- **3D Graphics:** Three.js integrated via React Three Fiber for immersive 3D environments, specifically for the virtual garage.
- **State Management & Routing:** React Context for global state (authentication, user), and React Router DOM v6 for navigation.
- **Backend & Database:** Supabase (PostgreSQL) for user authentication and data storage.
- **Data Visualization:** Recharts for data representation.
- **Animations:** Framer Motion for UI animations.

**Key Architectural Features:**
- **Gamified Engagement:** Therapeutic mini-games with a progression system where users unlock "car parts" based on therapeutic activity completion and XP. Mini-games are advanced 2D implementations focusing on professional mechanics, multi-stage gameplay, and advanced scoring.
- **AI Integration:** AI-powered journaling ("Scribe's Chronicle") and cognitive reframing ("The Reforge") with a dual-response system. This system involves structured analysis (e.g., emotion identification, CBT analysis) followed by character-driven therapeutic feedback from various "Guide Personas" embodying different therapeutic approaches. Personalized meditation recommendations are also AI-driven based on journal entries.
- **Immersive 3D Experiences:** Custom GLSL shaders are used for realistic visualizations in features like "Bonfire of Breath" mindfulness exercise, featuring procedural flame generation and dynamic breathing animations. The virtual garage leverages optimized 3D visuals with environment mapping and tone mapping.
- **Modular Component Design:** Organized into `components/` (UI, games), `contexts/`, `lib/` (utilities), and `pages/` for maintainability.
- **Environment Configuration:** Relies on environment variables for sensitive data like Supabase credentials, configured for a Replit development environment (port 5000, host 0.0.0.0).
- **Sanctuary of Stillness:** A guided meditation feature with character-voiced guidance from Dark Souls-inspired personas, designed to address specific emotional challenges. It includes a mood buff system rewarded upon meditation completion.

## External Dependencies
- **Supabase:** Used for PostgreSQL database services and user authentication.
- **Perplexity AI:** Integrated for AI-driven feelings analysis, cognitive theme identification, and structured CBT analysis within the journaling and reframing features.
- **ElevenLabs TTS:** Text-to-speech API for generating character-voiced meditation audio. (Optional, requires API key).