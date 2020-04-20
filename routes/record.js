const express = require('express')
const app = express()
const router = express.Router()
const db = require('../models')
const Record = db.Record
const User = db.User
const { authenticated } = require('../config/auth.js')
const { Op } = require('sequelize')

// 顯示所有購買項目
router.get('/', authenticated, (req, res) => {
  const queriedCategory = req.query.category || 'all'
  const time = new Date()
  const queriedMonth = req.query.month || time.toISOString().slice(0, 7)

  User.findByPk(req.user.id)
    .then(user => {
      if (!user) throw new Error('找不到使用者')

      // 回傳使用者的所有月份支出紀錄
      return Record.findAll({
        raw: true,
        nest: true,
        where: {
          UserId: req.user.id
        }
      })
    })
    .then(records => {
      // 計算使用者所有月份的支出總金額 
      app.locals.total = 0
      records.forEach(record => {
        app.locals.total += record.amount
      })

      return records
    })
    .then(records => {
      // 篩選使用者單一月份的所有支出紀錄
      const monthlyRecords = records.filter(record => record.date.includes(queriedMonth))

      return monthlyRecords
    })
    .then(monthlyRecords => {
      // 計算使用者單一月份所有類別的支出總金額 (monthlyTotal)
      app.locals.monthlyTotal = 0
      monthlyRecords.forEach(monthlyRecord => {
        app.locals.monthlyTotal += monthlyRecord.amount
        monthlyRecord[monthlyRecord.category] = true
      })

      if (queriedCategory === 'all') {
        return res.render('index', {
          records: monthlyRecords,
          total: app.locals.total,
          monthlyTotal: app.locals.monthlyTotal || '0',
          [queriedCategory]: true,
          queriedMonth
        })
      } else {
        // 計算該月份某一種類支出的總和 (monthlySubtotal)
        app.locals.monthlySubtotal = 0
        const classifiedRecords = monthlyRecords.filter(monthlyRecord => monthlyRecord.category === queriedCategory)

        classifiedRecords.forEach(classifiedRecord => {
          app.locals.monthlySubtotal += classifiedRecord.amount
        })

        return res.render('index', {
          records: classifiedRecords,
          total: app.locals.total,
          monthlySubtotal: app.locals.monthlySubtotal || '0',
          percentage: Math.floor((app.locals.monthlySubtotal / app.locals.monthlyTotal) * 100),
          [queriedCategory]: true,
          queriedMonth
        })
      }
    })
    .catch(error => { return console.log(error) })
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