# Dark Souls Therapeutic Guides System

## 🎮 Overview

The Dark Souls Therapeutic Guides System transforms traditional therapeutic tools into an immersive, narrative-driven experience. Users select from 7 iconic Dark Souls characters, each representing different therapeutic approaches and psychological frameworks. These guides provide personalized, character-driven feedback during journaling, cognitive reframing, and other therapeutic exercises.

## ✨ Features

### 🛡️ Seven Unique Guides

1. **Solaire of Astora** - The Optimist
   - Focus: Positive Psychology, Behavioral Activation
   - Helps users find their "own sun" (inner strength and purpose)
   - Unlocked: Level 1 (Default)

2. **Siegward of Catarina** - The Patient Knight
   - Focus: Task Chunking, Self-Compassion, Mindfulness
   - Breaks down overwhelming tasks into manageable steps
   - Unlocked: Level 1 (Default)

3. **Artorias the Abysswalker** - The Resilient Warrior
   - Focus: Trauma-Informed Care, Radical Acceptance
   - Stands with users against the "Abyss" of depression and anxiety
   - Unlocked: Level 1 (Default)

4. **Slave Knight Gael** - The Devoted
   - Focus: Values-Based Goal Setting, Grit
   - Reminds users that setbacks are nothing compared to their ultimate quest
   - Unlocked: Level 3

5. **Patches the Hyena** - The Cunning Survivor
   - Focus: Cognitive Distortion Identification
   - Helps spot the "traps" users set for themselves
   - Unlocked: Level 2

6. **Knight Lautrec of Carim** - The Shadow Worker
   - Focus: Shadow Work, Motivational Interviewing
   - Helps understand hidden payoffs of self-destructive behaviors
   - Unlocked: Level 2

7. **Sir Alonne** - The Honorable Samurai
   - Focus: Self-Discipline, Values-Based Action
   - Guides users to align actions with values
   - Unlocked: Level 3

### 📚 The Codex

A central hub where users can:
- View all available guides with detailed lore
- Select their active guide
- View interaction statistics
- Review conversation history
- Track guide unlock progress

### ✍️ Guided Journal

Enhanced journaling experience where:
- Users write journal entries
- Request guidance from their active guide
- Receive persona-specific insights
- Build a therapeutic relationship over time

### 🧠 Guided Reframing

Cognitive reframing with character:
- Submit negative thoughts
- Receive guide-specific reframing
- Learn CBT techniques through narrative
- Track progress with XP rewards

## 🚀 Installation & Setup

### 1. Database Setup

Run the SQL migrations in your Supabase SQL Editor:

```bash
# Execute the contents of database_migrations.sql
```

This creates:
- `active_guide` column in `user_profiles`
- `guide_interactions` table for tracking conversations
- `unlocked_guides` array for progression
- Helper functions and RLS policies

### 2. Edge Function Deployment

Deploy the Perplexity AI edge function:

```bash
# Set your Perplexity API key
supabase secrets set PERPLEXITY_API_KEY=your_key_here

# Deploy the function
supabase functions deploy guide-persona-chat
```

See `SUPABASE_EDGE_FUNCTION_SETUP.md` for detailed instructions.

### 3. Application Integration

The following files have been added/updated:

**New Files:**
- `src/lib/personaConfig.js` - Persona definitions and prompts
- `src/lib/guideService.js` - Guide-related API functions
- `src/components/GuideSelector.jsx` - Guide selection component
- `src/pages/CodexPage.jsx` - Main guide selection page
- `src/pages/AIJournalWithGuide.jsx` - Guided journal
- `src/pages/CognitiveReframingWithGuide.jsx` - Guided reframing
- `supabase/functions/guide-persona-chat/index.ts` - Edge function

**Updated Files:**
- `src/App.jsx` - Added new routes
- `src/components/Navigation.jsx` - Added navigation links
- `src/contexts/UserContext.jsx` - Added guide unlock notifications

### 4. Environment Variables

Ensure these are set in your Supabase project:

```
PERPLEXITY_API_KEY=your_perplexity_api_key
```

## 📖 Usage Guide

### For Users

1. **Choose Your Guide**
   - Navigate to "The Codex" from the main menu
   - Browse available guides
   - Select one to be your active companion

2. **Guided Journaling**
   - Go to "Guided Journal"
   - Write your thoughts
   - Click "Get [Guide Name]'s Guidance"
   - Receive personalized insights

3. **Guided Reframing**
   - Go to "Guided Reframing"
   - Enter a negative thought
   - Your guide helps you reframe it
   - Earn XP for mental flexibility

4. **Unlock New Guides**
   - Reach Level 2 to unlock Patches and Lautrec
   - Reach Level 3 to unlock Gael and Sir Alonne
   - Notifications appear when guides are unlocked

### For Developers

#### Adding a New Guide

