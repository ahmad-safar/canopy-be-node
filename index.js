const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const sqlite3 = require('sqlite3').verbose()

const mJwt = require('express-jwt')
const { body, validationResult } = require('express-validator')


const JWT_SECRET = 'supersecret'
const DBSOURCE = 'db.sqlite'

const app = express()
const router = express.Router()

const db = new sqlite3.Database(DBSOURCE, (err) => {
  try {
    if (err) throw err
    console.log('Connected to the SQLite database.')
  } catch (err) {
    console.error(err.message)
  }
})

app.use(express.json());

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})

app.post('/login',
  body('email').isEmail(),
  body('password').isLength({ min: 5 }),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = {
      email: req.body.email,
      password: req.body.password
    }

    const sql = 'SELECT * FROM users WHERE email = ?'
    const params = [user.email]

    db.all(sql, params, (err, rows) => {
      try {
        if (err) throw err
        // Load hash from the db, which was preivously stored 
        bcrypt.compare(user.password, rows[0].password, (_err, r) => {
          if (r == true) {
            const token = jwt.sign(user, JWT_SECRET)
            res.send({ token })
          } else {
            return invalidCredMsg(user.email, res)
          }
        })
      } catch (err) {
        return invalidCredMsg(user.email, res)
      }
    })
  })

app.get('/incident',
  mJwt({ secret: JWT_SECRET, algorithms: ['HS256'] }),
  (_req, res) => {

    const sql = 'SELECT * FROM incident'
    const params = []

    db.all(sql, params, (err, rows) => {
      try {
        if (err) throw err
        res.send({
          message: 'success',
          data: rows
        })
      } catch (err) {
        console.error(err.message)
      }
    })
  })

function invalidCredMsg(email, res) {
  return res.status(400).send({
    errors: [{
      value: email,
      msg: "Invalid credentials",
      param: "email",
      location: "body"
    }]
  })
}

app.use(function (err, _req, res, _next) {
  if (err.name === 'UnauthorizedError') {
    res.status(401).send({ message: 'Invalid token.' })
  }
})
