import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Shield, LogIn, UserPlus } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = isLogin 
      ? await signIn(email, password) 
      : await signUp(email, password, displayName);
      
    if (!error) {
      if (isLogin) {
        navigate(from, { replace: true });
      }
    }
    setLoading(false);
  };

  return (
    <>
      <Helmet>
        <title>Enter The Citadel</title>
        <meta name="description" content="Login or Sign Up to access your Mental Fortress" />
      </Helmet>
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <Shield className="w-16 h-16 text-gold-accent mx-auto" />
            <h1 className="text-4xl font-bold text-gradient-gold mt-4">The Citadel</h1>
            <p className="text-slate-400 font-garamond text-lg">Your Mental Fortress Awaits.</p>
          </div>
          <Card className="bg-dark-steel/50 border-slate-800 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <h2 className="text-2xl font-bold text-white text-center">{isLogin ? 'Return to the Fortress' : 'Begin Your Journey'}</h2>
              <div className="space-y-4">
                {!isLogin && (
                  <Input
                    type="text"
                    placeholder="Display Name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                    className="bg-dark-steel/70 border-slate-700 text-white"
                  />
                )}
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-dark-steel/70 border-slate-700 text-white"
                />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-dark-steel/70 border-slate-700 text-white"
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blood-red to-red-900 text-white font-bold py-3 font-cinzel"
              >
                {loading ? 'Processing...' : (isLogin ? <><LogIn className="mr-2 h-4 w-4" /> Enter</> : <><UserPlus className="mr-2 h-4 w-4" /> Sign the Pact</>)}
              </Button>
              <p className="text-center text-sm text-slate-400">
                {isLogin ? "Not yet a warrior?" : "Already a warrior?"}
                <Button
                  type="button"
                  variant="link"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-gold-accent"
                >
                  {isLogin ? 'Sign Up' : 'Sign In'}
                </Button>
              </p>
            </form>
          </Card>
        </motion.div>
      </div>
    </>
  );
};

export default AuthPage;