
import React from 'react';
import { Icons } from '../constants';

interface InputSectionProps {
  billAmount: number;
  setBillAmount: (val: number) => void;
  afa: number;
  setAfa: (val: number) => void;
}

const InputSection: React.FC<InputSectionProps> = ({ billAmount, setBillAmount, afa, setAfa }) => {
  const commonRates = [
    { label: 'Rebate (≤ 600kWh)', value: -0.0200 },
    { label: 'No Surcharge (601-1500kWh)', value: 0.0000 },
    { label: 'Surcharge (> 1500kWh)', value: 0.1000 },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
        <Icons.Banknote className="w-5 h-5 text-green-600" />
        Energy Parameters
      </h2>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Monthly TNB Bill Amount (RM)</label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-serif">RM</div>
            <input 
              type="number" 
              min="0" 
              step="0.01" 
              value={billAmount === 0 ? '' : billAmount} 
              onChange={(e) => setBillAmount(Math.max(0, Number(e.target.value)))} 
              className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-lg font-medium text-slate-900" 
              placeholder="e.g. 250.00" 
            />
          </div>
          <p className="text-xs text-slate-500 mt-2">Enter your total monthly electricity bill amount.</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">AFA / ICPT Rate (RM/kWh)</label>
          <div className="relative mb-3">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <Icons.Activity className="w-4 h-4" />
            </div>
            <input 
              type="number" 
              step="0.0001" 
              value={afa} 
              onChange={(e) => setAfa(Number(e.target.value))} 
              className="w-full pl-10 pr-12 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-lg font-medium text-slate-900" 
              placeholder="0.00" 
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">RM</span>
          </div>
          
          <div className="grid grid-cols-1 gap-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Quick Select (Residential Tiers)</p>
            <div className="flex flex-wrap gap-2">
              {commonRates.map((rate) => (
                <button
                  key={rate.value}
                  onClick={() => setAfa(rate.value)}
                  className={`text-[10px] px-2 py-1.5 rounded-md border transition-all font-semibold ${
                    afa === rate.value 
                      ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm' 
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {rate.label}
                </button>
              ))}
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3 italic">Imbalance Cost Pass-Through. Current rates valid until June 2025.</p>
        </div>
      </div>
    </div>
  );
};

export default InputSection;
