import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, CheckCircle, XCircle, Forward, ShieldAlert } from 'lucide-react';
import { Card } from '@/components/ui/card';

const ReframeAnalysisPanel = ({ analysis }) => {
  if (!analysis) {
    return null;
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="space-y-6"
    >
      <h2 className="text-2xl font-bold text-center text-gradient-gold mb-4 flex items-center justify-center">
        <Lightbulb className="mr-2" />
        Analysis & Reframing
      </h2>

      {analysis.balanced_reframe && (
        <Card className="bg-black/20 border-l-4 border-gold-accent p-5">
          <h3 className="font-semibold text-lg text-gold-accent mb-2">
            A More Balanced Perspective
          </h3>
          <p className="text-lg text-slate-300 font-garamond italic">
            "{analysis.balanced_reframe}"
          </p>
        </Card>
      )}

      {(analysis.evidence_for || analysis.evidence_against) && (
        <div className="grid md:grid-cols-2 gap-6">
          {analysis.evidence_for && (
            <Card className="bg-dark-steel/30 p-5 border-slate-800">
              <h4 className="font-semibold text-white mb-3 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                Evidence For the Thought
              </h4>
              <ul className="list-disc list-inside space-y-2 text-slate-400">
                {analysis.evidence_for.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </Card>
          )}
          
          {analysis.evidence_against && (
            <Card className="bg-dark-steel/30 p-5 border-slate-800">
              <h4 className="font-semibold text-white mb-3 flex items-center">
                <XCircle className="w-5 h-5 mr-2 text-red-500" />
                Evidence Against the Thought
              </h4>
              <ul className="list-disc list-inside space-y-2 text-slate-400">
                {analysis.evidence_against.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      )}

      {analysis.cognitive_distortions && analysis.cognitive_distortions.length > 0 && (
        <Card className="bg-dark-steel/30 p-5 border-slate-800">
          <h4 className="font-semibold text-white mb-3">
            Potential Cognitive Distortions
          </h4>
          <div className="flex flex-wrap gap-2">
            {analysis.cognitive_distortions.map((item, i) => (
              <span 
                key={i} 
                className="px-3 py-1 text-sm rounded-full bg-slate-700 text-slate-300"
              >
                {item}
              </span>
            ))}
          </div>
        </Card>
      )}

      {analysis.tiny_action && (
        <Card className="bg-dark-steel/30 p-5 border-slate-800">
          <h4 className="font-semibold text-white mb-3 flex items-center">
            <Forward className="w-5 h-5 mr-2 text-cyan-400" />
            A Tiny Next Step
          </h4>
          <p className="text-slate-300">{analysis.tiny_action}</p>
        </Card>
      )}

      {analysis.safety_note && (
        <Card className="bg-red-900/30 border-l-4 border-red-500 p-5 text-center">
          <p className="text-red-300 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5 mr-2" />
            {analysis.safety_note}
          </p>
        </Card>
      )}
    </motion.div>
  );
};

export default ReframeAnalysisPanel;
