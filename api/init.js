import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
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
    return res.status(200).json({ message: 'Database initialized successfully', result });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
