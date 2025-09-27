const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const deleteFile = (filePath) => {
  if (!filePath) return;
  try {
    const fullPath = path.join(__dirname, '..', filePath.replace(/^\//, ''));
    require('fs').unlinkSync(fullPath);
  } catch (err) {
    console.log(err.message);
  }
};

const getPhotoPath = (file) => {
  return file ? '/uploads/' + path.basename(file.path) : null;
};

const uploadDir = process.env.UPLOAD_DIR || 'uploads';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + '_' + Math.round(Math.random() * 1E9) + ext);
  }
});

function fileFilter (req, file, cb) {
  const allowed = ['.jpg', '.jpeg'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowed.includes(ext)) return cb(new Error('Only JPG and JPEG files are allowed'));
  cb(null, true);
}

const upload = multer({ storage, limits: { fileSize: 300 * 1024 }, fileFilter });

// get all employees
router.get('/', auth, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, name, position, photo, created_at FROM employees');
    res.json(rows);
  } catch (err) {
    console.log(err.message);
  }
});

// add new employee
router.post('/', auth, upload.single('photo'), async (req, res) => {
  try {
    const { name, position } = req.body;
    const photoPath = getPhotoPath(req.file);
    const [result] = await pool.query('INSERT INTO employees (name, position, photo) VALUES (?, ?, ?)', [name, position, photoPath]);
    res.json(result);
  } catch (err) {
    console.log(err.message);
  }
});

// update employee
router.put('/:id', auth, upload.single('photo'), async (req, res) => {
  try {
    const { name, position } = req.body;
    const [rows] = await pool.query('SELECT photo FROM employees WHERE id = ?', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'not found' });
    
    let photoPath = rows[0].photo;
    if (req.file) {
      deleteFile(photoPath); // Remove old photo
      photoPath = getPhotoPath(req.file);
    }

    const [result] = await pool.query('UPDATE employees SET name = ?, position = ?, photo = ? WHERE id = ?', [name, position, photoPath, req.params.id]);
    res.json(result);
  } catch (err) {
    console.log(err.message);
  }
});

// delete employee
router.delete('/:id', auth, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT photo FROM employees WHERE id = ?', [req.params.id]);
    if (rows[0]?.photo) {
      deleteFile(rows[0].photo);
    }
    await pool.query('DELETE FROM employees WHERE id = ?', [req.params.id]);
    res.json({ message: 'Employee deleted' });
  } catch (err) {
    console.log(err.message);
  }
});

module.exports = router;
