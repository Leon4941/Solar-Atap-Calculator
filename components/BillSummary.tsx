import React from 'react';
import { Icons, CAPACITY_RATE, NETWORK_RATE } from '../constants';
import { BillData } from '../types';
import { formatCurrency } from '../utils/calculations';

interface BillSummaryProps {
  data: BillData;
  usage: number;
  afaRate: number;
}

const BillSummary: React.FC<BillSummaryProps> = ({ data, usage, afaRate }) => {
  const avgCostPerKwh = usage > 0 ? data.totalBill / usage : 0;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-xl p-6 shadow-lg">
          <p className="text-indigo-100 text-sm font-medium mb-1">Estimated Usage</p>
          <div className="text-4xl font-bold tracking-tight flex items-baseline gap-2">
            {usage.toFixed(2)}<span className="text-lg font-normal text-indigo-200">kWh</span>
          </div>
          <div className="mt-4 flex items-center gap-2 text-indigo-200 text-sm">
            <Icons.Zap className="w-4 h-4" />
            <span>Derived from Bill Amount</span>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <p className="text-slate-500 text-sm font-medium mb-1">Average Cost</p>
          <div className="text-4xl font-bold text-slate-800 tracking-tight">
            RM {avgCostPerKwh.toFixed(4)}<span className="text-lg text-slate-500 font-normal ml-1">/kWh</span>
          </div>
          <div className="mt-4 flex items-center gap-2 text-slate-500 text-sm">
            <Icons.Percent className="w-4 h-4" />
            <span>Effective Rate</span>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            <Icons.FileText className="w-4 h-4 text-slate-500" />
            Cost Breakdown
          </h3>
          <div className="flex flex-col items-end">
            <span className="text-xs font-mono bg-blue-100 text-blue-700 px-2 py-1 rounded">
              Target: {formatCurrency(data.totalBill)}
            </span>
            {usage > 1500 && (
              <span className="text-[10px] text-orange-600 font-medium mt-1">High Usage Tier (&gt;1500 kWh)</span>
            )}
          </div>
        </div>
        <div className="divide-y divide-slate-100">
          <div className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors">
            <div>
              <p className="font-medium text-slate-700">Energy Charge</p>
              <p className="text-xs text-slate-500">RM {data.unitRate.toFixed(4)}/kWh &times; {usage.toFixed(2)} kWh</p>
            </div>
            <p className="font-mono font-medium text-slate-900">{formatCurrency(data.usageCost)}</p>
          </div>
          <div className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors">
            <div>
              <p className="font-medium text-slate-700">Capacity Charge</p>
              <p className="text-xs text-slate-500">RM {CAPACITY_RATE.toFixed(4)}/kWh &times; {usage.toFixed(2)} kWh</p>
            </div>
            <p className="font-mono font-medium text-slate-900">{formatCurrency(data.capacityCost)}</p>
          </div>
          <div className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors">
            <div>
              <p className="font-medium text-slate-700">Network Charge</p>
              <p className="text-xs text-slate-500">RM {NETWORK_RATE.toFixed(4)}/kWh &times; {usage.toFixed(2)} kWh</p>
            </div>
            <p className="font-mono font-medium text-slate-900">{formatCurrency(data.networkCost)}</p>
          </div>
          <div className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors">
            <div>
              <p className="font-medium text-slate-700">AFA (ICPT)</p>
              <p className="text-xs text-slate-500">RM {afaRate.toFixed(4)}/kWh &times; {usage.toFixed(2)} kWh</p>
            </div>
            <p className={`font-mono font-medium ${data.afaCost < 0 ? 'text-green-600' : 'text-slate-900'}`}>
              {formatCurrency(data.afaCost)}
            </p>
          </div>
          {data.retailCharge > 0 && (
            <div className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors bg-yellow-50/50">
              <div>
                <p className="font-medium text-slate-700">Retail Charge</p>
                <p className="text-xs text-slate-500">RM 10.00 (Flat fee &gt; 600kWh)</p>
              </div>
              <p className="font-mono font-medium text-slate-900">{formatCurrency(data.retailCharge)}</p>
            </div>
          )}
          <div className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors bg-slate-50/50">
            <div>
              <p className="font-medium text-slate-700">KWTBB (1.6%)</p>
              <p className="text-xs text-slate-500">1.6% (On Energy + Cap + Net)</p>
            </div>
            <p className="font-mono font-medium text-slate-900">{formatCurrency(data.kwtbbCost)}</p>
          </div>
          <div className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors bg-slate-50/50">
            <div>
              <p className="font-medium text-slate-700">Service Tax (8%)</p>
              <p className="text-xs text-slate-500">8.0% (On taxable portion &gt; 600kWh)</p>
            </div>
            <p className="font-mono font-medium text-slate-900">{formatCurrency(data.sstCost)}</p>
          </div>
          {data.eeiCost < 0 && (
            <div className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors bg-emerald-50/50">
              <div>
                <p className="font-medium text-emerald-800">EEI Rebate</p>
                <p className="text-xs text-emerald-600">Energy Efficiency Incentive</p>
              </div>
              <p className="font-mono font-medium text-emerald-700">{formatCurrency(data.eeiCost)}</p>
            </div>
          )}
        </div>
        <div className="p-4 bg-slate-100 flex justify-between items-center border-t border-slate-200">
          <span className="font-bold text-slate-800">Total Calculated</span>
          <span className="font-bold text-slate-900 text-lg">{formatCurrency(data.totalBill)}</span>
        </div>
      </div>
    </div>
  );
};

export default BillSummary;