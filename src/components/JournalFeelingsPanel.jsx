import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Brain, Activity } from 'lucide-react';
import { Card } from '@/components/ui/card';

const JournalFeelingsPanel = ({ insights }) => {
  if (!insights || insights.type !== 'feelings' || !insights.data) {
    return null;
  }

  const data = insights.data;

  return (
    <Card className="p-5 bg-gradient-to-br from-rose-950/40 to-dark-steel/80 border-rose-500/30 mt-4 space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <Heart className="w-5 h-5 text-rose-400" />
        <h4 className="font-semibold text-rose-300 text-lg">{insights.title}</h4>
      </div>
      
      <div className="space-y-3">
        <div>
          <p className="text-sm text-slate-400 mb-2">Primary Emotions</p>
          {data.primary_emotions?.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {data.primary_emotions.map((emotion, idx) => (
                <span 
                  key={idx} 
                  className="px-3 py-1 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-full text-sm font-medium"
                >
                  {emotion}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-sm italic">
              No clear emotions detected. Try adding more detail about how you felt.
            </p>
          )}
        </div>

        {data.secondary_emotions?.length > 0 && (
          <div>
            <p className="text-sm text-slate-400 mb-2">Secondary Emotions</p>
            <div className="flex flex-wrap gap-2">
              {data.secondary_emotions.map((emotion, idx) => (
                <span 
                  key={idx} 
                  className="px-3 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full text-sm"
                >
                  {emotion}
                </span>
              ))}
            </div>
          </div>
        )}

        {data.intensity !== undefined && (
          <div>
            <p className="text-sm text-slate-400 mb-2">Emotional Intensity</p>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(Math.max(data.intensity, 0), 10) * 10}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-rose-500 to-orange-500"
                />
              </div>
              <span className="text-rose-300 font-semibold text-sm">
                {Math.min(Math.max(data.intensity, 0), 10)}/10
              </span>
            </div>
          </div>
        )}

        {data.themes?.length > 0 && (
          <div>
            <p className="text-sm text-slate-400 mb-2 flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Themes
            </p>
            <ul className="space-y-1 text-slate-300 text-sm">
              {data.themes.map((theme, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-gold-accent mt-0.5">•</span>
                  <span>{theme}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {data.somatic_cues?.length > 0 && (
          <div>
            <p className="text-sm text-slate-400 mb-2 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Body Sensations
            </p>
            <ul className="space-y-1 text-slate-300 text-sm">
              {data.somatic_cues.map((cue, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-cyan-400 mt-0.5">•</span>
                  <span>{cue}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-rose-500/20">
        <p className="text-xs text-slate-400 leading-relaxed">
          <strong className="text-rose-300">DBT Tip:</strong> Naming emotions is a core skill. 
          Use these insights to practice emotional awareness and regulation. Notice the body 
          sensations and themes connected to your feelings.
        </p>
      </div>
    </Card>
  );
};

export default JournalFeelingsPanel;
