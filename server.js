const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/animated_blog'
});

app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Routes

// Auth - Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await pool.query(
      'INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING id, email, name',
      [email, hashedPassword, name]
    );
    
    const token = jwt.sign({ id: result.rows[0].id, email: result.rows[0].email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ user: result.rows[0], token });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Auth - Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
    
    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) return res.status(401).json({ error: 'Invalid credentials' });
    
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ user: { id: user.id, email: user.email, name: user.name }, token });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all posts (public)
app.get('/api/posts', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT posts.*, users.name as author_name 
       FROM posts 
       JOIN users ON posts.author_id = users.id 
       ORDER BY posts.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single post with comments
app.get('/api/posts/:id', async (req, res) => {
  try {
    const post = await pool.query(
      `SELECT posts.*, users.name as author_name 
       FROM posts 
       JOIN users ON posts.author_id = users.id 
       WHERE posts.id = $1`,
      [req.params.id]
    );
    
    const comments = await pool.query(
      `SELECT comments.*, users.name as author_name 
       FROM comments 
       JOIN users ON comments.author_id = users.id 
       WHERE comments.post_id = $1 
       ORDER BY comments.created_at DESC`,
      [req.params.id]
    );
    
    res.json({ post: post.rows[0], comments: comments.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create post (authenticated)
app.post('/api/posts', authenticateToken, async (req, res) => {
  try {
    const { title, excerpt, content, category, image_url } = req.body;
    const result = await pool.query(
      `INSERT INTO posts (title, excerpt, content, category, image_url, author_id, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) 
       RETURNING *`,
      [title, excerpt, content, category, image_url, req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update post (authenticated, own posts only)
app.put('/api/posts/:id', authenticateToken, async (req, res) => {
  try {
    const { title, excerpt, content, category, image_url } = req.body;
    const post = await pool.query('SELECT author_id FROM posts WHERE id = $1', [req.params.id]);
    
    if (post.rows[0].author_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const result = await pool.query(
      `UPDATE posts SET title=$1, excerpt=$2, content=$3, category=$4, image_url=$5, updated_at=NOW() 
       WHERE id=$6 RETURNING *`,
      [title, excerpt, content, category, image_url, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete post (authenticated, own posts only)
app.delete('/api/posts/:id', authenticateToken, async (req, res) => {
  try {
    const post = await pool.query('SELECT author_id FROM posts WHERE id = $1', [req.params.id]);
    if (post.rows[0].author_id !== req.user.id) return res.status(403).json({ error: 'Unauthorized' });
    
    await pool.query('DELETE FROM comments WHERE post_id = $1', [req.params.id]);
    await pool.query('DELETE FROM posts WHERE id = $1', [req.params.id]);
    res.json({ message: 'Post deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Add comment
app.post('/api/posts/:id/comments', authenticateToken, async (req, res) => {
  try {
    const { content } = req.body;
    const result = await pool.query(
      `INSERT INTO comments (post_id, author_id, content, created_at) 
       VALUES ($1, $2, $3, NOW()) 
       RETURNING *`,
      [req.params.id, req.user.id, content]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete comment (own comments only)
app.delete('/api/comments/:id', authenticateToken, async (req, res) => {
  try {
    const comment = await pool.query('SELECT author_id FROM comments WHERE id = $1', [req.params.id]);
    if (comment.rows[0].author_id !== req.user.id) return res.status(403).json({ error: 'Unauthorized' });
    
    await pool.query('DELETE FROM comments WHERE id = $1', [req.params.id]);
    res.json({ message: 'Comment deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
