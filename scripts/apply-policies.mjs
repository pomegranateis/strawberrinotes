import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load from injected dotenv
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function applyPolicies() {
  console.log('🍓 Applying Storage RLS policies...\n')

  const sql = readFileSync(resolve(__dirname, 'setup-policies.sql'), 'utf-8')

  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql })

    if (error) {
      // If the RPC doesn't exist, we need to apply policies manually via dashboard
      console.log('⚠️  Cannot apply policies automatically.')
      console.log('Please run the following SQL in your Supabase SQL Editor:\n')
      console.log(sql)
      console.log('\nGo to: https://supabase.com/dashboard → Your Project → SQL Editor')
      process.exit(0)
    }

    console.log('✅ Storage policies applied successfully!')

  } catch (error) {
    console.log('⚠️  Automatic policy application failed.')
    console.log('Please run the following SQL in your Supabase SQL Editor:\n')
    console.log(sql)
    console.log('\nGo to: https://supabase.com/dashboard → Your Project → SQL Editor')
  }
}

applyPolicies()
