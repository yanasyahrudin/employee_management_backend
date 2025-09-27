const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setupDatabase() {
  console.log('Setting up database...');
  
  try {
    // Connect without database first
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || ''
    });

    console.log('Connected to MySQL server');

    // Create database if not exists
    const dbName = process.env.DB_NAME || 'lyrid_prima_test';
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    console.log(`Database '${dbName}' ready`);

    // Switch to database
    await connection.query(`USE \`${dbName}\``);

    // Read and execute schema
    const schemaPath = path.join(__dirname, 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, 'utf8');
      const statements = schema.split(';').filter(stmt => stmt.trim().length > 0);
      
      for (const statement of statements) {
        if (statement.trim()) {
          await connection.query(statement);
        }
      }
      console.log('Schema executed successfully');
    }

    // Check if users table exists and has admin user
    const [tables] = await connection.query("SHOW TABLES LIKE 'users'");
    if (tables.length > 0) {
      const [users] = await connection.query("SELECT COUNT(*) as count FROM users WHERE username = 'admin'");
      if (users[0].count === 0) {
        console.log('Admin user not found. Please run: node seed.js');
      } else {
        console.log('Admin user exists');
      }
    } else {
      console.log('Users table not found');
    }

    await connection.end();
    console.log('Database setup completed');

  } catch (error) {
    console.error('Database setup failed:', error.message);
    console.error('Full error:', error);
  }
}

setupDatabase();