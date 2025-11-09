# Supabase Edge Function Setup Guide

## Overview
This guide explains how to deploy the Perplexity AI-powered edge functions for The Citadel therapeutic application:
- `guide-persona-chat` - AI guide personas for therapeutic conversations
- `perplexity-reframe-forge` - Cognitive reframing for negative thoughts
- `perplexity-journal-ai` - Journal entry analysis and insights

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

---

# Additional Edge Functions

## Function 2: perplexity-reframe-forge

### Overview
The `perplexity-reframe-forge` function provides AI-powered cognitive reframing for negative thoughts using CBT (Cognitive Behavioral Therapy) techniques.

### Deployment

#### Using Supabase CLI
```bash
# Deploy the function
supabase functions deploy perplexity-reframe-forge

# Verify deployment
supabase functions list
```

#### Manual Deployment via Dashboard
1. Go to your Supabase project dashboard
2. Navigate to **Edge Functions**
3. Click **Create a new function**
4. Name it: `perplexity-reframe-forge`
5. Copy the contents of `supabase/functions/perplexity-reframe-forge/index.ts`
6. Paste into the editor
7. Click **Deploy**

### Endpoint
```
POST https://your-project-ref.supabase.co/functions/v1/perplexity-reframe-forge
```

### Request Body
```typescript
{
  negative_thought: string;  // Required: The negative thought to reframe
  context?: string;          // Optional: Additional context about the situation
}
```

### Response
```typescript
{
  balanced_reframe: string;           // A more balanced perspective
  evidence_for: string[];             // 2-3 points supporting the thought
  evidence_against: string[];         // 2-3 points challenging the thought
  cognitive_distortions: string[];    // Identified cognitive distortions
  tiny_action: string;                // One small actionable step
  safety_note?: string;               // Optional warning for severe cases
}
```

### Test Example

#### Using curl:
```bash
curl -i --location --request POST 'https://your-project-ref.supabase.co/functions/v1/perplexity-reframe-forge' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "negative_thought": "I am going to fail this presentation and everyone will think I am incompetent.",
    "context": "I have a big work presentation tomorrow."
  }'
```

#### Using JavaScript:
```javascript
import { supabase } from './lib/customSupabaseClient';

const { data, error } = await supabase.functions.invoke('perplexity-reframe-forge', {
  body: {
    negative_thought: "I'm going to fail this presentation and everyone will think I'm incompetent.",
    context: "I have a big work presentation tomorrow."
  }
});

if (error) {
  console.error('Error:', error);
} else {
  console.log('Balanced reframe:', data.balanced_reframe);
  console.log('Cognitive distortions:', data.cognitive_distortions);
  console.log('Tiny action:', data.tiny_action);
}
```

### Application Integration
This function is used in:
- `src/pages/CognitiveReframing.jsx` - Main reframing interface
- `src/pages/CognitiveReframingWithGuide.jsx` - Reframing with guide personas

### Common Cognitive Distortions Identified
- All-or-nothing thinking
- Overgeneralization
- Mental filter
- Discounting the positive
- Jumping to conclusions
- Magnification/Catastrophizing
- Emotional reasoning
- Should statements
- Labeling
- Personalization

### Monitoring
```bash
# View function logs
supabase functions logs perplexity-reframe-forge
```

---

## Function 3: perplexity-journal-ai

### Overview
The `perplexity-journal-ai` function provides AI-powered analysis of journal entries with multiple modes for different types of insights.

### Deployment

#### Using Supabase CLI
```bash
# Deploy the function
supabase functions deploy perplexity-journal-ai

# Verify deployment
supabase functions list
```

#### Manual Deployment via Dashboard
1. Go to your Supabase project dashboard
2. Navigate to **Edge Functions**
3. Click **Create a new function**
4. Name it: `perplexity-journal-ai`
5. Copy the contents of `supabase/functions/perplexity-journal-ai/index.ts`
6. Paste into the editor
7. Click **Deploy**

### Endpoint
```
POST https://your-project-ref.supabase.co/functions/v1/perplexity-journal-ai
```

### Request Body
```typescript
{
  content: string;  // Required: The journal entry content
  mode: 'summarize' | 'insights' | 'next_steps' | 'feelings' | 'mechanic_question';  // Required
}
```

### Response Formats

#### Mode: 'summarize'
```typescript
{
  summary: string;  // A concise 2-3 sentence summary
}
```

#### Mode: 'insights'
```typescript
{
  insights: string[];  // 3-5 key insights or observations
}
```

#### Mode: 'next_steps'
```typescript
{
  actions: string[];  // 3-5 actionable next steps
}
```

#### Mode: 'feelings'
```typescript
{
  primary_emotions: string[];      // Main emotions (2-3)
  secondary_emotions: string[];    // Underlying emotions (2-3)
  intensity: number;               // Emotional intensity (1-10)
  themes: string[];                // Recurring themes
  somatic_cues: string[];          // Physical sensations mentioned
}
```

#### Mode: 'mechanic_question'
```typescript
{
  insights: string[];  // 3-5 thought-provoking insights
}
```

### Test Examples

