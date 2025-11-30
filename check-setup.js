// Quick setup checker
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

try {
  const envContent = readFileSync(join(__dirname, '.env'), 'utf8');
  const hasUrl = envContent.includes('VITE_SUPABASE_URL=https://kvtsylmeoldlumjlfjyk.supabase.co');
  const hasKey = envContent.includes('VITE_SUPABASE_ANON_KEY=') && 
                 !envContent.includes('PASTE_YOUR_FULL_ANON_KEY_HERE');
  
  console.log('\n📊 Setup Status:\n');
  console.log('✅ Supabase URL:', hasUrl ? 'Configured' : '❌ Missing');
  console.log('🔑 API Key:', hasKey ? 'Configured' : '❌ Needs full key');
  
  if (hasUrl && hasKey) {
    console.log('\n🎉 Your .env file is ready!');
    console.log('Run: npm run dev');
  } else {
    console.log('\n⚠️  Please complete the .env file setup');
  }
} catch (error) {
  console.log('❌ .env file not found or error reading it');
}

