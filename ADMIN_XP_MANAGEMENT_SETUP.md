# Admin XP/Level Management - Secure Implementation Guide

## ⚠️ SECURITY NOTICE

The admin XP/level management functions in `database_migrations_admin.sql` contain a **known security vulnerability** when called directly from the client. 

**DO NOT deploy these functions to production as-is.**

---

## Problem Statement

The RPC functions (`admin_set_user_xp`, `admin_set_user_level`, `admin_set_user_progress`) are vulnerable to privilege escalation because:

1. They are callable by the `authenticated` role (required for client-side RPC)
2. RLS policies cannot reliably prevent role self-modification
3. Internal role checks depend on mutable `user_profiles.role` data

**Attack Vector:** A malicious user could potentially modify their role to 'admin' and then call these functions.

---

## Recommended Solutions

Choose ONE of the following secure implementations:

### ✅ Solution 1: Use Supabase Admin API (RECOMMENDED)

Don't use RPC functions at all. Instead, use Supabase's built-in Admin API with service_role key on your backend.

**Backend Implementation (Node.js/Deno):**
```javascript
import { createClient } from '@supabase/supabase-js'

// Server-side only - NEVER expose service_role key to client!
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Keep this secret!
)

// Secure API endpoint (protected by your auth middleware)
app.post('/api/admin/update-user-progress', async (req, res) => {
  // 1. Verify the requesting user is an admin
  const requestingUser = await getAuthenticatedUser(req)
  if (requestingUser.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Admin access required' })
  }
  
  // 2. Update user XP/level directly via Admin API
  const { userId, xp, level } = req.body
  
  const { data, error } = await supabaseAdmin
    .from('user_profiles')
    .update({ 
      xp: xp,
      level: level,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)
  
  if (error) {
    return res.status(500).json({ error: error.message })
  }
  
  res.json({ success: true, data })
})
```

**Frontend Implementation:**
```javascript
// In UserManagementPage.jsx - call your secure backend endpoint
const handleUpdateXP = async (userId, newXP, newLevel) => {
  try {
    const response = await fetch('/api/admin/update-user-progress', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({ userId, xp: newXP, level: newLevel })
    })
    
    if (!response.ok) {
      throw new Error('Failed to update user progress')
    }
    
    toast({ title: 'Success', description: 'User XP/level updated' })
    fetchUsers() // Refresh list
  } catch (error) {
    toast({ 
      variant: 'destructive',
      title: 'Error',
      description: error.message
    })
  }
}
```

**Pros:**
- ✅ Most secure - no client-side RPC vulnerabilities
- ✅ Full control over authorization logic
- ✅ Can add audit logging, rate limiting, etc.
- ✅ Standard practice for sensitive operations

