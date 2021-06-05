const express = require('express')
const app = express()
const path = require('path')
const router = require('./router.js')
const bodyParser = require('body-parser')
const session = require("express-session")

app.engine('html', require('express-art-template'));
app.use('/public/', express.static(path.join(__dirname, './public/')))
app.use('/node_modules/', express.static(path.join(__dirname, './node_modules/')))
app.use(bodyParser.json()) // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
app.use(session({
    secret: 'mingzzz',
    resave: true, 
    saveUninitialized: false
    }))
app.use(router)
// app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');


app.listen(3000,() => {
    console.log('127.0.0.1:3000 running...')
})