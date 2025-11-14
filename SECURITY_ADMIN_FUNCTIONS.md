# Security Guide: Admin XP/Level Management Functions

## ⚠️ CRITICAL SECURITY REQUIREMENTS

The admin RPC functions (`admin_set_user_xp`, `admin_set_user_level`, `admin_set_user_progress`) allow privileged modification of user progression data. **Improper configuration can lead to privilege escalation vulnerabilities.**

---

## Security Architecture

### Multi-Layer Defense

1. **RLS Policies (Layer 1):** Prevent users from modifying their own `role` field
2. **Function-Level Role Checks (Layer 2):** Verify caller has `role='admin'` before executing
3. **NULL Handling (Layer 3):** Explicitly reject NULL roles to prevent bypass
4. **SECURITY DEFINER (Layer 4):** Functions run with elevated privileges but are protected by layers 1-3

---

## Required Configuration Steps

### Step 1: Run Database Migration

Execute `database_migrations_admin.sql` in your Supabase SQL Editor. This migration includes:

✅ RLS policies that prevent role self-modification  
✅ Admin RPC functions with internal role checks  
✅ get_all_users_with_profiles function for admin dashboard

### Step 2: Verify RLS Policies

After running the migration, verify these policies exist on `user_profiles`:

```sql
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'user_profiles' AND schemaname = 'public';
```

**Expected policies:**
- `Users can view own profile` (SELECT)
- `Users can update own profile except role` (UPDATE with role immutability check)
- `Only service role can modify roles` (UPDATE for service_role only)

### Step 3: Test Security

**Test 1: Non-admin cannot call admin functions**
```javascript
// As a non-admin user
const { data, error } = await supabase.rpc('admin_set_user_xp', {
  p_user_id: 'some-uuid',
  p_xp: 9999
});

// Expected: error with message "Permission denied: Only admins can modify user XP"
```

**Test 2: Users cannot change their own role**
```javascript
// As a regular user
const { error } = await supabase
  .from('user_profiles')
  .update({ role: 'admin' })
  .eq('id', userId);

// Expected: error due to RLS policy violation
```

**Test 3: Admins can call functions successfully**
```javascript
// As an admin user
const { data, error } = await supabase.rpc('admin_set_user_progress', {
  p_user_id: targetUserId,
  p_xp: 500,
  p_level: 5
});

// Expected: success, returns true
```

---

## Security Vulnerabilities Prevented

### 1. ✅ Privilege Escalation via Self-Role Modification
**Attack:** User modifies `user_profiles.role` to 'admin' then calls admin functions  
**Defense:** RLS policy prevents role column modification  
**Policy:** `Users can update own profile except role`

### 2. ✅ NULL Role Bypass
**Attack:** User without profile or with NULL role exploits NULL != 'admin' → NULL logic  
**Defense:** Explicit NULL check raises exception  
**Code:** `IF caller_role IS NULL THEN RAISE EXCEPTION...`

### 3. ✅ Direct Function Invocation
**Attack:** Non-admin user calls RPC directly via Supabase client  
**Defense:** Internal role verification before any logic executes  
**Code:** `IF caller_role IS DISTINCT FROM 'admin' THEN RAISE EXCEPTION...`

### 4. ✅ RLS Policy Gaps
**Attack:** Exploiting missing or incomplete RLS policies  
**Defense:** Comprehensive policies for SELECT and UPDATE operations  
**Policies:** All CRUD operations on user_profiles are protected

---

## Production Deployment Checklist

Before deploying to production:

- [ ] Executed `database_migrations_admin.sql` in Supabase
- [ ] Verified RLS policies exist (see Step 2)
- [ ] Tested all three security scenarios (see Step 3)
- [ ] Confirmed non-admin users get permission denied errors
- [ ] Confirmed admin users can successfully modify XP/levels
- [ ] Reviewed Supabase logs for any policy violations
- [ ] Documented who has admin role in your team
- [ ] Set up monitoring for unauthorized access attempts (optional)

---

## Monitoring & Incident Response

### Recommended Monitoring

Add logging to track admin function usage:

```sql
-- Optional: Create audit log table
CREATE TABLE admin_actions_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_user_id UUID REFERENCES auth.users(id),
  target_user_id UUID,
  action TEXT,
  old_value TEXT,
  new_value TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Incident Response

If unauthorized access is suspected:

1. Check Supabase logs for failed RPC calls
2. Review `user_profiles` for unexpected role changes
3. Audit all users with `role='admin'`
4. Consider rotating service_role key if compromised
5. Review RLS policy compliance

---

## Additional Hardening (Optional)

### Option 1: Use Service Role Key

Instead of allowing `authenticated` users to call these RPCs, call them through a secure backend:

```javascript
// Server-side (Node.js/Deno with service_role key)
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Secret!
)

// Only expose this endpoint to verified admins
app.post('/api/admin/set-user-xp', async (req, res) => {
  // Verify admin session
  if (!isAdmin(req.user)) {
    return res.status(403).json({ error: 'Forbidden' })
  }
  
  const { userId, xp } = req.body
  const { data, error } = await supabaseAdmin.rpc('admin_set_user_xp', {
    p_user_id: userId,
    p_xp: xp
  })
  
  res.json({ data, error })
})
```

### Option 2: Add Rate Limiting

Prevent brute-force attempts:

```javascript
// Client-side or middleware
const rateLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 10 // Max 10 admin actions per minute
})
```

### Option 3: Two-Factor Authentication

Require 2FA for all admin operations:

```javascript
// Before calling admin RPC
const verified = await verifyTwoFactorCode(user, code)
if (!verified) {
  throw new Error('2FA verification required for admin actions')
}
```

---

## Common Issues & Solutions

### Issue: "Permission denied: User profile not found"
**Cause:** User doesn't have a `user_profiles` row  
**Solution:** Ensure user profiles are created on signup

### Issue: "Permission denied: Only admins can modify user XP"
**Cause:** User's role is not 'admin'  
**Solution:** Verify user has correct role in database

### Issue: "new row violates row-level security policy"
**Cause:** RLS policy preventing role modification  
**Solution:** This is expected! RLS is working correctly

### Issue: Admin functions not working for admin users
**Cause:** Admin role not properly set in user_profiles  
**Solution:** Manually verify: `SELECT id, role FROM user_profiles WHERE id = 'admin-user-uuid'`

---

## Support & Questions

For security concerns or questions:
1. Review this document thoroughly
2. Check Supabase RLS documentation: https://supabase.com/docs/guides/auth/row-level-security
3. Test in a development environment first
4. Never expose service_role keys to client-side code

**Remember:** Security is a shared responsibility. While these functions have multiple layers of protection, proper deployment and configuration are essential.
