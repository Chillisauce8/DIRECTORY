# Outlaw 88 Style System

NOTE - This has not been signed off yet so should not be used!!

## Overview

This style system translates the Outlaw 88 brand guidelines into actionable specifications for AI-assisted page and component building. It provides precise values and rules to ensure consistent design implementation across digital products.

## 1. Colors

### Primary Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| Racing Red | #C8102E | (200, 16, 46) | Primary brand color, call-to-action buttons, important highlights |
| Mechanical Graphite | #333F48 | (51, 63, 72) | Main text, headers, backgrounds |

### Secondary Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| Aged Leather | #854A2B | (133, 74, 43) | Accent elements, historical content sections |
| Polished Aluminum | #D0D3D4 | (208, 211, 212) | Neutral backgrounds, borders, dividers |
| Road Dust Khaki | #BBA14F | (187, 161, 79) | Secondary accents, highlighted content areas |
| Rally Blue | #1F5AA6 | (31, 90, 166) | Secondary buttons, complementary accent to Racing Red |

### Functional Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| Redline Warning | #FF4438 | (255, 68, 56) | Error messages, critical alerts |
| Oil Pressure Green | #2E7D32 | (46, 125, 50) | Success messages, confirmations |
| Caution Amber | #F9A826 | (249, 168, 38) | Warnings, notices requiring attention |
| Blueprint Blue | #0277BD | (2, 119, 189) | Links, interactive elements |

### Neutral Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| Racing Black | #121212 | (18, 18, 18) | Deep backgrounds, text on light surfaces |
| Exhaust Grey | #707070 | (112, 112, 112) | Secondary text, disabled elements |
| Fog Light | #F5F5F5 | (245, 245, 245) | Light backgrounds, text input fields |
| Pure White | #FFFFFF | (255, 255, 255) | Text on dark backgrounds, clean surfaces |

## 2. Typography

### Font Families

**Primary Font: Tungsten**
- Usage: Headings, navigation, buttons, UI elements
- Character: Bold, condensed, mechanical precision
- Fallback: Impact, Haettenschweiler, sans-serif

**Secondary Font: Tiempos Text**
- Usage: Body text, paragraphs, descriptions
- Character: Refined, readable serif
- Fallback: Georgia, Times New Roman, serif

**Accent Font: Operator Mono**
- Usage: Specifications, technical details, code blocks
- Character: Modern monospaced with subtle character
- Fallback: Consolas, "Courier New", monospace

### Type Scale

| Element | Font | Weight | Size (px) | Line Height | Letter Spacing | Case |
|---------|------|--------|-----------|-------------|----------------|------|
| h1 | Tungsten | Bold | 48px | 1.1 | -0.5px | Uppercase |
| h2 | Tungsten | Bold | 36px | 1.1 | -0.3px | Uppercase |
| h3 | Tungsten | Medium | 28px | 1.2 | -0.2px | Uppercase |
| h4 | Tungsten | Medium | 24px | 1.2 | -0.1px | Uppercase |
| h5 | Tungsten | Medium | 20px | 1.3 | 0px | Uppercase |
| h6 | Tungsten | Medium | 18px | 1.3 | 0px | Uppercase |
| Subtitle | Tiempos Text | Semibold | 18px | 1.4 | 0px | Normal |
| Body | Tiempos Text | Regular | 16px | 1.5 | 0px | Normal |
| Body Small | Tiempos Text | Regular | 14px | 1.5 | 0px | Normal |
| Caption | Tiempos Text | Italic | 12px | 1.4 | 0.2px | Normal |
| Button | Tungsten | Medium | 18px | 1 | 0.5px | Uppercase |
| Navigation | Tungsten | Medium | 16px | 1 | 0.5px | Uppercase |
| Technical | Operator Mono | Regular | 14px | 1.6 | 0px | Normal |
| Technical Small | Operator Mono | Regular | 12px | 1.6 | 0px | Normal |

### Text Styling

