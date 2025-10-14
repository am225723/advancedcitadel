import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Plus, Trash2, Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const RiteScribe = ({ isOpen, onClose, onSaveRite, existingRites }) => {
  const [riteName, setRiteName] = useState('');
  const [inhale, setInhale] = useState(4);
  const [hold, setHold] = useState(4);
  const [exhale, setExhale] = useState(4);
  const [holdAfter, setHoldAfter] = useState(4);
  const [customRites, setCustomRites] = useState([]);

  useEffect(() => {
    // Load custom rites from localStorage
    const saved = localStorage.getItem('customBreathingRites');
    if (saved) {
      try {
        setCustomRites(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load custom rites:', e);
      }
    }
  }, [isOpen]);

  const saveCustomRite = () => {
    if (!riteName.trim()) {
      alert('Please enter a name for your rite');
      return;
    }

    const newRite = {
      name: riteName,
      rite: { inhale, hold, exhale, holdAfter },
      created: new Date().toISOString()
    };

    const updated = [...customRites, newRite];
    setCustomRites(updated);
    localStorage.setItem('customBreathingRites', JSON.stringify(updated));

    // Notify parent component
    onSaveRite(riteName, { inhale, hold, exhale, holdAfter });

    // Reset form
    setRiteName('');
    setInhale(4);
    setHold(4);
    setExhale(4);
    setHoldAfter(4);
  };

  const deleteCustomRite = (index) => {
    const updated = customRites.filter((_, i) => i !== index);
    setCustomRites(updated);
    localStorage.setItem('customBreathingRites', JSON.stringify(updated));
  };

  const loadRite = (rite) => {
    setRiteName(rite.name);
    setInhale(rite.rite.inhale);
    setHold(rite.rite.hold);
    setExhale(rite.rite.exhale);
    setHoldAfter(rite.rite.holdAfter);
  };

  const exportRites = () => {
    const dataStr = JSON.stringify(customRites, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'breathing-rites.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const importRites = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        const updated = [...customRites, ...imported];
        setCustomRites(updated);
        localStorage.setItem('customBreathingRites', JSON.stringify(updated));
      } catch (error) {
        alert('Failed to import rites. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  const totalCycleTime = inhale + hold + exhale + holdAfter;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-yellow-400/30 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto">
              {/* Header */}
              <div className="sticky top-0 bg-slate-900/95 backdrop-blur border-b border-yellow-400/20 p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-cinzel text-yellow-400 mb-1">The Rite Scribe</h2>
                  <p className="text-sm text-slate-400">Craft your own breathing rituals</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="text-slate-400 hover:text-yellow-400"
                >
                  <X className="w-6 h-6" />
                </Button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Create New Rite */}
                <div className="space-y-4">
                  <h3 className="text-lg font-cinzel text-yellow-400/90">Create New Rite</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="riteName" className="text-slate-300">Rite Name</Label>
                      <Input
                        id="riteName"
                        value={riteName}
                        onChange={(e) => setRiteName(e.target.value)}
                        placeholder="Enter a name for your rite..."
                        className="bg-slate-800/50 border-slate-700 text-slate-200 mt-1"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="inhale" className="text-slate-300">Inhale (seconds)</Label>
                        <Input
                          id="inhale"
                          type="number"
                          min="0"
                          max="30"
                          value={inhale}
                          onChange={(e) => setInhale(Number(e.target.value))}
                          className="bg-slate-800/50 border-slate-700 text-slate-200 mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="hold" className="text-slate-300">Hold (seconds)</Label>
                        <Input
                          id="hold"
                          type="number"
                          min="0"
                          max="30"
                          value={hold}
                          onChange={(e) => setHold(Number(e.target.value))}
                          className="bg-slate-800/50 border-slate-700 text-slate-200 mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="exhale" className="text-slate-300">Exhale (seconds)</Label>
                        <Input
                          id="exhale"
                          type="number"
                          min="0"
                          max="30"
                          value={exhale}
                          onChange={(e) => setExhale(Number(e.target.value))}
                          className="bg-slate-800/50 border-slate-700 text-slate-200 mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="holdAfter" className="text-slate-300">Hold After (seconds)</Label>
                        <Input
                          id="holdAfter"
                          type="number"
                          min="0"
                          max="30"
                          value={holdAfter}
                          onChange={(e) => setHoldAfter(Number(e.target.value))}
                          className="bg-slate-800/50 border-slate-700 text-slate-200 mt-1"
                        />
                      </div>
                    </div>

                    <div className="bg-slate-800/30 border border-slate-700 rounded p-3">
                      <p className="text-sm text-slate-400">
                        Total cycle time: <span className="text-yellow-400 font-semibold">{totalCycleTime}s</span>
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Breaths per minute: ~{Math.round(60 / totalCycleTime)}
                      </p>
                    </div>

                    <Button
                      onClick={saveCustomRite}
                      className="w-full bg-yellow-400/10 border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save Rite
                    </Button>
                  </div>
                </div>

                {/* Saved Rites */}
                {customRites.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-cinzel text-yellow-400/90">Your Rites</h3>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={exportRites}
                          className="text-slate-400 hover:text-yellow-400"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Export
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => document.getElementById('import-rites').click()}
                          className="text-slate-400 hover:text-yellow-400"
                        >
                          <Upload className="w-4 h-4 mr-1" />
                          Import
                        </Button>
                        <input
                          id="import-rites"
                          type="file"
                          accept=".json"
                          onChange={importRites}
                          className="hidden"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      {customRites.map((rite, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="bg-slate-800/30 border border-slate-700 rounded p-4 flex items-center justify-between group hover:border-yellow-400/30 transition-colors"
                        >
                          <div className="flex-1">
                            <h4 className="text-slate-200 font-semibold">{rite.name}</h4>
                            <p className="text-xs text-slate-500 mt-1">
                              {rite.rite.inhale}s / {rite.rite.hold}s / {rite.rite.exhale}s / {rite.rite.holdAfter}s
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => loadRite(rite)}
                              className="text-slate-400 hover:text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteCustomRite(index)}
                              className="text-slate-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Preset Rites Reference */}
                <div className="space-y-4">
                  <h3 className="text-lg font-cinzel text-yellow-400/90">Preset Rites</h3>
                  <div className="space-y-2">
                    <div className="bg-slate-800/20 border border-slate-700/50 rounded p-3">
                      <h4 className="text-slate-300 font-semibold text-sm">Estus Breath</h4>
                      <p className="text-xs text-slate-500 mt-1">5.5s / 0s / 5.5s / 0s - Resonance breathing</p>
                    </div>
                    <div className="bg-slate-800/20 border border-slate-700/50 rounded p-3">
                      <h4 className="text-slate-300 font-semibold text-sm">Iron Flesh</h4>
                      <p className="text-xs text-slate-500 mt-1">4s / 4s / 4s / 4s - Box breathing</p>
                    </div>
                    <div className="bg-slate-800/20 border border-slate-700/50 rounded p-3">
                      <h4 className="text-slate-300 font-semibold text-sm">Twilit Respite</h4>
                      <p className="text-xs text-slate-500 mt-1">4s / 7s / 8s / 0s - 4-7-8 breathing</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default RiteScribe;