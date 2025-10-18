#!/usr/bin/env node

// Script to run the check-in migration
// Usage: node scripts/run-migration.js

async function runMigration() {
  try {
    console.log('🔄 Running check-in database migration...');
    
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000';
    
    const response = await fetch(`${baseUrl}/api/db/migrate-checkin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        adminSecret: process.env.ADMIN_SECRET || 'your-admin-secret'
      })
    });
    
    const result = await response.json();
    
    if (response.ok && result.success) {
      console.log('✅ Migration completed successfully!');
      console.log(result.message);
    } else {
      console.error('❌ Migration failed:', result.error);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error running migration:', error.message);
    process.exit(1);
  }
}

runMigration();