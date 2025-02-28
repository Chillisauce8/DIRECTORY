# Unified Feature Document Prompt for Outlaw

## Purpose
This prompt guides AI assistants in creating and evolving a single comprehensive document for any feature in the Outlaw application, adapting to the feature's current development stage - from initial concept through planning, implementation, and final documentation.

## Instructions for AI Assistants
1. First, review the project's existing documentation to understand the established standards:
   - [READ_ME.md](./READ_ME.md) for overall project structure
   - [STYLE_GUIDE.md](./STYLE_GUIDE.md) for naming conventions and patterns

2. Determine the current development stage of the feature by asking the developer.

3. Focus your interview questions on the appropriate phase:
   - **New Feature**: Begin with concept definition and planning
   - **In-Progress Feature**: Focus on implementation details and challenges
   - **Completed Feature**: Focus on comprehensive documentation

4. Generate or update a single unified document named "[FeatureName]_Feature.md" that:
   - Maintains all information about the feature in one place
   - Evolves as the feature progresses through development
   - Follows project conventions and standards
   - Eventually becomes the complete documentation for the feature

## Feature Development Stages

### Phase 1: Concept & Planning (New Features)
For features in the initial planning stage, focus on gathering:

- Feature purpose and scope
- User stories and requirements
- Technical architecture
- Implementation strategy
- Initial component design

**Key Questions for Phase 1:**
- "What is the primary purpose of this feature?"
- "Who are the target users for this feature?"
- "What are the key user stories this feature addresses?"
- "What data entities will this feature work with?"
- "What components will be needed and how will they interact?"
- "How will this feature integrate with the rest of the application?"
- "Will this feature require form validation? If so, what fields need validation?"
- "What PrimeVue components would be appropriate for this feature's UI?"

### Phase 2: Implementation (In-Progress Features)
For features under active development, focus on documenting:

- Current implementation status
- Technical decisions and their rationale
- File structure and organization
- Component relationships
- Testing approach
- Challenges and solutions

**Key Questions for Phase 2:**
- "What components have been implemented so far?"
- "What technical challenges have you encountered?"
- "How have you structured the data flow?"
- "What remains to be implemented?"
- "Are there any design decisions that should be documented?"
- "Have you encountered any issues with the PrimeVue components?"
- "How are you handling form validation with Vuelidate?"

### Phase 3: Documentation (Completed Features)
For completed features, focus on comprehensive documentation:

- Complete feature overview
- Architectural details
- Usage examples
- API documentation
- Performance considerations
- Maintenance instructions

**Key Questions for Phase 3:**
- "How is the feature currently being used?"
- "Are there any non-obvious aspects of the implementation?"
- "What maintenance considerations should be documented?"
- "Are there any known issues or limitations?"
- "Are there any performance optimizations you've implemented?"
- "Are there any specific usage patterns for the PrimeVue components?"

## Unified Document Template
The document should adapt based on the feature's stage, but always maintain a consistent structure:

```markdown
# [Feature Name] - Feature Document

## Status
[Current development status]

## 1. Overview
- **Feature Name**: [Name]
- **Description**: [Brief description]
- **Purpose**: [Primary purpose]
- **Target Users**: [Who will use this feature]

## 2. User Stories
- As a [user type], I want to [action] so that [result].
- As a [user type], I want to [action] so that [result].
- [Additional user stories as defined]

## 3. Technical Architecture
### 3.1 Data Models
```typescript
// Core TypeScript interfaces for this feature
export interface I[EntityName] {
  _id: string;
  [additional properties]
}

export enum [EntityName]Enum {
  [enum values]
}
```

### 3.2 Component Architecture
- **[ComponentName]**:
  - **Purpose**: [Purpose]
  - **Props**: [Props]
  - **Emits**: [Events]
  - **Location**: /components/[feature-name]/[ComponentName].vue
  - **PrimeVue Components**: [List of PrimeVue components used]

### 3.3 State Management
- **Pinia Store**: /stores/use[FeatureName]Store.ts
- **Key State Elements**: [Description of state]
- **Actions**: [Key actions]
- **Getters**: [Key getters]

### 3.4 API Endpoints
- **MongoDB Collections**: [Collections used]
- **API Routes**: [Routes defined]
- **Data Flow**: [How data moves through the system]

### 3.5 Form Validation (if applicable)
- **Validation Strategy**: [How Vuelidate is implemented]
- **Validation Rules**: [Key validation rules]
- **Error Handling**: [How validation errors are displayed]

## 4. Implementation Details
### 4.1 File Structure
```
components/[feature-name]/
├── [ComponentName].vue
├── [ComponentName2].vue
├── index.ts                 // Export all components

