// 使用套件
const express = require('express')
const app = express()
const port = 3000
const exphbs = require('express-handlebars')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')
const session = require('express-session')
const passport = require('passport')
const flash = require('connect-flash')

const db = require('./models')
const Record = db.Record
const User = db.User

// 設定套件
app.engine('handlebars', exphbs({
  defaultLayout: 'main'
}))

app.set('view engine', 'handlebars')

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

app.use(session({
  secret: 'your secret key',
  resave: false,
  saveUninitialized: true,
}))

app.use(passport.initialize())
app.use(passport.session())
require('./config/passport.js')(passport)

app.use(flash())

// 常用變數，存放在 res.locals
app.use((req, res, next) => {
  res.locals.user = req.user
  res.locals.total = 0
  res.locals.monthlyTotal = 0
  res.locals.monthlySubtotal = 0
  res.locals.isAuthenticated = req.isAuthenticated()
  res.locals.success_msg = req.flash('success_msg')
  res.locals.warning_msg = req.flash('warning_msg')
  next()
})

app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(methodOverride('_method'))

// 分頁路由
app.use('/', require('./routes/home.js'))
app.use('/users', require('./routes/user.js'))
app.use('/records', require('./routes/record.js'))
app.use('/auth', require('./routes/auths.js'))

// 監聽 server 啟動狀態
app.listen(process.env.PORT || port, (req, res) => {
  console.log(`Server up & running at http://localhost:${port}`)
})