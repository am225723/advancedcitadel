import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Shield, Sun, Anchor, Scroll, Settings, Footprints, Car, Flame, ChevronLeft, ChevronRight, BookMarked, Sparkles, BrainCircuit, LogOut } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import WardenNotes from '@/components/WardenNotes';

const navItems = [
  { path: '/', label: 'Dashboard', icon: Sun },
  { path: '/codex', label: 'The Codex', icon: BookMarked },
  { path: '/journal-guided', label: 'The Reforge', icon: Sparkles },
  { path: '/reframe-guided', label: "Scribe's Chronicle", icon: BrainCircuit },
  { path: '/forward-path', label: 'Path of the Undaunted', icon: Footprints },
  { path: '/anchor', label: 'Anchor & Mantra', icon: Anchor },
  { path: '/garage', label: 'The Garage', icon: Car },
  { path: '/bonfire-enhanced', label: 'Bonfire of Breath', icon: Flame },
  { path: '/safe', label: 'The Safe', icon: Shield },
];

const NavItem = ({ item, isCollapsed }) => {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.path}
      className={({ isActive }) =>
        `flex items-center p-3 my-1 rounded-lg transition-colors duration-200 ${
          isActive
            ? 'bg-gold-accent/10 text-gold-accent'
            : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'
        } ${isCollapsed ? 'justify-center' : ''}`
      }
    >
      <Icon className={`w-5 h-5 ${isCollapsed ? '' : 'mr-4'}`} />
      <AnimatePresence>
        {!isCollapsed && (
          <motion.span 
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.2 }}
            className="font-medium whitespace-nowrap overflow-hidden"
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>
    </NavLink>
  );
};

const Navigation = ({ isCollapsed, setCollapsed }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { user: userData } = useUser();
  const { signOut } = useAuth();

  const allNavItems = [...navItems];
  if (userData?.role === 'admin') {
    allNavItems.push({ path: '/admin', label: 'Admin Panel', icon: Settings });
    allNavItems.push({ path: '/warden-notes', label: "Warden's Notes", icon: Scroll });
  }
  
  const sidebarContent = (isMobile = false) => (
    <div className="flex flex-col h-full bg-dark-steel">
      <div className={`p-4 border-b border-slate-700/50 flex items-center ${isCollapsed && !isMobile ? 'justify-center' : 'justify-between'}`}>
        <AnimatePresence>
        {!isCollapsed || isMobile ? (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <Link to="/" className="flex items-center space-x-2">
              <Shield className="w-8 h-8 text-gold-accent flex-shrink-0" />
              <span className="text-xl font-bold text-gradient-gold whitespace-nowrap">The Citadel</span>
            </Link>
          </motion.div>
        ) : <Shield className="w-8 h-8 text-gold-accent flex-shrink-0" />}
        </AnimatePresence>

        {!isMobile && (
          <Button variant="ghost" size="icon" onClick={() => setCollapsed(!isCollapsed)} className="text-slate-400 hover:text-gold-accent">
            {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
          </Button>
        )}
      </div>

      <nav className="flex-grow p-2 overflow-y-auto overflow-x-hidden">
        {allNavItems.map((item) => <NavItem key={item.path} item={item} isCollapsed={isCollapsed && !isMobile} />)}
      </nav>

      <div className={`p-4 border-t border-slate-700/50 space-y-4 ${isCollapsed && !isMobile ? 'flex flex-col items-center' : ''}`}>
        {!isCollapsed || isMobile ? <WardenNotes /> : null}
        {userData && (
          <AnimatePresence>
          {!isCollapsed || isMobile ? (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-sm w-full"
            >
              <p className="text-slate-300 font-bold text-center mb-2">{userData.display_name} the Ashen One</p>
              <div className="flex justify-between items-center text-slate-300">
                <span>Rank: {userData.level < 10 ? 'Squire' : 'Knight Errant'}</span>
                <span className="font-bold">Lvl {userData.level}</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full mt-1 overflow-hidden border border-gold-accent/20">
                <motion.div
                  className="h-full bg-gradient-to-r from-gold-accent/50 to-gold-accent"
                  initial={{ width: 0 }}
                  animate={{ width: `${(userData.xp / userData.xp_to_next_level) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <p className="text-xs text-slate-500 text-right mt-1">{userData.xp} / {userData.xp_to_next_level} XP</p>
            </motion.div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-gold-accent/20 flex items-center justify-center text-gold-accent font-bold text-xs border border-gold-accent">
              {userData.level}
            </div>
          )}
          </AnimatePresence>
        )}
        <Button onClick={signOut} variant="ghost" className={`w-full text-slate-400 hover:text-blood-red ${isCollapsed && !isMobile ? 'justify-center' : 'justify-start'}`}>
          <LogOut className={`w-5 h-5 ${isCollapsed && !isMobile ? '' : 'mr-4'}`} />
          <AnimatePresence>
            {!isCollapsed || isMobile ? (
              <motion.span initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }} transition={{ duration: 0.2 }} className="whitespace-nowrap overflow-hidden">
                Sign Out
              </motion.span>
            ) : null}
          </AnimatePresence>
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Header and Sidebar */}
      <div className="xl:hidden">
        <header className="bg-dark-steel/80 backdrop-blur-md border-b border-gold-accent/20 sticky top-0 z-40 flex items-center justify-between p-4 h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Shield className="w-8 h-8 text-gold-accent" />
            <span className="text-lg font-bold text-gradient-gold">The Citadel</span>
          </Link>
          <Button variant="ghost" size="icon" onClick={() => setIsMobileOpen(true)}>
            <Menu className="w-6 h-6" />
          </Button>
        </header>
        <AnimatePresence>
          {isMobileOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 bg-black/60 z-40"
                onClick={() => setIsMobileOpen(false)}
              />
              <motion.aside
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="fixed top-0 left-0 h-full w-64 bg-dark-steel border-r border-slate-700/50 z-50 font-cinzel"
              >
                {sidebarContent(true)}
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden xl:block">
        <motion.aside
          animate={{ width: isCollapsed ? '5rem' : '16rem' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed top-0 left-0 h-full bg-dark-steel font-cinzel z-30 overflow-hidden"
        >
          {sidebarContent()}
        </motion.aside>
      </div>
    </>
  );
};

export default Navigation;