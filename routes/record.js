const express = require('express')
const router = express.Router()
const Record = require('../models/record.js')
const { authenticated } = require('../config/auth.js')

// 顯示所有購買項目
router.get('/', authenticated, (req, res) => {
  const queriedCategory = req.query.category || 'all'
  const time = new Date()
  const queriedMonth = req.query.month || time.toISOString().slice(0, 7)

  if (queriedCategory === 'all') {
    let total = 0
    let subtotal = 0

    Record.find({ userId: req.user._id, date: { $regex: queriedMonth } })
      .lean()
      .exec((err, records) => {
        if (err) console.error(err)
        records.forEach(record => {
          total += record.amount
        })

        subtotal = total

        records.forEach(record => {
          const category = record.category
          return record[category] = true
        })

        return res.render('index', {
          records,
          total,
          subtotal,
          percentage() {
            if (!total) {
              return '0'
            } else {
              return Math.round((subtotal * 100) / total)
            }
          },
          queriedMonth,
          all: true
        })
      })
  } else {
    let total = 0
    let subtotal = 0

    Record.find({ userId: req.user._id, date: { $regex: queriedMonth } })
      .lean()
      .exec((err, records) => {
        records.forEach(record => {
          total += record.amount
        })
      })

    Record.find({ userId: req.user._id, category: queriedCategory, date: { $regex: queriedMonth } })
      .lean()
      .exec((err, records) => {
        if (err) console.error(err)
        records.forEach(record => {
          subtotal += record.amount
        })

        records.forEach(record => {
          const category = record.category
          return record[category] = true
        })

        return res.render('index', {
          records,
          total,
          subtotal,
          percentage() {
            if (!total) {
              return '0'
            } else {
              return Math.round((subtotal * 100) / total)
            }
          },
          queriedMonth,
          [queriedCategory]: true
        })
      })
  }

})

// 取得新增項目頁面
router.get('/new', authenticated, (req, res) => {
  res.render('new')
})

// 傳回新增項目
router.post('/', authenticated, (req, res) => {
  const record = new Record({
    name: req.body.name,
    category: req.body.category,
    date: req.body.date,
    amount: req.body.amount,
    retailer: req.body.retailer,
    userId: req.user._id
  })

  record.save(err => {
    if (err) console.error(err)
    return res.redirect('/')
  })

})

// 取回項目編輯頁面
router.get('/:id/edit', authenticated, (req, res) => {
  Record.findOne({ _id: req.params.id, userId: req.user._id })
    .lean()
    .exec((err, record) => {
      if (err) return console.error(err)

      record[record.category] = true

      return res.render('update', { record: record })
    })

})


// 傳回編輯資料
router.put('/:id', authenticated, (req, res) => {
  Record.findOne({ _id: req.params.id, userId: req.user._id }, (err, record) => {
    record.name = req.body.name
    record.date = req.body.date
    record.category = req.body.category
    record.amount = req.body.amount
    record.retailer = req.body.retailer

    record.save(err => {
      if (err) return console.error(err)
      return res.redirect('/records')
    })
  })
})


// 刪除項目
router.delete('/:id/delete', authenticated, (req, res) => {
  Record.findOne({ _id: req.params.id, userId: req.user._id }, (err, record) => {
    if (err) return console.error(err)
    record.remove(err => {
      if (err) return console.error(err)
      return res.redirect('/records')
    })
  })
})



module.exports = router