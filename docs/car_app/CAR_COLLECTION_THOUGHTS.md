EXTRENDED DETAILS:

# Car Application MongoDB Collections

## Summary Table

| Collection Name | Primary Use | Joins To |
|-----------------|-------------|----------|
| Users | Individual user accounts and profiles | Vehicles, Organizations, Follows, Notifications, Messages |
| Vehicles | Physical vehicles with VIN and specifications | Markets, Users, Listings, HistoryFiles, Activities, Files |
| Organizations | Clubs and companies in the classic car community | Users, Markets, Activities, Files, Connections |
| Listings | Vehicles offered for sale with price and details | Vehicles, Markets, Users, Organizations, Files |
| Markets | Hierarchical vehicle categorization system | Markets (self), Vehicles, Organizations, Follows |
| HistoryFiles | Comprehensive vehicle chronological records | Vehicles, Files, Users, HistoryFiles (parent) |
| Activities | Time-based events (maintenance, shows, tasks) | Vehicles, Users, Organizations, Files, Connections |
| Connections | Bidirectional relationship management | Users, Organizations, Vehicles, Activities |
| Files | Document and media management with permissions | Vehicles, Activities, Organizations, Messages, HistoryFiles |
| Follows | Tracking relationships for notifications | Users, Markets, Vehicles, Organizations, Listings |
| Showcases | Curated vehicle presentations for sharing | Vehicles, Files, Activities, Users, Organizations |
| MessageThreads | Conversation containers with participants | Users, Organizations, Messages, Connections |
| Messages | Individual communications within threads | MessageThreads, Files, Users, Organizations |
| Notifications | User alerts for system events | Users, (all relevant collections) |
| VehicleSpecifications | Detailed technical vehicle data | Vehicles, Markets |
| FeedItems | Personalized content stream entries | Users, (all relevant content collections) |
| EmailDigests | Configuration for batched notifications | Users, Notifications |
| QRCodes | Generated codes for event showcases | Showcases, Vehicles, Activities |
| Comments | User feedback on content | Users, Listings, Showcases, Activities |
| VehicleTransfers | Records of ownership changes | Vehicles, Users, HistoryFiles |

## Connections
**Primary Use**: Manages bidirectional relationships between different entities (users, organizations, vehicles) with explicit consent and granular permission settings.

**Interactions**: Connections interact with Users, Organizations, and Vehicles to establish relationships with specific permissions. They also enable the Activities collection to record service histories and the Files collection to manage access rights to documentation.

**Scenario**: A classic car owner establishes a connection with a restoration shop, granting them permission to document work on their vehicle. The shop performs a restoration, adds this as an activity to the vehicle's history, and the owner receives a notification to review and accept these records, with the connection controlling exactly what permissions the shop has throughout this process.

## Markets
**Primary Use**: Provides a hierarchical categorization system for vehicles from high-level makes down to specific sub-models and generations, allowing for organized filtering and market analysis.

**Interactions**: Markets connect with Vehicles to categorize them properly and with Listings to enable market-specific searches. They also interact with Organizations to establish specializations and with the Follows collection to enable users to track specific market segments.

**Scenario**: A user interested in Porsche 911 Turbos from 1995-1998 follows this specific market segment. When a new vehicle listing in this category appears, they automatically receive a notification, and can view market-specific price trends and related organizations specializing in these models.

## HistoryFiles
**Primary Use**: Maintains the comprehensive chronological record of a vehicle's existence, including ownership history, maintenance records, restoration work, and documentation that follows the vehicle across owners.

**Interactions**: HistoryFiles link primarily to Vehicles through a one-to-one relationship, but also connect to Activities for chronological entries and Files for documentation. They include rights management data that interacts with the Connections collection.

**Scenario**: When purchasing a rare Ferrari, a buyer receives transfer of the vehicle's history file, which contains 30 years of documented service records, ownership transfers, and restoration photos. This digital provenance increases the vehicle's value substantially and provides critical information for future maintenance decisions.

## Activities
**Primary Use**: Tracks time and date-based events including car shows, maintenance appointments, restoration milestones, and future tasks that can be added to calendars and associated with specific vehicles.

**Interactions**: Activities connect to Vehicles, Organizations, and Users as participants or creators. They interact with Files for documentation and the Connections collection to determine permissions for creating activities on behalf of others.

**Scenario**: A restoration shop creates a valve adjustment activity for a client's classic Jaguar, attaching detailed photos and notes. This activity appears on both the shop's portfolio calendar and the owner's maintenance timeline, with notifications sent for upcoming scheduled maintenance based on this record.

## Showcases
**Primary Use**: Enables owners to create and share curated presentations of their vehicles with varying levels of detail and access permissions, facilitating social interactions at physical events and online.

**Interactions**: Showcases link to Vehicles as their subject, Files for selected media, and Activities for event-specific showcases. They utilize connection permissions to control visibility and interact with the QR code generation system.

**Scenario**: A car owner attending a prestigious concours creates an event-specific showcase of their restored Mercedes 300SL, generating a QR code for their display card. Attendees scan the code to view detailed restoration photos, historical documentation, and technical specifications, while the owner receives notifications about who viewed their showcase.

## Follows
**Primary Use**: Tracks which users are following specific entities (markets, vehicles, organizations, listings) to receive notifications and updates about changes or new content.

**Interactions**: Follows connect Users with various entity types (polymorphic relationship) and interact with the Notifications collection to generate alerts. They also drive the personalized content feed system.

**Scenario**: A collector follows a specific 1967 Shelby GT500 they previously owned, receiving an alert years later when it reappears on the market with significant modifications. This follow relationship persists across multiple listings of the same physical vehicle, allowing long-term tracking regardless of ownership changes.

