import React, { useState, useMemo, useEffect } from 'react';
import { Icons, SYSTEM_PRICES, EPP_RATES, BASE_ENERGY_RATE, HIGH_USAGE_PENALTY } from '../constants';
import { FinanceResult, SolarResult } from '../types';
import { calculateBill, formatCurrency } from '../utils/calculations';

interface SolarSizingProps {
  requiredKWh: number;
  afaRate: number;
}

const SolarSizing: React.FC<SolarSizingProps> = ({ requiredKWh, afaRate }) => {
  const [peakHours, setPeakHours] = useState(3.4);
  const [morningUsagePercent, setMorningUsagePercent] = useState(30);
  
  const [discountPercent, setDiscountPercent] = useState(0);
  const [fixedRebate, setFixedRebate] = useState(0); 
  const [tngDiscount, setTngDiscount] = useState(0); 

  const [selectedBank, setSelectedBank] = useState("MBB (Maybank)");
  const [selectedDuration, setSelectedDuration] = useState(60);

  const PANEL_NAME = "JINKO SOLAR TIGER NEO N-TYPE";
  const PANEL_WATTAGE = 620;

  const peakHourOptions = useMemo(() => {
    const options = [];
    for (let i = 30; i <= 40; i++) options.push(i / 10);
    return options;
  }, []);

  const percentOptions = useMemo(() => {
    const options = [];
    for (let i = 10; i <= 100; i += 10) options.push(i);
    return options;
  }, []);

  const getMonthlyKWhPerPanel = () => (PANEL_WATTAGE * peakHours * 30) / 1000;
  const monthlyKWhPerPanel = getMonthlyKWhPerPanel();

  const solarResult: SolarResult = useMemo(() => {
    if (requiredKWh <= 0) return { panels: 0, systemSize: 0, generation: 0 };
    const panelsNeeded = Math.ceil(requiredKWh / monthlyKWhPerPanel);
    const systemSizeKWp = (panelsNeeded * PANEL_WATTAGE) / 1000;
    const totalGenerationKWh = panelsNeeded * monthlyKWhPerPanel;
    return { panels: panelsNeeded, systemSize: systemSizeKWp, generation: totalGenerationKWh };
  }, [requiredKWh, monthlyKWhPerPanel]);

  const getSystemPrice = (panels: number) => {
    if (panels < 8 || panels > 48) return 0;
    return SYSTEM_PRICES[panels] || 0;
  };

  const financeResult: FinanceResult = useMemo(() => {
    if (requiredKWh <= 0) return { morningOffset: 0, solarExport: 0, burnedSolar: 0, exportValue: 0, nightUsage: 0, nightBill: 0, netBill: 0, exportRate: 0 };
    
    const morningOffset = requiredKWh * (morningUsagePercent / 100);
    const rawSolarExport = Math.max(0, solarResult.generation - morningOffset);
    const nightUsage = Math.max(0, requiredKWh - morningOffset);
    
    const solarExport = Math.min(rawSolarExport, nightUsage);
    const burnedSolar = Math.max(0, rawSolarExport - nightUsage);
    
    const exportRate = nightUsage >= 1500 ? (BASE_ENERGY_RATE + HIGH_USAGE_PENALTY) : BASE_ENERGY_RATE;
    const exportValue = solarExport * exportRate;
    const nightBillData = calculateBill(nightUsage, afaRate);
    
    return { 
      morningOffset, 
      solarExport, 
      burnedSolar, 
      exportValue, 
      nightUsage, 
      nightBill: nightBillData.totalBill, 
      netBill: nightBillData.totalBill - exportValue, 
      exportRate 
    };
  }, [requiredKWh, morningUsagePercent, solarResult.generation, afaRate]);

  const originalBillAmount = calculateBill(requiredKWh, afaRate).totalBill;
  const monthlySavings = Math.max(0, originalBillAmount - financeResult.netBill);

  const totalSystemPanels = solarResult.panels;
  const baseSystemPrice = getSystemPrice(totalSystemPanels);
  
  const maxDiscountPercent = baseSystemPrice > 50000 ? 7 : (baseSystemPrice >= 30000 ? 6 : 5);
  const effectiveDiscountPercent = Math.min(discountPercent, maxDiscountPercent);
  const discountAmount = baseSystemPrice * (effectiveDiscountPercent / 100);
  const priceAfterPercentDiscount = baseSystemPrice - discountAmount;

  const maxFixedRebate = baseSystemPrice > 0 ? (priceAfterPercentDiscount < 30000 ? 600 : 1000) : 0;
  const effectiveFixedRebate = Math.min(fixedRebate, maxFixedRebate);
  const finalSystemCost = Math.max(0, priceAfterPercentDiscount - effectiveFixedRebate - tngDiscount);

  const availableDurations = useMemo(() => {
    const bankRates = EPP_RATES[selectedBank];
    if (!bankRates) return [];
    return Object.keys(bankRates).map(Number).sort((a, b) => a - b);
  }, [selectedBank]);

  useEffect(() => {
    if (!availableDurations.includes(selectedDuration)) {
      if (availableDurations.length > 0) {
        setSelectedDuration(availableDurations[availableDurations.length - 1]);
      }
    }
  }, [selectedBank, availableDurations, selectedDuration]);

  const interestRatePercent = EPP_RATES[selectedBank]?.[selectedDuration] || 0;
  const depositAmount = finalSystemCost * 0.05;
  const loanPrincipal = finalSystemCost - depositAmount;
  const totalLoanWithInterest = loanPrincipal * (1 + interestRatePercent / 100);
  const monthlyInstallment = selectedDuration > 0 ? totalLoanWithInterest / selectedDuration : 0;

  return (
    <div className="space-y-6">
      {/* System Recommendation */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-orange-50 border-b border-orange-100 p-4 flex items-center gap-3">
          <div className="bg-orange-100 p-2 rounded-lg"><Icons.Sun className="w-5 h-5 text-orange-600" /></div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Solar System Recommendation</h2>
            <p className="text-xs text-slate-500">Based on Jinko Solar 620W Panels</p>
          </div>
        </div>
        <div className="p-6 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Panel Model</label>
              <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <Icons.LayoutGrid className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="font-semibold text-slate-800 text-sm">{PANEL_NAME}</div>
                  <div className="text-xs text-slate-500">{PANEL_WATTAGE}W per panel</div>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Sun Peak Hours (Avg)</label>
              <select 
                value={peakHours} 
                onChange={(e) => setPeakHours(Number(e.target.value))} 
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white text-slate-900 font-medium cursor-pointer"
              >
                {peakHourOptions.map((val) => <option key={val} value={val}>{val.toFixed(1)} hours / day</option>)}
              </select>
            </div>
          </div>
          {solarResult.panels > 0 ? (
            <div className="bg-slate-900 text-white rounded-2xl p-6 relative overflow-hidden text-center md:text-left">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                <div>
                  <span className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Recommended</span>
                  <div className="flex items-baseline justify-center md:justify-start gap-2">
                    <span className="text-4xl font-bold text-orange-400">{solarResult.panels}</span>
                    <span className="text-lg font-medium text-slate-300">pcs</span>
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Total Capacity</span>
                  <div className="flex items-baseline justify-center md:justify-start gap-2">
                    <span className="text-3xl font-bold">{solarResult.systemSize.toFixed(2)}</span>
                    <span className="text-sm font-medium text-slate-300">kWp</span>
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Base Price</span>
                  <div className="flex items-baseline justify-center md:justify-start gap-2">
                    <span className="text-3xl font-bold text-blue-400">{getSystemPrice(solarResult.panels) > 0 ? formatCurrency(getSystemPrice(solarResult.panels)) : 'N/A'}</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-slate-800 text-center md:text-left">
                <p className="text-xs font-mono text-slate-400 tracking-wide uppercase mb-1">Calculation Formula:</p>
                <div className="text-sm font-mono text-blue-300 bg-slate-800/50 inline-block px-3 py-1.5 rounded-lg border border-slate-700/50">
                  {solarResult.panels}pcs &times; {PANEL_WATTAGE}w &times; {peakHours.toFixed(1)} hours &times; 30 days = <span className="text-blue-400 font-bold">{solarResult.generation.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kWh</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-300 font-medium">
              Enter a bill amount to see system sizing.
            </div>
          )}
        </div>
      </div>

      {requiredKWh > 0 && (
        <>
          {/* Net Bill Analysis */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-emerald-50 border-b border-emerald-100 p-4 flex items-center gap-3">
              <div className="bg-emerald-100 p-2 rounded-lg"><Icons.Coins className="w-5 h-5 text-emerald-600" /></div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Net Bill Analysis</h2>
                <p className="text-xs text-slate-500">Self-Consumption vs. Export (Capped)</p>
              </div>
            </div>
            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Morning Usage (Self-Consumption)</label>
                  <select 
                    value={morningUsagePercent} 
                    onChange={(e) => setMorningUsagePercent(Number(e.target.value))} 
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white font-bold"
                  >
                    {percentOptions.map((val) => <option key={val} value={val}>{val}% of Total Usage</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Energy Charge (Export Price)</label>
                  <div className="bg-slate-100 p-4 border rounded font-mono font-bold text-xl text-slate-700">
                    RM {financeResult.exportRate.toFixed(4)} <span className="text-xs text-slate-400 font-normal">/ kWh</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-2 italic leading-relaxed">
                    (RM 0.2703 if night usage &lt; 1500kWh; RM 0.3703 if &gt;= 1500kWh)
                    <br />Night Usage = {financeResult.nightUsage.toFixed(2)} kWh
                  </p>
                </div>
                <div className="bg-green-50 p-5 rounded-2xl border border-green-200">
                  <p className="text-xs font-bold text-green-700 uppercase mb-1">Monthly Savings</p>
                  <p className="text-4xl font-bold text-green-800">{formatCurrency(monthlySavings)}</p>
                  <p className="text-[10px] text-green-600 mt-1">Based on Estimated Original Bill: {formatCurrency(originalBillAmount)}</p>
                </div>
              </div>
              <div className="bg-slate-50 p-6 rounded-2xl border flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex justify-between border-b pb-3 items-center">
                    <div><p className="font-bold text-slate-700">Night Import</p><p className="text-xs text-slate-500">{financeResult.nightUsage.toFixed(2)} kWh</p></div>
                    <p className="font-bold text-slate-900">{formatCurrency(financeResult.nightBill)}</p>
                  </div>
                  <div className="flex justify-between border-b pb-3 items-center">
                    <div>
                      <p className="font-bold text-emerald-700">Export Income</p>
                      <p className="text-xs text-slate-500">Capped at {financeResult.nightUsage.toFixed(2)} kWh</p>
                      {financeResult.burnedSolar > 0 && (
                        <p className="text-[10px] text-orange-600 mt-1 font-medium bg-orange-100 inline-block px-1.5 py-0.5 rounded">
                          {(solarResult.generation - financeResult.morningOffset).toFixed(2)}kWh - {financeResult.nightUsage.toFixed(2)}kWh = {financeResult.burnedSolar.toFixed(2)}kWh (Unused)
                        </p>
                      )}
                    </div>
                    <p className="font-bold text-emerald-700">-{formatCurrency(financeResult.exportValue)}</p>
                  </div>
                  <div className="flex justify-between items-center pt-3">
                    <p className="text-sm font-bold text-slate-800">New Net Payment</p>
                    <p className={`text-3xl font-bold ${financeResult.netBill <= 0 ? 'text-green-600' : 'text-slate-900'}`}>
                      {formatCurrency(financeResult.netBill)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* System Pricing & Quotation */}
          <div className="bg-slate-800 text-white rounded-xl shadow-lg border border-slate-700 overflow-hidden mt-8">
            <div className="p-6 border-b border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 p-2 rounded-lg text-white"><Icons.Tags className="w-5 h-5" /></div>
                <div>
                  <h2 className="text-xl font-bold">System Pricing & Quotation</h2>
                  <p className="text-sm text-slate-400">Final Cost Breakdown with Discounts</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">{totalSystemPanels} Panels</div>
                <div className="text-xs text-slate-400">Total System Size</div>
              </div>
            </div>
            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <div className="flex justify-between items-center"><span className="text-sm text-slate-300">Base System Price</span><span className="text-lg font-semibold">{baseSystemPrice > 0 ? formatCurrency(baseSystemPrice) : 'Contact Support'}</span></div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Special Discount (%)</label>
                  <input 
                    type="number" min="0" step="0.1" value={discountPercent === 0 ? '' : discountPercent} 
                    onChange={(e) => setDiscountPercent(Number(e.target.value))} 
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white outline-none focus:ring-1 focus:ring-blue-500" 
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Fixed Rebate (RM)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">RM</span>
                    <input 
                      type="number" min="0" value={fixedRebate === 0 ? '' : fixedRebate} 
                      onChange={(e) => setFixedRebate(Number(e.target.value))} 
                      className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-12 p-3 text-white outline-none focus:ring-1 focus:ring-blue-500" 
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">TNG (Roadshow) / Campaign Discount (RM)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">RM</span>
                    <input 
                      type="number" min="0" value={tngDiscount === 0 ? '' : tngDiscount} 
                      onChange={(e) => setTngDiscount(Number(e.target.value))} 
                      className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-12 p-3 text-white outline-none focus:ring-1 focus:ring-blue-500" 
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>
              <div className="bg-slate-900 rounded-xl p-6 border border-slate-700 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex justify-between text-slate-400"><span>Base Price</span><span>{formatCurrency(baseSystemPrice)}</span></div>
                  <div className="flex justify-between text-green-400"><span>Special Discount ({effectiveDiscountPercent}%)</span><span>-{formatCurrency(discountAmount)}</span></div>
                  <div className="flex justify-between text-green-400"><span>Fixed Rebate</span><span>-{formatCurrency(effectiveFixedRebate)}</span></div>
                  {tngDiscount > 0 && <div className="flex justify-between text-blue-400"><span>Campaign Discount</span><span>-{formatCurrency(tngDiscount)}</span></div>}
                  <div className="border-t border-slate-700 pt-4 flex justify-between items-end mt-4">
                    <span className="font-bold text-lg text-white">Final System Cost</span>
                    <span className="font-bold text-3xl text-white">{formatCurrency(finalSystemCost)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* EPP Calculator */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mt-8">
            <div className="bg-indigo-50 border-b border-indigo-100 p-4 flex items-center gap-3">
              <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600"><Icons.CreditCard className="w-5 h-5" /></div>
              <h2 className="text-lg font-semibold text-slate-900">Installment Calculator (EPP)</h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Select Bank</label>
                  <select value={selectedBank} onChange={(e) => setSelectedBank(e.target.value)} className="w-full p-3 border rounded-lg outline-none bg-white font-medium text-slate-900">
                    {Object.keys(EPP_RATES).map(bank => <option key={bank} value={bank}>{bank}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Duration (Months)</label>
                  <select value={selectedDuration} onChange={(e) => setSelectedDuration(Number(e.target.value))} className="w-full p-3 border rounded-lg outline-none bg-white font-medium text-slate-900">
                    {availableDurations.map(duration => <option key={duration} value={duration}>{duration} Months</option>)}
                  </select>
                  <div className="mt-3 flex items-center gap-2 text-sm font-medium text-indigo-700 bg-indigo-50 px-3 py-2 rounded-lg border border-indigo-100">
                    <Icons.Activity className="w-4 h-4" />
                    <span>Applicable Interest: <span className="font-bold">{interestRatePercent.toFixed(2)}%</span></span>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white rounded-xl p-6 shadow-lg">
                <p className="text-indigo-100 text-sm font-medium mb-1 uppercase tracking-wider text-[10px] font-bold">Monthly Installment</p>
                <div className="text-4xl font-bold mb-6 tracking-tight">{formatCurrency(monthlyInstallment)}<span className="text-lg font-normal opacity-75">/mth</span></div>
                <div className="text-xs text-indigo-100 space-y-2 border-t border-white/20 pt-4">
                  <div className="flex justify-between items-center pb-1">
                    <span>Final System Cost</span>
                    <span className="font-bold text-white">{formatCurrency(finalSystemCost)}</span>
                  </div>
                  <div className="flex justify-between items-center pb-1">
                    <span>Upfront Deposit (5%)</span>
                    <span className="font-bold">{formatCurrency(depositAmount)}</span>
                  </div>
                  <div className="flex justify-between items-center pb-1">
                    <span>Loan Amount (95%)</span>
                    <span>{formatCurrency(loanPrincipal)}</span>
                  </div>
                  <div className="flex justify-between items-center pb-1">
                    <span>Interest on Loan Amount</span>
                    <span className="font-bold">{formatCurrency(totalLoanWithInterest - loanPrincipal)}</span>
                  </div>
                  <div className="flex justify-between pt-1 font-bold text-white border-t border-white/10 mt-2 text-sm">
                    <span>Total Loan Repayment</span>
                    <span>{formatCurrency(totalLoanWithInterest)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SolarSizing;