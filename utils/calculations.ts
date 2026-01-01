
import { 
  BASE_ENERGY_RATE, 
  HIGH_USAGE_PENALTY, 
  CAPACITY_RATE, 
  NETWORK_RATE, 
  RETAIL_THRESHOLD, 
  RETAIL_CHARGE_AMOUNT, 
  SST_THRESHOLD, 
  SST_RATE, 
  KWTBB_RATE 
} from '../constants';
import { BillData } from '../types';

export const getEEIRate = (kwh: number) => {
  if (kwh <= 0) return 0;
  if (kwh <= 200) return 0.250;
  if (kwh <= 250) return 0.245;
  if (kwh <= 300) return 0.225;
  if (kwh <= 350) return 0.210;
  if (kwh <= 400) return 0.170;
  if (kwh <= 450) return 0.145;
  if (kwh <= 500) return 0.120;
  if (kwh <= 550) return 0.105;
  if (kwh <= 600) return 0.090;
  if (kwh <= 650) return 0.075;
  if (kwh <= 700) return 0.055;
  if (kwh <= 750) return 0.045;
  if (kwh <= 800) return 0.040;
  if (kwh <= 850) return 0.025;
  if (kwh <= 900) return 0.010;
  if (kwh <= 1000) return 0.005;
  return 0;
};

export const calculateEEI = (kWh: number) => {
  const rate = getEEIRate(kWh);
  return -(kWh * rate);
};

export const calculateBill = (kWh: number, afaRate: number): BillData => {
  const effectiveUsageRate = kWh > 1500 
    ? BASE_ENERGY_RATE + HIGH_USAGE_PENALTY 
    : BASE_ENERGY_RATE;

  const usageCost = kWh * effectiveUsageRate;
  const capacityCost = kWh * CAPACITY_RATE;
  const networkCost = kWh * NETWORK_RATE;
  const afaCost = kWh * afaRate;
  const retailCharge = kWh > RETAIL_THRESHOLD ? RETAIL_CHARGE_AMOUNT : 0;
  
  const kwtbbBase = usageCost + capacityCost + networkCost;
  const kwtbbCost = kwtbbBase * KWTBB_RATE;

  let sstCost = 0;
  if (kWh > SST_THRESHOLD) {
    const taxableKWh = kWh - SST_THRESHOLD;
    const costPerUnit = effectiveUsageRate + CAPACITY_RATE + NETWORK_RATE + afaRate;
    const taxableVariableCost = taxableKWh * costPerUnit;
    const totalTaxableBase = taxableVariableCost + retailCharge;
    sstCost = Math.max(0, totalTaxableBase * SST_RATE);
  }

  const eeiCost = calculateEEI(kWh);
  const totalBill = usageCost + capacityCost + networkCost + afaCost + retailCharge + kwtbbCost + sstCost + eeiCost;

  return {
    usageCost, capacityCost, networkCost, afaCost, retailCharge, kwtbbCost, sstCost, eeiCost, totalBill, unitRate: effectiveUsageRate
  };
};

export const calculateKWhFromBill = (targetBill: number, afaRate: number) => {
  if (!targetBill || targetBill <= 0) return 0;
  let low = 0, high = 100000, mid = 0, iterations = 0;
  while (high - low > 0.0001 && iterations < 100) {
    mid = (low + high) / 2;
    const res = calculateBill(mid, afaRate);
    if (res.totalBill < targetBill) low = mid;
    else high = mid;
    iterations++;
  }
  return mid;
};

export const formatCurrency = (val: number) => 
  new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' }).format(val);
