/**
    Server initialization
 */

const app = require('express')()
const express = require('express')
const bodyParser = require('body-parser')
const session = require('express-session')
const cookieParser = require('cookie-parser')
require('dotenv').config({path: '../.env'})

/**
 *  Local imports
 */
const api = require('./routes/api')
const port = process.env.SERVER_PORT
const error = require('./routes/error')
const root_url = process.env.ROOT_URL
console.log('ROOT_URL ', root_url)
console.log('SERVER_PORT ', "http://localhost:" + port)

app.use('*', (req, res, next) => {
  res.header("Access-Control-Allow-Origin", root_url)
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  res.header('Access-Control-Allow-Credentials', true)
  next()
})

app.use(
  bodyParser.json(
    {limit: '40mb', extended: true}
  )
)
app.use(
  bodyParser.urlencoded(
    {limit: '40mb', extended: true}
  )
)

app.use(cookieParser(process.env.SERVER_COOKIE_SECRET))
app.use(
  session({
    name:"access-token",
    resave:false,
    saveUninitialized:true,
    secret:process.env.SERVER_COOKIE_SECRET,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24
    }
  })
)
app.set('trust proxy', 1)

app.use('/api/v1', api)
app.use(express.static('../client/dist'))
app.all('*', error.unknown)

/**
 Start server.
 */
// app.listen(port, () => {
//   console.log(`App listening on port ${port}!`)
// })

module.exports = app;
