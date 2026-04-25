import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { date } = req.query;
      
      let result;
      if (date) {
        result = await sql`
          SELECT * FROM entries 
          WHERE date = ${date} 
          ORDER BY created_at DESC;
        `;
      } else {
        result = await sql`
          SELECT * FROM entries 
          ORDER BY created_at ASC;
        `;
      }

      // Group by date to match the frontend format, or just return as flat array
      // Since it's easier to format on the frontend, let's just return the rows.
      return res.status(200).json(result.rows);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const { date, type, consistency, medicine_type, user = 'Nisse' } = req.body;
      
      if (!date || !type) {
        return res.status(400).json({ error: 'Date and type are required' });
      }

      const result = await sql`
        INSERT INTO entries (date, type, consistency, medicine_type, "user")
        VALUES (${date}, ${type}, ${consistency || null}, ${medicine_type || null}, ${user})
        RETURNING *;
      `;

      return res.status(201).json(result.rows[0]);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
