import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

const { data: buckets, error } = await supabase.storage.listBuckets()

if (error) {
  console.error('❌ Error:', error.message)
  process.exit(1)
}

const noteImagesBucket = buckets.find(b => b.name === 'note-images')

if (noteImagesBucket) {
  console.log('✅ Bucket "note-images" exists!')
  console.log('   Public:', noteImagesBucket.public)
  console.log('   ID:', noteImagesBucket.id)
} else {
  console.log('❌ Bucket "note-images" NOT found')
  console.log('Available buckets:', buckets.map(b => b.name).join(', '))
}
