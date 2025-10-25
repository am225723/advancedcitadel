# The Citadel (Therapeutic Garage)

## Overview
The Citadel is a mental health and therapeutic web application that provides a gamified mental health support experience. The app uses a medieval fortress/garage metaphor to make therapeutic tools and techniques more engaging and accessible.

**Current Status:** Successfully configured for Replit environment (October 25, 2025)

## Project Architecture

### Technology Stack
- **Frontend Framework:** React 18.2.0
- **Build Tool:** Vite 7.1.9
- **Styling:** Tailwind CSS with custom animations
- **3D Graphics:** Three.js with React Three Fiber
- **UI Components:** Radix UI primitives
- **Routing:** React Router DOM v6
- **Database/Auth:** Supabase (PostgreSQL backend with authentication)
- **Charts:** Recharts
- **Animations:** Framer Motion

### Project Structure
```
src/
├── components/
│   ├── games/          # Therapeutic mini-games (CarWash, OilChange, etc.)
│   ├── ui/             # Reusable UI components (Radix UI)
│   └── [various]       # Specialized components (AIPersona, CarModel, etc.)
├── contexts/           # React contexts for auth and user state
├── lib/                # Utilities and configurations
├── pages/              # Route pages (Dashboard, AIJournal, VirtualGarage, etc.)
└── main.jsx            # Application entry point
```

### Key Features
- User authentication (login/signup)
- Virtual garage with therapeutic activities
- AI-powered journaling
- Mindfulness and breathing exercises ("Bonfire of Breath")
- Cognitive reframing tools
- Exposure ladder for gradual desensitization
- Admin dashboard for user management
- Warden notes system

## Configuration

### Environment Variables
The application requires Supabase credentials. These should be set as secrets:
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous/public API key

A `.env.example` file is provided as a template.

### Development Server
- **Port:** 5000
- **Host:** 0.0.0.0 (allows Replit proxy access)
- **Command:** `npm run dev`

### Vite Configuration
- Already configured with `allowedHosts: true` for Replit's iframe proxy
- Custom plugins for visual editing and error handling
- CORS enabled with Cross-Origin-Embedder-Policy headers

## Recent Changes (October 25, 2025)

### Photorealistic Flame Enhancements
Based on user-provided reference images, completely overhauled the soul flame for photorealism:

**Shader Enhancements:**
- Implemented layered volumetric rendering (core, mid-layer, wispy edges)
- Added Worley/Voronoi noise for realistic cellular flame structure
- 4-octave turbulent noise for multi-scale organic motion
- Temperature-based color gradients: white-gold → amber → orange-red → blue-violet
- Height-based opacity falloff with exponential dissipation for wispy top
- Fresnel effect for edge translucency
- Increased geometry resolution to 48×96 for smoother appearance

**Particle System Overhaul:**
- Enhanced to 300 embers (inhale) and 200 sparks (exhale)
- Custom soft-sprite shaders with circular gradients and exponential glow
- Realistic physics: gravity, drag, swirl, acceleration
- Size attenuation based on camera distance
- GPU-friendly instanced rendering

**Dynamic Post-Processing:**
- Phase-responsive bloom (0.6 idle → 1.5 hold)
- Adaptive luminance threshold (0.5 → 0.3 during hold)
- Dynamic vignette darkness (1.2 → 1.4 during hold)
- Subtle chromatic aberration for photographic realism

**Performance:** Estimated 8-12ms per frame (60+ FPS on modern hardware)

### Bug Fix: Missing Fonts Causing Canvas Failure
- **Issue**: Text components in Canvas were referencing non-existent font files
- **Fix**: Removed font props from all Text components - they now use default fonts
- **Result**: Canvas now renders properly with all premium components visible

### Premium Breathing Widget Implementation (Initial)
1. Created **PremiumSoulFlame** component with advanced GLSL shaders:
   - Volumetric flame rendering using custom vertex/fragment shaders
   - Curl noise displacement for realistic fluid motion
   - Dynamic color gradients (orange/red edges to white-gold core)
   - Phase-reactive lighting system with point lights
   - Smooth transitions between breathing states
   
2. Created **ProceduralStarfield** component:
   - 8,000 procedurally generated stars with varied colors
   - Custom shader for star twinkling effects
   - Gentle rotation and breathing animations
   - Blue, yellow, and white star variations
   
3. Created **GeometricOverlay** component:
   - Sacred geometry circles (3 concentric rings)
   - Rotating geometric patterns
   - Radial lines connecting inner and outer circles
   - Subtle golden glow effect
   
4. Created **BreathingParticles** component:
   - Ember particles during inhale (converge toward flame)
   - Spark particles during exhale (rise and fade out)
   - Physics-based particle motion
   - Lifecycle management with respawning
   
5. Updated **EnhancedBonfireOfBreath** page:
   - Integrated all new premium components
   - Replaced old components with shader-based visuals
   - Updated phase text to match design (INHALE, HOLD, EXHALE, REST)
   - Maintained all existing functionality (audio, haptics, timers)

### Replit Environment Setup
1. Updated dev server to use port 5000 (Replit standard)
2. Changed host binding from `::` to `0.0.0.0` for proper network access
3. Moved Supabase credentials to environment variables (from hardcoded values)
4. Added comprehensive .gitignore for build artifacts and env files
5. Created .env.example template for environment setup
6. Configured Dev Server workflow
7. All dependencies installed successfully

### Security Improvements
- Refactored Supabase client to use environment variables instead of hardcoded credentials
- Added fallback values for backward compatibility during transition

## Known Issues
- Some React Router future flag warnings (cosmetic, not breaking)
- Uses deprecated react-helmet (UNSAFE_componentWillMount warning)
- One moderate npm security vulnerability in dependencies

## User Preferences
None documented yet.

## Development Notes
- The app uses a unique therapeutic metaphor combining automotive garage mechanics with mental health exercises
- Extensive use of 3D graphics for immersive experience
- Supabase handles both database and authentication
- Custom Vite plugins for enhanced development experience
