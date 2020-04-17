const express = require('express')
const app = express()
const router = express.Router()
const db = require('../models')
const Record = db.Record
const User = db.User
const { authenticated } = require('../config/auth.js')

// 顯示所有購買項目
router.get('/', authenticated, (req, res) => {
  const queriedCategory = req.query.category || 'all'
  const time = new Date()
  const queriedMonth = req.query.month || time.toISOString().slice(0, 7)

  // 顯示全部種類的支出
  if (queriedCategory === 'all') {
    User.findByPk(req.user.id)
      .then(user => {
        if (!user) throw new Error('找不到使用者')

        return Record.findAll({
          raw: true,
          nest: true,
          where: {
            UserId: req.user.id
          }
        })
      })
      .then(records => {
        // 計算所有 record 的支出總和
        app.locals.total = 0
        records.forEach(record => {
          app.locals.total += record.amount
        })

        // 在每個 record 中新增屬性，讓 index 頁面能夠顯示對應圖示
        records.forEach(record => {
          const category = record.category
          return (record[category] = true)
        })

        return res.render('index', {
          records,
          total: app.locals.total.toString(),
          [queriedCategory]: true
        })
      })
      .catch(error => { return console.log(error) })
  }
  // 顯示其他種類的支出
  else {
    User.findByPk(req.user.id)
      .then(user => {
        if (!user) throw new Error('找不到使用者')

        return Record.findAll({
          raw: true,
          nest: true,
          where: {
            UserId: req.user.id,
            category: queriedCategory
          }
        })
      })
      .then(records => {
        // 在每個 record 中新增屬性，讓 index 頁面能夠顯示對應圖示
        records.forEach(record => {
          const category = record.category
          return (record[category] = true)
        })

        // 計算該種類 record 的支出總和
        app.locals.subtotal = 0
        records.forEach(record => {
          app.locals.subtotal += record.amount
        })

        return res.render('index', {
          records,
          subtotal: app.locals.subtotal.toString(),
          percentage: Math.floor((app.locals.subtotal / app.locals.total) * 100),
          [queriedCategory]: true
        })
      })
      .catch(error => { return console.log(error) })
  }

})

// 取得新增項目頁面
router.get('/new', authenticated, (req, res) => {
  res.render('new')
})

// 傳回新增項目
router.post('/', authenticated, (req, res) => {
  Record.create({
    name: req.body.name,
    category: req.body.category,
    date: req.body.date,
    amount: req.body.amount,
    retailer: req.body.retailer,
    UserId: req.user.id
  })
    .then(record => { return res.redirect('/') })
    .catch(error => { return console.log(error) })
})

// 取回項目編輯頁面
router.get('/:id/edit', authenticated, (req, res) => {
  User.findByPk(req.user.id)
    .then(user => {
      if (!user) throw new Error('user not found')
      return Record.findOne({
        where: {
          Id: req.params.id,
          UserId: req.user.id
        }
      })
    })
    .then(record => { return res.render('update', { record: record.get() }) })
})


// 傳回編輯資料
router.put('/:id', authenticated, (req, res) => {
  Record.findOne({
    where: {
      id: req.params.id,
      UserId: req.user.id
    }
  })
    .then(record => {
      record.name = req.body.name
      record.date = req.body.date
      record.category = req.body.category
      record.amount = req.body.amount
      record.retailer = req.body.retailer

      return record.save()
    })
    .then(record => {
      return res.redirect('/records')
    })
    .catch(error => { console.log(error) })
})


// 刪除項目
router.delete('/:id/delete', authenticated, (req, res) => {
  User.findByPk(req.user.id)
    .then(user => {
      if (!user) throw new Error('user not found')

      return Record.destroy({
        where: {
          Id: req.params.id,
          UserId: req.user.id
        }
      })
    })
    .then(todo => { return res.redirect('/') })
    .catch(error => { return console.log(error) })
})



module.exports = router