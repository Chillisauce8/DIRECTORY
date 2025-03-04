# Car Application - Documentation Overview

This document serves as an index to the comprehensive documentation for the Car Application platform, which addresses various pain points around owning and searching for classic vehicles.

## Purpose of This Documentation

The Car Application is a complex, interconnected system with multiple major components. This documentation has been structured in a modular way to:

- Make specific information easier to find
- Allow focused updates to individual components
- Improve maintainability as the system evolves
- Support efficient processing of documentation by AI tools

## Document Structure

The documentation is divided into the following sections:

### Core Concepts

1. [Core Concepts and Definitions](01-CORE-CONCEPTS.md) - Fundamental entities and concepts that form the foundation of the application

### Main Feature Areas

2. [Public Area](02-PUBLIC-AREA.md) - SEO-focused public-facing components and market listings
3. [User Features](03-USER-FEATURES.md) - Comprehensive list of user-oriented features and capabilities
4. [Organizations](04-ORGANIZATIONS.md) - Organization types, management, and integration with other system components
5. [Connection Management System](05-CONNECTIONS.md) - Relationships between different entities in the application

### Technical Considerations

6. [Technical Architecture](06-TECHNICAL.md) - Data models, technical implementation details, and architectural considerations

### Advanced Features

7. [Vehicle History and Rights Management](07-HISTORY-FILES.md) - History file ownership, transfer, and digital rights management
8. [Vehicle Showcase System](08-SHOWCASE.md) - Vehicle presentation, sharing, and QR code integration
9. [Feed and Notification System](09-NOTIFICATIONS.md) - Content personalization, notification delivery, and geographical features

### Integration and User Journeys

10. [Integration Points](10-INTEGRATION.md) - How the Car Application integrates with external systems and services
11. [User Journeys](11-USER-JOURNEYS.md) - Common user paths through the application

## Cross-Component Relationships

The Car Application's components are highly interconnected. Key relationships include:

- **Users** interact with **Vehicles**, **Organizations**, and **Markets** through the **Connection System**
- **Organizations** contribute to **Vehicle Histories** and host **Activities**
- **Activities** become part of both **Vehicle Histories** and **Organization Showcases**
- **Markets** organize content across the system for **Following** and **Notifications**
- **History Files** support **Showcase** creation and **Vehicle Management**

Each document mentions related components and includes cross-references to the relevant documentation files where appropriate.

## Terminology Consistency

Throughout the documentation, consistent terminology is used for key concepts:

- **User**: An individual person with an account in the system
- **Organization**: An entity that connects users (either a Club or Company)
- **Vehicle**: The physical entity identified by VIN (cars, motorcycles, etc.)
- **Market**: Hierarchical categorization system for vehicles
- **Listing**: An instance of a vehicle being offered for sale
- **Activity**: Time and date-based event that can be added to a calendar
- **Connection**: Bidirectional relationship between entities
- **History File**: Comprehensive chronological record of a vehicle's existence
- **Mini-Site**: An organization's digital presence within the application
- **Following**: Tracking entities to receive notifications and updates

Refer to the [Core Concepts](01-CORE-CONCEPTS.md) document for complete definitions.