import React, { useState } from 'react';
import { BookOpen, BrainCircuit, RefreshCw } from 'lucide-react';
import { DialectTrack } from '../types';

export const VocabVault: React.FC<{ selectedDialect: DialectTrack }> = ({ selectedDialect }) => {
  const [flipped, setFlipped] = useState(false);

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-950 text-slate-100 flex flex-col items-center justify-center">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center justify-center gap-3 mb-2">
            <BookOpen className="text-emerald-400" /> Vocab Vault
          </h1>
          <p className="text-slate-400">Your spaced-repetition deck for {selectedDialect.dialect}.</p>
        </div>

        <div 
          onClick={() => setFlipped(!flipped)}
          className="w-full h-80 bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-3xl p-8 flex flex-col items-center justify-center cursor-pointer shadow-2xl transition-all relative overflow-hidden group"
        >
          <div className="absolute top-4 right-4 text-slate-500 group-hover:text-emerald-400 transition-colors">
            <RefreshCw size={20} />
          </div>
          <span className="text-4xl font-black text-white mb-4">
            {flipped ? "Awesome / Cool / Tough" : "Wa3er / Zwin (واعر / زوين)"}
          </span>
          <p className="text-sm text-slate-400">Tap to flip</p>
        </div>

        <button className="px-8 py-4 rounded-full bg-emerald-500 text-slate-950 font-black flex items-center justify-center gap-2 mx-auto hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20">
          <BrainCircuit size={18} /> Start Daily Drill
        </button>
      </div>
    </div>
  );
};
