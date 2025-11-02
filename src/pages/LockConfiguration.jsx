import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Settings, Gauge, Cog, Save, RotateCcw } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

const LockConfiguration = () => {
  const [tachConfig, setTachConfig] = useState({
    checkpoint1: 2500,
    checkpoint2: 5000,
    checkpoint3: 7500,
    tolerance: 200
  });

  const [gearConfig, setGearConfig] = useState({
    sequence: [1, 3, 5, 2, 4]
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchConfigurations();
  }, []);

  const fetchConfigurations = async () => {
    setLoading(true);
    try {
      const { data: tachData } = await supabase
        .from('lock_configurations')
        .select('*')
        .eq('lock_type', 'tachometer')
        .single();

      const { data: gearData } = await supabase
        .from('lock_configurations')
        .select('*')
        .eq('lock_type', 'gearshifter')
        .single();

      if (tachData) {
        setTachConfig(tachData.config);
      }

      if (gearData) {
        setGearConfig(gearData.config);
      }
    } catch (error) {
      console.error('Error fetching configurations:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveTachometerConfig = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('lock_configurations')
        .upsert({
          lock_type: 'tachometer',
          config: tachConfig,
          updated_at: new Date().toISOString()
        }, { onConflict: 'lock_type' });

      if (error) throw error;

      toast({
        title: "Tachometer Configuration Saved ✓",
        description: "RPM checkpoints and tolerance updated successfully"
      });
    } catch (error) {
      console.error('Error saving tachometer config:', error);
      toast({
        title: "Error",
        description: "Failed to save tachometer configuration",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const saveGearShifterConfig = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('lock_configurations')
        .upsert({
          lock_type: 'gearshifter',
          config: gearConfig,
          updated_at: new Date().toISOString()
        }, { onConflict: 'lock_type' });

      if (error) throw error;

      toast({
        title: "Gear Shifter Configuration Saved ✓",
        description: "Gear sequence updated successfully"
      });
    } catch (error) {
      console.error('Error saving gear shifter config:', error);
      toast({
        title: "Error",
        description: "Failed to save gear shifter configuration",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = () => {
    setTachConfig({
      checkpoint1: 2500,
      checkpoint2: 5000,
      checkpoint3: 7500,
      tolerance: 200
    });
    setGearConfig({
      sequence: [1, 3, 5, 2, 4]
    });
    toast({
      title: "Reset to Defaults",
      description: "All configurations restored to default values"
    });
  };

  const updateGearSequence = (index, value) => {
    const newSequence = [...gearConfig.sequence];
    newSequence[index] = parseInt(value);
    setGearConfig({ ...gearConfig, sequence: newSequence });
  };

  return (
    <>
      <Helmet>
        <title>Lock Configuration - The Citadel Admin</title>
      </Helmet>
      
      <div className="space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gradient-gold flex items-center gap-3">
                <Settings className="w-10 h-10" />
                Lock Configuration
              </h1>
              <p className="text-slate-400 font-garamond text-lg mt-2">
                Configure security layer parameters for The Safe
              </p>
            </div>
            <Button
              onClick={resetToDefaults}
              variant="outline"
              className="border-amber-600 text-amber-500 hover:bg-amber-950/30"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset to Defaults
            </Button>
          </div>
        </motion.div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-400">Loading configurations...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Tachometer Configuration */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-dark-steel/50 border-slate-800 p-6 space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-700 pb-4">
                  <Gauge className="w-6 h-6 text-green-500" />
                  <h2 className="text-2xl font-bold text-white">Tachometer Lock</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-slate-300 mb-2 block">Checkpoint 1 (RPM)</Label>
                    <Input
                      type="number"
                      min="500"
                      max="9000"
                      step="100"
                      value={tachConfig.checkpoint1}
                      onChange={(e) => setTachConfig({ ...tachConfig, checkpoint1: parseInt(e.target.value) })}
                      className="bg-slate-900 border-slate-700 text-white text-lg font-mono"
                    />
                  </div>

                  <div>
                    <Label className="text-slate-300 mb-2 block">Checkpoint 2 (RPM)</Label>
                    <Input
                      type="number"
                      min="500"
                      max="9000"
                      step="100"
                      value={tachConfig.checkpoint2}
                      onChange={(e) => setTachConfig({ ...tachConfig, checkpoint2: parseInt(e.target.value) })}
                      className="bg-slate-900 border-slate-700 text-white text-lg font-mono"
                    />
                  </div>

                  <div>
                    <Label className="text-slate-300 mb-2 block">Checkpoint 3 (RPM)</Label>
                    <Input
                      type="number"
                      min="500"
                      max="9000"
                      step="100"
                      value={tachConfig.checkpoint3}
                      onChange={(e) => setTachConfig({ ...tachConfig, checkpoint3: parseInt(e.target.value) })}
                      className="bg-slate-900 border-slate-700 text-white text-lg font-mono"
                    />
                  </div>

                  <div>
                    <Label className="text-slate-300 mb-2 block">Tolerance (±RPM)</Label>
                    <Input
                      type="number"
                      min="50"
                      max="500"
                      step="50"
                      value={tachConfig.tolerance}
                      onChange={(e) => setTachConfig({ ...tachConfig, tolerance: parseInt(e.target.value) })}
                      className="bg-slate-900 border-slate-700 text-white text-lg font-mono"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Users can be ±{tachConfig.tolerance} RPM from target
                    </p>
                  </div>

                  <div className="pt-4">
                    <div className="bg-slate-950/50 border border-slate-700 rounded p-4 space-y-2">
                      <p className="text-sm font-semibold text-amber-400">Preview:</p>
                      <p className="text-sm text-slate-300">
                        Checkpoint 1: {tachConfig.checkpoint1} RPM (±{tachConfig.tolerance})
                      </p>
                      <p className="text-sm text-slate-300">
                        Checkpoint 2: {tachConfig.checkpoint2} RPM (±{tachConfig.tolerance})
                      </p>
                      <p className="text-sm text-slate-300">
                        Checkpoint 3: {tachConfig.checkpoint3} RPM (±{tachConfig.tolerance})
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={saveTachometerConfig}
                  disabled={saving}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-6"
                >
                  <Save className="w-5 h-5 mr-2" />
                  Save Tachometer Config
                </Button>
              </Card>
            </motion.div>

            {/* Gear Shifter Configuration */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-dark-steel/50 border-slate-800 p-6 space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-700 pb-4">
                  <Cog className="w-6 h-6 text-amber-500" />
                  <h2 className="text-2xl font-bold text-white">Gear Shifter Lock</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-slate-300 mb-3 block">Gear Sequence (5 positions)</Label>
                    <div className="grid grid-cols-5 gap-3">
                      {gearConfig.sequence.map((gear, index) => (
                        <div key={index} className="space-y-2">
                          <Label className="text-xs text-slate-500 text-center block">
                            Position {index + 1}
                          </Label>
                          <Input
                            type="number"
                            min="1"
                            max="5"
                            value={gear}
                            onChange={(e) => updateGearSequence(index, e.target.value)}
                            className="bg-slate-900 border-slate-700 text-white text-2xl font-bold text-center h-16"
                          />
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-slate-500 mt-3">
                      Enter gears 1-5 only. Sequence must be exactly 5 gears.
                    </p>
                  </div>

                  <div className="pt-4">
                    <div className="bg-slate-950/50 border border-slate-700 rounded p-4 space-y-2">
                      <p className="text-sm font-semibold text-amber-400">Preview:</p>
                      <div className="flex items-center justify-center gap-2 text-3xl font-bold text-white">
                        {gearConfig.sequence.map((gear, idx) => (
                          <React.Fragment key={idx}>
                            <span className="bg-amber-600 w-14 h-14 rounded-full flex items-center justify-center">
                              {gear}
                            </span>
                            {idx < gearConfig.sequence.length - 1 && (
                              <span className="text-slate-600">→</span>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-950/30 border border-blue-800/50 rounded p-4 mt-4">
                    <p className="text-sm text-blue-300">
                      <strong>Note:</strong> Users must drag the shift knob through this exact sequence 
                      to unlock the vault. Make sure the sequence is memorable but secure.
                    </p>
                  </div>
                </div>

                <Button
                  onClick={saveGearShifterConfig}
                  disabled={saving}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-6"
                >
                  <Save className="w-5 h-5 mr-2" />
                  Save Gear Shifter Config
                </Button>
              </Card>
            </motion.div>
          </div>
        )}
      </div>
    </>
  );
};

export default LockConfiguration;
