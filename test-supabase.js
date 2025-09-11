// Test Supabase connection
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://czzpkrtlujpejuzhdnnr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6enBrcnRsdWpwZWp1emhkbm5yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2NDg3NzksImV4cCI6MjA2ODIyNDc3OX0.HIzKIGPXhKEk0iMkMt7R_zQul616PruCQu7XORjQeQs';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('🔍 Testing Supabase connection...');
  
  try {
    // Test basic connection
    const { data, error } = await supabase.from('jobs').select('count').limit(1);
    
    if (error) {
      console.log('❌ Connection failed:', error.message);
      console.log('💡 You need to run the database schema first!');
      console.log('📋 Go to: https://supabase.com/dashboard');
      console.log('📋 Select your project and go to SQL Editor');
      console.log('📋 Copy and paste the contents of supabase-schema.sql');
      console.log('📋 Click "Run" to create all tables');
    } else {
      console.log('✅ Supabase connection successful!');
      console.log('🎉 Your database is ready to use!');
    }
  } catch (err) {
    console.log('❌ Error:', err.message);
  }
}

testConnection();
