// Supabase Client Configuration
// This file creates a connection between your React app and Supabase database

// Import the Supabase JavaScript client library
import { createClient } from '@supabase/supabase-js'

// Get your Supabase credentials from environment variables
// These are stored in your .env file and accessed via import.meta.env (Vite's way)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validate that credentials exist
// If missing, show error in console to help debugging
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables!')
  console.error('Make sure your .env file has:')
  console.error('VITE_SUPABASE_URL=your-url')
  console.error('VITE_SUPABASE_ANON_KEY=your-key')
}

// Create and export the Supabase client
// This single instance will be used throughout your app to make database queries
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Export a helper function to check if connection works
export async function testConnection() {
  try {
    // Try to fetch projects from database
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .limit(1)
    
    if (error) throw error
    
    console.log('✅ Supabase connection successful!')
    return true
  } catch (error) {
    console.error('❌ Supabase connection failed:', error.message)
    return false
  }
}