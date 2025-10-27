# Supabase Edge Function Setup Guide

## Overview
This guide explains how to deploy the `guide-persona-chat` edge function that uses Perplexity AI for the Dark Souls therapeutic guides system.

## Prerequisites
1. Supabase CLI installed (`npm install -g supabase`)
2. Supabase project created
3. Perplexity AI API key (get one at https://www.perplexity.ai/)

## Step 1: Set Up Perplexity API Key

### Option A: Using Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **Edge Functions**
3. Click on **Manage secrets**
4. Add a new secret:
   - Name: `PERPLEXITY_API_KEY`
   - Value: Your Perplexity API key

### Option B: Using Supabase CLI
```bash
# Set the secret
supabase secrets set PERPLEXITY_API_KEY=your_perplexity_api_key_here
```

## Step 2: Deploy the Edge Function

### Using Supabase CLI

1. **Link your project** (if not already linked):
```bash
supabase link --project-ref your-project-ref
```

2. **Deploy the function**:
```bash
supabase functions deploy guide-persona-chat
```

3. **Verify deployment**:
```bash
supabase functions list
```

### Manual Deployment via Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Edge Functions**
3. Click **Create a new function**
4. Name it: `guide-persona-chat`
5. Copy the contents of `supabase/functions/guide-persona-chat/index.ts`
6. Paste into the editor
7. Click **Deploy**

## Step 3: Test the Edge Function

### Using curl:
```bash
curl -i --location --request POST 'https://your-project-ref.supabase.co/functions/v1/guide-persona-chat' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "systemPrompt": "You are Solaire of Astora. Respond with optimism and encouragement.",
    "messageHistory": [
      {
        "role": "user",
        "content": "I am feeling down today."
      }
    ],
    "userContext": {
      "level": 5,
      "completedExercises": 10
    }
  }'
```

### Using JavaScript:
```javascript
import { supabase } from './lib/customSupabaseClient';

const { data, error } = await supabase.functions.invoke('guide-persona-chat', {
  body: JSON.stringify({
    systemPrompt: "You are Solaire of Astora. Respond with optimism and encouragement.",
    messageHistory: [
      {
        role: 'user',
        content: 'I am feeling down today.'
      }
    ],
    userContext: {
      level: 5,
      completedExercises: 10
    }
  })
});

if (error) {
  console.error('Error:', error);
} else {
  console.log('Response:', data.response);
}
```

## Step 4: Update Your Application

The application is already configured to use this edge function. The following files reference it:

- `src/lib/guideService.js` - Contains functions that call the edge function
- `src/pages/AIJournalWithGuide.jsx` - Uses it for journal guidance
- `src/pages/CognitiveReframingWithGuide.jsx` - Uses it for reframing

## Function Details

### Endpoint
```
POST https://your-project-ref.supabase.co/functions/v1/guide-persona-chat
```

### Request Body
```typescript
{
  systemPrompt: string;      // The persona's system prompt
  messageHistory: Array<{    // Array of messages
    role: 'user' | 'assistant';
    content: string;
  }>;
  userContext?: {            // Optional user context
    level?: number;
    xp?: number;
    displayName?: string;
    completedExercises?: number;
  };
}
```

### Response
```typescript
{
  response: string;          // The AI's response
  model: string;            // Model used (e.g., "llama-3.1-sonar-large-128k-online")
  usage?: {                 // Token usage information
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}
```

### Error Response
```typescript
{
  error: string;            // Error message
  details?: string;         // Additional error details
}
```

## Perplexity AI Model Information

The function uses `llama-3.1-sonar-large-128k-online` which:
- Has access to real-time web information
- Supports up to 128k tokens context
- Provides high-quality, contextual responses
- Is optimized for conversational AI

### Alternative Models
You can change the model in the edge function code:

```typescript
// For faster responses (no web access):
model: 'llama-3.1-sonar-small-128k-chat'

// For maximum quality (no web access):
model: 'llama-3.1-sonar-large-128k-chat'

// For online information (current default):
model: 'llama-3.1-sonar-large-128k-online'
```

## Monitoring and Logs

### View Function Logs
```bash
supabase functions logs guide-persona-chat
```

### View in Dashboard
1. Go to **Edge Functions** in your Supabase dashboard
2. Click on `guide-persona-chat`
3. View the **Logs** tab

## Troubleshooting

### Error: "PERPLEXITY_API_KEY is not set"
- Ensure you've set the secret in Supabase
- Redeploy the function after setting the secret

### Error: "Perplexity API error: 401"
- Your API key is invalid or expired
- Get a new key from https://www.perplexity.ai/

### Error: "No response from Perplexity AI"
- Check your Perplexity API quota
- Verify the model name is correct
- Check function logs for detailed errors

### Function times out
- Increase the timeout in your Supabase project settings
- Consider using a smaller model for faster responses

## Cost Considerations

Perplexity AI pricing (as of 2024):
- Online models: ~$1 per 1M tokens
- Chat models: ~$0.20 per 1M tokens

Monitor your usage in the Perplexity dashboard to avoid unexpected costs.

## Security Notes

1. **Never expose your Perplexity API key** in client-side code
2. The edge function runs server-side, keeping your API key secure
3. Use Supabase RLS policies to control who can call the function
4. Consider implementing rate limiting for production use

## Next Steps

1. Deploy the function using the steps above
2. Test it with the provided examples
3. Monitor logs to ensure it's working correctly
4. Update the application code if needed
5. Set up monitoring and alerts for production use