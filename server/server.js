require('dotenv').config()

const express = require('express')
const cors = require('cors')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const db = require('./database')

const app = express()
const PORT = 5000
const JWT_SECRET = process.env.JWT_SECRET

function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization

    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
        return res.status(401).json({
            message: 'Authentication required',
        })
    }

    try {
        const user = jwt.verify(token, JWT_SECRET)

        req.user = user

        next()
    } catch (error) {
        return res.status(403).json({
            message: 'Invalid or expired token',
        })
    }
}

app.use(cors())
app.use(express.json())

app.get('/api/health', (req, res) => {
    res.json({
        message: 'Server is working!',
    })
})

app.post('/api/register', async (req, res) => {
    const { username, email, password } = req.body

    if (!username || !email || !password) {
        return res.status(400).json({
            message: 'Username, email, and password are required',
        })
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10)

        const result = db.prepare(`
      INSERT INTO users (username, email, password)
      VALUES (?, ?, ?)
    `).run(username, email, hashedPassword)

        res.status(201).json({
            id: result.lastInsertRowid,
            username,
            email,
        })
    } catch (error) {
        console.error(error)

        res.status(500).json({
            message: 'Unable to create user',
        })
    }
})

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body

    if (!email || !password) {
        return res.status(400).json({
            message: 'Email and password are required',
        })
    }

    try {
        const user = db.prepare(`
      SELECT *
      FROM users
      WHERE email = ?
    `).get(email)

        if (!user) {
            return res.status(401).json({
                message: 'Invalid email or password',
            })
        }

        const passwordMatches = await bcrypt.compare(
            password,
            user.password
        )

        if (!passwordMatches) {
            return res.status(401).json({
                message: 'Invalid email or password',
            })
        }

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
            },
            JWT_SECRET,
            { expiresIn: '1h' }
        )

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
            },
        })

    } catch (error) {
        console.error(error)

        res.status(500).json({
            message: 'Unable to log in',
        })
    }
})

app.get('/api/users', authenticateToken, (req, res) => {
    const users = db.prepare(`
    SELECT id, username, email
    FROM users
  `).all()

    res.json(users)
})

app.get('/api/me', authenticateToken, (req, res) => {
    const user = db.prepare(`
    SELECT id, username, email
    FROM users
    WHERE id = ?
  `).get(req.user.id)

    if (!user) {
        return res.status(404).json({
            message: 'User not found',
        })
    }

    res.json(user)
})

app.put('/api/me', authenticateToken, (req, res) => {
  const { username, email } = req.body

  if (!username || !email) {
    return res.status(400).json({
      message: 'Username and email are required',
    })
  }

  try {
    const result = db.prepare(`
      UPDATE users
      SET username = ?, email = ?
      WHERE id = ?
    `).run(username, email, req.user.id)

    if (result.changes === 0) {
      return res.status(404).json({
        message: 'User not found',
      })
    }

    const updatedUser = db.prepare(`
      SELECT id, username, email
      FROM users
      WHERE id = ?
    `).get(req.user.id)

    res.json(updatedUser)
  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: 'Unable to update profile',
    })
  }
})

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
})