1. Add persona to `src/lib/personaConfig.js`:
```javascript
export const PERSONAS = {
  // ... existing personas
  newguide: {
    id: 'newguide',
    name: 'New Guide Name',
    title: 'Title',
    theme: 'Theme description',
    therapeuticLens: 'Therapeutic approach',
    unlockLevel: 1,
    imageUrl: 'image_url',
    color: '#HEX_COLOR',
    description: 'Description',
  }
};

export const PERSONA_PROMPTS = {
  // ... existing prompts
  newguide: `Your system prompt here...`
};
```

2. Update database constraint:
```sql
ALTER TABLE user_profiles
DROP CONSTRAINT valid_guide_name;

ALTER TABLE user_profiles
ADD CONSTRAINT valid_guide_name 
CHECK (active_guide IN ('solaire', 'siegward', 'artorias', 'gael', 'patches', 'lautrec', 'alonne', 'newguide'));
```

#### Customizing Persona Prompts

Edit the prompts in `src/lib/personaConfig.js`:

```javascript
export const PERSONA_PROMPTS = {
  solaire: `Your custom prompt...`,
  // ... other personas
};
```

#### Tracking Custom Interactions

Use the `saveGuideInteraction` function:

```javascript
import { saveGuideInteraction } from '@/lib/guideService';

await saveGuideInteraction(
  userId,
  guideId,
  'custom_type', // e.g., 'mood_check', 'goal_setting'
  userInput,
  guideResponse
);
```

## 🎨 Customization

### Changing AI Provider

The system uses Perplexity AI by default. To use a different provider:

1. Update `supabase/functions/guide-persona-chat/index.ts`
2. Replace the Perplexity API call with your provider
3. Update environment variables
4. Redeploy the edge function

### Adjusting Unlock Levels

Edit `src/contexts/UserContext.jsx`:

```javascript
const checkGuideUnlocks = async (newLevel, oldLevel) => {
  // Customize unlock levels here
  if (newLevel >= 2 && oldLevel < 2) {
    guidesToUnlock.push('patches', 'lautrec');
  }
  // ... more levels
};
```

### Styling Guide Cards

Edit `src/components/GuideSelector.jsx` to customize:
- Card layouts
- Color schemes
- Animations
- Unlock indicators

## 📊 Analytics & Monitoring

### View Guide Usage Statistics

```javascript
import { getGuideStats } from '@/lib/guideService';

const stats = await getGuideStats(userId);
// Returns: [{ guide_name, interaction_count, last_interaction }]
```

### View Interaction History

```javascript
import { getGuideInteractionHistory } from '@/lib/guideService';

const history = await getGuideInteractionHistory(userId, 50);
// Returns last 50 interactions
```

### Database Queries

```sql
-- Most popular guide
SELECT guide_name, COUNT(*) as interactions
FROM guide_interactions
GROUP BY guide_name
ORDER BY interactions DESC;

-- User engagement
SELECT user_id, COUNT(DISTINCT guide_name) as guides_used
FROM guide_interactions
GROUP BY user_id;

-- Daily active users
SELECT DATE(created_at) as date, COUNT(DISTINCT user_id) as users
FROM guide_interactions
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

## 🔒 Security Considerations

1. **API Keys**: Never expose Perplexity API key in client code
2. **RLS Policies**: Ensure users can only access their own data
3. **Rate Limiting**: Consider implementing rate limits in production
4. **Input Validation**: Validate all user inputs before processing
5. **Content Filtering**: Monitor for inappropriate content

## 🐛 Troubleshooting

### Guide not changing
- Check browser console for errors
- Verify `active_guide` column exists
- Check RLS policies

### No guide response
- Verify edge function is deployed
- Check edge function logs
- Ensure Perplexity API key is set

### Interactions not saving
- Check `guide_interactions` table exists
- Verify RLS policies allow INSERT
- Check browser console

### Images not loading
- Verify image URLs are accessible
- Check CORS settings
- Use fallback images

## 📚 Additional Resources

- [Integration Guide](INTEGRATION_GUIDE.md) - Step-by-step integration
- [Implementation Documentation](DARK_SOULS_GUIDES_IMPLEMENTATION.md) - Technical details
- [Edge Function Setup](SUPABASE_EDGE_FUNCTION_SETUP.md) - Deployment guide
- [Database Migrations](database_migrations.sql) - SQL scripts

## 🤝 Contributing

To contribute to this system:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This system is part of The Citadel therapeutic application.

## 🙏 Acknowledgments

- FromSoftware for the Dark Souls universe
- The therapeutic psychology community
- Perplexity AI for the language model
- Supabase for the backend infrastructure

## 📞 Support

For issues or questions:
- Check the troubleshooting section
- Review the documentation files
- Open an issue on GitHub
- Contact the development team

---

**Version**: 1.0.0  
**Last Updated**: 2024  
**Status**: Production Ready ✅