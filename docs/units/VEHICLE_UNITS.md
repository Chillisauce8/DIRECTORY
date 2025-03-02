# Vehicle Unit Conversion System in Nuxt 3

This document outlines the Vehicle Unit Conversion system for our classic car website, which automatically handles measurement units and currency formatting based on user location.

## Table of Contents

- [Overview](#overview)
- [File Structure](#file-structure)
- [Core Concept](#core-concept)
- [Units and Conversions](#units-and-conversions)
- [Usage Examples](#usage-examples)
  - [Basic Usage](#basic-usage)
  - [Complete Example](#complete-example)
  - [Using Generic Formatter](#using-generic-formatter)
- [Integration with Country Detection](#integration-with-country-detection)
- [Extending the System](#extending-the-system)
  - [Adding More Countries](#adding-more-countries)
  - [Adding More Unit Types](#adding-more-unit-types)
  - [Currency Exchange Rates](#currency-exchange-rates)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Overview

The Vehicle Unit Conversion System provides an easy way to display vehicle specifications in locally appropriate units based on the user's country. All data is stored in metric units and automatically converted to the appropriate local units when displayed to users.

## File Structure

Our unit conversion system consists of two main files:

1. **Types File**: `types/vehicleUnits.ts`
   - Contains TypeScript definitions for all unit types, interfaces, and conversion functions
   - Defines the exact string values used for each unit
   - Exports default metric units

2. **Composable File**: `composables/useVehicleUnits.ts`
   - Contains the implementation of the `useVehicleUnits()` composable
   - Includes country-specific settings for the top 30 countries
   - Provides conversion functions from metric values to localized units
   - Handles formatting values with appropriate units

## Core Concept

The system follows these principles:

1. **Store in Metric**: All vehicle specifications in the database are stored in metric units:
   - Distances: kilometers (km)
   - Small distances: millimeters (mm)
   - Speed: kilometers per hour (km/h)
   - Engine displacement: liters (L)
   - Power: kilowatts (kW)
   - Torque: newton meters (Nm)
   - Weight: kilograms (kg)
   - Fuel capacity: liters (L)
   - Fuel efficiency: liters per 100 kilometers (L/100km)

2. **Display in Local Units**: When data is displayed to users, it's automatically converted to their preferred units based on their country.

3. **Pre-Formatted Units**: All unit strings are stored in their display format (e.g., "km/h" instead of "kph"), eliminating the need for additional mapping or formatting.

## Units and Conversions

The system supports the following unit types with their respective conversions:

| Measurement Type    | Metric (Storage) | Common Alternative Units            | Conversion Factor              |
|---------------------|------------------|------------------------------------|---------------------------------|
| Distance            | km               | mi (miles)                         | 1 km = 0.621371 mi              |
| Small Distance      | mm               | in (inches)                        | 1 mm = 0.0393701 in             |
| Speed               | km/h             | mph                                | 1 km/h = 0.621371 mph           |
| Displacement        | L (liters)       | cu in (cubic inches), cc (cm³)     | 1 L = 61.0237 cu in = 1000 cc   |
| Power               | kW (kilowatts)   | hp, bhp, PS, CV, etc.             | 1 kW = 1.34102 hp = 1.35962 PS  |
| Torque              | Nm (newton meters) | lb-ft (pound-feet)               | 1 Nm = 0.737562 lb-ft          |
| Weight              | kg (kilograms)   | lb (pounds)                        | 1 kg = 2.20462 lb               |
| Fuel Capacity       | L (liters)       | gal (US gallons)                   | 1 L = 0.264172 gal              |
| Fuel Efficiency     | L/100km          | mpg (miles per gallon), km/L       | See conversion functions        |

## Usage Examples

### Basic Usage

```vue
<script setup>
import { useVehicleUnits } from '~/composables/useVehicleUnits'

// Get the vehicle units composable
const { convertPower, convertTorque, convertSpeed } = useVehicleUnits()

// Car data (stored in metric units)
const enginePower = 250 // kW
const engineTorque = 500 // Nm
const topSpeed = 280 // km/h
</script>

<template>
  <div>
    <p>Engine Power: {{ convertPower(enginePower) }}</p>
    <p>Engine Torque: {{ convertTorque(engineTorque) }}</p>
    <p>Top Speed: {{ convertSpeed(topSpeed) }}</p>
  </div>
</template>
```

### Complete Example

```vue
<script setup>
import { useVehicleUnits } from '~/composables/useVehicleUnits'

// Get the vehicle units composable
const { 
  convertDistance, 
  convertSmallDistance,
  convertSpeed, 
  convertPower, 
  convertTorque, 
  convertWeight,
  convertDisplacement,
  convertFuelCapacity,
  convertFuelEfficiency,
  convertCurrency
} = useVehicleUnits()

// Car data (all in metric units)
const car = {
  name: 'Classic Speedster',
  engine: {
    displacement: 5.0, // liters
    power: 300, // kilowatts
    torque: 550 // newton meters
  },
  performance: {
    topSpeed: 250, // km/h
    acceleration: 4.5 // 0-100 km/h in seconds
  },
  dimensions: {
    length: 4.78, // meters
    width: 1.89, // meters
    height: 1.42, // meters
    weight: 1650, // kilograms
    wheelbase: 2850, // millimeters
    groundClearance: 120 // millimeters
  },
  fuel: {
    capacity: 70, // liters
    consumption: 9.8 // L/100km
  },
  price: 75000 // base currency (e.g., USD)
}
</script>

<template>
  <div class="car-specs">
    <h1>{{ car.name }}</h1>
    
    <section>
      <h2>Engine & Performance</h2>
      <div class="specs-grid">
        <div class="spec">
          <span class="label">Displacement:</span>
          <span class="value">{{ convertDisplacement(car.engine.displacement) }}</span>
        </div>
        <div class="spec">
          <span class="label">Power:</span>
          <span class="value">{{ convertPower(car.engine.power) }}</span>
        </div>
        <div class="spec">
          <span class="label">Torque:</span>
          <span class="value">{{ convertTorque(car.engine.torque) }}</span>
        </div>
        <div class="spec">
          <span class="label">Top Speed:</span>
          <span class="value">{{ convertSpeed(car.performance.topSpeed) }}</span>
        </div>
      </div>
    </section>
    
    <section>
      <h2>Dimensions</h2>
      <div class="specs-grid">
        <div class="spec">
          <span class="label">Length:</span>
          <span class="value">{{ convertDistance(car.dimensions.length) }}</span>
        </div>
        <div class="spec">
          <span class="label">Width:</span>
          <span class="value">{{ convertDistance(car.dimensions.width) }}</span>
        </div>
        <div class="spec">
          <span class="label">Height:</span>
          <span class="value">{{ convertDistance(car.dimensions.height) }}</span>
        </div>
        <div class="spec">
          <span class="label">Weight:</span>
          <span class="value">{{ convertWeight(car.dimensions.weight) }}</span>
        </div>
        <div class="spec">
          <span class="label">Wheelbase:</span>
          <span class="value">{{ convertSmallDistance(car.dimensions.wheelbase) }}</span>
        </div>
        <div class="spec">
          <span class="label">Ground Clearance:</span>
          <span class="value">{{ convertSmallDistance(car.dimensions.groundClearance) }}</span>
        </div>
      </div>
    </section>
    
    <section>
      <h2>Fuel & Economy</h2>
      <div class="specs-grid">
        <div class="spec">
          <span class="label">Fuel Capacity:</span>
          <span class="value">{{ convertFuelCapacity(car.fuel.capacity) }}</span>
        </div>
        <div class="spec">
          <span class="label">Fuel Consumption:</span>
          <span class="value">{{ convertFuelEfficiency(car.fuel.consumption) }}</span>
        </div>
      </div>
    </section>
    
    <section>
      <h2>Price</h2>
      <div class="price">{{ convertCurrency(car.price) }}</div>
    </section>
  </div>
</template>
```

### Using Generic Formatter

The generic `formatSpec` function provides a more flexible way to handle different types of units:

```vue
<script setup>
import { useVehicleUnits } from '~/composables/useVehicleUnits'

// Get the formatSpec function
const { formatSpec } = useVehicleUnits()

// Car data (all in metric units)
const specs = {
  displacement: 5.0, // liters
  power: 300, // kilowatts
  torque: 550, // newton meters
  topSpeed: 250, // km/h
  weight: 1650 // kilograms
}

// Specifications we want to display
const specsToShow = [
  { label: 'Engine', type: 'displacement', value: specs.displacement },
  { label: 'Power', type: 'power', value: specs.power },
  { label: 'Torque', type: 'torque', value: specs.torque },
  { label: 'Top Speed', type: 'speed', value: specs.topSpeed },
  { label: 'Weight', type: 'weight', value: specs.weight }
]
</script>

<template>
  <div class="specs-list">
    <div v-for="(spec, index) in specsToShow" :key="index" class="spec-item">
      <span class="spec-label">{{ spec.label }}:</span>
      <span class="spec-value">{{ formatSpec(spec.value, spec.type) }}</span>
    </div>
  </div>
</template>
```

## Integration with Country Detection

This system is designed to work with your locale settings system. It expects to find a country code in the Nuxt app context. Adjust the `countryCode` computed property in `useVehicleUnits.ts` to match your app's locale settings structure:

```typescript
// In useVehicleUnits.ts
const countryCode = computed<string>(() => {
  // Replace this with your own logic to get the user's country
  return $localeSettings?.country || 'US';
});
```

## Extending the System

### Adding More Countries

To add more countries to the system, simply add new entries to the `countrySettings` array in `useVehicleUnits.ts`:

```json
{
  "countryCode": "NEW_COUNTRY_CODE",
  "currencyUnits": {
    "code": "CURRENCY_CODE",
    "name": "Currency Name",
    "symbol": "$"
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
}
```

### Adding More Unit Types

To add new types of measurements:

1. **Update the types/vehicleUnits.ts file:**
   - Add a new type definition
   - Add the new property to the VehicleUnits interface
   - Update the DEFAULT_UNITS constant

2. **Update useVehicleUnits.ts:**
   - Add the new unit to each country in countrySettings
   - Add conversion functions
   - Add a new converter function
   - Update the formatSpec function to handle the new type

### Currency Exchange Rates

To support real-time currency conversion, you'll need to integrate with an exchange rate API:

```typescript
// Example integration with exchange rate API
const { convertCurrency } = useVehicleUnits()
const { data: exchangeRates } = await useFetch('/api/exchange-rates')

// Convert 50,000 USD to local currency
const localPrice = convertCurrency(50000, exchangeRates.value[currencyUnits.value.code])
```

## Best Practices

- Store all data in metric units in your database
- Use converter functions when displaying data to users
- Provide a UI for users to override their detected country/units preferences
- Cache exchange rates for currency conversion
- Use the unit directly from vehicleUnits.value if you need to know what unit is being used without formatting a value

## Troubleshooting

| Issue | Possible Solution |
|-------|-------------------|
| Wrong Units Shown | Check if the user's country is being detected correctly. Verify the value of `countryCode.value` in the composable. |
| Formatting Issues | Ensure values are provided in the correct metric units for conversion functions. |
| Missing Countries | Add the country to the `countrySettings` array in `useVehicleUnits.ts`. |
| Currency Formatting | For more complex currency formatting, consider using `Intl.NumberFormat` with appropriate locale options. |
| Incorrect Conversions | Double-check the conversion factors in the `conversions` object against official conversion tables. |



