import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { MultiBackend, TouchTransition, MouseTransition } from 'react-dnd-multi-backend';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useUser } from '@/contexts/UserContext';

const HTML5toTouch = {
  backends: [
    {
      id: 'html5',
      backend: HTML5Backend,
      transition: MouseTransition,
    },
    {
      id: 'touch',
      backend: TouchBackend,
      options: { enableMouseEvents: true },
      preview: true,
      transition: TouchTransition,
    },
  ],
};

const ItemTypes = {
  TIRE: 'tire',
};

const Tire = ({ name }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.TIRE,
    item: { name },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <motion.div
      ref={drag}
      className={`p-4 bg-slate-700 rounded-lg border-2 border-cyan-500 cursor-move text-center ${
        isDragging ? 'opacity-50' : 'opacity-100'
      }`}
      whileHover={{ scale: 1.05 }}
    >
      <div className="text-4xl mb-2">🛞</div>
      <div className="text-sm font-bold text-white">{name}</div>
    </motion.div>
  );
};

const Hub = ({ position, onDrop, placedTire }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.TIRE,
    drop: (item) => onDrop(position, item.name),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={drop}
      className={`p-6 rounded-lg border-4 border-dashed ${
        isOver ? 'border-green-500 bg-green-500/20' : 'border-slate-600 bg-slate-800/50'
      } min-h-32 flex flex-col items-center justify-center transition-all`}
    >
      <p className="text-xs font-bold text-cyan-400 mb-2">{position}</p>
      {placedTire ? (
        <div className="text-center">
          <div className="text-4xl mb-1">🛞</div>
          <div className="text-xs font-bold text-white">{placedTire}</div>
        </div>
      ) : (
        <div className="text-slate-600 text-sm">Drop Here</div>
      )}
    </div>
  );
};

const TireRotationGame = ({ onComplete }) => {
  const { addXP } = useUser();
  const sourceTires = ['Front Left', 'Front Right', 'Rear Left', 'Rear Right'];
  const [placedTires, setPlacedTires] = useState({});
  
  const correctSolution = {
    'Front Left': 'Rear Right',
    'Front Right': 'Rear Left',
    'Rear Left': 'Front Right',
    'Rear Right': 'Front Left',
  };

  const handleDrop = (hub, tire) => {
    setPlacedTires(prev => ({ ...prev, [hub]: tire }));
  };

  const handleCheck = () => {
    const allPlaced = Object.keys(correctSolution).every(hub => placedTires[hub]);
    if (!allPlaced) {
      toast({
        variant: "destructive",
        title: "Incomplete!",
        description: "Place all tires before checking.",
      });
      return;
    }

    const isCorrect = Object.keys(correctSolution).every(
      hub => placedTires[hub] === correctSolution[hub]
    );

    if (isCorrect) {
      addXP(40);
      toast({
        title: "Perfect Rotation! 🎯",
        description: "You've earned +40 XP for expert tire rotation!",
      });
      setTimeout(onComplete, 1000);
    } else {
      toast({
        variant: "destructive",
        title: "Incorrect Pattern!",
        description: "That's not the standard cross-rotation. Try again!",
      });
      setPlacedTires({});
    }
  };

  const handleReset = () => {
    setPlacedTires({});
  };

  const availableTires = sourceTires.filter(
    tire => !Object.values(placedTires).includes(tire)
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Card className="bg-slate-900/80 border-cyan-500/50 p-8">
        <h3 className="text-2xl font-bold text-white flex items-center justify-center space-x-2 mb-4">
          <RefreshCw className="w-6 h-6 text-cyan-400" />
          <span>Tire Rotation Puzzle</span>
        </h3>
        <p className="text-slate-400 mb-6 text-center">
          Drag tires to the correct hubs for a proper cross-rotation pattern.
        </p>

        <div className="flex gap-8">
          <div className="w-48 space-y-3">
            <h4 className="text-sm font-bold text-cyan-400 mb-2">Available Tires:</h4>
            {availableTires.map(tire => (
              <Tire key={tire} name={tire} />
            ))}
          </div>

          <div className="flex-1">
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
              <Hub 
                position="Front Left" 
                onDrop={handleDrop}
                placedTire={placedTires['Front Left']}
              />
              <Hub 
                position="Front Right" 
                onDrop={handleDrop}
                placedTire={placedTires['Front Right']}
              />
              <Hub 
                position="Rear Left" 
                onDrop={handleDrop}
                placedTire={placedTires['Rear Left']}
              />
              <Hub 
                position="Rear Right" 
                onDrop={handleDrop}
                placedTire={placedTires['Rear Right']}
              />
            </div>

            <div className="flex justify-center gap-4 mt-6">
              <Button
                onClick={handleCheck}
                className="bg-green-600 hover:bg-green-700"
              >
                Check Rotation
              </Button>
              <Button
                onClick={handleReset}
                variant="outline"
                className="border-slate-600"
              >
                Reset
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

const TireRotation = (props) => (
  <DndProvider backend={MultiBackend} options={HTML5toTouch}>
    <TireRotationGame {...props} />
  </DndProvider>
);

export default TireRotation;
