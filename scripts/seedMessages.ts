import { seederHttpService } from './seeder-http.service.ts';
import type { messages } from '../types/collections/messages';
import type { userMessageStates } from '../types/collections/userMessageStates';
import fs from 'fs/promises';
import path from 'path';

interface DemoUser {
    email: string;
    name: string;
}

async function seedMessages() {
    console.log('Starting message seeding process...');
    
    try {
        console.log('Creating/verifying demo users...');
        const demoUsers: DemoUser[] = [
            { email: 'ionibowcher@gmail.com', name: 'Ioni Bowcher' },
            { email: 'amyelsner@gmail.com', name: 'Amy Elsner' },
            { email: 'asiyajavayant@gmail.com', name: 'Asiya Javayant' },
            { email: 'xuexuefeng@gmail.com', name: 'Xuxue Feng' },
            { email: 'user123@gmail.com', name: 'Test User' }  // Main user for receiving messages
        ];

        const userMap = new Map<string, string>();

        // Use exact query pattern from update-market-urls.vue
        for (const user of demoUsers) {
            try {
                // Check for existing user exactly like update-market-urls.vue
                const response = await seederHttpService.get('/api/query', {
                    collection: 'users',
                    q: JSON.stringify({ email: user.email })
                });

                if (response.data?.length > 0) {
                    userMap.set(user.email, response.data[0]._id);
                    console.log(`Found existing user: ${user.email}`);
                    continue;
                }

                // Create new user matching update-market-urls pattern
                const newUser = await seederHttpService.post('users', {
                    email: user.email,
                    name: user.name,
                    createdAt: new Date().toISOString()
                });

                if (!newUser.data?._id) {
                    throw new Error(`Failed to create user: ${user.email}`);
                }

                userMap.set(user.email, newUser.data._id);
                console.log(`Created new user: ${user.email}`);
            } catch (error) {
                console.error(`Failed to process user ${user.email}:`, error);
            }
        }

        console.log(`Created/verified ${userMap.size} users`);

        // Create a default user if none exist
        if (userMap.size === 0) {
            const defaultUser = await seederHttpService.post('/api/query', {
                collection: 'users',
                data: {
                    email: 'default@example.com',
                    name: 'Default User',
                    createdAt: new Date().toISOString()
                }
            });
            userMap.set('default@example.com', defaultUser.data.insertedId);
        }

        // Get default sender and recipient IDs
        const defaultSenderId = userMap.get('ionibowcher@gmail.com') || userMap.values().next().value;
        const defaultRecipientId = userMap.get('user123@gmail.com') || userMap.values().next().value;

        // Load JSON file and preserve original fields
        const jsonPath = path.join(process.cwd(), 'public', 'demo', 'data', 'mail.json');
        const rawData = await fs.readFile(jsonPath, 'utf-8');
        const demoData = JSON.parse(rawData);
        
        // Transform demo data but keep all needed fields
        const messages = demoData.data.map(item => ({
            subject: item.subject || item.title,
            content: item.content || item.message,
            from: item.from || item.sender?.title || 'Ioni Bowcher',
            email: item.email || 'ionibowcher@gmail.com', // Default sender email
            title: item.subject || item.title,
            state: item.state || 'inbox',
            isStarred: item.starred || false,
            isImportant: item.important || false
        }));

        let successCount = 0;
        let errorCount = 0;

        for (const item of messages) {
            try {
                // Use default IDs if lookup fails
                const senderId = userMap.get(item.email) || defaultSenderId;
                const recipientId = defaultRecipientId;

                console.log('Creating message with IDs:', {
                    senderId,
                    recipientId,
                    from: item.from
                });

                // Create message with guaranteed sender/recipient
                const message = await seederHttpService.post('/api/query', {
                    collection: 'messages',
                    data: {
                        subject: item.subject,
                        content: item.content,
                        sender: {
                            id: senderId,
                            _type: 'user',
                            title: item.from || 'Unknown Sender'
                        },
                        recipientType: 'user',
                        userRecipients: [recipientId],
                        groupRecipients: [],
                        isInitialMessage: true,
                        _createdAt: new Date().toISOString()
                    }
                });

                // Create message state with guaranteed IDs
                await seederHttpService.post('/api/query', {
                    collection: 'userMessageStates',
                    data: {
                        userId: recipientId,
                        messageId: message.data.insertedId,
                        state: 'inbox',
                        isStarred: item.isStarred || false,
                        isImportant: item.isImportant || false,
                        _createdAt: new Date().toISOString()
                    }
                });

                successCount++;
                console.log(`Processed ${successCount + errorCount}/${messages.length} messages`);
            } catch (error) {
                console.error('Failed to create message:', error);
                errorCount++;
            }
        }

        console.log('\nSeeding completed:');
        console.log(`- ${successCount} messages created`);
        console.log(`- ${errorCount} messages failed`);

    } catch (error) {
        console.error('Fatal error during seeding:', error);
        process.exit(1);
    }
}

// Run the seeder
console.log('Message seeder starting...');
seedMessages()
    .then(() => {
        console.log('Seeding completed successfully');
        process.exit(0);
    })
    .catch(error => {
        console.error('Seeding failed:', error);
        process.exit(1);
    });
