import { MongoClient } from 'mongodb';

export default defineEventHandler(async (event) => {
  try {
    const session = event.context.session;
    if (!session) {
      throw new Error('No active session found');
    }

    await session.commitTransaction();
    await session.endSession();

    return {
      ok: true,
      message: 'Transaction committed successfully'
    };
  } catch (error) {
    console.error('Error committing transaction:', error);
    throw createError({
      statusCode: 500,
      message: 'Failed to commit transaction'
    });
  }
});
