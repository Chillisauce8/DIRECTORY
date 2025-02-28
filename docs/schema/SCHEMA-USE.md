# Schema Usage Guide

## Quick Start Guide

1. Basic Form Field:
```json
{
  "properties": {
    "myField": {
      "type": "string",
      "component": "InputText", 
      "title": "My Field"
    }
  }
}
```

2. Field with Validation:
```json
{
  "properties": {
    "email": {
      "type": "string",
      "component": "InputText",
      "title": "Email",
      "pattern": "^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$",
      "required": true
    }
  }
}
```

3. Conditional Field:
```json
{
  "properties": {
    "showExtra": {
      "type": "boolean",
      "title": "Show Extra Fields"
    },
    "extraField": {
      "type": "string",
      "hide": {
        "if": "!this.showExtra",
        "value": true
      }
    }
  }
}
```

## Table of Contents

1. [Quick Start](#quick-start-guide)
2. [Basic Concepts](#basic-concepts)
3. [Form Controls](#form-controls) 
4. [Validation](#validation-rules)
5. [Conditional Logic](#conditional-logic)
6. [Advanced Features](#advanced-features)
7. [Troubleshooting](#troubleshooting)

## Function Index

| Function | Purpose | Section Reference |
|----------|---------|------------------|
| hide / x-hide | Controls visibility of fields based on conditions | [§1](#hide--x-hide) |
| show / x-show | Alternative visibility control with simpler syntax | [§2](#show--x-show) |
| _relator / join | Creates relationships between different collections | [§3](#_relator--join) |
| component | Specifies which UI component to render | [§4](#component) |
| required / x-required | Defines conditional validation requirements | [§5](#required--x-required) |
| calculate / x-calculate | Performs dynamic calculations between fields | [§6](#calculate--x-calculate) |
| concatenate / x-concatenate | Combines multiple field values into one | [§7](#concatenate--x-concatenate) |
| default / x-default | Sets conditional default values | [§8](#default--x-default) |
| filter / x-filter | Filters available options based on conditions | [§9](#filter--x-filter) |
| container | Groups fields with shared visibility rules | [§10](#container) |
| x-options | Defines dynamic options for select components | [§11](#linked-dropdowns) |
| x-minItems / x-maxItems | Controls array length validation | [§12](#arrays-of-objects) |
| props | Configure additional component properties | [§13](#component-props) |
| if statements | Conditional logic using JavaScript expressions | [§14](#if-statements) |
| set | Dynamically set field values based on conditions | [§15](#set-values) |

## Overview

This document details all available custom extensions and functionality that can be added to JSON Schema documents in this system. These extensions enhance the base JSON Schema specification with features like conditional visibility, dynamic validation, data relationships, and UI controls.

## Schema Extensions

### X-Prefixed Properties

<h4 id="hide--x-hide">§1. hide / x-hide</h4>
Controls field visibility in the form.

Location: Can be applied to any field definition
```json
{
  "properties": {
    "myField": {
      "type": "string",
      "x-hide": {
        "match-type": true,  // true to hide, false to show
        "match-key": "otherField",  // Field to match against
        "match-values": ["value1", "value2"],  // Values that trigger hiding
        "persist": true  // Keep value in data even when hidden
      }
    }
  }
}
```

<h4 id="show--x-show">§2. show / x-show</h4>
Alternative to hide, with inverse logic.
```json
{
  "properties": {
    "myField": {
      "show": {
        "if": "otherField === 'specificValue'",  // Modern syntax
        "value": true,
        "persist": false  // Remove value when hidden
      }
    }
  }
}
```

### Relator Fields

<h4 id="_relator--join">§3. _relator / join</h4>
Defines relationships between schemas/collections.

```json
{
  "properties": {
    "linkedItem": {
      "_relator": {
        "nodeType": "collection-name",  // Target collection
        "select": ["field1", "field2"],  // Fields to fetch (modern syntax)
        "x-select": ["field1", "field2"],  // Fields to fetch (legacy syntax)
        "mappings": [  // Field mappings
          {
            "from": "sourceField",
            "to": "targetField",
            "bind": true  // Auto-update on change
          }
        ],
        "bindAll": true,  // Automatically bind all mappings
        // OR
        "bind-all-mappings": true  // Alternative syntax
      }
    }
  }
}
```

The `bindAll` (or `bind-all-mappings`) property automatically sets `bind: true` for all mappings, saving you from having to specify it on each mapping individually. This is useful when you want all mapped fields to update automatically when the related item changes.

The `select` (or `x-select`) property specifies which fields should be fetched from the related collection. This optimization:
- Reduces data transfer by only fetching needed fields
- Improves performance by limiting database queries
- Can include nested fields using dot notation (e.g. "address.city")
- Always includes system fields like '_id' and 'title' automatically

If no select is specified, all fields will be fetched.

### Form Controls

<h4 id="component">§4. component</h4>
Specifies the UI component to use.

```json
{
  "properties": {
    "myField": {
      "type": "string",
      "component": "Select",  // Available: InputText, Select, MultiSelect, DatePicker, etc.
      "options": ["option1", "option2"]  // For Select/MultiSelect
    }
  }
}
```

<h4 id="component-props">§13. Component Props</h4>
Components can be configured with additional properties using the `props` field. These map directly to PrimeVue component props:

```json
{
  "properties": {
    "textField": {
      "type": "string",
      "component": "InputText",
      "props": {
        "placeholder": "Enter text",
        "size": 30,
        "autocomplete": "off",
        "aria-label": "Text Input",
        "disabled": false
      }
    },
    "selectField": {
      "type": "string",
      "component": "Dropdown",
      "props": {
        "placeholder": "Select an item",
        "filter": true,
        "filterMatchMode": "contains",
        "showClear": true,
        "optionLabel": "name",
        "optionValue": "id",
        "virtualScrollerOptions": {
          "itemSize": 38
        }
      }
    },
    "multiSelectField": {
      "type": "array",
      "component": "MultiSelect",
      "props": {
        "filter": true,
        "maxSelectedLabels": 3,
        "display": "chip",
        "selectAll": true,
        "showToggleAll": true
      }
    },
    "dateField": {
      "type": "string",
      "component": "Calendar",
      "props": {
        "showTime": true,
        "showSeconds": false,
        "showIcon": true,
        "dateFormat": "dd/mm/yy",
        "hourFormat": "24",
        "showButtonBar": true,
        "selectionMode": "single"
      }
    },
    "numberField": {
      "type": "number",
      "component": "InputNumber",
      "props": {
        "mode": "decimal",
        "minFractionDigits": 2,
        "maxFractionDigits": 2,
        "showButtons": true,
        "buttonLayout": "horizontal",
        "prefix": "$",
        "min": 0,
        "max": 100
      }
    },
    "autoCompleteField": {
      "type": "string",
      "component": "AutoComplete",
      "props": {
        "delay": 300,
        "minLength": 1,
        "scrollHeight": "200px",
        "forceSelection": true,
        "completeOnFocus": false,
        "dropdown": true
      }
    },
    "textAreaField": {
      "type": "string",
      "component": "Textarea",
      "props": {
        "autoResize": true,
        "rows": 5,
        "cols": 30
      }
    }
  }
}
```

Common Base Props (available on most components):
- `disabled`: Boolean to disable the component
- `placeholder`: String for placeholder text
- `tabindex`: Number for tab order
- `aria-label`: String for accessibility
- `pt`: Object for pass-through styling (PrimeVue 3.29+)

Component-Specific Props:

1. **Dropdown/MultiSelect**
   - `filter`: Enable filtering options
   - `filterMatchMode`: 'contains' | 'startsWith' | 'endsWith'
   - `virtualScroller`: Enable virtual scrolling for large lists
   - `showClear`: Show clear selection button
   - `optionLabel`: Field name for option label
   - `optionValue`: Field name for option value
   - `loading`: Show loading state
   
2. **Calendar**
   - `selectionMode`: 'single' | 'multiple' | 'range'
   - `dateFormat`: Custom date format
   - `showTime`: Include time picker
   - `hourFormat`: '12' | '24'
   - `showButtonBar`: Show today/clear buttons
   - `showIcon`: Show calendar icon
   - `minDate`/`maxDate`: Date range constraints

3. **InputNumber**
   - `mode`: 'decimal' | 'currency'
   - `locale`: Number formatting locale
   - `min`/`max`: Value constraints
   - `step`: Increment/decrement step
   - `prefix`/`suffix`: Display affixes
   - `showButtons`: Show increment/decrement buttons
   - `currency`: Currency code for currency mode
   - `currencyDisplay`: Currency display format

4. **AutoComplete**
   - `delay`: Delay before searching (ms)
   - `minLength`: Min chars before search
   - `scrollHeight`: Dropdown height
   - `dropdown`: Show dropdown button
   - `multiple`: Allow multiple selections
   - `forceSelection`: Require selection from suggestions

### Validation Rules

<h4 id="required--x-required">§5. required / x-required</h4>
Defines conditional required status.

```json
{
  "properties": {
    "myField": {
      "x-required": {
        "match-key": "otherField",
        "match-values": ["value1"],
        "match-type": true
      }
    }
  }
}
```

### Calculated Values

<h4 id="calculate--x-calculate">§6. calculate / x-calculate</h4>
Performs calculations based on other fields.

```json
{
  "properties": {
    "total": {
      "type": "number",
      "x-calculate": [
        {
          "match-key": "quantity",
          "operation": "*",  // Available: +, -, *, /, %
          "const": 10  // Or use another match-key
        }
      ]
    }
  }
}
```

### Field Concatenation

<h4 id="concatenate--x-concatenate">§7. concatenate / x-concatenate</h4>
Combines multiple field values.

```json
{
  "properties": {
    "fullName": {
      "type": "string",
      "x-concatenate": [
        "&firstName",  // & prefix references other fields
        " ",
        "&lastName"
      ]
    }
  }
}
```

### Default Values

<h4 id="default--x-default">§8. default / x-default</h4>
Sets conditional default values.

```json
{
  "properties": {
    "status": {
      "type": "string",
      "x-default": {
        "match-key": "type",
        "match-values": ["new"],
        "default": "pending"
      }
    }
  }
}
```

### Value Filtering

<h4 id="filter--x-filter">§9. filter / x-filter</h4>
Filters available options based on conditions. Can be used in two ways:

1. Using match-key comparison:
```json
{
  "properties": {
    "subCategory": {
      "type": "string",
      "x-filter": {
        "match-key": "category",
        "by-field": "parentCategory"
      }
    }
  }
}
```

2. Using JavaScript expressions:
```json
{
  "properties": {
    "myField": {
      "type": "string",
      "filter": "this.item.subType && this.item.subType.includes(this.setting.type)"  // JavaScript expression
    }
  }
}
```

The expression-based filter provides more flexibility by allowing you to:
- Access current item properties using `this.item`
- Access settings using `this.setting`
- Use any JavaScript logic (includes, &&, ||, etc.)
- Reference nested properties
- Combine multiple conditions

Expression Context:
- `this.item`: The current item being filtered
- `this.setting`: Access to form settings
- `this`: The form context with access to all form data

Common Use Cases:
```json
{
  "properties": {
    "example1": {
      "filter": "this.item.status === 'active'"  // Simple equality check
    },
    "example2": {
      "filter": "this.item.price >= 100 && this.item.stock > 0"  // Multiple conditions
    },
    "example3": {
      "filter": "this.item.tags.some(tag => this.setting.allowedTags.includes(tag))"  // Array operations
    }
  }
}
```

## Advanced Features

### Nested Structures

<h4 id="arrays-of-objects">§12. Arrays of Objects</h4>
Handling repeating groups of fields.

```json
{
  "properties": {
    "items": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "name": { "type": "string" },
          "quantity": { "type": "number" }
        }
      },
      "x-minItems": 1,
      "x-maxItems": 10
    }
  }
}
```

### Dynamic Field Groups

<h4 id="container">§10. container</h4>
Groups fields with shared visibility rules.

```json
{
  "properties": {
    "section1": {
      "type": "container",
      "x-hide": {
        "match-key": "showSection",
        "match-type": false
      },
      "properties": {
        // Child fields inherit container visibility
      }
    }
  }
}
```

### Conditional Logic

<h4 id="if-statements">§14. If Statements</h4>
JavaScript expressions can be used in 'if' conditions throughout the schema for dynamic behavior. The system evaluates these as JavaScript code, allowing full use of JavaScript operators and methods:

```json
{
  "properties": {
    "myField": {
      "hide": {
        "if": "!this.setting.type",  // JavaScript NOT operator
        "value": true
      }
    },
    "complexCondition": {
      "hide": {
        "if": "['A', 'B'].includes(this.setting.type) && this.item.value > 100",  // Complex JS logic
        "value": true
      }
    },
    "arrayMethods": {
      "if": "this.item.tags.some(tag => this.allowedTags.includes(tag))",  // Array methods
      "then": {
        "show": true
      }
    }
  }
}
```

The JavaScript context provides:
- Full JavaScript expression support
- Access to array methods (map, filter, includes, etc)
- Logical operators (&&, ||, !)
- Comparison operators (===, !==, >, <, etc)
- Math operators and functions
- String methods

Common patterns:
```json
// Null/undefined checks
"if": "!this.setting.type"

// Array inclusion checks  
"if": "['A','B'].includes(this.setting.type)"

// Comparison with boolean conversion
"if": "!!/setting.category" 

// Multiple conditions
"if": "this.setting.type === 'special' && this.item.value > 100"
```

<h4 id="set-values">§15. Set Values</h4>
The 'set' property allows dynamic value setting based on conditions:

```json
{
  "properties": {
    "customerVenueChoice": {
      "type": "string",
      "title": "Customer Can Choose Venue?",
      "default": "Yes",
      "hide": {
        "if": "/setting.multiVenue !== 'Yes'",
        "value": true
      },
      "set": {
        "if": "/setting.multiVenue === 'No'",
        "then": {
          "value": "No"
        }
      },
      "enum": [
        "Yes",
        "No"
      ]
    },
    "advancedExample": {
      "set": {
        "if": "this.item.category === 'premium'",
        "then": {
          "value": "high",
          "readonly": true
        },
        "else": {
          "value": "standard",
          "readonly": false
        }
      }
    }
  }
}
```

Set Features:
- Can be triggered by JavaScript expressions or path references
- Supports 'then' and 'else' blocks
- Can set multiple properties (value, readonly, etc.)
- Executes when referenced values change
- Can be combined with other schema features like hide/show

Common Use Cases:
```json
{
  "properties": {
    "example1": {
      "set": {
        "if": "this.item.type === 'special'",
        "then": {
          "value": "Special Rate",
          "readonly": true
        }
      }
    },
    "example2": {
      "set": {
        "if": "/settings.mode === 'automatic'",
        "then": {
          "value": "Auto"
        },
        "else": {
          "value": "Manual"
        }
      }
    }
  }
}
```

## Special Schema Properties

### ignoreHistory
The `ignoreHistory` property at the root level specifies fields that should be excluded from version history and change tracking. This is typically used for:

- Computed/dynamic fields that don't represent user configuration
- Runtime state that shouldn't be versioned
- Performance optimization for large computed datasets

Example:
```json
{
  "properties": {
    // ... schema properties
  },
  "ignoreHistory": [
    "computedField1",
    "runtimeState",
    "temporaryData"
  ]
}
```

Fields listed in `ignoreHistory` will still persist their data but won't trigger version history entries when their values change.

### persist
The `persist` property can be used with visibility conditions (`hide`, `show`) to control whether a field's value should be kept when hidden. This is useful for:

- Maintaining data that is temporarily hidden
- Preserving values in conditional sections
- Supporting multi-step forms where data is collected but not shown

Example:
```json
{
  "properties": {
    "hiddenField": {
      "type": "string",
      "hide": {
        "if": "!this.setting.showAdvanced",
        "value": true,
        "persist": true  // Value will be kept when hidden
      }
    },
    "temporaryField": {
      "type": "string", 
      "hide": {
        "if": "this.setting.type !== 'special'",
        "value": true,
        "persist": false  // Value will be cleared when hidden
      }
    }
  }
}
```

Common use cases:
- Hidden admin fields: `persist: true` to maintain admin-only data
- Conditional sections: `persist: true` to preserve data when toggling sections
- Temporary inputs: `persist: false` to clear data when hidden
- Multi-step forms: `persist: true` to keep data between steps

The `persist` property can be used with:
- `hide` / `x-hide`
- `show` / `x-show` 
- `if/then` conditions
- Container visibility rules

## Best Practices

1. **Visibility Rules**
   - Use `x-hide` with `persist: true` when the data should be kept
   - Use `show` for simpler conditional display logic

2. **Validation**
   - Combine JSON Schema validation (`required`, `pattern`, etc.) with x-prefixed rules
   - Use `x-required` for dynamic requirements

3. **Relationships**
   - Use `_relator` for complex relationships
   - Specify only needed fields in `x-select` for performance

4. **Calculations**
   - Break down complex calculations into steps
   - Use appropriate number formatting with `x-step`

## Common Patterns

### Conditional Sections
```json
{
  "properties": {
    "type": {
      "type": "string",
      "enum": ["individual", "company"]
    },
    "companyDetails": {
      "type": "object",
      "x-hide": {
        "match-key": "type",
        "match-values": ["individual"],
        "match-type": true
      },
      "properties": {
        "companyName": { "type": "string" },
        "regNumber": { "type": "string" }
      }
    }
  }
}
```

### Linked Dropdowns

<h4 id="linked-dropdowns">§11. Linked Dropdowns</h4>
```json
{
  "properties": {
    "country": {
      "type": "string",
      "component": "Select",
      "options": ["USA", "UK", "Canada"]
    },
    "state": {
      "type": "string",
      "component": "Select",
      "x-options": {
        "match-key": "country",
        "mapping": {
          "USA": ["NY", "CA", "TX"],
          "UK": ["England", "Scotland", "Wales"],
          "Canada": ["ON", "BC", "QC"]
        }
      }
    }
  }
}
```

## Layout Controls

### Field Layout Properties
The system supports several properties for controlling field layout and appearance:

```json
{
  "properties": {
    "field1": {
      "type": "string",
      "line": 2,  // Controls vertical ordering
      "flex": 50  // Controls field width (out of 100)
    },
    "gridSection": {
      "x-grid": true,  // Displays children in grid layout
      "items": {
        // ...grid items
      }
    }
  }
}
```

### Dynamic Titles
The `x-title` property allows dynamic title construction:

```json
{
  "properties": {
    "maxPeople": {
      "type": "number",
      "x-title": {
        "match-type": true,
        "value": [
          "Max people per",
          "&config.unitType"  // Reference another field
        ]
      }
    }
  }
}
```

### Special Field Types
The `fieldType` property specifies special input types:

```json
{
  "properties": {
    "multipleChoice": {
      "type": "array",
      "fieldType": "multiselect",  // Multi-select dropdown
      "items": {
        "type": "string",
        "enum": ["option1", "option2"]
      }
    },
    "images": {
      "type": "array", 
      "fieldType": "imageslist"  // Image upload/gallery
    },
    "videos": {
      "type": "array",
      "fieldType": "videolist"  // Video upload/gallery
    },
    "autoComplete": {
      "fieldType": "autocomplete",
      "requireMatch": false
    }
  }
}
```

### Extended Enums
The `x-enum` property supports complex conditional enums:

```json
{
  "properties": {
    "field": {
      "type": "string",
      "x-enum": [
        {
          "match-key": "category.name",
          "match-values": ["TypeA"],
          "match-type": true,
          "enum": ["A1", "A2", "A3"]
        },
        {
          "match-key": "category.name", 
          "match-values": ["TypeB"],
          "match-type": true,
          "enum": ["B1", "B2", "B3"]
        },
        {
          "match-type": false,  // Default fallback
          "enum": ["Default1", "Default2"]
        }
      ]
    }
  }
}
```

### Data Formats
Special format types for fields:

```json
{
  "properties": {
    "startDate": {
      "type": "string",
      "format": "date"  // Date picker
    },
    "startTime": {
      "type": "string", 
      "format": "time"  // Time picker
    }
  }
}
```

## Debugging Tips

1. Check the browser console for validation errors
2. Use the Vue devtools to inspect form state
3. Verify path references in `match-key` values
4. Test persistence with `persist: true` when troubleshooting visibility rules

## Common Issues and Solutions

1. **Hidden Fields Not Clearing**
   - Ensure `persist: false` is set when values should be cleared

2. **Calculations Not Updating**
   - Verify all referenced fields in `match-key` exist
   - Check for circular dependencies

3. **Relator Not Loading**
   - Verify collection names and permissions
   - Check network requests for API errors

4. **Validation Not Triggering**
   - Ensure validation rules are at the correct level in the schema
   - Check for conflicting rules

## Deprecated Features & Modern Alternatives

The following features still work but are being phased out in favor of newer approaches:

### Legacy Path References → Modern Syntax 
1. `G/` prefixed paths are being replaced with `this.global`:
```json
{
  "if": "G/userType !== 'staff'"  // Legacy
  "if": "this.global.userType !== 'staff'"  // Modern
}
```

2. Absolute paths `/setting.type` being replaced with `this` context:
```json
{
  "if": "/setting.type === 'special'"  // Legacy
  "if": "this.setting.type === 'special'"  // Modern
}
```

### _relator → join
The `_relator` field has been replaced by `join` which provides a cleaner syntax for defining relationships:

```json
{
  "properties": {
    "legacyWay": {
      "_relator": {  // Deprecated
        "nodeType": "collection-name",
        "mappings": [...]
      }
    },
    "modernWay": {
      "join": {  // Preferred
        "collection": "collection-name", 
        "mappings": [...]
      }
    }
  }
}
```

### fieldType → component
The `fieldType` property is being replaced by `component` which directly specifies the PrimeVue component to use:

```json
{
  "properties": {
    "legacyField": {
      "type": "string",
      "fieldType": "textarea"  // Deprecated
    },
    "modernField": {
      "type": "string",
      "component": "Textarea",  // Preferred - references PrimeVue component
      "props": {  // Configure component via props
        "autoResize": true,
        "rows": 5
      }
    }
  }
}
```

Common component mappings:
- `fieldType: "textarea"` → `component: "Textarea"`
- `fieldType: "multiselect"` → `component: "MultiSelect"`
- `fieldType: "imageslist"` → `component: "ImageUploader"`
- `fieldType: "videolist"` → `component: "VideoUploader"`
- `fieldType: "autocomplete"` → `component: "AutoComplete"`

### x-select → select
In join/relator configurations:
```json
{
  "legacyWay": {
    "x-select": ["field1", "field2"]  // Deprecated
  },
  "modernWay": {
    "select": ["field1", "field2"]  // Modern
  }
}
```

### format → component props
Instead of using `format`, configure the component's behavior through `props`:

```json
{
  "properties": {
    "legacyDate": {
      "type": "string",
      "format": "date"  // Deprecated
    },
    "modernDate": {
      "type": "string",
      "component": "Calendar",  // Preferred
      "props": {
        "dateFormat": "dd/mm/yy",
        "showIcon": true
      }
    }
  }
}
```

Common migrations:
- `format: "date"` → `component: "Calendar"`
- `format: "time"` → `component: "Calendar"` with `props: { "timeOnly": true }`
- `format: "datetime"` → `component: "Calendar"` with `props: { "showTime": true }`

### x-required → required with conditions
```json
{
  "properties": {
    "legacyWay": {
      "x-required": {  // Deprecated
        "match-key": "otherField",
        "match-values": ["value1"]
      }
    },
    "modernWay": {
      "required": {  // Modern
        "if": "this.otherField === 'value1'",
        "value": true
      }
    }
  }
}
```

### match-type/match-values → if/then
```json
{
  "properties": {
    "legacyWay": {
      "x-hide": {  // Deprecated
        "match-type": true,
        "match-key": "type",
        "match-values": ["A", "B"]
      }
    },
    "modernWay": {
      "hide": {  // Modern
        "if": "['A', 'B'].includes(this.type)",
        "value": true
      }
    }
  }
}
```

The modern approaches provide:
- More consistent JavaScript-based syntax
- Better TypeScript support
- Direct integration with Vue.js and PrimeVue
- Cleaner, more maintainable code
- Better IDE support and code completion
- More flexible conditional logic

Migration Tips:
1. Update path references to use `this` context
2. Replace x-prefixed properties with their modern equivalents
3. Convert match conditions to JavaScript expressions
4. Use component props instead of legacy format/fieldType properties
5. Update relator configurations to use new join syntax

## Special Path References 

### Global Variables (G/)
References prefixed with 'G/' access global context variables:

```json
{
  "properties": {
    "supplierField": {
      "default": "G/supplier",  // Reference global supplier
      "if": "G/userType !== 'staff'",  // Check global user type
      "then": {
        "hide": true
      }
    }
  }
}
```

Common global variables:
- `G/supplier` - Current supplier context
- `G/userType` - Current user type
- `G/supplier.subSuppliers` - Related suppliers

### Dynamic Path References
References can use dot notation and array indexing:
- Simple: `/setting.type`
- Array index: `/items[0].value`
- Nested: `/setting.category.title`

## Extended Field Features

### x-set Arrays
The x-set property can be either a simple object or array of conditions:

```json
{
  "properties": {
    "field": {
      "x-set": [
        {
          "match-key": "category.name",
          "match-values": ["TypeA"],
          "match-type": true,
          "value": "valueA"
        },
        {
          "match-key": "category.name",
          "match-values": ["TypeB"],
          "match-type": true,
          "value": "valueB" 
        }
      ]
    }
  }
}
```

### Dynamic Titles (x-title)
x-title supports dynamic concatenation and field references:

```json 
{
  "properties": {
    "maxPeople": {
      "x-title": {
        "match-type": true,
        "value": [
          "Max people per",  // Static text
          "&config.unitType" // Field reference
        ]
      }
    }
  }
}
```

### Extended Enums with Path References
x-enum supports referencing values from other fields:

```json
{
  "properties": {
    "field": {
      "x-enum": {
        "enum": "&category.allowedValues",  // Reference field
        "title-path": "name",    // Path for display text
        "value-path": "id"       // Path for actual value
      }
    }
  }
}
```

### Array Validation Conditions 
x-minItems/x-maxItems support conditional validation:

```json
{
  "properties": {
    "venues": {
      "type": "array",
      "x-maxItems": [
        {
          "match-key": "setting.multiVenue",
          "match-values": ["No"],
          "match-type": true,
          "value": 1
        }
      ],
      "x-minItems": [
        {
          "match-key": "setting.multiVenue", 
          "match-values": ["Yes"],
          "match-type": true,
          "value": 2
        }
      ]
    }
  }
}
```

### Field Ordering
The `line` property controls vertical field ordering:

```json
{
  "properties": {
    "field1": {
      "line": 1  // Appears first
    },
    "field2": {
      "line": 2  // Appears second 
    }
  }
}
```

## Common Patterns & Examples

### Multi-Step Form
```json
{
  "properties": {
    "step1": {
      "type": "container",
      "hide": {
        "if": "this.currentStep !== 1",
        "value": true,
        "persist": true
      },
      "properties": {
        // Step 1 fields
      }
    },
    "step2": {
      "type": "container", 
      "hide": {
        "if": "this.currentStep !== 2",
        "value": true,
        "persist": true
      },
      "properties": {
        // Step 2 fields
      }
    }
  }
}
```

### Dynamic Validation
```json
{
  "properties": {
    "paymentType": {
      "type": "string",
      "enum": ["credit", "bank"]
    },
    "creditCard": {
      "type": "string",
      "x-required": {
        "if": "this.paymentType === 'credit'",
        "value": true
      },
      "pattern": "^[0-9]{16}$"
    }
  }
}
```

## Troubleshooting Guide

### Common Errors

1. **Field Not Showing/Hiding Correctly**
   - Check path references are correct
   - Verify condition syntax
   - Check persist values
   - Example fix:
   ```json
   {
     "hide": {
       "if": "this.setting.type",  // ❌ Wrong
       "if": "!this.setting.type"  // ✅ Correct
     }
   }
   ```

2. **Validation Not Working** 
   - Ensure x-required conditions match
   - Check pattern syntax
   - Verify field types
   
3. **Relator Not Loading**
   - Check collection names
   - Verify mappings exist
   - Confirm select query syntax

### Best Practices Checklist

- [ ] Use consistent naming
- [ ] Group related fields in containers
- [ ] Add clear titles and descriptions
- [ ] Use appropriate component types
- [ ] Handle all condition cases
- [ ] Test validation rules
- [ ] Document custom logic
