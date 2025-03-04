# Organizations

Organizations represent entities that interact with the classic vehicle community, primarily categorized into two types: Clubs and Companies. This document outlines how organizations are managed and integrated with other system components.

## Organization Types

### Clubs

Community-focused vehicle enthusiast groups:
- Car clubs organized around specific makes/models
- Regional enthusiast groups
- Event-focused organizations
- Historical vehicle preservation societies

### Companies

Commercial entities in the classic vehicle industry:
- Restoration services
- Parts suppliers
- Specialist mechanics
- Insurance providers
- Storage facilities
- Auction houses
- Dealerships

## Organization Ownership and Validation

### Initial Data Population
- System pre-populated with verified organizations at launch
- Organizations initially exist without claimed ownership

### Ownership Validation Process
- Domain-based verification system
  - Organization must have a legitimate website on its own domain
  - System emails domain-associated addresses (info@, contact@, admin@)
  - Owner validates through secure authentication flow
  - Owner provides additional validation documentation if required

### New Organization Creation
- User submits organization details with supporting evidence
- AI-powered validation checks:
  - Website content analysis to verify organization legitimacy
  - Social media presence verification
  - Business registration lookup where applicable
  - Industry directory cross-reference
- Admin review for edge cases
- Domain email verification required for final approval

## Organization Management

### Organization Profile
- Comprehensive public profile page
- Logo and branding
- Description and history
- Contact information
- Service areas or regions
- Specializations (makes, models, services)

### Organization Administration
- Role-based permissions system:
  - Owner (full administrative access)
  - Administrators (manage content and members)
  - Contributors (create events, post updates)
  - Members (participate in discussions)
- Analytics dashboard
- Member management

### Organization Content
- Event creation and management
- News and updates
- Vehicle showcases
- Service listings
- Media galleries
- Forum/discussion areas

## Organization Integration

Organizations connect with other system features:
- **Events**: Create and manage events, track RSVPs
- **Messaging**: Direct communication with members
- **Listings**: Associated vehicle listings (for dealerships/auction houses)
- **Suppliers Directory**: Service listings and specializations
- **Media**: Photo galleries from events and showcases
- **Following**: Users can follow organizations for updates
- **Calendar**: Organization events appear in relevant user calendars

## Organization Mini-Sites

Each organization in the system gets a comprehensive "mini-site" within the application that serves as their digital presence and portfolio.

### Dynamic Profile Pages
- Custom URL structure: `/org/[organization-slug]`
- Brand-consistent layout with organization colors and logo
- Customizable sections and layout options
- Responsive design optimized for all devices

### Work Showcase System
- Categorized portfolio of work (restorations, repairs, modifications)
- Before/after comparisons with interactive sliders
- Searchable project gallery filterable by vehicle make/model/year
- Featured projects with enhanced visibility
- Performance metrics (e.g., number of restorations completed)

### Activity-to-Showcase Pipeline
- Activities created during regular work automatically feed the showcase
- Workflow:
  1. Organization member creates an activity (e.g., "Engine Rebuild", "Respray")
  2. Member associates activity with customer vehicle and adds documentation
  3. Vehicle owner receives notification and can approve content for public use
  4. Approved content populates both the vehicle history and organization showcase
  5. Organization can feature selected work in their portfolio

### Media Rights & Permission System
- Automated content usage agreements:
  - Vehicle owners control what can be shared publicly
  - Organizations request media usage rights through the system
  - Simple approval process with clear terms
  - Usage tracking and analytics
- Different permission levels:
  - Private (owner only)
  - Organization only (for internal portfolio)
  - Public with attribution
  - Featured (highlighted in organization profile)

### Service Documentation Center
- Detailed service listings with pricing
- Specialization indicators (e.g., make/model expertise)
- Certification and qualification displays
- Service area maps and coverage information
- Booking/inquiry functionality

### Customer Interaction Hub
- Testimonials and reviews from verified customers
- Project request system
- Direct messaging with potential customers
- Quote request functionality
- Follow/subscription option for updates

### Analytics Dashboard
- Profile visit statistics
- Service inquiry tracking
- Content engagement metrics
- Customer acquisition analytics
- Showcase performance data

## Organization-Specific Features

### For Restoration Companies/Specialists

