import React, { useState, useMemo } from 'react';
import InputSection from './components/InputSection';
import BillSummary from './components/BillSummary';
import SolarSizing from './components/SolarSizing';
import { calculateBill, calculateKWhFromBill } from './utils/calculations';

const App: React.FC = () => {
  const [billAmount, setBillAmount] = useState(0);
  const [afaRate, setAfaRate] = useState(0.00); 

  const estimatedKWh = useMemo(() => calculateKWhFromBill(billAmount, afaRate), [billAmount, afaRate]);
  const results = useMemo(() => calculateBill(estimatedKWh, afaRate), [estimatedKWh, afaRate]);

  return (
    <div className="min-h-screen bg-slate-50 pb-12 flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="https://www.google.com/s2/favicons?domain=www.solarpanels.my&sz=128" alt="ETERNALGY Logo" className="h-10 w-10 rounded-lg" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              ETERNALGY <span className="text-blue-600">Solar Calculator</span>
            </h1>
          </div>
          <div className="text-sm font-medium text-slate-500 hidden sm:block">
            Malaysia Electricity Reverse Calculator
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-6">
            <InputSection 
              billAmount={billAmount} 
              setBillAmount={setBillAmount} 
              afa={afaRate} 
              setAfa={setAfaRate} 
            />
            <div className="bg-slate-100 rounded-lg p-5 text-sm text-slate-600 space-y-3">
              <h4 className="font-semibold text-slate-800">Calculation Engine:</h4>
              <p className="text-xs text-slate-500 mb-2">We estimate your usage (kWh) based on the bill amount provided.</p>
              <ul className="list-disc pl-4 space-y-1">
                <li><strong className="text-slate-800">Energy Charge:</strong> RM 0.2703/kWh (Base). RM 0.3703/kWh if total &gt; 1500 kWh.</li>
                <li><strong className="text-slate-800">Capacity Charge:</strong> RM 0.0455/kWh.</li>
                <li><strong className="text-slate-800">Network Charge:</strong> RM 0.1285/kWh.</li>
                <li><strong className="text-slate-800">Retail Charge:</strong> RM 10.00 if usage &gt; 600 kWh.</li>
                <li><strong className="text-strong text-slate-800">KWTBB (1.6%):</strong> On Energy + Capacity + Network.</li>
                <li><strong className="text-slate-800">SST (8%):</strong> On taxable portion (&gt;600 kWh).</li>
                <li><strong className="text-emerald-700">EEI Rebate:</strong> Applied flat rate based on total usage tier.</li>
              </ul>
            </div>
          </div>
          <div className="lg:col-span-8 space-y-8">
            <BillSummary data={results} usage={estimatedKWh} afaRate={afaRate} />
            <SolarSizing requiredKWh={estimatedKWh} afaRate={afaRate} />
          </div>
        </div>
      </main>
      
      <footer className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pb-12 w-full">
        <div className="border-t border-slate-200 pt-8 text-center">
          <p className="font-semibold text-slate-700 mb-2">
            &copy; {new Date().getFullYear()} Eternalgy Sdn Bhd <span className="font-normal text-slate-500">202301029164 (1523087-A)</span>
          </p>
          <p className="text-xs text-slate-500 max-w-3xl mx-auto leading-relaxed mb-2">
            This solar calculator is the proprietary property of Eternalgy Sdn Bhd. Usage is strictly limited to authorized personnel only. Unauthorized reproduction or distribution will result in legal action.
          </p>
          <p className="text-xs text-slate-400 max-w-3xl mx-auto leading-relaxed font-medium">
            本太阳能计算器归 Eternalgy Sdn Bhd 202301029164 (1523087-A) 所有。仅限获授权人士使用。翻版必究。
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;