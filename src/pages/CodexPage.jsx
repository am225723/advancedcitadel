// src/pages/CodexPage.jsx
// Main page for the Codex - Guide selection and lore

import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { BookOpen, Users, TrendingUp, History } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import GuideSelector from '@/components/GuideSelector';
import { useUser } from '@/contexts/UserContext';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { getGuideStats, getGuideInteractionHistory } from '@/lib/guideService';
import { getPersona } from '@/lib/personaConfig';

const CodexPage = () => {
  const [guideStats, setGuideStats] = useState([]);
  const [recentInteractions, setRecentInteractions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  const { session } = useAuth();

  useEffect(() => {
    if (session?.user?.id) {
      loadData();
    }
  }, [session?.user?.id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [stats, history] = await Promise.all([
        getGuideStats(session.user.id),
        getGuideInteractionHistory(session.user.id, 10),
      ]);

      setGuideStats(stats);
      setRecentInteractions(history);
    } catch (error) {
      console.error('Error loading codex data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getInteractionTypeLabel = (type) => {
    const labels = {
      journal: 'Journal Entry',
      reframe: 'Thought Reframing',
      chat: 'Conversation',
    };
    return labels[type] || type;
  };

  return (
    <>
      <Helmet>
        <title>The Codex - The Citadel</title>
        <meta
          name="description"
          content="Choose your therapeutic guide and view your journey's history"
        />
      </Helmet>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <div className="flex items-center justify-center space-x-3">
            <BookOpen className="w-12 h-12 text-gold-accent" />
            <h1 className="text-4xl font-bold text-gradient-gold font-cinzel">
              The Codex
            </h1>
          </div>
          <p className="text-xl text-slate-400 font-garamond max-w-2xl mx-auto">
            The ancient tome of guides and companions. Choose your mentor wisely,
            for they will shape your journey through the darkness.
          </p>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="guides" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-dark-steel/50">
            <TabsTrigger value="guides" className="data-[state=active]:bg-gold-accent/20">
              <Users className="w-4 h-4 mr-2" />
              Guides
            </TabsTrigger>
            <TabsTrigger value="stats" className="data-[state=active]:bg-gold-accent/20">
              <TrendingUp className="w-4 h-4 mr-2" />
              Statistics
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-gold-accent/20">
              <History className="w-4 h-4 mr-2" />
              History
            </TabsTrigger>
          </TabsList>

          {/* Guides Tab */}
          <TabsContent value="guides" className="mt-6">
            <GuideSelector onGuideSelected={loadData} />
          </TabsContent>

          {/* Statistics Tab */}
          <TabsContent value="stats" className="mt-6">
            <div className="space-y-6">
              <Card className="bg-dark-steel/50 border-slate-800 p-6">
                <h2 className="text-2xl font-bold text-gradient-gold mb-4 font-cinzel">
                  Your Journey Statistics
                </h2>

                {loading ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-accent"></div>
                  </div>
                ) : guideStats.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400 font-garamond">
                      Begin your journey by interacting with your guides
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {guideStats.map((stat) => {
                      const persona = getPersona(stat.guide_name);
                      if (!persona) return null;

                      return (
                        <Card
                          key={stat.guide_name}
                          className="bg-black/20 border-slate-800 p-4"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div
                                className="w-12 h-12 rounded-full flex items-center justify-center"
                                style={{ backgroundColor: `${persona.color}20` }}
                              >
                                <Users
                                  className="w-6 h-6"
                                  style={{ color: persona.color }}
                                />
                              </div>
                              <div>
                                <h3 className="font-semibold text-white">
                                  {persona.name}
                                </h3>
                                <p className="text-sm text-slate-500">
                                  {persona.title}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-gold-accent">
                                {stat.interaction_count}
                              </div>
                              <div className="text-xs text-slate-500">
                                interactions
                              </div>
                            </div>
                          </div>
                          {stat.last_interaction && (
                            <div className="mt-3 pt-3 border-t border-slate-800 text-xs text-slate-500">
                              Last interaction: {formatDate(stat.last_interaction)}
                            </div>
                          )}
                        </Card>
                      );
                    })}
                  </div>
                )}
              </Card>

              {/* Total Stats */}
              {guideStats.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-gradient-to-br from-gold-accent/10 to-transparent border-gold-accent/30 p-6 text-center">
                    <div className="text-3xl font-bold text-gold-accent mb-2">
                      {guideStats.reduce((sum, stat) => sum + parseInt(stat.interaction_count), 0)}
                    </div>
                    <div className="text-sm text-slate-400">Total Interactions</div>
                  </Card>
                  <Card className="bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/30 p-6 text-center">
                    <div className="text-3xl font-bold text-blue-400 mb-2">
                      {guideStats.length}
                    </div>
                    <div className="text-sm text-slate-400">Guides Consulted</div>
                  </Card>
                  <Card className="bg-gradient-to-br from-purple-500/10 to-transparent border-purple-500/30 p-6 text-center">
                    <div className="text-3xl font-bold text-purple-400 mb-2">
                      {user?.level || 1}
                    </div>
                    <div className="text-sm text-slate-400">Current Level</div>
                  </Card>
                </div>
              )}
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="mt-6">
            <Card className="bg-dark-steel/50 border-slate-800 p-6">
              <h2 className="text-2xl font-bold text-gradient-gold mb-4 font-cinzel">
                Recent Interactions
              </h2>

              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-accent"></div>
                </div>
              ) : recentInteractions.length === 0 ? (
                <div className="text-center py-12">
                  <History className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400 font-garamond">
                    Your journey history will appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentInteractions.map((interaction) => {
                    const persona = getPersona(interaction.guide_name);
                    if (!persona) return null;

                    return (
                      <Card
                        key={interaction.id}
                        className="bg-black/20 border-slate-800 p-4"
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: `${persona.color}20` }}
                          >
                            <Users
                              className="w-5 h-5"
                              style={{ color: persona.color }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <h3 className="font-semibold text-white text-sm">
                                  {persona.name}
                                </h3>
                                <p className="text-xs text-slate-500">
                                  {getInteractionTypeLabel(interaction.interaction_type)}
                                </p>
                              </div>
                              <span className="text-xs text-slate-500">
                                {formatDate(interaction.created_at)}
                              </span>
                            </div>
                            <div className="space-y-2">
                              <div className="text-sm text-slate-400 line-clamp-2">
                                <span className="text-slate-500 font-semibold">You: </span>
                                {interaction.user_input}
                              </div>
                              <div className="text-sm text-slate-300 line-clamp-3 italic">
                                <span className="text-gold-accent font-semibold">
                                  {persona.name}:{' '}
                                </span>
                                {interaction.guide_response}
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default CodexPage;