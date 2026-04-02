import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function setupStorage() {
  console.log('🍓 Setting up Supabase Storage...\n')

  try {
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()

    if (listError) {
      console.error('❌ Error listing buckets:', listError.message)
      process.exit(1)
    }

    const bucketExists = buckets.some(b => b.name === 'note-images')

    if (bucketExists) {
      console.log('✓ Bucket "note-images" already exists')
    } else {
      console.log('Creating bucket "note-images"...')

      const { data: bucket, error: createError } = await supabase.storage.createBucket('note-images', {
        public: true,
        fileSizeLimit: 5242880, // 5 MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
      })

      if (createError) {
        console.error('❌ Error creating bucket:', createError.message)
        process.exit(1)
      }

      console.log('✓ Bucket "note-images" created successfully')
    }

    console.log('\n✅ Storage setup complete!')
    console.log('\nNext steps:')
    console.log('1. Go to Supabase Dashboard → Storage → note-images')
    console.log('2. Set up RLS policies for the bucket:')
    console.log('   - Allow authenticated users to upload to their own folder')
    console.log('   - Allow public read access')
    console.log('   - Allow users to delete their own images')
    console.log('\nOr run the SQL in the Supabase SQL Editor:')
    console.log(`
-- Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload their own images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'note-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow anyone to view public images
CREATE POLICY "Public images are viewable by anyone"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'note-images');

-- Allow users to delete their own images
CREATE POLICY "Users can delete their own images"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'note-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
`)

  } catch (error) {
    console.error('❌ Unexpected error:', error)
    process.exit(1)
  }
}

setupStorage()
