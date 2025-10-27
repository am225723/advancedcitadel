# Dark Souls Guides Integration Guide

## Overview
This guide explains how to integrate the Dark Souls therapeutic guide system into your existing application.

## Step 1: Database Setup

### Execute SQL Migrations
Run the SQL commands in `database_migrations.sql` in your Supabase SQL Editor:

1. Log into your Supabase dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `database_migrations.sql`
4. Execute the script

This will:
- Add `active_guide` column to `user_profiles`
- Create `guide_interactions` table
- Set up Row Level Security (RLS) policies
- Create helper functions

### Verify Database Changes
```sql
-- Check if active_guide column exists
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'user_profiles' AND column_name = 'active_guide';

-- Check if guide_interactions table exists
SELECT table_name FROM information_schema.tables 
WHERE table_name = 'guide_interactions';
```

## Step 2: Update App Routing

### Add New Routes to App.jsx

```javascript
// In your App.jsx, add these imports:
import CodexPage from './pages/CodexPage';
import AIJournalWithGuide from './pages/AIJournalWithGuide';
import CognitiveReframingWithGuide from './pages/CognitiveReframingWithGuide';

// Add these routes:
<Route path="/codex" element={<CodexPage />} />
<Route path="/journal-guided" element={<AIJournalWithGuide />} />
<Route path="/reframe-guided" element={<CognitiveReframingWithGuide />} />
```

### Update Navigation Component

Add links to the new pages in your Navigation component:

```javascript
<Link to="/codex">The Codex</Link>
<Link to="/journal-guided">Guided Journal</Link>
<Link to="/reframe-guided">Guided Reframing</Link>
```

## Step 3: Update Edge Functions

### Modify Existing Edge Function

If you have an existing `gemini-persona-chat` edge function, update it to accept a `systemPrompt` parameter:

```typescript
// In your edge function (e.g., supabase/functions/gemini-persona-chat/index.ts)

Deno.serve(async (req) => {
  try {
    const { systemPrompt, userContext, messageHistory } = await req.json();

    // Use the provided systemPrompt instead of a hardcoded one
    const messages = [
      {
        role: 'system',
        content: systemPrompt || 'You are a helpful therapeutic assistant.'
      },
      ...messageHistory
    ];

    // Your existing Gemini API call logic here
    // ...

    return new Response(
      JSON.stringify({ response: aiResponse }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
```

### Alternative: Create New Edge Function

If you prefer to keep your existing function unchanged, create a new one:

```bash
# In your terminal
supabase functions new guide-chat
```

Then implement the function with the system prompt parameter as shown above.

## Step 4: Testing the Integration

### Test Guide Selection
1. Navigate to `/codex`
2. Verify all 7 guides are displayed
3. Try selecting different guides
4. Check that the active guide is saved to the database

### Test Journal Integration
1. Navigate to `/journal-guided`
2. Create a new journal entry
3. Click "Get [Guide Name]'s Guidance"
4. Verify the response matches the guide's persona
5. Check that the interaction is saved to `guide_interactions` table

### Test Reframing Integration
1. Navigate to `/reframe-guided`
2. Enter a negative thought
3. Click "Reframe with [Guide Name]"
4. Verify the response matches the guide's therapeutic approach
5. Check that XP is awarded

## Step 5: Optional Enhancements

### Add Guide Unlock Notifications

In your `UserContext.jsx`, add a function to check for guide unlocks:

```javascript
const checkGuideUnlocks = async (newLevel) => {
  const guidesToUnlock = [];
  
  if (newLevel >= 2) {
    guidesToUnlock.push('patches', 'lautrec');
  }
  if (newLevel >= 3) {
    guidesToUnlock.push('gael', 'alonne');
  }
  
  for (const guideId of guidesToUnlock) {
    const unlocked = await unlockGuide(user.id, guideId);
    if (unlocked) {
      const persona = getPersona(guideId);
      toast({
        title: "New Guide Unlocked!",
        description: `${persona.name} is now available in the Codex.`,
      });
    }
  }
};
```

### Add Guide Quick Switcher

Create a dropdown in your navigation to quickly switch guides:

```javascript
import { getActiveGuide, setActiveGuide, getUnlockedGuides } from '@/lib/guideService';
import { getAllPersonas } from '@/lib/personaConfig';

// In your component:
const [activeGuide, setActiveGuideState] = useState(null);
const [unlockedGuides, setUnlockedGuides] = useState([]);

// Load and display in dropdown
// Allow quick switching without going to Codex page
```

## Step 6: Migrate Existing Data (Optional)

If you have existing journal entries or reframing sessions, you can migrate them:

```sql
-- Set default active guide for all existing users
UPDATE user_profiles 
SET active_guide = 'solaire' 
WHERE active_guide IS NULL;

-- Initialize unlocked_guides for existing users
UPDATE user_profiles 
SET unlocked_guides = ARRAY['solaire', 'siegward', 'artorias']
WHERE unlocked_guides IS NULL;
```

## Troubleshooting

### Issue: Guide not changing
- Check browser console for errors
- Verify `active_guide` column exists in database
- Check RLS policies are correctly set up

### Issue: No guide response
- Verify edge function is deployed
- Check edge function logs in Supabase dashboard
- Ensure API keys are configured correctly

### Issue: Interactions not saving
- Check `guide_interactions` table exists
- Verify RLS policies allow INSERT
- Check browser console for errors

## File Structure

```
src/
├── lib/
│   ├── personaConfig.js          # Persona definitions and prompts
│   └── guideService.js            # Guide-related API functions
├── components/
│   └── GuideSelector.jsx          # Guide selection component
└── pages/
    ├── CodexPage.jsx              # Main guide selection page
    ├── AIJournalWithGuide.jsx     # Journal with guide integration
    └── CognitiveReframingWithGuide.jsx  # Reframing with guide integration
```

## Next Steps

1. Customize persona prompts in `personaConfig.js` to match your therapeutic approach
2. Add more interaction types (e.g., mood tracking, goal setting)
3. Create analytics dashboard for guide usage
4. Add guide-specific achievements and rewards
5. Implement guide "voice lines" for different scenarios

## Support

For issues or questions:
1. Check the implementation documentation in `DARK_SOULS_GUIDES_IMPLEMENTATION.md`
2. Review the database schema in `database_migrations.sql`
3. Examine the example components for reference implementations