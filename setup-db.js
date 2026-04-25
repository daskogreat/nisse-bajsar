import { sql } from '@vercel/postgres';
import { config } from 'dotenv';
config({ path: '.env.local' });

async function init() {
  console.log('Initializing database...');
  try {
    const result = await sql`
      CREATE TABLE IF NOT EXISTS entries (
        id SERIAL PRIMARY KEY,
        date VARCHAR(10) NOT NULL,
        type VARCHAR(20) NOT NULL,
        consistency VARCHAR(20),
        medicine_type VARCHAR(20),
        "user" VARCHAR(50) DEFAULT 'Nisse',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('Database initialized successfully:', result);
    process.exit(0);
  } catch (err) {
    console.error('Error initializing database:', err);
    process.exit(1);
  }
}

init();