**Cons:**
- ❌ Requires backend server (can't use Replit client-only deployment)
- ❌ More complex infrastructure

---

### ✅ Solution 2: Database Trigger + Function Revocation

Keep RPC functions but make them truly admin-only using database triggers.

**Step 1: Add immutable role trigger**
```sql
-- Create trigger function to prevent role changes
CREATE OR REPLACE FUNCTION prevent_role_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Allow service_role to change roles
  IF current_setting('request.jwt.claims', true)::json->>'role' = 'service_role' THEN
    RETURN NEW;
  END IF;
  
  -- Allow initial role setting (INSERT)
  IF TG_OP = 'INSERT' THEN
    RETURN NEW;
  END IF;
  
  -- Prevent role changes for all other cases
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    RAISE EXCEPTION 'Cannot modify user role. Contact administrator.';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to user_profiles
DROP TRIGGER IF EXISTS enforce_immutable_role ON user_profiles;
CREATE TRIGGER enforce_immutable_role
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION prevent_role_change();
```

**Step 2: Revoke and restrict RPC access**
```sql
-- Revoke from authenticated role
REVOKE EXECUTE ON FUNCTION admin_set_user_xp(UUID, INTEGER) FROM authenticated;
REVOKE EXECUTE ON FUNCTION admin_set_user_level(UUID, INTEGER) FROM authenticated;
REVOKE EXECUTE ON FUNCTION admin_set_user_progress(UUID, INTEGER, INTEGER) FROM authenticated;

-- These functions can now only be called via service_role key
-- Your backend must use service_role to call them
```

**Step 3: Call via backend with service_role**
```javascript
// Same as Solution 1, but using RPC instead of direct update
const { data, error } = await supabaseAdmin.rpc('admin_set_user_progress', {
  p_user_id: userId,
  p_xp: xp,
  p_level: level
})
```

**Pros:**
- ✅ Database-enforced role immutability
- ✅ Uses existing RPC functions
- ✅ Clear separation of concerns

**Cons:**
- ❌ Still requires backend server
- ❌ More complex database setup
- ❌ Trigger overhead on all profile updates

---

### ⚠️ Solution 3: Manual Admin Dashboard Only (Quick Fix)

For development/testing only - don't use in production.

**Remove admin UI from UserManagementPage:**
```javascript
// Comment out or remove the Edit XP/Level dialog
// Admins must manually update database via Supabase Dashboard

// In UserManagementPage.jsx, remove:
// - Edit XP/Level button
// - EditXPLevelDialog component
// - All RPC calls to admin functions
```

**Manual Process:**
1. Admin logs into Supabase Dashboard
2. Navigates to Table Editor → user_profiles
3. Manually edits XP/level values
4. Saves changes

**Pros:**
- ✅ Zero security risk
- ✅ No code changes needed
- ✅ Works immediately

**Cons:**
- ❌ Poor UX for admins
- ❌ No audit trail
- ❌ Not scalable

---

## Migration Path

**For Development (Now):**
- Use Solution 3 (manual dashboard) or accept the security risk in dev environment
- Document the limitation clearly

**For Production (Before Launch):**
- Implement Solution 1 (Admin API with backend) - STRONGLY RECOMMENDED
- OR implement Solution 2 (Database trigger + service_role)
- Test thoroughly in staging environment
- Add audit logging
- Set up monitoring

---

## Current Implementation Status

**What's Included:**
✅ RPC functions with internal role checks  
✅ Security documentation  
✅ Frontend UI in UserManagementPage  
⚠️ **NOT production-ready due to privilege escalation vulnerability**

**What's Required:**
❌ Backend server with service_role key  
❌ Secure API endpoints for admin operations  
❌ Database trigger for role immutability (if using Solution 2)  
❌ Proper testing and security audit

---

## Testing Security

After implementing your chosen solution, test these scenarios:

**Test 1: Non-admin cannot escalate**
```javascript
// As regular user, try to change role (should fail)
const { error } = await supabase
  .from('user_profiles')
  .update({ role: 'admin' })
  .eq('id', myUserId)

// Expected: Error - trigger or RLS blocks change
console.log(error) // Should not be null
```

**Test 2: Non-admin cannot call admin functions**
```javascript
// As regular user, try to call admin endpoint (should fail)
const response = await fetch('/api/admin/update-user-progress', {
  method: 'POST',
  body: JSON.stringify({ userId: someId, xp: 9999, level: 99 })
})

// Expected: 403 Forbidden
console.log(response.status) // Should be 403
```

**Test 3: Admin can update XP/level**
```javascript
// As admin user, update another user's progress (should succeed)
const response = await fetch('/api/admin/update-user-progress', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${adminToken}` },
  body: JSON.stringify({ userId: targetId, xp: 500, level: 5 })
})

// Expected: 200 Success
console.log(response.status) // Should be 200
```

---

## Decision Matrix

| Criteria | Solution 1 (Admin API) | Solution 2 (Trigger) | Solution 3 (Manual) |
|----------|----------------------|---------------------|-------------------|
| **Security** | ⭐⭐⭐⭐⭐ Excellent | ⭐⭐⭐⭐ Very Good | ⭐⭐⭐⭐⭐ Perfect |
| **UX** | ⭐⭐⭐⭐⭐ Excellent | ⭐⭐⭐⭐⭐ Excellent | ⭐ Poor |
| **Complexity** | ⭐⭐⭐ Moderate | ⭐⭐⭐⭐ High | ⭐⭐⭐⭐⭐ Simple |
| **Scalability** | ⭐⭐⭐⭐⭐ Excellent | ⭐⭐⭐⭐ Very Good | ⭐ Poor |
| **Audit Trail** | ⭐⭐⭐⭐⭐ Easy to add | ⭐⭐⭐⭐ Moderate | ⭐ Manual only |
| **Recommended For** | **Production** | Advanced users | Dev/testing only |

---

##  Conclusion

**For Production:** Use **Solution 1 (Admin API)**  
**For Development:** Use **Solution 3 (Manual)** until backend is ready  
**Never:** Deploy the current RPC functions directly callable from client

Questions? Review the security vulnerabilities section in `SECURITY_ADMIN_FUNCTIONS.md` and choose the solution that best fits your infrastructure.
