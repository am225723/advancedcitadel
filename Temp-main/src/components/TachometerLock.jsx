import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from '@/components/ui/use-toast';

const Pedal = ({ children, ...props }) => (
  <motion.button
    {...props}
    whileTap={{ scale: 0.95, y: 5 }}
    className="relative w-24 h-36 bg-slate-700 rounded-md border-b-4 border-slate-900 shadow-lg group"
  >
    <div className="absolute inset-0 bg-gradient-to-b from-slate-600 to-slate-800 rounded-md"></div>
    <div className="absolute inset-1 bg-slate-800 rounded-sm p-2 flex items-center justify-center">
      <div className="w-full h-full border-2 border-slate-600 rounded-sm flex items-center justify-center">
        <span className="text-slate-300 font-bold text-lg tracking-widest">{children}</span>
      </div>
    </div>
  </motion.button>
);

const TachometerLock = ({ onSuccess }) => {
  const [rpm, setRpm] = useState(0);
  const [targetRpm] = useState(5500);
  const [isPressed, setIsPressed] = useState(false);

  useEffect(() => {
    let interval;
    if (isPressed && rpm < 9000) {
      interval = setInterval(() => {
        setRpm(prev => Math.min(prev + 100, 9000));
      }, 50);
    } else if (!isPressed && rpm > 0) {
      interval = setInterval(() => {
        setRpm(prev => Math.max(prev - 80, 0));
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isPressed, rpm]);

  const checkRpm = () => {
    const tolerance = 300;
    if (Math.abs(rpm - targetRpm) <= tolerance) {
      toast({
        title: "Success! 🎉",
        description: "Perfect rev! Moving to next security layer..."
      });
      setTimeout(onSuccess, 1000);
    } else {
      toast({
        title: "Try Again",
        description: `Target: ${targetRpm} RPM (±${tolerance})`,
        variant: "destructive"
      });
    }
  };

  const needleRotation = (rpm / 9000) * 270 - 135;

  return (
    <div className="space-y-8 flex flex-col items-center">
      <div className="relative w-80 h-80">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <defs>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <radialGradient id="bezel" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0.8" stopColor="#333" />
              <stop offset="0.95" stopColor="#555" />
              <stop offset="1" stopColor="#222" />
            </radialGradient>
          </defs>
          
          <circle cx="100" cy="100" r="100" fill="url(#bezel)" />
          <circle cx="100" cy="100" r="90" fill="#f0f0f0" />

          {Array.from({ length: 37 }).map((_, i) => {
            const angle = -135 + i * (270 / 36);
            const isMajor = i % 4 === 0;
            const isRed = i >= 28;
            const r1 = 90;
            const r2 = isMajor ? 80 : 85;
            const x1 = 100 + r1 * Math.cos(angle * Math.PI / 180);
            const y1 = 100 + r1 * Math.sin(angle * Math.PI / 180);
            const x2 = 100 + r2 * Math.cos(angle * Math.PI / 180);
            const y2 = 100 + r2 * Math.sin(angle * Math.PI / 180);
            return (
              <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={isRed ? "#dc2626" : "#333"} strokeWidth={isMajor ? "1.5" : "0.75"} />
            );
          })}

          {Array.from({ length: 10 }).map((_, i) => {
            const angle = -135 + i * 27;
            const textX = 100 + 70 * Math.cos(angle * Math.PI / 180);
            const textY = 100 + 70 * Math.sin(angle * Math.PI / 180);
            const isRed = i >= 7;
            return (
              <text key={i} x={textX} y={textY + 4} textAnchor="middle" fill={isRed ? "#dc2626" : "#111"} fontSize="14" fontWeight="bold">
                {i}
              </text>
            );
          })}
          
          <path d="M 100 10 A 90 90 0 0 1 163.6 36.4" fill="none" stroke="#dc2626" strokeWidth="4" transform="rotate(90 100 100)" />

          <text x="100" y="115" textAnchor="middle" fill="#555" fontSize="6" fontWeight="bold">TARMAC</text>
          <text x="100" y="122" textAnchor="middle" fill="#555" fontSize="6" fontWeight="bold">GRAVEL</text>
          <text x="100" y="129" textAnchor="middle" fill="#555" fontSize="6" fontWeight="bold">SNOW</text>

          <rect x="85" y="140" width="30" height="12" fill="#333" rx="1" />
          <text x="100" y="148" textAnchor="middle" fill="#f59e0b" fontSize="8" fontWeight="bold">{rpm.toFixed(0)}</text>

          <motion.line
            x1="100"
            y1="100"
            x2="100"
            y2="20"
            stroke="#dc2626"
            strokeWidth="2"
            strokeLinecap="round"
            style={{ transformOrigin: '100px 100px' }}
            animate={{ rotate: needleRotation }}
            transition={{ type: "spring", stiffness: 150, damping: 20 }}
            filter="url(#glow)"
          />
          <circle cx="100" cy="100" r="8" fill="#1a1a1a" />
          <circle cx="100" cy="100" r="9" fill="none" stroke="#333" strokeWidth="1" />
        </svg>
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-center">
          <p className="text-yellow-400 font-bold text-lg">Target: {targetRpm} RPM</p>
        </div>
      </div>

      <div className="flex justify-center space-x-8">
        <div className="flex flex-col items-center space-y-2">
          <Pedal
            onMouseDown={() => setIsPressed(true)}
            onMouseUp={() => setIsPressed(false)}
            onTouchStart={() => setIsPressed(true)}
            onTouchEnd={() => setIsPressed(false)}
          >
            GAS
          </Pedal>
          <span className="text-sm text-slate-400">Hold to Rev</span>
        </div>
        <div className="flex flex-col items-center space-y-2">
          <Pedal onClick={checkRpm}>
            CHECK
          </Pedal>
          <span className="text-sm text-slate-400">Press to Check</span>
        </div>
      </div>
    </div>
  );
};

export default TachometerLock;