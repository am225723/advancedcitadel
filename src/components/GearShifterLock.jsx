import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

const GearShifterLock = ({ onSuccess }) => {
  const [sequence, setSequence] = useState([]);
  const [currentGear, setCurrentGear] = useState('N');
  const [targetSequence, setTargetSequence] = useState([1, 3, 5, 2, 4]);
  const [loading, setLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [knobPosition, setKnobPosition] = useState({ x: 120, y: 180 });
  
  const svgRef = useRef(null);
  const dragStartRef = useRef({ x: 0, y: 0 });

  const gearPositions = {
    'N': { x: 120, y: 180 },
    1: { x: 50, y: 80 },
    2: { x: 50, y: 280 },
    3: { x: 120, y: 80 },
    4: { x: 120, y: 280 },
    5: { x: 190, y: 80 },
    'R': { x: 190, y: 280 }
  };

  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('lock_configurations')
        .select('config')
        .eq('lock_type', 'gearshifter')
        .single();

      if (data?.config?.sequence) {
        setTargetSequence(data.config.sequence);
      }
    } catch (error) {
      console.error('Error loading gear configuration:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSVGCoordinates = (clientX, clientY) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());
    return { x: svgP.x, y: svgP.y };
  };

  const getNearestGear = (x, y) => {
    let nearest = 'N';
    let minDist = Infinity;
    
    Object.entries(gearPositions).forEach(([gear, pos]) => {
      const dist = Math.sqrt(Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2));
      if (dist < minDist && dist < 40) {
        minDist = dist;
        nearest = gear;
      }
    });
    
    return nearest;
  };

  const handleDragStart = (e) => {
    setIsDragging(true);
    const coords = e.touches 
      ? getSVGCoordinates(e.touches[0].clientX, e.touches[0].clientY)
      : getSVGCoordinates(e.clientX, e.clientY);
    
    dragStartRef.current = coords;
  };

  const handleDragMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    
    const coords = e.touches
      ? getSVGCoordinates(e.touches[0].clientX, e.touches[0].clientY)
      : getSVGCoordinates(e.clientX, e.clientY);
    
    let newX = coords.x;
    let newY = coords.y;
    
    newX = Math.max(28, Math.min(202, newX));
    newY = Math.max(58, Math.min(302, newY));
    
    setKnobPosition({ x: newX, y: newY });
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    const nearestGear = getNearestGear(knobPosition.x, knobPosition.y);
    const targetPos = gearPositions[nearestGear];
    setKnobPosition(targetPos);
    
    if (nearestGear !== currentGear && nearestGear !== 'N' && nearestGear !== 'R') {
      confirmGearShift(nearestGear);
    } else {
      setCurrentGear(nearestGear);
    }
  };

  const confirmGearShift = (gear) => {
    const gearNum = parseInt(gear);
    const newSequence = [...sequence, gearNum];
    setSequence(newSequence);
    setCurrentGear(gear);

    if (newSequence.length === targetSequence.length) {
      if (JSON.stringify(newSequence) === JSON.stringify(targetSequence)) {
        toast({
          title: "Access Granted! 🎉",
          description: "Perfect shift sequence! Unlocking vault..."
        });
        setTimeout(onSuccess, 1000);
      } else {
        toast({
          title: "Incorrect Sequence",
          description: "Gearbox grinding... resetting!",
          variant: "destructive"
        });
        setTimeout(() => {
          setSequence([]);
          setCurrentGear('N');
          setKnobPosition(gearPositions['N']);
        }, 1500);
      }
    } else {
      toast({
        title: `Gear ${gearNum} Engaged`,
        description: `Shift ${newSequence.length}/${targetSequence.length} complete`,
      });
    }
  };

  const reset = () => {
    setSequence([]);
    setCurrentGear('N');
    setKnobPosition(gearPositions['N']);
  };

  useEffect(() => {
    if (isDragging) {
      const handleMouseMove = (e) => handleDragMove(e);
      const handleMouseUp = () => handleDragEnd();
      const handleTouchMove = (e) => handleDragMove(e);
      const handleTouchEnd = () => handleDragEnd();

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging, knobPosition]);

  if (loading) {
    return <div className="text-center py-12 text-slate-400">Loading configuration...</div>;
  }

  return (
    <div className="space-y-8 flex flex-col items-center">
      <div className="relative w-80 h-96">
        <svg ref={svgRef} viewBox="0 0 240 360" className="w-full h-full">
          <defs>
            <linearGradient id="gate-metal-new" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#5a5a5a" />
              <stop offset="30%" stopColor="#4a4a4a" />
              <stop offset="70%" stopColor="#3a3a3a" />
              <stop offset="100%" stopColor="#2a2a2a" />
            </linearGradient>
            <radialGradient id="knob-sphere" cx="0.35" cy="0.35" r="0.65">
              <stop offset="0%" stopColor="#8a8a8a" />
              <stop offset="40%" stopColor="#5a5a5a" />
              <stop offset="80%" stopColor="#3a3a3a" />
              <stop offset="100%" stopColor="#1a1a1a" />
            </radialGradient>
            <radialGradient id="gate-slot-new" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0%" stopColor="#000000" />
              <stop offset="70%" stopColor="#0a0a0a" />
              <stop offset="100%" stopColor="#1a1a1a" />
            </radialGradient>
            <filter id="metal-shadow-new">
              <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.7"/>
            </filter>
            <filter id="deep-inset-new">
              <feGaussianBlur in="SourceAlpha" stdDeviation="4"/>
              <feOffset dx="0" dy="4" result="offsetblur"/>
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.8"/>
              </feComponentTransfer>
              <feMerge>
                <feMergeNode/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Base plate */}
          <rect x="10" y="10" width="220" height="340" rx="12" fill="url(#gate-metal-new)" stroke="#0a0a0a" strokeWidth="4" filter="url(#metal-shadow-new)"/>
          
          {/* Brushed metal texture */}
          <rect x="10" y="10" width="220" height="340" rx="12" 
            fill="url(#gate-metal-new)" 
            opacity="0.2"
            style={{ mixBlendMode: 'overlay' }}
          />
          
          {/* Rivets */}
          {[...Array(8)].map((_, i) => {
            const isTop = i < 4;
            const x = 30 + (i % 4) * 55;
            const y = isTop ? 25 : 335;
            return (
              <g key={i}>
                <circle cx={x} cy={y} r="5" fill="#1a1a1a" stroke="#0a0a0a" strokeWidth="1.5"/>
                <circle cx={x} cy={y} r="2.5" fill="#0a0a0a"/>
                <circle cx={x - 1} cy={y - 1} r="1" fill="#3a3a3a" opacity="0.6"/>
              </g>
            );
          })}
          
          {/* Shift gate slots */}
          <g filter="url(#deep-inset-new)">
            <rect x="26" y="56" width="38" height="248" rx="19" fill="url(#gate-slot-new)" stroke="#000000" strokeWidth="3"/>
            <rect x="28" y="58" width="34" height="244" rx="17" fill="none" stroke="#1a1a1a" strokeWidth="0.5" opacity="0.5"/>
            
            <rect x="96" y="56" width="38" height="248" rx="19" fill="url(#gate-slot-new)" stroke="#000000" strokeWidth="3"/>
            <rect x="98" y="58" width="34" height="244" rx="17" fill="none" stroke="#1a1a1a" strokeWidth="0.5" opacity="0.5"/>
            
            <rect x="166" y="56" width="38" height="248" rx="19" fill="url(#gate-slot-new)" stroke="#000000" strokeWidth="3"/>
            <rect x="168" y="58" width="34" height="244" rx="17" fill="none" stroke="#1a1a1a" strokeWidth="0.5" opacity="0.5"/>
          </g>

          {/* Gear labels */}
          <g style={{ fontFamily: 'Arial, sans-serif', fontWeight: '900', fontSize: '20px', userSelect: 'none' }}>
            <text x="45" y="45" textAnchor="middle" fill="#f0f0f0" stroke="#0a0a0a" strokeWidth="0.5">1</text>
            <text x="45" y="335" textAnchor="middle" fill="#f0f0f0" stroke="#0a0a0a" strokeWidth="0.5">2</text>
            <text x="115" y="45" textAnchor="middle" fill="#f0f0f0" stroke="#0a0a0a" strokeWidth="0.5">3</text>
            <text x="115" y="335" textAnchor="middle" fill="#f0f0f0" stroke="#0a0a0a" strokeWidth="0.5">4</text>
            <text x="185" y="45" textAnchor="middle" fill="#f0f0f0" stroke="#0a0a0a" strokeWidth="0.5">5</text>
            <text x="185" y="335" textAnchor="middle" fill="#dc2626" stroke="#0a0a0a" strokeWidth="0.5" fontWeight="900">R</text>
          </g>

          {/* Shift pattern diagram */}
          <g transform="translate(182, 10)">
            <rect width="50" height="50" rx="6" fill="#0a0a0a" stroke="#3a3a3a" strokeWidth="2"/>
            <text x="12" y="16" style={{ fontSize: '8px', fill: '#bbb', fontWeight: 'bold' }}>1  3  5</text>
            <line x1="11" y1="19" x2="11" y2="36" stroke="#888" strokeWidth="1"/>
            <line x1="25" y1="19" x2="25" y2="36" stroke="#888" strokeWidth="1"/>
            <line x1="39" y1="19" x2="39" y2="36" stroke="#888" strokeWidth="1"/>
            <text x="12" y="45" style={{ fontSize: '8px', fill: '#bbb', fontWeight: 'bold' }}>2  4  R</text>
          </g>

          {/* Shift boot */}
          <ellipse cx="120" cy="325" rx="42" ry="18" fill="#0a0a0a" opacity="0.9" filter="url(#metal-shadow-new)"/>
          <ellipse cx="120" cy="323" rx="38" ry="16" fill="#000000"/>
          <ellipse cx="120" cy="322" rx="34" ry="14" fill="none" stroke="#1a1a1a" strokeWidth="0.5"/>
          <ellipse cx="120" cy="323" rx="28" ry="11" fill="none" stroke="#2a2a2a" strokeWidth="0.5" strokeDasharray="3,2"/>

          {/* Shift knob (draggable) */}
          <motion.g
            animate={{
              x: knobPosition.x - 120,
              y: knobPosition.y - 180,
            }}
            transition={isDragging ? { duration: 0 } : { type: 'spring', stiffness: 500, damping: 35 }}
            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
          >
            {/* Shift shaft */}
            <rect x="115" y="150" width="10" height="55" rx="5" 
              fill="url(#knob-sphere)" 
              stroke="#1a1a1a" 
              strokeWidth="0.8" 
              filter="url(#metal-shadow-new)"
            />
            <rect x="116" y="151" width="8" height="53" rx="4" fill="none" stroke="#6a6a6a" strokeWidth="0.5" opacity="0.6"/>
            
            {/* Knob sphere */}
            <circle cx="120" cy="150" r="24" fill="url(#knob-sphere)" stroke="#2a2a2a" strokeWidth="3" filter="url(#metal-shadow-new)"/>
            <circle cx="120" cy="150" r="21" fill="none" stroke="#4a4a4a" strokeWidth="0.5"/>
            <circle cx="120" cy="150" r="18" fill="none" stroke="#3a3a3a" strokeWidth="0.5"/>
            
            {/* Leather texture */}
            <path d="M 120 131 Q 128 150 120 169" fill="none" stroke="#3a3a3a" strokeWidth="1"/>
            <path d="M 120 131 Q 112 150 120 169" fill="none" stroke="#3a3a3a" strokeWidth="1"/>
            <path d="M 105 142 Q 120 147 135 142" fill="none" stroke="#3a3a3a" strokeWidth="0.7"/>
            <path d="M 105 158 Q 120 153 135 158" fill="none" stroke="#3a3a3a" strokeWidth="0.7"/>
            
            {/* Specular highlight */}
            <ellipse cx="113" cy="142" rx="10" ry="8" fill="white" opacity="0.2"/>
            <ellipse cx="111" cy="140" rx="6" ry="4" fill="white" opacity="0.25"/>
            
            {/* Gear indicator */}
            <text x="120" y="156" textAnchor="middle" 
              style={{ 
                fontSize: '18px', 
                fontWeight: '900', 
                fill: '#fff', 
                textShadow: '0 2px 6px rgba(0,0,0,0.9)',
                pointerEvents: 'none'
              }}
            >
              {currentGear}
            </text>
          </motion.g>

          {/* Progress indicators */}
          {Object.entries(gearPositions).filter(([gear]) => gear !== 'N' && gear !== 'R').map(([gear, pos]) => {
            const isPassed = sequence.includes(parseInt(gear));
            
            return (
              <g key={gear}>
                <circle 
                  cx={pos.x} 
                  cy={pos.y} 
                  r="8" 
                  fill={isPassed ? "#22c55e" : "#2a2a2a"}
                  stroke={isPassed ? "#16a34a" : "#1a1a1a"}
                  strokeWidth="2"
                  opacity={isPassed ? "1" : "0.3"}
                />
                {isPassed && (
                  <path 
                    d={`M ${pos.x - 3} ${pos.y} L ${pos.x - 1} ${pos.y + 3} L ${pos.x + 4} ${pos.y - 4}`}
                    stroke="#fff"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                )}
              </g>
            );
          })}

          {/* Branding */}
          <text x="120" y="355" textAnchor="middle" 
            style={{ 
              fontSize: '10px', 
              fontWeight: '900', 
              fill: '#999', 
              letterSpacing: '2.5px',
              fontFamily: 'Arial, sans-serif'
            }}
          >
            MITSUBISHI EVOLUTION IV
          </text>
        </svg>
      </div>

      {/* Control panel */}
      <div className="text-center space-y-4">
        {/* Progress indicator */}
        <div className="flex justify-center space-x-2">
          {[...Array(targetSequence.length)].map((_, index) => (
            <div
              key={`progress-${index}`}
              className={`w-14 h-14 rounded-full flex items-center justify-center border-2 ${
                index < sequence.length 
                  ? 'bg-gradient-to-br from-green-600 via-green-700 to-green-900 border-green-400' 
                  : 'border-slate-700 border-dashed bg-slate-900/50'
              }`}
              style={{ boxShadow: index < sequence.length ? '0 4px 12px rgba(34, 197, 94, 0.4)' : 'none' }}
            >
              {index < sequence.length && (
                <span className="text-white font-bold text-2xl">{sequence[index]}</span>
              )}
              {index >= sequence.length && (
                <span className="text-slate-600 text-lg">{index + 1}</span>
              )}
            </div>
          ))}
        </div>

        {/* Instructions */}
        <div className="bg-slate-900/80 border border-slate-700 rounded-lg p-4 max-w-md">
          <p className="text-amber-400 font-bold text-sm mb-2">
            🎯 Drag the Shifter
          </p>
          <p className="text-slate-400 text-xs">
            Touch and drag the shift knob to each gear position in sequence
          </p>
        </div>

        {/* Reset button */}
        <Button
          onClick={reset}
          variant="outline"
          className="border-slate-600 text-slate-300 hover:bg-slate-800"
        >
          Reset to Neutral
        </Button>
      </div>
    </div>
  );
};

export default GearShifterLock;
