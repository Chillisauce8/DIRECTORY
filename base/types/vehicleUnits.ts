// types/vehicleUnits.ts
import { ComputedRef } from 'vue'

// Distance units
export type DistanceUnit = 'km' | 'mi';
export type SmallDistanceUnit = 'mm' | 'in';

// Speed units
export type SpeedUnit = 'km/h' | 'mph';

// Engine units
export type DisplacementUnit = 'L' | 'cc' | 'cu in';
export type PowerUnit = 
  | 'kW'    // kilowatts (metric)
  | 'hp'    // horsepower (US)
  | 'bhp'   // brake horsepower (UK)
  | 'PS'    // Pferdestärke (German)
  | 'CV'    // cavalli (Italian) / chevaux (French)
  | 'pk'    // paardenkracht (Dutch)
  | 'hk'    // hästkraft (Swedish) / hestekraft (Danish)
  | 'ch'    // chevaux-vapeur (French)
  | 'л.с.'  // лошадиная сила (Russian)
  | 'k'     // koňská síla (Czech)
  | 'KM'    // koń mechaniczny (Polish)
  | 'hv';   // hevosvoimaa (Finnish)

export type TorqueUnit = 'Nm' | 'lb-ft';

// Weight units
export type WeightUnit = 'kg' | 'lb';

// Fuel units
export type FuelCapacityUnit = 'L' | 'gal';
export type FuelEfficiencyUnit = 'L/100km' | 'mpg' | 'km/L';

// All vehicle unit types grouped
export interface VehicleUnits {
  distance: DistanceUnit;
  smallDistance: SmallDistanceUnit;
  speed: SpeedUnit;
  displacement: DisplacementUnit;
  power: PowerUnit;
  torque: TorqueUnit;
  weight: WeightUnit;
  fuelCapacity: FuelCapacityUnit;
  fuelEfficiency: FuelEfficiencyUnit;
}

// Currency units
export interface CurrencyUnits {
  code: string;
  name: string;
  symbol: string;
}

// Country settings structure
export interface CountryVehicleSettings {
  countryCode: string;
  currencyUnits: CurrencyUnits;
  vehicleUnits: VehicleUnits;
}

// Format function types
export type FormatFunction = (value: number, sourceUnit?: string) => string;
export type UnitFormatter = Record<keyof VehicleUnits, FormatFunction>;

// Conversion function types
export interface ConversionFunctions {
  kmToMiles: (km: number) => number;
  milesToKm: (miles: number) => number;
  mmToInch: (mm: number) => number;
  inchToMm: (inch: number) => number;
  kgToLb: (kg: number) => number;
  lbToKg: (lb: number) => number;
  literToGallon: (liter: number) => number;
  gallonToLiter: (gallon: number) => number;
  kwToHp: (kw: number) => number;
  hpToKw: (hp: number) => number;
  kwToPs: (kw: number) => number;
  psToKw: (ps: number) => number;
  nmToLbFt: (nm: number) => number;
  lbFtToNm: (lbFt: number) => number;
  literToCubicInch: (liter: number) => number;
  cubicInchToLiter: (cubicInch: number) => number;
  ccToLiter: (cc: number) => number;
  literToCc: (liter: number) => number;
  mpgToL100km: (mpg: number) => number;
  l100kmToMpg: (l100km: number) => number;
  kmLToL100km: (kmL: number) => number;
  l100kmToKmL: (l100km: number) => number;
}

// Vehicle Units Composable return type
export interface UseVehicleUnitsReturn {
  // Settings
  countryCode: ComputedRef<string>;
  vehicleUnits: ComputedRef<VehicleUnits>;
  currencyUnits: ComputedRef<CurrencyUnits>;
  
  // Converters (from metric to preferred units)
  convertDistance: (km: number) => string;
  convertSmallDistance: (mm: number) => string;
  convertSpeed: (kph: number) => string;
  convertPower: (kw: number) => string;
  convertTorque: (nm: number) => string;
  convertWeight: (kg: number) => string;
  convertDisplacement: (liters: number) => string;
  convertFuelCapacity: (liters: number) => string;
  convertFuelEfficiency: (l100km: number) => string;
  convertCurrency: (amount: number, exchangeRate?: number) => string;
  
  // Main formatter
  formatSpec: (value: number, specType: keyof VehicleUnits) => string;
  
  // Helpers
  getUnitType: (specType: string) => string | null;
}

// Default units (metric system)
export const DEFAULT_UNITS: VehicleUnits = {
  distance: "km",
  smallDistance: "mm",
  speed: "km/h",
  displacement: "L",
  power: "kW",
  torque: "Nm",
  weight: "kg",
  fuelCapacity: "L",
  fuelEfficiency: "L/100km"
};