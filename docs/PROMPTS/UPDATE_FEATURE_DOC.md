# Update Document Prompt for Outlaw

## Purpose
This prompt guides AI assistants in systematically reviewing and updating existing feature documentation to ensure it remains accurate, comprehensive, and aligned with the current implementation. Use this prompt when a feature has evolved since its documentation was last updated.

## Instructions for AI Assistants
1. First, review both:
   - The existing feature document ("[FeatureName]_Feature.md")
   - The current implementation in the codebase

2. Systematically compare the documentation with the actual implementation, looking for:
   - Discrepancies between documented and actual TypeScript interfaces
   - Components or functionality mentioned in code but missing from documentation
   - Features described in documentation but not present in code
   - Outdated API endpoints, props, or event names
   - Inaccurate file paths or component locations

3. Update the feature document to accurately reflect the current implementation while preserving:
   - The document's original structure and organization
   - Historical context and rationale for design decisions
   - Any non-implementation content (e.g., future enhancements, known issues)

4. Add a "Document Revision History" section if one doesn't exist

## Document Revision Process

### Step 1: Assessment
Begin by asking the developer:
- "What changes have been made to this feature since the documentation was last updated?"
- "Are there specific sections of the documentation you know need updating?"
- "Have any new TypeScript interfaces or components been added?"
- "Has the API or data structure changed?"

### Step 2: Code Review
Conduct a systematic review of the current implementation:
1. Review TypeScript interfaces and types for changes
2. Examine component implementations for new props, events, or functionality
3. Check Pinia store for modified actions, state, or getters
4. Review API endpoints for changes
5. Look for new or modified form validation rules
6. Note any changes to UI components or styling

### Step 3: Document Update
Update the document with a clear indication of changes:

1. **For TypeScript interfaces and types:**
   - Update any interfaces that have changed
   - Add any new interfaces
   - Ensure the documentation matches actual implementation

2. **For components:**
   - Update props, events, and descriptions
   - Add any new components
   - Update component hierarchy diagrams
   - Update PrimeVue component usage

3. **For state management:**
   - Update store state structure, actions, and getters
   - Ensure documented state matches actual implementation

4. **For API and data:**
   - Update API endpoints and request/response formats
   - Update MongoDB collection structures
   - Update data flow diagrams

5. **For usage examples:**
   - Update code examples to reflect current patterns
   - Ensure examples compile and work with current API

### Step 4: Validation
After updates, verify consistency:
- Check that all file paths mentioned are accurate
- Ensure component names match the actual implementation
- Verify that props and events are correctly documented
- Confirm that TypeScript interfaces are complete and accurate

### Step 5: Update Revision History
Add an entry to the Document Revision History section:

```markdown
## Document Revision History

| Date | Updated By | Changes |
|------|------------|---------|
| [Current Date] | [Developer Name] | [Summary of changes made to the document] |
| [Previous Date] | [Previous Developer] | [Previous changes] |
```

## Common Update Scenarios

### 1. API Changes
When the API has changed:
- Update the API endpoints section
- Update any request/response examples
- Update the data flow diagrams
- Update usage examples that call the API

### 2. Component Structure Changes
When components have been added, removed, or restructured:
- Update the component hierarchy diagram
- Update the component architecture section
- Add/remove component documentation as needed
- Update integration points

### 3. TypeScript Interface Changes
When data structures have changed:
- Update all affected TypeScript interfaces
- Ensure consistency between interfaces and MongoDB schema
- Update form validation rules if applicable
- Update examples that use these interfaces

### 4. State Management Changes
When Pinia store has changed:
- Update the state structure documentation
- Update actions and getters documentation
- Update examples showing store usage
- Check for impacts on components that use the store

### 5. PrimeVue Component Updates
When UI components have changed:
- Update the PrimeVue components list
- Update any custom styling documentation
- Update screenshots or UI descriptions
- Update usage examples

## Formatting Guidance
When updating the document:

1. Maintain consistent formatting
   - Use the same heading levels and structure
   - Keep code blocks properly formatted
   - Maintain table formatting

2. Use Markdown features appropriately
   - Tables for structured data
   - Code blocks with language specifiers
   - Lists for sequential steps or related items

3. Clearly indicate updated sections
   - Consider adding timestamps to major section updates
   - Use the revision history to track significant changes

## Final Checklist
Before finalizing the update, verify:

- [ ] All TypeScript interfaces match the current implementation
- [ ] Component documentation reflects the current component structure
- [ ] All file paths and locations are accurate
- [ ] Usage examples are up-to-date and functional
- [ ] MongoDB schema documentation matches actual collections
- [ ] API endpoint documentation is complete and accurate
- [ ] PrimeVue component usage is correctly documented
- [ ] Revision history has been updated
- [ ] Development status section reflects current status