composables/
├── use[FeatureName].ts      // Feature-specific composable

stores/
├── use[FeatureName]Store.ts // Feature store

types/
├── [feature-name]/          // Feature-specific types
    └── index.ts

[Additional structure as needed]
```

### 4.2 Key Components
[Detailed description of important components]

### 4.3 State Management Implementation
[Details of store implementation]

### 4.4 Integration Points
[How this feature connects to other parts of the application]

### 4.5 UI Implementation
- **PrimeVue Components Used**: [List with usage details]
- **Custom Styling**: [Any custom CSS applied to PrimeVue components]
- **Responsive Design**: [How the UI adapts to different screen sizes]

## 5. Testing
- **Test Approach**: [Unit, component, e2e testing approach]
- **Key Test Cases**: [Important scenarios to test]
- **Test Status**: [Current testing coverage]

## 6. Development Status
- [x] Feature Planning
- [ ] Core Implementation
- [ ] UI Implementation
- [ ] API Integration
- [ ] Testing
- [ ] Documentation
- [ ] Deployment

## 7. Known Issues and Limitations
- [List of any known issues or current limitations]

## 8. Future Enhancements
- [Potential future improvements]

## 9. Documentation and Usage Examples
[Examples of how to use this feature - expanded as implementation progresses]

### 9.1 Component Usage
```vue
<template>
  <!-- Example usage of the feature components -->
  <FeatureComponent
    :prop1="value1"
    :prop2="value2"
    @event="handleEvent"
  />
</template>

<script setup lang="ts">
import { FeatureComponent } from '@/components/feature-name';
import { useFeatureStore } from '@/stores/useFeatureStore';

// Example setup code
const featureStore = useFeatureStore();
const handleEvent = () => {
  // Example event handler
};
</script>
```

### 9.2 Store Usage
```typescript
// Example of how to use the feature's store
import { useFeatureStore } from '@/stores/useFeatureStore';

const featureStore = useFeatureStore();

// Example action call
await featureStore.fetchItems();

// Example getter usage
const items = featureStore.filteredItems;
```

### 9.3 API Usage
```typescript
// Example of API interactions
import { api } from '@/services/api';

// Example API call
const response = await api.get('/feature-endpoint');
```
```

## Adaptation Strategy
The document should evolve naturally through these stages:

1. **Initial Creation (Phase 1)**:
   - Complete sections 1-2 thoroughly
   - Create initial drafts of sections 3-4
   - Mark development status appropriately
   - Leave sections 5-9 as minimal placeholders

2. **During Implementation (Phase 2)**:
   - Update sections 3-4 with actual implementation details
   - Begin populating sections 5-7 as development progresses
   - Update development status regularly

3. **After Completion (Phase 3)**:
   - Ensure all sections are complete and accurate
   - Provide comprehensive usage examples in section 9
   - Document any known issues in section 7
   - Finalize development status

## Maintaining Document Alignment
Throughout all phases, ensure the document:
- Uses correct naming conventions from STYLE_GUIDE.md
- Follows file structure patterns from the project architecture
- References existing components and services accurately
- Maintains TypeScript interfaces that match actual implementation
- Updates the status checklist to reflect current progress

## Notes for AI Development Assistance
When helping implement the feature based on this document:
1. Follow the architecture and patterns established in the document
2. Update the document when making significant implementation decisions
3. Use the user stories as guidance for implementation priorities
4. Reference the project's established coding standards for implementation details
5. Keep local component state separate from global state as appropriate
6. Use TypeScript types exactly as defined in the document
7. Implement components in the order suggested by the component hierarchy
8. Use appropriate PrimeVue components for UI elements
9. Implement form validation with Vuelidate as specified
10. Write clear comments in TypeScript/JavaScript code to explain complex logic
11. Follow the project's CSS standards for any custom styling