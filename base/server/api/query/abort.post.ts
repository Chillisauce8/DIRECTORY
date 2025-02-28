import { MongoClient } from 'mongodb';

export default defineEventHandler(async (event) => {
  try {
    const session = event.context.session;
    if (!session) {
      throw new Error('No active session found');
    }

    await session.abortTransaction();
    await session.endSession();

    return {
      ok: true,
      message: 'Transaction aborted successfully'
    };
  } catch (error) {
    console.error('Error aborting transaction:', error);
    throw createError({
      statusCode: 500,
      message: 'Failed to abort transaction'
    });
  }
});