#### Using curl (Summarize):
```bash
curl -i --location --request POST 'https://your-project-ref.supabase.co/functions/v1/perplexity-journal-ai' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "content": "Today was challenging. I felt overwhelmed at work and struggled to focus. I noticed my chest felt tight and I kept worrying about my deadlines.",
    "mode": "summarize"
  }'
```

#### Using curl (Insights):
```bash
curl -i --location --request POST 'https://your-project-ref.supabase.co/functions/v1/perplexity-journal-ai' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "content": "Today was challenging. I felt overwhelmed at work and struggled to focus. I noticed my chest felt tight and I kept worrying about my deadlines.",
    "mode": "insights"
  }'
```

#### Using curl (Feelings):
```bash
curl -i --location --request POST 'https://your-project-ref.supabase.co/functions/v1/perplexity-journal-ai' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "content": "Today was challenging. I felt overwhelmed at work and struggled to focus. I noticed my chest felt tight and I kept worrying about my deadlines.",
    "mode": "feelings"
  }'
```

#### Using JavaScript:
```javascript
import { supabase } from './lib/customSupabaseClient';

// Get insights
const { data, error } = await supabase.functions.invoke('perplexity-journal-ai', {
  body: {
    content: "Today was challenging. I felt overwhelmed at work and struggled to focus.",
    mode: "insights"
  }
});

if (error) {
  console.error('Error:', error);
} else {
  console.log('Insights:', data.insights);
}

// Get next steps
const { data: actionsData, error: actionsError } = await supabase.functions.invoke('perplexity-journal-ai', {
  body: {
    content: "Today was challenging. I felt overwhelmed at work and struggled to focus.",
    mode: "next_steps"
  }
});

if (!actionsError) {
  console.log('Suggested actions:', actionsData.actions);
}

// Analyze feelings
const { data: feelingsData, error: feelingsError } = await supabase.functions.invoke('perplexity-journal-ai', {
  body: {
    content: "Today was challenging. I felt overwhelmed at work and struggled to focus.",
    mode: "feelings"
  }
});

if (!feelingsError) {
  console.log('Primary emotions:', feelingsData.primary_emotions);
  console.log('Intensity:', feelingsData.intensity);
  console.log('Somatic cues:', feelingsData.somatic_cues);
}
```

### Application Integration
This function is used in:
- `src/pages/AIJournal.jsx` - Main journal interface with AI analysis

### Analysis Modes Explained

1. **summarize**: Quick overview of the entry's main themes and emotions
2. **insights**: Deep analysis identifying patterns and growth opportunities
3. **next_steps**: Practical, actionable suggestions based on the entry
4. **feelings**: Comprehensive emotional analysis including body sensations
5. **mechanic_question**: Thought-provoking observations for self-exploration

### Monitoring
```bash
# View function logs
supabase functions logs perplexity-journal-ai
```

---

## Deploy All Functions at Once

### Using Supabase CLI
```bash
# Deploy all three functions in sequence
supabase functions deploy guide-persona-chat
supabase functions deploy perplexity-reframe-forge
supabase functions deploy perplexity-journal-ai

# Verify all deployments
supabase functions list
```

### View All Function Logs
```bash
# View logs for all functions
supabase functions logs guide-persona-chat
supabase functions logs perplexity-reframe-forge
supabase functions logs perplexity-journal-ai
```

## Common Troubleshooting for All Functions

### Error: "PERPLEXITY_API_KEY is not set"
- The PERPLEXITY_API_KEY secret is shared across all three functions
- Ensure you've set it once in Supabase (see Step 1 above)
- Redeploy the affected function after setting the secret

### Error: "Failed to parse AI response as JSON"
- The AI occasionally returns markdown-wrapped JSON
- All functions include fallback parsing for markdown code blocks
- If this error persists, check the function logs for the raw response

### Error: "Invalid response structure from AI"
- The AI's response didn't match the expected format
- Check function logs to see what was returned
- Consider adjusting the temperature or trying again

### Rate Limiting
For production use, consider implementing rate limiting to prevent abuse:
```sql
-- Example: Create a rate limiting table
CREATE TABLE IF NOT EXISTS function_rate_limits (
  user_id UUID NOT NULL,
  function_name TEXT NOT NULL,
  call_count INTEGER DEFAULT 0,
  window_start TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user_id, function_name)
);
```

## Best Practices

1. **Error Handling**: All functions include comprehensive error handling with detailed error messages
2. **CORS**: Configured to allow cross-origin requests from your application
3. **Validation**: Input validation ensures required fields are present and properly formatted
4. **JSON Parsing**: Robust parsing handles both raw JSON and markdown-wrapped responses
5. **Logging**: Use `console.error` for debugging production issues
6. **Security**: API keys are stored as secrets and never exposed to the client

## Summary

You now have three powerful AI-driven edge functions:

1. **guide-persona-chat**: Conversational AI with therapeutic personas
2. **perplexity-reframe-forge**: Cognitive reframing for negative thoughts
3. **perplexity-journal-ai**: Multi-mode journal entry analysis

All functions use the same Perplexity API key and model, ensuring consistent performance and cost management.