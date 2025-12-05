import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Dashboard from '@/pages/Dashboard';
import ExposureLadder from '@/pages/ExposureLadder';
import GroundingTools from '@/pages/GroundingTools';
import AdminDashboard from '@/pages/AdminDashboard';
import AdminNotesPage from '@/pages/AdminNotesPage';
import UserManagementPage from '@/pages/UserManagementPage';
import LockConfiguration from '@/pages/LockConfiguration';
import SafeView from '@/pages/SafeView';
import AuthPage from '@/pages/AuthPage';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useUser } from '@/contexts/UserContext';
import { AnimatePresence } from 'framer-motion';
import WardenNotesPage from '@/pages/WardenNotesPage';
import VirtualGarage from '@/pages/VirtualGarage';
import BonfireOfBreath from '@/pages/BonfireOfBreath';
import EnhancedBonfireOfBreath from '@/pages/EnhancedBonfireOfBreath';
import MindfulDrive from '@/pages/MindfulDrive';
import MindfulDriveEnhanced from '@/pages/MindfulDriveEnhanced';
import AIPersona from '@/components/AIPersona';
// Dark Souls Guides System
import CodexPage from '@/pages/CodexPage';
import AIJournalWithGuide from '@/pages/AIJournalWithGuide';
import CognitiveReframingWithGuide from '@/pages/CognitiveReframingWithGuide';
import MeditationsPage from '@/pages/MeditationsPage';
import ConsentForms from '@/pages/ConsentForms';

const PrivateRoute = ({ children }) => {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="flex justify-center items-center h-screen text-gold-accent font-cinzel text-2xl">Loading Fortress...</div>;
  }
  
  if (!session) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return children;
};

const AdminRoute = ({ children }) => {
  const { user: userData, loading: userLoading } = useUser();
  const { session, loading: authLoading } = useAuth();
  const location = useLocation();

  if (authLoading || userLoading) {
    return <div className="flex justify-center items-center h-screen text-gold-accent font-cinzel text-2xl">Verifying Warden's credentials...</div>;
  }

  if (!session) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (userData?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  const { session } = useAuth();
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1280px)');
    
    const handleScreenChange = (e) => {
      if (e.matches) {
        const savedPreference = localStorage.getItem('sidebarCollapsed');
        if (savedPreference !== null) {
          setIsSidebarCollapsed(savedPreference === 'true');
        }
      } else {
        setIsSidebarCollapsed(true);
      }
    };
    
    handleScreenChange(mediaQuery);
    
    mediaQuery.addEventListener('change', handleScreenChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleScreenChange);
    };
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1280px)');
    if (mediaQuery.matches) {
      localStorage.setItem('sidebarCollapsed', String(isSidebarCollapsed));
    }
  }, [isSidebarCollapsed]);

  return (
    <>
      <Helmet>
        <title>The Citadel - Your Mental Fortress</title>
        <meta name="description" content="A FromSoftware-inspired therapeutic web app for mental resilience." />
      </Helmet>
      <div className="min-h-screen bg-dark-steel text-slate-300 background-main">
        {session && <Navigation isCollapsed={isSidebarCollapsed} setCollapsed={setIsSidebarCollapsed} />}
        <main className={`p-4 sm:p-8 transition-all duration-300 ${session ? (isSidebarCollapsed ? 'xl:ml-20' : 'xl:ml-64') : ''}`}>
          <AnimatePresence mode="wait" initial={false}>
            <Routes location={location} key={location.pathname}>
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/forward-path" element={<PrivateRoute><ExposureLadder /></PrivateRoute>} />
              <Route path="/anchor" element={<PrivateRoute><GroundingTools /></PrivateRoute>} />
              <Route path="/safe" element={<PrivateRoute><SafeView /></PrivateRoute>} />
              <Route path="/garage" element={<PrivateRoute><VirtualGarage /></PrivateRoute>} />
              <Route path="/mindful-drive" element={<PrivateRoute><MindfulDriveEnhanced /></PrivateRoute>} />
              <Route path="/mindful-drive-classic" element={<PrivateRoute><MindfulDrive /></PrivateRoute>} />
              <Route path="/bonfire-of-breath" element={<PrivateRoute><BonfireOfBreath /></PrivateRoute>} />
              <Route path="/bonfire-enhanced" element={<PrivateRoute><EnhancedBonfireOfBreath /></PrivateRoute>} />
              
              {/* Dark Souls Guides System Routes */}
              <Route path="/codex" element={<PrivateRoute><CodexPage /></PrivateRoute>} />
              <Route path="/journal-guided" element={<PrivateRoute><AIJournalWithGuide /></PrivateRoute>} />
              <Route path="/reframe-guided" element={<PrivateRoute><CognitiveReframingWithGuide /></PrivateRoute>} />
              <Route path="/meditations" element={<PrivateRoute><MeditationsPage /></PrivateRoute>} />
              <Route path="/consent-forms" element={<PrivateRoute><ConsentForms /></PrivateRoute>} />
              
              <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              <Route path="/admin/notes" element={<AdminRoute><AdminNotesPage /></AdminRoute>} />
              <Route path="/admin/users" element={<AdminRoute><UserManagementPage /></AdminRoute>} />
              <Route path="/admin/locks" element={<AdminRoute><LockConfiguration /></AdminRoute>} />
              <Route path="/warden-notes" element={<AdminRoute><WardenNotesPage /></AdminRoute>} />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AnimatePresence>
        </main>
        {session && <AIPersona />}
      </div>
    </>
  );
}

export default App;