#### Restoration Project Timelines
- Interactive project journals with chronological documentation
- Milestone tracking with media attachments
- Technical specifications and parts documentation
- Cost tracking (optional for public display)
- Restoration methodology details

#### Knowledge Base & Technical Resources
- Restoration guides and articles
- Technical tips specific to makes/models
- Parts sourcing information
- Maintenance recommendations
- Restoration process explanations

#### Expert Showcase
- Team member profiles highlighting specializations
- Expert credentials and certification displays
- Craftsperson portfolios of personal work
- Special skills and rare techniques documentation
- "Meet the Team" section with role descriptions

#### Service Activity Templates
- Pre-configured activity templates for common restoration tasks
- Standardized documentation for various services
- Quality control checklists
- Customer approval workflows
- Service warranty information

### For Clubs and Enthusiast Groups

#### Member Vehicle Showcase
- Gallery of member vehicles with permission-based inclusion
- Featured member vehicle rotation
- Vehicle specifications and unique details
- Owner stories and acquisition details
- Awards and recognition display

#### Event Management & Documentation
- Comprehensive event calendar with registration
- Post-event galleries with member-contributed content
- Event results and awards
- Integrated event activities with photos and documentation
- Historical event archives

#### Community Features
- Member directories with vehicle information
- Discussion forums focused on relevant topics
- Technical advice sections
- Parts exchange/marketplace
- Geographical member mapping

#### Club Resources
- Club history and heritage documentation
- Membership benefits information
- Club documents and bylaws
- Committee and leadership information
- Branded merchandise display

## Integration with Vehicle Histories

The organization mini-sites deeply integrate with the vehicle history system:

### Bidirectional History Connection
- Activities created by organizations appear in vehicle histories
- Vehicle owners can showcase their vehicle's professional service history
- Organizations build portfolios through their regular service documentation
- Service records become verified when created by certified organizations

### Service Documentation Standards
- Structured data capturing for consistent service records
- Industry-standard categorization of services
- Parts and materials documentation
- Labor hours and technician information
- Quality ratings and metrics

### Service Timeline Integration
- Organization activities appear on vehicle timelines
- Service intervals and maintenance schedules
- Automated service reminders
- Maintenance history validation
- Service certification badges

### Value-Add Documentation
- Professional condition assessments
- Market value impact of services
- Authenticity verifications
- Originality certifications
- Concours preparation documentation

## Benefits

### Benefits to Organizations
- **Digital Presence**: Professional online presence without maintaining a separate website
- **Portfolio Building**: Automatic portfolio creation through regular work documentation
- **Lead Generation**: Discoverability by users searching for specific services or expertise
- **Credibility**: Verified work history and customer reviews build trust
- **Community Connection**: Direct integration with the enthusiast community
- **Simplified Marketing**: Built-in tools to showcase services and special expertise
- **Administrative Efficiency**: Unified system for documentation, customer communication, and marketing

### Benefits to Vehicle Owners
- **Comprehensive Records**: Professional documentation of all services performed
- **Verified History**: Certified service records increase vehicle value
- **Convenience**: All vehicle information in one place
- **Quality Assurance**: Transparency in service performance and outcomes
- **Value Preservation**: Documented professional maintenance improves resale value
- **Expert Access**: Direct connection to qualified service providers
- **Community Connection**: Integration with clubs and events related to their vehicle

## Organization Verification and Trust

### Verification Badges
- Verified status for authenticated organizations
- Trust indicators for users interacting with organizations
- Special capabilities for verified organizations
- Enhanced visibility in search and listings

### Event Galleries
- Centralized display of user-contributed event content
- Automatic aggregation of content marked as public
- Branded event pages under organization profiles
- Showcasing member participation and vehicles
- Searchable archives of past events with media
- Organization-curated highlights and featured content
- Promotion of upcoming events through past event galleries

## Related Documentation

- For information on how users interact with organizations, see [User Features](03-USER-FEATURES.md)
- For details on the connection system between users and organizations, see [Connection Management System](05-CONNECTIONS.md)
- For information on vehicle history file management, see [Vehicle History and Rights Management](07-HISTORY-FILES.md)
- For details on vehicle showcasing through organizations, see [Vehicle Showcase System](08-SHOWCASE.md)