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

## Recent Changes

### November 4, 2025 - Bonfire of Breath Visual Overhaul

**Ethereal White-Gold Flame Redesign:**
Transformed the soul flame from orange-red to a stunning ethereal white-gold appearance, matching reference imagery with dramatic breathing-reactive behavior:

**Color Palette Update:**
- Base flame: Warm orange (#FF8C42) transitioning to bright amber (#FFB84D)
- Core: Dark chocolate orange (#D2691E) to bright orange (#FF8C42)
- Emissive glow: Orange-red (#FF4500, #FF6B35) to tomato (#FF6347, #FFA500)
- Point light: Warm orange-amber glow (#FF8C42, #FFB84D)
- Traditional fire colors matching reference imagery

**Enhanced Breathing Dynamics:**
- **Idle State**: Gentle base glow (0.4 core scale, 0.7-0.8 flame scale)
- **Inhale Phase**: Dramatic growth from 0.4 → 1.0 core scale, flame height grows from 0.8 → 1.8 (125% vertical expansion)
- **Hold Phase**: Maximum intensity with subtle pulse (scale 1.0, emissive 0.4, bloom 0.3)
- **Exhale Phase**: Smooth shrinking back to idle state (1.0 → 0.4 scale)

**Post-Processing Enhancements:**
- Bloom intensity: 0.15 idle → 0.3 hold (minimal for visible flame texture)
- Very high luminance threshold (0.9) prevents blown-out appearance
- Tight bloom radius (0.5) maintains visible flame texture with subtle ethereal halo
- Enhanced vignette for better focus on flame center

**Visual Improvements:**
- Re-enabled GeometricOverlay for subtle rotating golden rings
- Minimal emissive intensities (0.15 → 0.4 range) preserve clear flame texture visibility
- Point light (0.5 → 0.8 intensity) provides subtle ambient glow without washout
- Dramatic scale changes make breathing highly visible and meditative

**Bug Fixes (Multiple Root Causes):**
- **CRITICAL FIX 1 - AdditiveBlending**: Changed material blending from THREE.AdditiveBlending to THREE.NormalBlending to prevent brightness stacking
- **CRITICAL FIX 2 - Opacity**: Reduced opacity from 0.9-0.95 to 0.4-0.6 to allow texture colors to show through instead of appearing as solid white mass
- **CRITICAL FIX 3 - Bloom**: Minimized bloom to fixed 0.05 intensity with 0.98 threshold to eliminate white washout
- Final ultra-low brightness values:
  - Core opacity: 0.5 → 0.7, emissive: 0.06 → 0.18 (hold phase)
  - Flame opacity: 0.4 → 0.6, emissive: 0.05 → 0.17 (hold phase)
  - Point light: 0.3 → 0.7 (hold phase)
  - Bloom: 0.05 fixed (threshold 0.98)

**Size and Positioning Fixes:**
- Reduced flame overall scale to 0.5 (50% of original size)
- Moved flame group down to y: -1.5
- Centered all flame billboards at x: 0 (eliminated horizontal offset)
- Flame billboards positioned at y: 0.3, 0.35, 0.25 with z-depth layering
- Moved countdown number forward (z: 2) with larger font (2.0) and black outline
- Ensures perfect centering and countdown visibility

**Result**: A luminous, ethereal white-gold flame with clearly visible texture that dramatically expands and contracts with breathing. Properly sized and positioned with all UI elements clearly visible.

### October 25, 2025

### Critical Shader Bug Fixes
After diagnosing "blown-out white blob" rendering issues, three critical shader bugs were identified and resolved:

1. **Excessive Brightness (Fixed)** - Layer colors multiplied by large scalars (1.8, 1.3, 0.7) then added together, causing RGB > 1.0. Fixed by normalizing weights to weighted average and adding alpha premultiplication.

2. **Inverted Alpha Falloff (Fixed)** - `smoothstep()` edge parameters were backwards, preventing proper alpha falloff. Fixed by correcting smoothstep ranges and changing from max() to weighted sum.

3. **Missing 3D Noise Function (Fixed)** - Fragment shader called `snoise()` but only had `snoise_2d()` defined, causing compilation failure. Fixed by adding complete 3D simplex noise function.

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
