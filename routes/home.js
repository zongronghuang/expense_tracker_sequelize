const express = require('express')
const router = express.Router()
const db = require('../models')
const Record = db.Record
const User = db.User
const { authenticated } = require('../config/auth.js')

router.get('/', authenticated, (req, res) => {
  User.findByPk(req.user.id)
    .then(user => {
      if (!user) throw new Error('user not found')

      return Record.findAll({
        raw: true,
        nest: true,
        where: { UserId: req.user.id }
      })
    })
    .then(records => { return res.redirect('/records') })
    .catch(err => { if (err) return console.error(err) })
})

module.exports = router