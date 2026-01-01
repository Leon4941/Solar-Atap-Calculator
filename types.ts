export interface BillData {
  usageCost: number;
  capacityCost: number;
  networkCost: number;
  afaCost: number;
  retailCharge: number;
  kwtbbCost: number;
  sstCost: number;
  eeiCost: number;
  totalBill: number;
  unitRate: number;
}

export interface SolarResult {
  panels: number;
  systemSize: number;
  generation: number;
}

export interface FinanceResult {
  morningOffset: number;
  solarExport: number;
  burnedSolar: number;
  exportValue: number;
  nightUsage: number;
  nightBill: number;
  netBill: number;
  exportRate: number;
}