# Supabase Edge Functions Deployment Guide

## Overview
This guide explains how to deploy and update the Perplexity AI-powered edge functions for The Citadel. All edge functions now include comprehensive error logging for better debugging and monitoring.

## Prerequisites
1. Supabase CLI installed: `npm install -g supabase`
2. Supabase project created
3. Perplexity AI API key (https://www.perplexity.ai/settings/api)
4. ElevenLabs API key (optional, for meditation audio)

---

## Step 1: Set Up API Keys in Supabase

### Using Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to **Project Settings** → **Edge Functions** → **Secrets**
3. Add the following secrets:
   - Key: `PERPLEXITY_API_KEY`, Value: `your_perplexity_api_key`
   - Key: `ELEVENLABS_API_KEY`, Value: `your_elevenlabs_api_key` (optional)

### Using Supabase CLI
```bash
# Set Perplexity API key
supabase secrets set PERPLEXITY_API_KEY=your_api_key_here

# Set ElevenLabs API key (optional)
supabase secrets set ELEVENLABS_API_KEY=your_api_key_here

# Verify secrets are set
supabase secrets list
```

---

## Step 2: Deploy Edge Functions

### Important Note on File Structure
- **Local Development:** Edge functions are in `supabase_functions/` folder
- **Deployment:** Need to copy to `supabase/functions/` folder for Supabase CLI deployment

### Prepare for Deployment
```bash
# Create supabase/functions directory structure
mkdir -p supabase/functions/_shared
mkdir -p supabase/functions/perplexity-persona-chat

# Copy shared CORS helper
cp supabase_functions/_shared/cors.ts supabase/functions/_shared/

# Copy persona chat function
cp supabase_functions/perplexity-persona-chat.ts supabase/functions/perplexity-persona-chat/index.ts
```

### Deploy Functions

#### 1. Deploy Persona Chat Function
```bash
cd supabase/functions
supabase functions deploy perplexity-persona-chat

# Verify deployment
supabase functions list
```

#### 2. Deploy Other Functions (if you have them)  
If you have existing `perplexity-journal-ai` or `perplexity-reframe-forge` functions:

```bash
# Deploy journal AI
supabase functions deploy perplexity-journal-ai

# Deploy reframe forge
supabase functions deploy perplexity-reframe-forge

# List all deployed functions
supabase functions list
```

---

## Step 3: Run Database Migrations

### Using Supabase Dashboard
1. Go to **SQL Editor**
2. Copy and execute the contents of these files in order:
   - `database_migrations.sql` (guides system)
   - `database_migrations_meditations.sql` (meditation system)
   - `database_migrations_admin.sql` (admin functions)

### Using Supabase CLI
```bash
# Connect to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

---

## Step 4: Test Edge Functions

### Test Persona Chat
```bash
curl -i --location --request POST 'https://your-project-ref.supabase.co/functions/v1/perplexity-persona-chat' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "userContext": {
      "displayName": "Test User",
      "level": 5,
      "xp": 150,
      "completedExercises": 10
    },
    "messageHistory": [
      {"role": "user", "content": "I am feeling anxious today"}
    ]
  }'
```

### Expected Response
```json
{
  "response": "The weight you bear is heavy, warrior. Yet here you stand, seeking counsel and growth..."
}
```

---

## Error Logging Features

All edge functions now include:

1. **Detailed Error Context**
   - Request body logging
   - API response status codes
   - Full error stack traces
   - Timestamp information

2. **Structured Error Messages**
   - User-friendly error messages in responses
   - Technical details in server logs
   - Error categorization (API errors, validation errors, etc.)

3. **Console Logging**
   - Success confirmations
   - Request/response previews
   - Performance metrics
   - API call tracking

### Viewing Logs

#### Using Supabase Dashboard
1. Go to **Edge Functions**
2. Click on function name
3. View **Logs** tab
4. Filter by error level or search

#### Using Supabase CLI
```bash
# View real-time logs
supabase functions logs perplexity-persona-chat

# Follow logs (live)
supabase functions logs perplexity-persona-chat --follow

# Filter by error level
supabase functions logs perplexity-persona-chat --level error
```

---

## Troubleshooting

### Common Errors

#### 1. "PERPLEXITY_API_KEY is not set"
**Solution:** Ensure API key is added to Supabase secrets (Step 1)

#### 2. "System prompt is required"
**Solution:** Ensure you're using the updated edge function with system prompt included

#### 3. "CORS error"
**Solution:** Verify `_shared/cors.ts` is deployed correctly

#### 4. "Function not found"
**Solution:** Verify function is deployed: `supabase functions list`

#### 5. "Structure of query does not match function result type"
**Solution:** Run `database_migrations_admin.sql` to fix RPC functions

### Debugging Steps

1. **Check Function Deployment:**
   ```bash
   supabase functions list
   ```

2. **Verify Secrets:**
   ```bash
   supabase secrets list
   ```

3. **View Logs:**
   ```bash
   supabase functions logs function-name --follow
   ```

4. **Test Locally (Optional):**
   ```bash
   supabase functions serve function-name
   ```

---

## Production Deployment Checklist

- [ ] Perplexity API key added to secrets
- [ ] ElevenLabs API key added (optional)
- [ ] All edge functions deployed
- [ ] Database migrations executed
- [ ] Functions tested with curl or Postman
- [ ] Error logs reviewed and verified
- [ ] CORS headers working correctly
- [ ] Client-side integration tested

---

## Monitoring & Maintenance

### Regular Checks
- Review error logs weekly
- Monitor API usage and costs
- Update functions when dependencies change
- Test after Supabase platform updates

### Performance Optimization
- Monitor response times in logs
- Adjust Perplexity model if needed (currently using `llama-3.1-sonar-small-128k-online`)
- Consider caching for frequently requested data
- Optimize prompt lengths to reduce costs

---

## Next Steps

1. Deploy all edge functions to Supabase
2. Run database migrations
3. Test all API endpoints
4. Configure monitoring alerts (optional)
5. Document any custom modifications

For questions or issues, refer to:
- Supabase Edge Functions Docs: https://supabase.com/docs/guides/functions
- Perplexity API Docs: https://docs.perplexity.ai/
- ElevenLabs API Docs: https://elevenlabs.io/docs
