import mongoose from 'mongoose';

/**
 * connectDB — establishes a connection to MongoDB Atlas.
 * Called once at server startup before the HTTP server starts listening.
 */
export async function connectDB() {
  const atlasUrl = process.env.ATLAS_URL;

  if (!atlasUrl) {
    console.error('❌  Missing ATLAS_URL in environment variables!');
    process.exit(1);
  }

  await mongoose.connect(atlasUrl);
  console.log('✅  Connected to MongoDB Atlas');
}