**Link Styling:**
- Default: Blueprint Blue (#0277BD), no underline
- Hover: Blueprint Blue (#0277BD) with underline
- Visited: Darkened Blueprint Blue (#01579B)
- Focus: Blueprint Blue (#0277BD) with 2px outline in Racing Red (#C8102E)

**Emphasis:**
- Primary emphasis: Bold text
- Secondary emphasis: Italics
- Technical emphasis: Operator Mono with Road Dust Khaki (#BBA14F) background

## 3. Spacing and Layout

### Spacing Scale

| Size | Value (px) | Usage |
|------|------------|-------|
| xxxs | 4px | Minimum spacing, tight component internals |
| xxs | 8px | Tight spacing, icon padding |
| xs | 12px | Component internal padding |
| sm | 16px | Standard component padding |
| md | 24px | Section padding, related content grouping |
| lg | 32px | Component group spacing |
| xl | 48px | Section spacing |
| xxl | 64px | Major section divisions |
| xxxl | 96px | Page sections, hero areas |

### Grid System

**Base Unit:** 8px

**Container Widths:**
- Mobile: 100% (320px - 767px)
- Tablet: 720px (768px - 1023px)
- Desktop: 1080px (1024px - 1439px)
- Wide Desktop: 1320px (1440px+)

**Grid Columns:**
- Mobile: 4 columns
- Tablet: 8 columns
- Desktop: 12 columns
- Gutter width: 24px

**Mechanical Grid System:**
- Inspired by technical drawings and workshop manuals
- Structure without rigidity
- Base grid with 8px increments
- Workshop-inspired overlays for decorative elements

## 4. Components

### Buttons

**Primary Button:**
- Background: Racing Red (#C8102E)
- Text: White (#FFFFFF)
- Font: Tungsten, Medium, 18px, uppercase
- Padding: 12px 24px
- Border: None
- Border Radius: 2px
- Hover: Darkened Racing Red (#A70D26)
- Active: Further darkened (#8B0B20)
- Disabled: Exhaust Grey (#707070) with 50% opacity

**Secondary Button:**
- Background: Rally Blue (#1F5AA6)
- Text: White (#FFFFFF)
- Font: Tungsten, Medium, 18px, uppercase
- Padding: 12px 24px
- Border: None
- Border Radius: 2px
- Hover: Darkened Rally Blue (#194A87)
- Active: Further darkened (#143D70)
- Disabled: Exhaust Grey (#707070) with 50% opacity

**Outline Button:**
- Background: Transparent
- Text: Mechanical Graphite (#333F48)
- Font: Tungsten, Medium, 18px, uppercase
- Padding: 10px 22px
- Border: 2px solid Mechanical Graphite (#333F48)
- Border Radius: 2px
- Hover: Background 10% Mechanical Graphite
- Active: Background 20% Mechanical Graphite
- Disabled: Border and text Exhaust Grey (#707070) with 50% opacity

**Ghost Button:**
- Background: Transparent
- Text: Racing Red (#C8102E)
- Font: Tungsten, Medium, 18px, uppercase
- Padding: 12px 24px
- Border: None
- Hover: Background 5% Racing Red
- Active: Background 10% Racing Red
- Disabled: Text Exhaust Grey (#707070) with 50% opacity

### Cards

**Standard Card:**
- Background: White (#FFFFFF)
- Border: 1px solid Polished Aluminum (#D0D3D4)
- Border Radius: 2px
- Shadow: 0 2px 4px rgba(0,0,0,0.1)
- Padding: 24px
- Title: Tungsten, Bold, 24px
- Subtitle: Tiempos Text, Semibold, 18px
- Body: Tiempos Text, Regular, 16px
- Technical Details: Operator Mono, Regular, 14px

**Vehicle Card:**
- Background: White (#FFFFFF)
- Border: 1px solid Polished Aluminum (#D0D3D4)
- Border Radius: 2px
- Shadow: 0 2px 4px rgba(0,0,0,0.1)
- Image: Full-width at top, 16:9 ratio
- Content Padding: 24px
- Vehicle Name: Tungsten, Bold, 24px
- Vehicle Year: Tungsten, Medium, 18px, Racing Red (#C8102E)
- Details: Tiempos Text, Regular, 16px
- Specifications: Operator Mono, Regular, 14px

**Event Card:**
- Background: White (#FFFFFF)
- Border-Left: 4px solid Racing Red (#C8102E)
- Border Radius: 0
- Shadow: 0 2px 4px rgba(0,0,0,0.1)
- Padding: 24px
- Date: Tungsten, Bold, 18px, Racing Red (#C8102E)
- Title: Tungsten, Bold, 24px
- Location: Tiempos Text, Italic, 16px
- Description: Tiempos Text, Regular, 16px

### Navigation

**Primary Navigation:**
- Background: Mechanical Graphite (#333F48)
- Text: White (#FFFFFF)
- Font: Tungsten, Medium, 16px, uppercase
- Item Padding: 16px 24px
- Active Item: Bottom border 4px Racing Red (#C8102E)
- Hover: Background 20% lighter than Mechanical Graphite
- Logo Position: Left aligned

**Secondary Navigation:**
- Background: White (#FFFFFF)
- Text: Mechanical Graphite (#333F48)
- Font: Tungsten, Medium, 14px, uppercase
- Item Padding: 12px 16px
- Active Item: Text Racing Red (#C8102E)
- Hover: Text Racing Red (#C8102E)
- Border Bottom: 1px solid Polished Aluminum (#D0D3D4)

**Mobile Navigation:**
- Menu Icon: Racing Red (#C8102E), 24px
- Slide-in menu from left
- Background: Mechanical Graphite (#333F48)
- Text: White (#FFFFFF)
- Font: Tungsten, Medium, 18px, uppercase
- Item Padding: 16px 24px
- Item Border Bottom: 1px solid rgba(255,255,255,0.1)
- Active Item: Left border 4px Racing Red (#C8102E)

### Forms

**Input Field:**
- Background: White (#FFFFFF)
- Border: 1px solid Polished Aluminum (#D0D3D4)
- Border Radius: 2px
- Padding: 12px 16px
- Text: Mechanical Graphite (#333F48)
- Font: Tiempos Text, Regular, 16px
- Label: Tungsten, Medium, 14px, uppercase
- Focus: Border 2px Blueprint Blue (#0277BD)
- Error: Border 2px Redline Warning (#FF4438)
- Disabled: Background Fog Light (#F5F5F5), Text Exhaust Grey (#707070)

**Dropdown:**
- Same as Input Field
- Dropdown Icon: Mechanical Graphite (#333F48)
- Options Background: White (#FFFFFF)
- Option Hover: Background Road Dust Khaki (#BBA14F) at 10% opacity
- Selected Option: Background Road Dust Khaki (#BBA14F) at 20% opacity

**Checkbox:**
- Border: 2px solid Mechanical Graphite (#333F48)
- Border Radius: 2px
- Size: 16px × 16px
- Checked Icon: White (#FFFFFF)
- Checked Background: Racing Red (#C8102E)
- Label: Tiempos Text, Regular, 16px

**Radio Button:**
- Border: 2px solid Mechanical Graphite (#333F48)
- Border Radius: 50%
- Size: 16px × 16px
- Selected Dot: Racing Red (#C8102E)
- Label: Tiempos Text, Regular, 16px

### Alerts and Notifications

**Success Alert:**
- Background: Oil Pressure Green (#2E7D32) at 10% opacity
- Border Left: 4px solid Oil Pressure Green (#2E7D32)
- Text: Mechanical Graphite (#333F48)
- Icon: Oil Pressure Green (#2E7D32)
- Padding: 16px

**Warning Alert:**
- Background: Caution Amber (#F9A826) at 10% opacity
- Border Left: 4px solid Caution Amber (#F9A826)
- Text: Mechanical Graphite (#333F48)
- Icon: Caution Amber (#F9A826)
- Padding: 16px

**Error Alert:**
- Background: Redline Warning (#FF4438) at 10% opacity
- Border Left: 4px solid Redline Warning (#FF4438)
- Text: Mechanical Graphite (#333F48)
- Icon: Redline Warning (#FF4438)
- Padding: 16px

**Info Alert:**
- Background: Blueprint Blue (#0277BD) at 10% opacity
- Border Left: 4px solid Blueprint Blue (#0277BD)
- Text: Mechanical Graphite (#333F48)
- Icon: Blueprint Blue (#0277BD)
- Padding: 16px

**Toast Notification:**
- Background: Mechanical Graphite (#333F48)
- Text: White (#FFFFFF)
- Border Radius: 2px
- Shadow: 0 4px 8px rgba(0,0,0,0.2)
- Padding: 12px 16px
- Success Indicator: 4px top border in Oil Pressure Green (#2E7D32)
- Error Indicator: 4px top border in Redline Warning (#FF4438)
- Duration: 5 seconds default

## 5. Imagery Guidelines

### Brand Identity Elements

**Race Roundels:**
- Circular/oval racing number elements
- Bold "88" numbers in race-inspired typography
- High contrast edges with subtle distressing
- Apply as overlays on vehicle images when appropriate

**Outlaw Badges:**
- Showcase authentic "Outlaw" badges similar to customized vintage Porsches
- Use in detail shots and component decorative elements

**8-Ball Shifters:**
- Include as iconography element where appropriate
- Visual shorthand for customization culture

### Photography Style

**Vehicle Photography:**
- Low-angle, dramatic compositions
- Natural environments suggesting adventure
- Action shots showing vehicles in motion
- Moody lighting creating depth and drama
- Authentic settings (roads, race tracks, workshops)

**Image Processing:**
- Contrast: High to medium-high
- Saturation: Slightly desaturated except for brand colors
- Vignetting: Subtle to create focus
- Grain: Light film grain texture for authenticity
- Historical Images: Period-appropriate treatments

**Image Ratios:**
- Hero images: 16:9 or 21:9 for landscapes
- Vehicle profiles: 3:2
- Detail shots: 1:1 or 4:3
- Article headers: 16:9

### Background Elements

**Workshop Texture Overlays:**
- Subtle grunge textures
- Low opacity (5-15%)
- Use sparingly as section dividers or panel backgrounds

**Machine-Turned Metal Patterns:**
- Circular, precision-machined patterns
- Use as header backgrounds or decorative panels
- Light patterns on dark backgrounds for best effect

**Road Map Textures:**
- Vintage road atlas and rally map-inspired patterns
- Use as full-bleed backgrounds with low opacity
- Combine with solid color overlays from palette

## 6. UI Patterns

### Dashboard Components

**Vehicle Stats Panel:**
- Background: White (#FFFFFF)
- Border: 1px solid Polished Aluminum (#D0D3D4)
- Border Radius: 2px
- Shadow: 0 2px 4px rgba(0,0,0,0.1)
- Header: Tungsten, Bold, 20px, Racing Red (#C8102E)
- Stats Labels: Tungsten, Medium, 14px
- Stats Values: Operator Mono, Regular, 16px
- Icons: Line style in Mechanical Graphite (#333F48)

**Timeline Elements:**
- Track: 2px line in Polished Aluminum (#D0D3D4)
- Nodes: 12px circles in Racing Red (#C8102E)
- Current Node: 16px circle with 2px white border
- Labels: Tungsten, Medium, 14px
- Dates: Operator Mono, Regular, 12px
- Hover State: Node scales to 1.2x size

**Technical Specifications Table:**
- Headers: Tungsten, Medium, 14px, uppercase, Racing Red (#C8102E)
- Background: Alternating rows White (#FFFFFF) and Fog Light (#F5F5F5)
- Border: 1px solid Polished Aluminum (#D0D3D4)
- Labels: Tiempos Text, Semibold, 14px
- Values: Operator Mono, Regular, 14px
- Padding: 8px 12px

### Interactive Elements

**Tabbed Interface:**
- Tab Background: Fog Light (#F5F5F5)
- Active Tab: White (#FFFFFF) with 2px top border in Racing Red (#C8102E)
- Tab Text: Tungsten, Medium, 16px, uppercase
- Tab Padding: 12px 24px
- Content Background: White (#FFFFFF)
- Content Border: 1px solid Polished Aluminum (#D0D3D4)
- Content Padding: 24px

**Accordion:**
- Header Background: Fog Light (#F5F5F5)
- Header Text: Tungsten, Bold, 18px
- Header Padding: 16px 24px
- Icon: Plus/Minus in Racing Red (#C8102E)
- Content Background: White (#FFFFFF)
- Content Border: 1px solid Polished Aluminum (#D0D3D4)
- Content Padding: 24px
- Border Radius: 2px

**Slider Control:**
- Track: 4px height, Polished Aluminum (#D0D3D4)
- Handle: 20px diameter, Racing Red (#C8102E)
- Active Track: Racing Red (#C8102E)
- Labels: Operator Mono, Regular, 12px
- Value Display: Operator Mono, Regular, 14px in small floating card

### Vehicle Documentation Components

**Service Record Card:**
- Background: White (#FFFFFF)
- Border-Left: 4px solid Rally Blue (#1F5AA6)
- Border Radius: 2px on right side only
- Shadow: 0 2px 4px rgba(0,0,0,0.1)
- Date: Tungsten, Bold, 16px
- Service Type: Tungsten, Bold, 20px
- Details: Tiempos Text, Regular, 16px
- Mechanic: Tiempos Text, Italic, 14px
- Technical Notes: Operator Mono, Regular, 14px, with Road Dust Khaki (#BBA14F) background at 10%

**Vehicle Gallery:**
- Image Border: 1px solid Polished Aluminum (#D0D3D4)
- Image Spacing: 12px
- Caption: Tiempos Text, Italic, 14px
- Date Overlay: Operator Mono, Regular, 12px on semi-transparent black background
- Zoom Icon: White (#FFFFFF) on Racing Red (#C8102E) circular background

## 7. Voice and Tone Guidelines

### Content Structure

**Headlines:**
- Brief, impactful statements
- Active voice
- Often without articles (a, the)
- May use racing/automotive metaphors
- Examples: "DRIVE THE LEGACY", "CRAFTING TOMORROW'S VINTAGE HISTORY"

**Body Copy:**
- Direct and conversational
- Technical when necessary, accessible always
- Balance of historical reverence and excitement
- Active voice predominates
- First person plural for brand voice ("we believe")
- Second person when addressing users ("your journey")

**Technical Content:**
- Precise and factual
- Concise without unnecessary jargon
- Define specialist terms when first used
- Use consistent terminology throughout

### Tone Applications

**Historical Content:**
- Respectful and informative
- Factual accuracy prioritized
- Context provided for significance
- Connections drawn to present experience

**Community Content:**
- Inclusive and welcoming
- Celebrates diversity of vehicles and experiences
- Acknowledges different knowledge levels
- Encourages participation and sharing

**Technical Instructions:**
- Clear step-by-step guidance
- Purpose explained before process
- Visual aids complement text
- Safety considerations highlighted

**Marketing Messages:**
- Emphasize experience over possession
- Focus on stories and adventure
- Highlight community and connection
- Celebrate the culture of driving classics

## 8. Animation and Interaction

### Transitions

**Page Transitions:**
- Style: Fade with slight movement
- Duration: 300ms
- Easing: ease-out
- Direction: Related to user journey (forward/back)

**Component Transitions:**
- Style: Subtle scale and fade
- Duration: 200ms
- Easing: ease-in-out

**Content Loading:**
- Style: Fade in with staggered timing for elements
- Duration: 400ms total, 100ms between elements
- Easing: ease-out
- Loading indicator: Animated circular gauge inspired by tachometer

### Hover States

**Interactive Elements:**
- Scale: 1.02x for small elements
- Color: Shift to appropriate hover color
- Duration: 150ms
- Easing: ease

**Images:**
- Subtle zoom (1.05x)
- Optional overlay revealing additional information
- Duration: 300ms
- Easing: ease-out

### Micro-Interactions

**Buttons:**
- Press effect: Scale to 0.98x
- Release effect: Scale to 1.02x then return to 1x
- Duration: 200ms
- Easing: ease-in-out

**Form Controls:**
- Focus effect: Subtle glow in Blueprint Blue (#0277BD)
- Validation: Checkmark animation for valid inputs
- Error: Gentle shake animation (3px left-right, 3 cycles)
- Duration: 300ms
- Easing: ease-in-out

**Notifications:**
- Entrance: Slide in with fade
- Exit: Fade out
- Duration: 300ms entrance, 200ms exit
- Easing: ease-out for entrance, ease-in for exit

## 9. Responsive Behavior

### Breakpoints

- Mobile: 320px - 767px
- Tablet: 768px - 1023px
- Desktop: 1024px - 1439px
- Wide Desktop: 1440px+

### Typography Scaling

| Element | Mobile | Tablet | Desktop | Wide Desktop |
|---------|--------|--------|---------|-------------|
| h1 | 36px | 40px | 48px | 48px |
| h2 | 28px | 32px | 36px | 36px |
| h3 | 24px | 24px | 28px | 28px |
| h4 | 20px | 20px | 24px | 24px |
| h5 | 18px | 18px | 20px | 20px |
| h6 | 16px | 16px | 18px | 18px |
| Body | 16px | 16px | 16px | 16px |

### Component Adaptations

**Navigation:**
- Mobile: Hamburger menu with slide-in panel
- Tablet: Condensed horizontal menu
- Desktop: Full horizontal menu with dropdowns
- Wide Desktop: Same as desktop with more spacing

**Cards:**
- Mobile: Full width, vertical layout
- Tablet: 2-column grid, vertical layout
- Desktop: 3-column grid, vertical layout
- Wide Desktop: 3 or 4-column grid based on content

**Vehicle Details:**
- Mobile: Stacked sections, gallery as carousel
- Tablet: Two columns for some content, larger gallery
- Desktop: Multiple columns, sidebar navigation, expanded gallery
- Wide Desktop: Same as desktop with more whitespace

## 10. Accessibility Guidelines

### Color Contrast

- Text on background must maintain at least 4.5:1 contrast ratio
- Large text (18px+) must maintain at least 3:1 contrast ratio
- UI elements and informational graphics must maintain at least 3:1 contrast ratio
- Alternative text-only version available for complex interactive elements

### Typography Accessibility

- Line height minimum 1.5 for body text
- Letter spacing slightly increased for improved readability
- No justified text (always left-aligned)
- Maximum line length: 80 characters
- Headings properly nested (H1 → H6)

### Interactive Elements

- Focus states clearly visible with high contrast
- Interactive elements minimum size 44px × 44px on touch devices
- Buttons have visible text labels (not just icons)
- Form fields have associated labels
- Error messages explicit and descriptive

### Screen Reader Support

- All images have appropriate alt text
- ARIA landmarks used appropriately
- Dynamic content changes announced to screen readers
- Custom components have proper ARIA roles and states
- Focus order follows logical sequence

## Implementation Examples

### Vehicle Card Component

```html
<div class="vehicle-card">
  <div class="vehicle-card__image-container">
    <img src="example-car.jpg" alt="1968 Porsche 911 S" class="vehicle-card__image">
    <div class="vehicle-card__roundel">88</div>
  </div>
  <div class="vehicle-card__content">
    <h3 class="vehicle-card__title">Porsche 911 S</h3>
    <p class="vehicle-card__year">1968</p>
    <div class="vehicle-card__details">
      <p class="vehicle-card__description">Outlaw-inspired restoration with period-correct modifications and rally history.</p>
    </div>
    <div class="vehicle-card__specs">
      <span class="vehicle-card__spec">Engine: 2.0L Flat-6</span>
      <span class="vehicle-card__spec">Power: 170 HP</span>
      <span class="vehicle-card__spec">Weight: 1,020 kg</span>
    </div>
    <div class="vehicle-card__actions">
      <button class="btn btn--primary">View Details</button>
      <button class="btn btn--outline">Add to Garage</button>
    </div>
  </div>
</div>
```

### Timeline Component

```html
<div class="timeline">
  <div class="timeline__track">
    <div class="timeline__node timeline__node--complete" data-date="1968">
      <div class="timeline__label">Original Build</div>
    </div>
    <div class="timeline__node timeline__node--complete" data-date="1972">
      <div class="timeline__label">First Race Entry</div>
    </div>
    <div class="timeline__node timeline__node--complete" data-date="1985">
      <div class="timeline__label">Major Restoration</div>
    </div>
    <div class="timeline__node timeline__node--current" data-date="2023">
      <div class="timeline__label">Outlaw Conversion</div>
    </div>
    <div class="timeline__node" data-date="Future">
      <div class="timeline__label">Your Adventure</div>
    </div>
  </div>
</div>
```

### Workshop-Inspired Page Section

```html
<section class="workshop-section">
  <div class="mechanical-grid-overlay"></div>
  <div class="container">
    <h2 class="workshop-section__title">DOCUMENTATION TOOLS</h2>
    <p class="workshop-section__subtitle">Preserve your vehicle's story with precision and passion</p>
    
    <div class="tool-cards">
      <div class="tool-card">
        <div class="tool-card__icon">
          <svg><!-- Maintenance log icon --></svg>
        </div>
        <h3 class="tool-card__title">MAINTENANCE LOGGER</h3>
        <p class="tool-card__description">Track service history with workshop-quality detail and parts cataloging.</p>
        <button class="btn btn--primary">EXPLORE TOOL</button>
      </div>
      
      <!-- Additional tool cards -->
      
    </div>
  </div>
</section>
```
