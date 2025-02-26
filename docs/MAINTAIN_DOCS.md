# Documentation Maintenance Guide

## Documentation Update Process

### When to Update Documentation
- When creating new collections or modifying database schemas
- When adding or modifying API endpoints
- When creating new services or utilities
- When changing authentication flows
- When modifying project structure

### Key Files to Keep Updated
1. **Database Changes**
   - Update `/docs/database/DATABASE.md` when modifying:
     - `/server/api/plugins/db-indexes.ts`
     - Any collection schemas
     - Database relationships

2. **Authentication Changes**
   - Update `/docs/auth/AUTH.md` when modifying:
     - `/server/api/auth/[...].ts`
     - `/middleware/auth.ts`
     - Authentication flows or security

3. **Architecture Changes**
   - Update `/docs/architecture/ARCHITECTURE.md` when:
     - Adding new directories
     - Creating new services
     - Modifying project structure

### Documentation Index
```typescript
interface DocMapping {
  sourceFile: string;
  docFile: string;
  lastUpdated: Date;
}

const documentationMap: DocMapping[] = [
  {
    sourceFile: '/server/api/plugins/db-indexes.ts',
    docFile: '/docs/database/DATABASE.md',
    lastUpdated: new Date('2024-01-21')
  },
  {
    sourceFile: '/server/api/auth/[...].ts',
    docFile: '/docs/auth/AUTH.md',
    lastUpdated: new Date('2024-01-21')
  }
];
```

## Automated Checks

### Pre-commit Hook
Add this script to your package.json:

```json
{
  "scripts": {
    "check-docs": "node scripts/check-docs-freshness.js"
  },
  "husky": {
    "hooks": {
      "pre-commit": "npm run check-docs"
    }
  }
}
```

### Documentation Freshness Check
Create a script that:
1. Compares file modification dates between source and docs
2. Warns when documentation is older than source code
3. Prevents commits when documentation is outdated

## Best Practices

1. **Document While Coding**
   - Update relevant documentation while making code changes
   - Add documentation tasks to your PR checklist

2. **Regular Reviews**
   - Schedule monthly documentation reviews
   - Use the documentation index to track updates

3. **Integration with Development Flow**
   - Include documentation updates in PR requirements
   - Add documentation checks to CI/CD pipeline

4. **Version Control**
   - Tag documentation versions with code releases
   - Include documentation changes in commit messages

## Tools and Scripts

1. Documentation Validator Script
```javascript
// scripts/check-docs-freshness.js
const docMap = require('../docs/doc-mapping.json');
// Add validation logic
```

2. PR Template Addition
```markdown
## Documentation
- [ ] Updated relevant documentation
- [ ] Verified documentation accuracy
- [ ] Updated documentation index
```

## Quick Reference

### Command Examples
```bash
# Check documentation freshness
npm run check-docs

# Generate documentation index
npm run docs:index

# Validate documentation links
npm run docs:validate
```

### Common Update Patterns

1. Database Changes:
```bash
# 1. Update schema
vim server/api/plugins/db-indexes.ts
# 2. Update documentation
vim docs/database/DATABASE.md
# 3. Update index
npm run docs:index
```

2. Authentication Changes:
```bash
# 1. Modify auth logic
vim server/api/auth/[...].ts
# 2. Update documentation
vim docs/auth/AUTH.md
# 3. Update index
npm run docs:index
```

## Getting Help

If you're unsure about documentation updates:
1. Check the documentation map
2. Review related source files
3. Consult the team lead
4. Use automated tools for validation
