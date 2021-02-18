const bcrypt = require('bcrypt')
const sqlite3 = require('sqlite3').verbose()

const saltRounds = 10

const db = new sqlite3.Database(process.env.DB_FILE, (err) => {
  try {
    if (err) throw err
    console.log('Connected to the SQLite database.')
  } catch (err) {
    console.error(err.message)
  }
})

const user = {
  email: 'admin@gmail.com',
  password: 'secret'
}

bcrypt.hash('secret', saltRounds, (_err, hashedPassword) => {
  const sql = 'INSERT INTO users (email, password) VALUES(?, ?)'
  const params = [user.email, hashedPassword]

  db.all(sql, params, (err, rows) => {
    try {
      if (err) throw err
      console.log(rows)
    } catch (err) {
      console.error(err.message)
    }
  })
});
