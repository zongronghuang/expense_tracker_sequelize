const express = require('express')
const router = express.Router()
const Record = require('../models/record.js')
const { authenticated } = require('../config/auth.js')

router.get('/', authenticated, (req, res) => {
  Record.find()
    .lean()
    .exec((err, records) => {
      if (err) return console.error(err)
      return res.redirect('/records')
    })
})

module.exports = router