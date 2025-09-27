require('dotenv').config();
const pool = require('../db');
const bcrypt = require('bcryptjs');

async function main() {
  const username = process.env.SEED_ADMIN_USER || 'admin';
  const password = process.env.SEED_ADMIN_PASS || 'admin123';
  try {
    const [rows] = await pool.query('SELECT id FROM users WHERE username = ? LIMIT 1', [username]);
    if (rows[0]) {
      console.log('Admin user already exists with id', rows[0].id);
      await pool.end();
      return;
    }
    const hashed = await bcrypt.hash(password, 10);
    const [result] = await pool.query('INSERT INTO users (username, password, fullname, role) VALUES (?, ?, ?, ?)', [username, hashed, 'Administrator', 'admin']);
    console.log('Inserted admin user with id', result.insertId);
    await pool.end();
  } catch (err) {
    console.error('Seed failed:', err.message || err);
    try { await pool.end(); } catch (e) {}
    process.exit(1);
  }
}

main();
