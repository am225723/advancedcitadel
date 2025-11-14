# ElevenLabs Voice Setup Guide

## Overview

This application uses ElevenLabs' text-to-speech API to generate immersive, character-voiced meditation audio. Each Dark Souls character guide has been paired with a specific ElevenLabs voice that matches their personality and therapeutic approach.

**Important:** Audio generation is completely optional. The meditation scripts work perfectly fine without TTS, but adding ElevenLabs voices creates a more immersive experience.

---

## Table of Contents

1. [Getting Your ElevenLabs API Key](#getting-your-elevenlabs-api-key)
2. [Character Voice Mappings](#character-voice-mappings)
3. [Finding Voice IDs](#finding-voice-ids)
4. [Setting Up the API Key](#setting-up-the-api-key)
5. [Voice Settings Configuration](#voice-settings-configuration)
6. [Testing Your Setup](#testing-your-setup)
7. [Troubleshooting](#troubleshooting)

---

## Getting Your ElevenLabs API Key

### Step 1: Create an Account

1. Visit [ElevenLabs](https://elevenlabs.io)
2. Click "Sign Up" and create a free account
3. ElevenLabs offers a generous free tier with 10,000 characters per month

### Step 2: Access Your API Key

1. Log in to your ElevenLabs account
2. Click on your profile icon in the top-right corner
3. Select "Profile" from the dropdown menu
4. Scroll down to the "API Key" section
5. Click "Copy" to copy your API key to the clipboard

**Security Note:** Never share your API key publicly or commit it to version control.

---

## Character Voice Mappings

Each character guide has been carefully paired with an ElevenLabs voice that matches their personality:

### Solaire of Astora → **Josh**
- **Character:** Warm, uplifting, encouraging
- **Voice Description:** Warm male voice with a friendly, optimistic tone
- **Meditation Focus:** Self-compassion, inner light, positive psychology
- **Best For:** Anxiety, hopelessness, low self-worth

### Siegward of Catarina → **Antoni**
- **Character:** Calm, reassuring, patient
- **Voice Description:** Calm male voice with a patient, fatherly quality
- **Meditation Focus:** Rest, mindfulness, present-moment awareness
- **Best For:** Stress, overwhelm, burnout, racing thoughts

### Artorias the Abysswalker → **Arnold**
- **Character:** Deep, powerful, resonant
- **Voice Description:** Deep male voice with gravitas and strength
- **Meditation Focus:** Accepting difficult emotions, radical acceptance
- **Best For:** Depression, trauma, grief, anger, fear

### Sir Alonne → **Callum**
- **Character:** Disciplined, precise, authoritative
- **Voice Description:** Disciplined male voice with authority and clarity
- **Meditation Focus:** Values-based action, self-discipline, integrity
- **Best For:** Lack of direction, guilt, shame, procrastination

### Patches the Hyena → **Charlie**
- **Character:** Clever, cunning, insightful
- **Voice Description:** Slightly raspy male voice with character
- **Meditation Focus:** Spotting cognitive distortions, mental clarity
- **Best For:** Catastrophizing, black-and-white thinking, rumination

---

## Finding Voice IDs

### Method 1: Using the ElevenLabs Dashboard

1. Log in to [ElevenLabs](https://elevenlabs.io)
2. Navigate to the "Voices" tab in the left sidebar
3. Browse the "Voice Library" or "Your Voices" section
4. Click on a voice to see its details
5. The Voice ID will be displayed in the voice details panel
6. Click the copy icon next to the Voice ID

### Method 2: Using the Recommended Voices

The recommended voices for this application are pre-made ElevenLabs voices. Here's how to find them:

1. Go to [ElevenLabs Voice Library](https://elevenlabs.io/voice-library)
2. Use the search bar to find each voice by name:
   - Search "Josh" for Solaire
   - Search "Antoni" for Siegward
   - Search "Arnold" for Artorias
   - Search "Callum" for Sir Alonne
   - Search "Charlie" for Patches
3. Click on the voice to preview it
4. Add the voice to your workspace if needed
5. Copy the Voice ID from the voice details

### Direct Links to Voice Library

- **Voice Library:** https://elevenlabs.io/voice-library
- **Your Voices:** https://elevenlabs.io/speech-synthesis (after login)

---

## Setting Up the API Key

### Option 1: Using Replit Secrets (Recommended)

1. In your Replit workspace, click the "Secrets" tab (lock icon) in the left sidebar
2. Click "+ New Secret"
3. Set the key name: `ELEVENLABS_API_KEY`
4. Paste your ElevenLabs API key as the value
5. Click "Add Secret"

The application will automatically detect and use this API key.

### Option 2: Using Environment Variables (Local Development)

If running locally, create a `.env` file in the root directory:

```env
ELEVENLABS_API_KEY=your_api_key_here
```

**Important:** Make sure `.env` is in your `.gitignore` file!

---

## Voice Settings Configuration

The application comes pre-configured with optimized voice settings for each character. These settings are defined in `src/lib/textToSpeechService.js`:

### Pre-configured Settings

```javascript
{
  solaire: {
    stability: 0.7,        // Balanced, natural variation
    similarity_boost: 0.8, // High voice consistency
    style: 0.3,            // Moderate expressiveness
    use_speaker_boost: true
  },
  siegward: {
    stability: 0.8,        // Very stable, calming
    similarity_boost: 0.7, // Good consistency
    style: 0.2,            // Gentle, minimal drama
    use_speaker_boost: true
  },
  artorias: {
    stability: 0.75,       // Balanced power
    similarity_boost: 0.75,// Strong consistency
    style: 0.4,            // More expressive
    use_speaker_boost: true
  },
  alonne: {
    stability: 0.8,        // Highly controlled
    similarity_boost: 0.75,// Strong consistency
    style: 0.35,           // Measured expressiveness
    use_speaker_boost: true
  },
  patches: {
    stability: 0.65,       // More variation (cunning)
    similarity_boost: 0.8, // High consistency
    style: 0.5,            // Very expressive
    use_speaker_boost: true
  }
}
```

### Understanding Voice Settings

- **Stability (0.0-1.0):** Controls voice consistency. Higher = more stable, lower = more expressive variation
- **Similarity Boost (0.0-1.0):** Enhances similarity to the original voice. Higher = closer to the base voice
- **Style (0.0-1.0):** Controls how much the AI attempts to amplify the style. Higher = more dramatic
- **Speaker Boost:** Enhances clarity and boosts similarity (recommended: true)

**Note:** These settings are already optimized for each character. You don't need to modify them unless you want to experiment with different voice characteristics.

---

## Testing Your Setup

### Step 1: Verify API Key

1. Navigate to the Meditations page in the application
2. If the API key is not set, you'll see a help message explaining how to add it
3. If the API key is set, the meditation cards will show voice information

### Step 2: Test Audio Generation

1. Select any unlocked meditation
2. Click "Begin Meditation"
3. The meditation player will attempt to generate audio
4. If successful, you'll hear the character-voiced meditation
5. If it fails, check the browser console for error messages

### Step 3: Verify Voice Quality

Listen for:
- ✅ Clear, understandable speech
- ✅ Appropriate pacing for meditation
- ✅ Consistent voice throughout
- ✅ Proper pause handling between segments

---

## Troubleshooting

### "ElevenLabs API key is required" Error

**Solution:** The API key is not set or not accessible.
1. Double-check that you've added `ELEVENLABS_API_KEY` to Replit Secrets
2. Make sure the key name is exactly `ELEVENLABS_API_KEY` (case-sensitive)
3. Restart the application after adding the secret

### "Failed to fetch voices: 401" Error

**Solution:** The API key is invalid or expired.
1. Verify your API key is correct in the ElevenLabs dashboard
2. Copy and paste it again to avoid typos
3. Check that your ElevenLabs account is active

### "Voice not found" or 404 Errors

**Solution:** The voice ID doesn't exist or isn't accessible.
1. Ensure the voice is in your ElevenLabs workspace
2. If using pre-made voices, add them to your workspace from the Voice Library
3. Verify you're using the correct Voice ID (not the voice name)

### Audio Plays But No Sound

**Solution:** Check your browser and system audio settings.
1. Ensure your device volume is turned up
2. Check browser permissions for audio playback
3. Try refreshing the page
4. Check browser console for audio context errors

### "Quota exceeded" Error

**Solution:** You've reached your monthly character limit.
1. Check your usage in the ElevenLabs dashboard
2. Wait for your quota to reset (monthly on free tier)
3. Consider upgrading your ElevenLabs plan for more characters

### Audio Quality Issues

**Solution:** Adjust voice settings or try different voices.
1. The pre-configured settings are optimized, but you can experiment
2. Try adjusting stability (higher = more consistent, lower = more varied)
3. Consider testing different voices from the Voice Library
4. Ensure you're using high-quality meditation scripts

---

## API Usage & Costs

### Free Tier

- **10,000 characters per month** (sufficient for ~15-20 meditation sessions)
- Access to all standard voices
- Standard voice quality

### Paid Tiers

For frequent meditation users, consider upgrading:
- **Starter:** 30,000 characters/month (~$5/month)
- **Creator:** 100,000 characters/month (~$22/month)
- **Pro:** 500,000 characters/month (~$99/month)

### Calculating Usage

Each meditation script is approximately 500-800 characters. Example:
- Solaire's "Finding Your Sun" meditation ≈ 750 characters
- If you meditate daily, you'll use ~22,500 characters/month
- Free tier: ~13 meditations/month
- Starter tier: ~40 meditations/month

---

## Advanced Configuration

### Using Custom Voices

If you want to use your own cloned voices or different ElevenLabs voices:

1. **Clone Your Own Voice:**
   - Go to ElevenLabs > Voice Lab > Instant Voice Cloning
   - Record samples or upload audio files
   - Create your custom voice
   - Copy the Voice ID

2. **Update the Application:**
   - In `src/lib/textToSpeechService.js`, you can modify the voice mappings
   - However, for user-level customization, we recommend keeping the defaults and using the voice selection UI

3. **Test Thoroughly:**
   - Ensure your custom voice maintains appropriate meditation pacing
   - Adjust voice settings (stability, style) as needed

### Caching Strategy

The application automatically caches generated audio to minimize API usage:
- Audio is cached in browser localStorage
- Cache key includes meditation ID and version
- Cached audio persists across sessions
- Clear browser data to regenerate audio with new settings

---

## Best Practices

1. **Start with Default Settings:** The pre-configured voices and settings are optimized for meditation
2. **Test One Voice at a Time:** When experimenting, change one setting at a time
3. **Monitor API Usage:** Keep an eye on your character quota in the ElevenLabs dashboard
4. **Use Caching:** Let the application cache audio to save on API calls
5. **Preview Before Committing:** Test voices in the ElevenLabs dashboard before using them in meditations

---

## Support & Resources

- **ElevenLabs Documentation:** https://docs.elevenlabs.io/
- **ElevenLabs API Reference:** https://docs.elevenlabs.io/api-reference
- **Voice Library:** https://elevenlabs.io/voice-library
- **Community Discord:** https://discord.gg/elevenlabs

---

## Quick Reference

### Essential Voice Mappings

| Character | Voice Name | Voice Quality |
|-----------|------------|---------------|
| Solaire | Josh | Warm, uplifting |
| Siegward | Antoni | Calm, fatherly |
| Artorias | Arnold | Deep, powerful |
| Sir Alonne | Callum | Disciplined, precise |
| Patches | Charlie | Raspy, clever |

### Setup Checklist

- [ ] Created ElevenLabs account
- [ ] Obtained API key
- [ ] Added `ELEVENLABS_API_KEY` to Replit Secrets
- [ ] Identified desired voices in Voice Library
- [ ] Added voices to workspace (if needed)
- [ ] Tested audio generation with one meditation
- [ ] Verified audio quality and pacing
- [ ] Confirmed API usage tracking

---

**Remember:** The meditation experience works great even without audio generation. ElevenLabs TTS is an enhancement, not a requirement. Users can read the meditation scripts and follow along at their own pace.