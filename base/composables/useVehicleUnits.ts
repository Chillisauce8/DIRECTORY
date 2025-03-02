// composables/useVehicleUnits.ts
import { ref, computed, ComputedRef } from 'vue'
import { useNuxtApp } from '#app'
import type { 
  VehicleUnits, 
  CountryVehicleSettings, 
  ConversionFunctions, 
  UseVehicleUnitsReturn,
  FormatFunction,
  CurrencyUnits
} from '~/types/vehicleUnits'
import { DEFAULT_UNITS } from '~/types/vehicleUnits'

export function useVehicleUnits(): UseVehicleUnitsReturn {
  const { $localeSettings } = useNuxtApp()
  
  // Country settings array with vehicle units for top 30 countries
  const countrySettings: CountryVehicleSettings[] = [
    {
      "countryCode": "US",
      "currencyUnits": {
        "code": "USD",
        "name": "US Dollar",
        "symbol": "$"
      },
      "vehicleUnits": {
        "distance": "mi",
        "smallDistance": "in",
        "speed": "mph",
        "displacement": "cu in",
        "power": "hp",
        "torque": "lb-ft",
        "weight": "lb",
        "fuelCapacity": "gal",
        "fuelEfficiency": "mpg"
      }
    },
    {
      "countryCode": "GB",
      "currencyUnits": {
        "code": "GBP",
        "name": "British Pound",
        "symbol": "£"
      },
      "vehicleUnits": {
        "distance": "mi",
        "smallDistance": "in",
        "speed": "mph",
        "displacement": "L",
        "power": "bhp",
        "torque": "lb-ft",
        "weight": "kg",
        "fuelCapacity": "L",
        "fuelEfficiency": "mpg"
      }
    },
    {
      "countryCode": "DE",
      "currencyUnits": {
        "code": "EUR",
        "name": "Euro",
        "symbol": "€"
      },
      "vehicleUnits": {
        "distance": "km",
        "smallDistance": "mm",
        "speed": "km/h",
        "displacement": "L",
        "power": "kW",
        "torque": "Nm",
        "weight": "kg",
        "fuelCapacity": "L",
        "fuelEfficiency": "L/100km"
      }
    },
    {
      "countryCode": "CA",
      "currencyUnits": {
        "code": "CAD",
        "name": "Canadian Dollar",
        "symbol": "CA$"
      },
      "vehicleUnits": {
        "distance": "km",
        "smallDistance": "mm",
        "speed": "km/h",
        "displacement": "L",
        "power": "hp",
        "torque": "lb-ft",
        "weight": "kg",
        "fuelCapacity": "L",
        "fuelEfficiency": "L/100km"
      }
    },
    {
      "countryCode": "AU",
      "currencyUnits": {
        "code": "AUD",
        "name": "Australian Dollar",
        "symbol": "A$"
      },
      "vehicleUnits": {
        "distance": "km",
        "smallDistance": "mm",
        "speed": "km/h",
        "displacement": "L",
        "power": "kW",
        "torque": "Nm",
        "weight": "kg",
        "fuelCapacity": "L",
        "fuelEfficiency": "L/100km"
      }
    },
    {
      "countryCode": "FR",
      "currencyUnits": {
        "code": "EUR",
        "name": "Euro",
        "symbol": "€"
      },
      "vehicleUnits": {
        "distance": "km",
        "smallDistance": "mm",
        "speed": "km/h",
        "displacement": "L",
        "power": "ch",
        "torque": "Nm",
        "weight": "kg",
        "fuelCapacity": "L",
        "fuelEfficiency": "L/100km"
      }
    },
    {
      "countryCode": "IT",
      "currencyUnits": {
        "code": "EUR",
        "name": "Euro",
        "symbol": "€"
      },
      "vehicleUnits": {
        "distance": "km",
        "smallDistance": "mm",
        "speed": "km/h",
        "displacement": "L",
        "power": "CV",
        "torque": "Nm",
        "weight": "kg",
        "fuelCapacity": "L",
        "fuelEfficiency": "L/100km"
      }
    },
    {
      "countryCode": "JP",
      "currencyUnits": {
        "code": "JPY",
        "name": "Japanese Yen",
        "symbol": "¥"
      },
      "vehicleUnits": {
        "distance": "km",
        "smallDistance": "mm",
        "speed": "km/h",
        "displacement": "cc",
        "power": "PS",
        "torque": "Nm",
        "weight": "kg",
        "fuelCapacity": "L",
        "fuelEfficiency": "km/L"
      }
    },
    {
      "countryCode": "NL",
      "currencyUnits": {
        "code": "EUR",
        "name": "Euro",
        "symbol": "€"
      },
      "vehicleUnits": {
        "distance": "km",
        "smallDistance": "mm",
        "speed": "km/h",
        "displacement": "L",
        "power": "pk",
        "torque": "Nm",
        "weight": "kg",
        "fuelCapacity": "L",
        "fuelEfficiency": "L/100km"
      }
    },
    {
      "countryCode": "CH",
      "currencyUnits": {
        "code": "CHF",
        "name": "Swiss Franc",
        "symbol": "Fr"
      },
      "vehicleUnits": {
        "distance": "km",
        "smallDistance": "mm",
        "speed": "km/h",
        "displacement": "L",
        "power": "PS",
        "torque": "Nm",
        "weight": "kg",
        "fuelCapacity": "L",
        "fuelEfficiency": "L/100km"
      }
    },
    {
      "countryCode": "BE",
      "currencyUnits": {
        "code": "EUR",
        "name": "Euro",
        "symbol": "€"
      },
      "vehicleUnits": {
        "distance": "km",
        "smallDistance": "mm",
        "speed": "km/h",
        "displacement": "L",
        "power": "pk",
        "torque": "Nm",
        "weight": "kg",
        "fuelCapacity": "L",
        "fuelEfficiency": "L/100km"
      }
    },
    {
      "countryCode": "SE",
      "currencyUnits": {
        "code": "SEK",
        "name": "Swedish Krona",
        "symbol": "kr"
      },
      "vehicleUnits": {
        "distance": "km",
        "smallDistance": "mm",
        "speed": "km/h",
        "displacement": "L",
        "power": "hk",
        "torque": "Nm",
        "weight": "kg",
        "fuelCapacity": "L",
        "fuelEfficiency": "L/100km"
      }
    },
    {
      "countryCode": "ES",
      "currencyUnits": {
        "code": "EUR",
        "name": "Euro",
        "symbol": "€"
      },
      "vehicleUnits": {
        "distance": "km",
        "smallDistance": "mm",
        "speed": "km/h",
        "displacement": "L",
        "power": "CV",
        "torque": "Nm",
        "weight": "kg",
        "fuelCapacity": "L",
        "fuelEfficiency": "L/100km"
      }
    },
    {
      "countryCode": "NZ",
      "currencyUnits": {
        "code": "NZD",
        "name": "New Zealand Dollar",
        "symbol": "NZ$"
      },
      "vehicleUnits": {
        "distance": "km",
        "smallDistance": "mm",
        "speed": "km/h",
        "displacement": "L",
        "power": "kW",
        "torque": "Nm",
        "weight": "kg",
        "fuelCapacity": "L",
        "fuelEfficiency": "L/100km"
      }
    },
    {
      "countryCode": "AT",
      "currencyUnits": {
        "code": "EUR",
        "name": "Euro",
        "symbol": "€"
      },
      "vehicleUnits": {
        "distance": "km",
        "smallDistance": "mm",
        "speed": "km/h",
        "displacement": "L",
        "power": "PS",
        "torque": "Nm",
        "weight": "kg",
        "fuelCapacity": "L",
        "fuelEfficiency": "L/100km"
      }
    },
    {
      "countryCode": "NO",
      "currencyUnits": {
        "code": "NOK",
        "name": "Norwegian Krone",
        "symbol": "kr"
      },
      "vehicleUnits": {
        "distance": "km",
        "smallDistance": "mm",
        "speed": "km/h",
        "displacement": "L",
        "power": "hk",
        "torque": "Nm",
        "weight": "kg",
        "fuelCapacity": "L",
        "fuelEfficiency": "L/100km"
      }
    },
    {
      "countryCode": "DK",
      "currencyUnits": {
        "code": "DKK",
        "name": "Danish Krone",
        "symbol": "kr"
      },
      "vehicleUnits": {
        "distance": "km",
        "smallDistance": "mm",
        "speed": "km/h",
        "displacement": "L",
        "power": "hk",
        "torque": "Nm",
        "weight": "kg",
        "fuelCapacity": "L",
        "fuelEfficiency": "L/100km"
      }
    },
    {
      "countryCode": "PL",
      "currencyUnits": {
        "code": "PLN",
        "name": "Polish Zloty",
        "symbol": "zł"
      },
      "vehicleUnits": {
        "distance": "km",
        "smallDistance": "mm",
        "speed": "km/h",
        "displacement": "L",
        "power": "KM",
        "torque": "Nm",
        "weight": "kg",
        "fuelCapacity": "L",
        "fuelEfficiency": "L/100km"
      }
    },
    {
      "countryCode": "BR",
      "currencyUnits": {
        "code": "BRL",
        "name": "Brazilian Real",
        "symbol": "R$"
      },
      "vehicleUnits": {
        "distance": "km",
        "smallDistance": "mm",
        "speed": "km/h",
        "displacement": "L",
        "power": "CV",
        "torque": "Nm",
        "weight": "kg",
        "fuelCapacity": "L",
        "fuelEfficiency": "km/L"
      }
    },
    {
      "countryCode": "FI",
      "currencyUnits": {
        "code": "EUR",
        "name": "Euro",
        "symbol": "€"
      },
      "vehicleUnits": {
        "distance": "km",
        "smallDistance": "mm",
        "speed": "km/h",
        "displacement": "L",
        "power": "hv",
        "torque": "Nm",
        "weight": "kg",
        "fuelCapacity": "L",
        "fuelEfficiency": "L/100km"
      }
    },
    {
      "countryCode": "AE",
      "currencyUnits": {
        "code": "AED",
        "name": "UAE Dirham",
        "symbol": "د.إ"
      },
      "vehicleUnits": {
        "distance": "km",
        "smallDistance": "mm",
        "speed": "km/h",
        "displacement": "L",
        "power": "hp",
        "torque": "Nm",
        "weight": "kg",
        "fuelCapacity": "L",
        "fuelEfficiency": "L/100km"
      }
    },
    {
      "countryCode": "ZA",
      "currencyUnits": {
        "code": "ZAR",
        "name": "South African Rand",
        "symbol": "R"
      },
      "vehicleUnits": {
        "distance": "km",
        "smallDistance": "mm",
        "speed": "km/h",
        "displacement": "L",
        "power": "kW",
        "torque": "Nm",
        "weight": "kg",
        "fuelCapacity": "L",
        "fuelEfficiency": "L/100km"
      }
    },
    {
      "countryCode": "AR",
      "currencyUnits": {
        "code": "ARS",
        "name": "Argentine Peso",
        "symbol": "$"
      },
      "vehicleUnits": {
        "distance": "km",
        "smallDistance": "mm",
        "speed": "km/h",
        "displacement": "L",
        "power": "CV",
        "torque": "Nm",
        "weight": "kg",
        "fuelCapacity": "L",
        "fuelEfficiency": "km/L"
      }
    },
    {
      "countryCode": "MX",
      "currencyUnits": {
        "code": "MXN",
        "name": "Mexican Peso",
        "symbol": "$"
      },
      "vehicleUnits": {
        "distance": "km",
        "smallDistance": "mm",
        "speed": "km/h",
        "displacement": "L",
        "power": "hp",
        "torque": "Nm",
        "weight": "kg",
        "fuelCapacity": "L",
        "fuelEfficiency": "km/L"
      }
    },
    {
      "countryCode": "RU",
      "currencyUnits": {
        "code": "RUB",
        "name": "Russian Ruble",
        "symbol": "₽"
      },
      "vehicleUnits": {
        "distance": "km",
        "smallDistance": "mm",
        "speed": "km/h",
        "displacement": "L",
        "power": "л.с.",
        "torque": "Nm",
        "weight": "kg",
        "fuelCapacity": "L",
        "fuelEfficiency": "L/100km"
      }
    },
    {
      "countryCode": "CZ",
      "currencyUnits": {
        "code": "CZK",
        "name": "Czech Koruna",
        "symbol": "Kč"
      },
      "vehicleUnits": {
        "distance": "km",
        "smallDistance": "mm",
        "speed": "km/h",
        "displacement": "L",
        "power": "k",
        "torque": "Nm",
        "weight": "kg",
        "fuelCapacity": "L",
        "fuelEfficiency": "L/100km"
      }
    },
    {
      "countryCode": "PT",
      "currencyUnits": {
        "code": "EUR",
        "name": "Euro",
        "symbol": "€"
      },
      "vehicleUnits": {
        "distance": "km",
        "smallDistance": "mm",
        "speed": "km/h",
        "displacement": "L",
        "power": "CV",
        "torque": "Nm",
        "weight": "kg",
        "fuelCapacity": "L",
        "fuelEfficiency": "L/100km"
      }
    },
    {
      "countryCode": "IE",
      "currencyUnits": {
        "code": "EUR",
        "name": "Euro",
        "symbol": "€"
      },
      "vehicleUnits": {
        "distance": "km",
        "smallDistance": "mm",
        "speed": "km/h",
        "displacement": "L",
        "power": "bhp",
        "torque": "Nm",
        "weight": "kg",
        "fuelCapacity": "L",
        "fuelEfficiency": "L/100km"
      }
    },
    {
      "countryCode": "MY",
      "currencyUnits": {
        "code": "MYR",
        "name": "Malaysian Ringgit",
        "symbol": "RM"
      },
      "vehicleUnits": {
        "distance": "km",
        "smallDistance": "mm",
        "speed": "km/h",
        "displacement": "cc",
        "power": "hp",
        "torque": "Nm",
        "weight": "kg",
        "fuelCapacity": "L",
        "fuelEfficiency": "L/100km"
      }
    },
    {
      "countryCode": "SG",
      "currencyUnits": {
        "code": "SGD",
        "name": "Singapore Dollar",
        "symbol": "S$"
      },
      "vehicleUnits": {
        "distance": "km",
        "smallDistance": "mm",
        "speed": "km/h",
        "displacement": "cc",
        "power": "bhp",
        "torque": "Nm",
        "weight": "kg",
        "fuelCapacity": "L",
        "fuelEfficiency": "L/100km"
      }
    }
  ];

  // Get the current country code from locale settings
  const countryCode = computed<string>(() => {
    // Adjust this to match your app's locale settings structure
    return $localeSettings?.country || 'US';
  });

  // Get vehicle units for current country
  const vehicleUnits = computed<VehicleUnits>(() => {
    const country = countrySettings.find(c => c.countryCode === countryCode.value);
    return country?.vehicleUnits || DEFAULT_UNITS;
  });
  
  // Get currency units for current country
  const currencyUnits = computed<CurrencyUnits>(() => {
    const country = countrySettings.find(c => c.countryCode === countryCode.value);
    return country?.currencyUnits || {
      code: "USD",
      name: "US Dollar",
      symbol: "$"
    };
  });

  // Conversion functions - enhanced with all needed conversions
  const conversions: ConversionFunctions = {
    // Distance conversions
    kmToMiles: (km: number) => km * 0.621371,
    milesToKm: (miles: number) => miles * 1.60934,
    
    // Small distance conversions
    mmToInch: (mm: number) => mm * 0.0393701,
    inchToMm: (inch: number) => inch * 25.4,
    
    // Weight conversions
    kgToLb: (kg: number) => kg * 2.20462,
    lbToKg: (lb: number) => lb * 0.453592,
    
    // Volume conversions
    literToGallon: (liter: number) => liter * 0.264172, // US gallons
    gallonToLiter: (gallon: number) => gallon * 3.78541,
    
    // Power conversions
    kwToHp: (kw: number) => kw * 1.34102,
    hpToKw: (hp: number) => hp * 0.7457,
    kwToPs: (kw: number) => kw * 1.35962,
    psToKw: (ps: number) => ps * 0.7355,
    
    // Torque conversions
    nmToLbFt: (nm: number) => nm * 0.737562,
    lbFtToNm: (lbFt: number) => lbFt * 1.35582,
    
    // Engine displacement conversions
    literToCubicInch: (liter: number) => liter * 61.0237,
    cubicInchToLiter: (cubicInch: number) => cubicInch * 0.0163871,
    ccToLiter: (cc: number) => cc / 1000,
    literToCc: (liter: number) => liter * 1000,
    
    // Fuel efficiency conversions
    mpgToL100km: (mpg: number) => 235.215 / mpg,
    l100kmToMpg: (l100km: number) => 235.215 / l100km,
    kmLToL100km: (kmL: number) => 100 / kmL,
    l100kmToKmL: (l100km: number) => 100 / l100km
  };

  // ========== METRIC TO PREFERRED UNIT CONVERTERS ==========
  // These functions take metric values and convert to preferred units
  
  /**
   * Converts a distance in kilometers to the user's preferred unit
   * @param km Distance in kilometers
   * @returns Formatted distance string with unit
   */
  const convertDistance = (km: number): string => {
    const unit = vehicleUnits.value.distance;
    let value = km;
    
    if (unit === 'mi') {
      value = conversions.kmToMiles(km);
    }
    
    return `${value.toFixed(1)} ${unit}`;
  };
  
  /**
   * Converts a small distance in millimeters to the user's preferred unit
   * @param mm Distance in millimeters
   * @returns Formatted small distance string with unit
   */
  const convertSmallDistance = (mm: number): string => {
    const unit = vehicleUnits.value.smallDistance;
    let value = mm;
    
    if (unit === 'in') {
      value = conversions.mmToInch(mm);
    }
    
    return unit === 'in' 
      ? `${value.toFixed(2)} ${unit}`
      : `${value.toFixed(1)} ${unit}`;
  };
  
  /**
   * Converts a speed in km/h to the user's preferred unit
   * @param kph Speed in kilometers per hour
   * @returns Formatted speed string with unit
   */
  const convertSpeed = (kph: number): string => {
    const unit = vehicleUnits.value.speed;
    let value = kph;
    
    if (unit === 'mph') {
      value = conversions.kmToMiles(kph);
    }
    
    return `${Math.round(value)} ${unit}`;
  };
  
  /**
   * Converts power in kilowatts to the user's preferred unit
   * @param kw Power in kilowatts
   * @returns Formatted power string with unit
   */
  const convertPower = (kw: number): string => {
    const unit = vehicleUnits.value.power;
    let value = kw;
    
    // Convert from kW to preferred unit
    if (['hp', 'bhp'].includes(unit)) {
      value = conversions.kwToHp(kw);
    } else if (['PS', 'CV', 'pk', 'hk', 'ch', 'л.с.', 'k', 'KM', 'hv'].includes(unit)) {
      value = conversions.kwToPs(kw);
    }
    
    return `${Math.round(value)} ${unit}`;
  };
  
  /**
   * Converts torque in newton meters to the user's preferred unit
   * @param nm Torque in newton meters
   * @returns Formatted torque string with unit
   */
  const convertTorque = (nm: number): string => {
    const unit = vehicleUnits.value.torque;
    let value = nm;
    
    if (unit === 'lb-ft') {
      value = conversions.nmToLbFt(nm);
    }
    
    return `${Math.round(value)} ${unit}`;
  };
  
  /**
   * Converts weight in kilograms to the user's preferred unit
   * @param kg Weight in kilograms
   * @returns Formatted weight string with unit
   */
  const convertWeight = (kg: number): string => {
    const unit = vehicleUnits.value.weight;
    let value = kg;
    
    if (unit === 'lb') {
      value = conversions.kgToLb(kg);
    }
    
    return `${Math.round(value)} ${unit}`;
  };
  
  /**
   * Converts engine displacement in liters to the user's preferred unit
   * @param liters Engine displacement in liters
   * @returns Formatted displacement string with unit
   */
  const convertDisplacement = (liters: number): string => {
    const unit = vehicleUnits.value.displacement;
    let value = liters;
    
    if (unit === 'cu in') {
      value = conversions.literToCubicInch(liters);
      return `${Math.round(value)} ${unit}`;
    } else if (unit === 'cc') {
      value = conversions.literToCc(liters);
      return `${Math.round(value)} ${unit}`;
    }
    
    return `${value.toFixed(1)} ${unit}`;
  };
  
  /**
   * Converts fuel capacity in liters to the user's preferred unit
   * @param liters Fuel capacity in liters
   * @returns Formatted fuel capacity string with unit
   */
  const convertFuelCapacity = (liters: number): string => {
    const unit = vehicleUnits.value.fuelCapacity;
    let value = liters;
    
    if (unit === 'gal') {
      value = conversions.literToGallon(liters);
    }
    
    return `${value.toFixed(1)} ${unit}`;
  };
  
  /**
   * Converts fuel efficiency from L/100km to the user's preferred unit
   * @param l100km Fuel efficiency in liters per 100 kilometers
   * @returns Formatted fuel efficiency string with unit
   */
  const convertFuelEfficiency = (l100km: number): string => {
    const unit = vehicleUnits.value.fuelEfficiency;
    let value = l100km;
    
    if (unit === 'mpg') {
      value = conversions.l100kmToMpg(l100km);
    } else if (unit === 'km/L') {
      value = conversions.l100kmToKmL(l100km);
    }
    
    return `${value.toFixed(1)} ${unit}`;
  };
  
  /**
   * Converts a price to the user's preferred currency format
   * @param amount Price amount in the source currency
   * @param exchangeRate Exchange rate from source to target currency
   * @returns Formatted price string with currency symbol
   */
  const convertCurrency = (amount: number, exchangeRate: number = 1): string => {
    const { symbol } = currencyUnits.value;
    const value = amount * exchangeRate;
    
    return `${symbol}${value.toLocaleString()}`;
  };
  
  // ========== VEHICLE SPEC FORMATTERS ==========
  // These handle both conversion and string formatting
  
  /**
   * Formats a vehicle specification using the appropriate converter
   * @param value Value in metric units
   * @param specType Type of specification (distance, power, etc)
   * @returns Formatted specification string with appropriate unit
   */
  const formatSpec = (value: number, specType: keyof VehicleUnits): string => {
    switch (specType) {
      case 'distance':
        return convertDistance(value);
      case 'smallDistance':
        return convertSmallDistance(value);
      case 'speed':
        return convertSpeed(value);
      case 'power':
        return convertPower(value);
      case 'torque':
        return convertTorque(value);
      case 'weight':
        return convertWeight(value);
      case 'displacement':
        return convertDisplacement(value);
      case 'fuelCapacity':
        return convertFuelCapacity(value);
      case 'fuelEfficiency':
        return convertFuelEfficiency(value);
      default:
        return `${value}`;
    }
  };
  
  // ========== HELPER FUNCTIONS ==========
  
  /**
   * Gets the raw preferred unit for a specific spec type
   * @param specType Type of specification
   * @returns The preferred unit string or null if not found
   */
  const getUnitType = (specType: string): string | null => {
    if (specType in vehicleUnits.value) {
      return vehicleUnits.value[specType as keyof VehicleUnits];
    }
    return null;
  };

  // ========== PUBLIC API ==========
  return {
    // Settings access
    countryCode,
    vehicleUnits,
    currencyUnits,
    
    // Converters
    convertDistance,
    convertSmallDistance,
    convertSpeed,
    convertPower,
    convertTorque,
    convertWeight,
    convertDisplacement,
    convertFuelCapacity,
    convertFuelEfficiency,
    convertCurrency,
    
    // Main formatter
    formatSpec,
    
    // Helpers
    getUnitType
  };
}