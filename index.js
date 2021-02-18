const express = require("express")
const jwt = require('express-jwt')
const sqlite3 = require('sqlite3').verbose()
const bodyParser = require('body-parser')
const router = express.Router()

const app = express()


const HTTP_PORT = 8005

const DBSOURCE = "db.sqlite"

const db = new sqlite3.Database(DBSOURCE, (err) => {
    try {
        if(err) throw err
        console.log('Connected to the SQLite database.')
    } catch (err) {
        console.error(err.message)
    }
});

app.listen(HTTP_PORT, () => {
  console.log(`Server running on port ${HTTP_PORT}`)
});

app.get("/",
    jwt({ secret: 'supersecret',algorithms: ['HS256']  }),
    (req, res, next) => {
    let sql = "SELECT * FROM incident"
    let params = []
    db.all(sql,params,(err,rows) => {
        try {
            if(err) throw err
            res.json({
                "message":"success",
                "data":rows
            })
        } catch (err) {
            console.error(err.message)
        }
    })
})

app.use(function (req, res) {
  res.status(404)
});
