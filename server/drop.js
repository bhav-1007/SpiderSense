import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const atlasUrl = process.env.ATLAS_URL;
mongoose.connect(atlasUrl).then(async () => {
  await mongoose.connection.collection('heroes').drop().catch(() => {});
  console.log('Dropped heroes collection.');
  process.exit(0);
}).catch(console.error);
