import React from 'react';

const LogicGrid = ({ options, settings, onSettingChange }) => {
  return (
    <div className="grid grid-cols-4 gap-2 p-2 bg-slate-800 rounded">
      {/* Header */}
      <div></div>
      {options.map(o => <div key={o} className="font-bold text-center text-cyan-400">{o}</div>)}

      {/* Rows */}
      {['Fuel', 'Timing', 'Boost'].map(param => (
        <React.Fragment key={param}>
          <div className="font-bold text-slate-300">{param}</div>
          {options.map(o => (
            <div
              key={o}
              onClick={() => onSettingChange(param, o)}
              className={`h-12 w-full rounded flex items-center justify-center cursor-pointer
                ${settings[param] === o ? 'bg-green-500' : 'bg-slate-700 hover:bg-slate-600'}
              `}
            >
              {settings[param] === o && '✓'}
            </div>
          ))}
        </React.Fragment>
      ))}
    </div>
  );
};

export default LogicGrid;
