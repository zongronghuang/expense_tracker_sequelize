const LocalStrategy = require('passport-local').Strategy
const FacebookStrategy = require('passport-facebook').Strategy
const bcrypt = require('bcryptjs')
const db = require('../models')
const User = db.User

module.exports = passport => {
  passport.use(
    new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
      User.findOne({ where: { email: email } })
        .then(user => {
          if (!user) {
            console.log('Not registered')
            return done(null, false, { message: 'Email not registered' })
          }

          bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) throw err
            if (isMatch) {
              return done(null, user)
            } else {
              return done(null, false, { message: 'incorrect email or password' })
            }
          })
        })
    })
  )

  passport.use(
    new FacebookStrategy({
      clientID: process.env.FACEBOOK_ID,
      clientSecret: process.env.FACEBOOK_SECRET,
      callbackURL: process.env.FACEBOOK_CALLBACK,
      profileFields: ['email', 'displayName']
    }, (accessToken, refreshToken, profile, done) => {
      // 確認回傳的 profile 物件裡有沒有缺少需要的資料，或是因為隱私設定而沒回傳
      // console.log('profile', profile) 

      User.findOne({ where: { email: profile._json.email } })
        .then(user => {
          if (!user) {
            const randomPassword = Math.random().toString(36).slice(-8)

            bcrypt.genSalt(10, (err, salt) => {
              bcrypt.hash(randomPassword, salt, (err, hash) => {
                if (err) throw err
                User.create({
                  name: profile._json.name,
                  email: profile._json.email,
                  password: hash
                })
                  .then(user => { return done(null, user) })
                  .catch(err => { console.log(err) })
              })
            })
          } else {
            return done(null, user)
          }
        })
    })
  )

  passport.serializeUser((user, done) => {
    done(null, user.id)
  })

  passport.deserializeUser((id, done) => {
    User.findByPk(id)
      .then((user) => {
        user = user.get()
        done(null, user)
      })
  })
}