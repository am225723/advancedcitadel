# Quick Start Guide - Dark Souls Therapeutic Guides System

## 🚀 Quick Setup (5 Minutes)

### Step 1: Database Setup (2 minutes)
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `database_migrations.sql`
4. Paste and click **Run**
5. Verify success ✅

### Step 2: Edge Function Setup (2 minutes)
1. Get your Perplexity API key from https://www.perplexity.ai/
2. In your terminal:
```bash
supabase secrets set PERPLEXITY_API_KEY=your_key_here
supabase functions deploy guide-persona-chat
```
3. Verify deployment ✅

### Step 3: Merge & Deploy (1 minute)
1. Go to https://github.com/am225723/advancedcitadel/pull/13
2. Review the changes
3. Click **Merge pull request**
4. Deploy to your hosting platform ✅

## 🎮 Using the System

### For Users

**Choose Your Guide:**
1. Click "The Codex" in navigation
2. Browse the 7 available guides
3. Click on a guide card to select them

**Guided Journal:**
1. Click "Guided Journal" in navigation
2. Write your journal entry
3. Click "Get [Guide Name]'s Guidance"
4. Read your guide's personalized response

**Guided Reframing:**
1. Click "Guided Reframing" in navigation
2. Enter a negative thought
3. Click "Reframe with [Guide Name]"
4. Review the reframing guidance

### The 7 Guides

| Guide | Unlock Level | Therapeutic Focus |
|-------|--------------|-------------------|
| Solaire of Astora | 1 (Default) | Positive Psychology |
| Siegward of Catarina | 1 (Default) | Task Chunking & Self-Compassion |
| Artorias the Abysswalker | 1 (Default) | Trauma-Informed Care |
| Patches the Hyena | 2 | Cognitive Distortions |
| Knight Lautrec of Carim | 2 | Shadow Work |
| Slave Knight Gael | 3 | Values-Based Goals |
| Sir Alonne | 3 | Self-Discipline |

## 🔧 Troubleshooting

### "Guide not responding"
- Check edge function logs: `supabase functions logs guide-persona-chat`
- Verify Perplexity API key is set
- Check your Perplexity API quota

### "Guide not changing"
- Clear browser cache
- Check browser console for errors
- Verify database migrations ran successfully

### "Guides not unlocking"
- Check user level in database
- Verify `checkGuideUnlocks` function is running
- Check browser console for errors

## 📊 Monitoring

### Check API Usage
```bash
# View edge function logs
supabase functions logs guide-persona-chat

# Check Perplexity usage
# Visit https://www.perplexity.ai/dashboard
```

### View Statistics
```sql
-- Most popular guide
SELECT guide_name, COUNT(*) as interactions
FROM guide_interactions
GROUP BY guide_name
ORDER BY interactions DESC;

-- User engagement
SELECT COUNT(DISTINCT user_id) as active_users
FROM guide_interactions
WHERE created_at > NOW() - INTERVAL '7 days';
```

## 📚 Documentation

- **Full Documentation:** `DARK_SOULS_GUIDES_README.md`
- **Integration Guide:** `INTEGRATION_GUIDE.md`
- **Edge Function Setup:** `SUPABASE_EDGE_FUNCTION_SETUP.md`
- **Technical Details:** `DARK_SOULS_GUIDES_IMPLEMENTATION.md`

## 🆘 Need Help?

1. Check the troubleshooting section above
2. Review the full documentation
3. Check the GitHub pull request for updates
4. Review edge function logs for errors

## ✅ Verification Checklist

After setup, verify:
- [ ] Can access /codex page
- [ ] Can see all 7 guides
- [ ] Can select a guide
- [ ] Can create journal entry
- [ ] Can get guide's response
- [ ] Can reframe a thought
- [ ] Guides unlock at correct levels
- [ ] Statistics display correctly

## 🎯 Next Steps

1. Test the system with real users
2. Monitor Perplexity API usage
3. Gather user feedback
4. Customize persona prompts if needed
5. Add more interaction types (optional)

---

**Pull Request:** https://github.com/am225723/advancedcitadel/pull/13  
**Status:** Ready for deployment ✅