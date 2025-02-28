import { MongoClient } from 'mongodb';

export default defineEventHandler(async (event) => {
  const client: MongoClient = event.context.mongo;
  const session = client.startSession();
  session.startTransaction();
  
  return { 
    sessionId: session.id,
    // Store session in context for other handlers
    context: event.context.session = session
  };
});
