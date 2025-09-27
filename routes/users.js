const express = require("express");
const router = express.Router();
const pool = require("../db");
const auth = require("../middleware/auth");
const bcrypt = require("bcryptjs"); 

const checkDuplicate = async (pool, table, field, value, excludeId = null) => {
  const query = excludeId
    ? `SELECT id FROM ${table} WHERE ${field} = ? AND id != ?`
    : `SELECT id FROM ${table} WHERE ${field} = ?`;

  const params = excludeId ? [value, excludeId] : [value];
  const [existing] = await pool.query(query, params);

  if (existing.length > 0) {
    return {
      status: 400,
      error: `${field} '${value}' sudah digunakan. Silakan pilih ${field.toLowerCase()} yang lain.`,
    };
  }
  return null;
};

// get all users
router.get("/", auth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, username, fullname, role, created_at FROM users"
    );
    res.json(rows);
  } catch (err) {
    console.error(err.message);
  }
});

// create user
router.post("/", auth, async (req, res) => {
  const { username, password, fullname, role } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: "Username dan password wajib diisi" });

  try {
    // Check if username already exists
    const duplicateError = await checkDuplicate(
      pool,
      "users",
      "username",
      username
    );
    if (duplicateError) {
      return res
        .status(duplicateError.status)
        .json({ error: duplicateError.error });
    }

    const hashed = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      "INSERT INTO users (username, password, fullname, role) VALUES (?, ?, ?, ?)",
      [username, hashed, fullname || "", role || "staff"]
    );
    res.json({ id: result.insertId, username });
  } catch (err) {
    console.error(err.message);
  }
});

module.exports = router;
