import { MongoClient } from 'mongodb';

export default defineEventHandler(async (event) => {
  const collection = event.context.params.collection;
  const body = await readBody(event);
  
  console.log('API Request:', {
    collection,
    operation: body.operation || 'insert',
    query: body.q,
    hasData: !!body.data
  });
  
  try {
    const client: MongoClient = event.context.mongo;
    if (!client?.db) {
      console.error('Database connection details:', {
        hasClient: !!client,
        hasDb: !!client?.db,
        context: Object.keys(event.context)
      });
      throw createError({
        statusCode: 500,
        message: 'Database connection not available'
      });
    }

    try {
      const db = client.db();
      const options = body.session ? { session: event.context.session } : {};
      
      // Handle different operation types
      switch (body.operation) {
        case 'update':
          const updateResult = await db.collection(collection).updateMany(
            body.q || {},
            { $set: body.data },
            options
          );
          return { ok: true, data: updateResult };

        case 'find':
          let findResult;
          if (collection === 'userMessageStates' && body.thread) {
            // Thread-aware aggregation with user data
            findResult = await db.collection(collection)
              .aggregate([
                { $match: body.q || {} },
                { $sort: body.sort || { _createdAt: -1 } },
                { $limit: body.limit || 50 },
                {
                  $lookup: {
                    from: 'messages',
                    localField: 'messageId',
                    foreignField: '_id',
                    as: 'message'
                  }
                },
                { $unwind: '$message' },
                // Add user lookup for sender
                {
                  $lookup: {
                    from: 'users',
                    localField: 'message.sender.id',
                    foreignField: '_id',
                    as: 'senderData'
                  }
                },
                { $unwind: '$senderData' },
                // Add user lookup for recipients
                {
                  $lookup: {
                    from: 'users',
                    localField: 'message.userRecipients',
                    foreignField: '_id',
                    as: 'recipientData'
                  }
                },
                {
                  $addFields: {
                    'message.sender': {
                      $mergeObjects: ['$message.sender', {
                        email: '$senderData.email',
                        image: '$senderData.image'
                      }]
                    },
                    'message.messageState': {
                      state: '$state',
                      isStarred: '$isStarred',
                      isImportant: '$isImportant',
                      userId: '$userId'
                    }
                  }
                }
              ]).toArray();
            
            return { ok: true, data: findResult.map(r => r.message) };
          }

          if (collection === 'userMessageStates') {
            // Join messages with their states
            findResult = await db.collection(collection)
              .aggregate([
                { $match: body.q || {} },
                { $sort: body.sort || { _createdAt: -1 } },
                { $limit: body.limit || 50 },
                {
                  $lookup: {
                    from: 'messages',
                    localField: 'messageId',
                    foreignField: '_id',
                    as: 'message'
                  }
                },
                { $unwind: '$message' },
                {
                  $addFields: {
                    'message.messageState': {
                      state: '$state',
                      isStarred: '$isStarred',
                      isImportant: '$isImportant',
                      userId: '$userId'
                    }
                  }
                }
              ]).toArray();
            
            return { ok: true, data: findResult.map(r => r.message) };
          }

          findResult = await db.collection(collection)
            .find(body.q || {})
            .sort(body.sort || { _createdAt: -1 })
            .limit(body.limit || 50)
            .toArray();
          return { ok: true, data: findResult };

        default:
          // Handle inserts (default behavior)
          if (Array.isArray(body.data)) {
            const insertManyResult = await db.collection(collection).insertMany(body.data, options);
            return { ok: true, data: insertManyResult };
          }
          
          const insertOneResult = await db.collection(collection).insertOne(body.data, options);
          return { ok: true, data: insertOneResult };
      }
      
    } catch (error) {
      console.error(`Error in ${collection} operation:`, error);
      throw createError({
        statusCode: 500,
        message: `Database operation failed for ${collection}`
      });
    }
  } catch (error) {
    console.error('Full error details:', {
      error,
      stack: error.stack,
      collection,
      body: JSON.stringify(body)
    });
    throw createError({
      statusCode: 500,
      message: `Operation failed: ${error.message}`
    });
  }
});