## MessageThreads
**Primary Use**: Manages conversation threads in the messaging system, supporting organization-to-user communication, user-to-user messaging, and group discussions with appropriate permission controls.

**Interactions**: MessageThreads connect Users and Organizations as participants and contain Messages as child entities. They reference Connections to check messaging permissions and interact with Notifications for alerting users to new messages.

**Scenario**: A car club creates a thread to discuss an upcoming rally with its performance vehicle group members. The thread maintains conversation history even as new members join, provides read receipts for critical information, and allows file attachments like route maps to be shared securely among participants.

## Messages
**Primary Use**: Stores individual messages within conversation threads, supporting text content, file attachments, read receipts, and message categorization for user-to-user and organization-user communications.

**Interactions**: Messages belong to MessageThreads and can reference Files as attachments. They track read status for each participant and trigger Notifications when new messages are sent.

**Scenario**: A restoration shop sends a message with attached photos showing the uncovered rust on a client's vehicle, requiring approval before proceeding. The client receives a notification, views the images directly in the thread, and responds with approval, maintaining a documented communication trail for this critical decision.

## Files
**Primary Use**: Manages documents and media related to vehicles, organizations, and activities, with comprehensive metadata, versioning, and permission controls for access and usage rights.

**Interactions**: Files can be associated with Vehicles, Activities, Organizations, or Messages as attachments. They work with the Connections collection to enforce permissions and with HistoryFiles to document vehicle provenance.

**Scenario**: A vehicle owner uploads their original factory certificate of authenticity, service records, and restoration photos, applying specific permissions to each. When authorizing a service relationship with a specialist shop, they grant access to technical documentation but not ownership papers, while setting restoration photos to be available for the shop's portfolio with proper attribution.

## Notifications
**Primary Use**: Delivers alerts to users about relevant system events including listing updates, connection requests, messages, and activity reminders through multiple channels with preference-based filtering.

**Interactions**: Notifications reference the User as recipient and various entity types as subjects. They are generated based on Follows, Connections, MessageThreads, and Activities data, and respect user notification preferences.

**Scenario**: A user who follows both a specific Mercedes 300SL and the broader Gullwing market receives a digest notification that includes a price drop on a vehicle they're tracking, a new listing in their followed market, and an upcoming local car meet featuring several Gullwings, all filtered and prioritized according to their notification preferences.

## Users
**Primary Use**: Stores individual user accounts with profiles, preferences, and authentication details.

**Interactions**: Users connect to nearly every collection in the system, particularly Vehicles (ownership), Organizations (membership), Activities (participation), and Follows (interests).

**Scenario**: A classic car enthusiast creates an account, sets up their profile with interests in British sports cars, connects their vehicle collection, joins several marque-specific clubs, and configures notification preferences for specific market segments they're monitoring for potential purchases.

## Vehicles
**Primary Use**: Represents physical vehicles with VIN identification, specifications, and ownership information that persists across multiple sales listings.

**Interactions**: Vehicles are central entities connecting to Users (owners), Markets (categorization), HistoryFiles (provenance), Listings (sales), and Activities (events/maintenance).

**Scenario**: A 1963 Jaguar E-Type is entered into the system with its VIN, complete specifications, and ownership details. Over time, it accumulates service records, appears in multiple listings as it changes hands, participates in various events, and builds a comprehensive digital history that follows the physical vehicle throughout its life.

## Organizations
**Primary Use**: Represents clubs, companies, and service providers in the classic vehicle ecosystem with profiles, specializations, and membership structures.

**Interactions**: Organizations connect to Users (members/staff), Markets (specializations), Activities (events), and Connections (relationships with users and vehicles).

**Scenario**: A Ferrari owners club creates an organization profile, establishes connections with specific Ferrari market segments, organizes regular events for members, publishes content about Ferrari maintenance, and builds a member directory of enthusiasts and their vehicles that can be discovered by potential new members.

## Listings
**Primary Use**: Individual instances of vehicles being offered for sale with price, description, and sale status tracking.

**Interactions**: Listings connect to Vehicles (the physical item being sold), Users or Organizations (sellers), Markets (categorization), and Files (photos and documentation).

**Scenario**: A dealer creates a listing for a classic Porsche, including detailed photos, service history, price details, and market categorization. Users following either the specific vehicle or the Porsche market receive notifications, and when the vehicle sells, the system records the sale price and date for market analysis.

## VehicleSpecifications
**Primary Use**: Stores detailed technical information about vehicles including dimensions, performance figures, and factory specifications.

**Interactions**: VehicleSpecifications link directly to Vehicles and relate to Markets for standard model specifications.

**Scenario**: When adding a Mercedes 300SL to their collection, the owner can access factory specifications automatically populated from the model database, while adding details specific to their vehicle such as non-standard features, deviations from factory specifications, and restoration modifications.

## FeedItems
**Primary Use**: Powers the personalized content feed by aggregating and prioritizing content from various sources based on user follows and preferences.

**Interactions**: FeedItems reference Users (recipients) and various content types from across the system including Listings, Activities, and Showcase content.

**Scenario**: When a user opens their personalized feed, they see a mix of new listings for vehicles they follow, upcoming events from their clubs, recently showcased vehicles from followed users, and market price updates - all tailored to their specific interests and sorted by relevance algorithms.

## QRCodes
**Primary Use**: Generates and manages scannable codes for vehicle showcases at physical events, enabling digital-physical interaction.

**Interactions**: QRCodes link to Showcases, Vehicles, and Activities (events) with tracking for scan analytics.

**Scenario**: For a major concours d'elegance, participants generate QR codes for their vehicle display cards. Attendees scan these codes to view comprehensive digital showcases of the vehicles, with owners receiving analytics on how many people viewed their vehicle's digital profile during the event.