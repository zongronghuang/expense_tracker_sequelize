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
  app.locals.total = 0
  app.locals.subtotal = 0

  User.findByPk(req.user.id)
    .then(user => {
      if (!user) throw new Error('找不到使用者')

      return Record.findAll({
        raw: true,
        nest: true,
        where: {
          UserId: req.user.id,
          date: {
            [Op.like]: queriedMonth + '%'
          }
        }
      })
    })
    .then(records => {
      // 計算 total (該月份全部種類支出的總和)
      records.forEach(record => {
        app.locals.total += record.amount
        record[record.category] = true
      })

      if (queriedCategory === 'all') {
        // 在 index 上 render 全部類別的支出
        return res.render('index', {
          records,
          total: app.locals.total || '0',
          [queriedCategory]: true,
          queriedMonth
        })
      } else {
        const subsetRecords = records.filter(record => record.category === queriedCategory)

        // 計算 subtotal (該月份特定種類支出的總和)
        subsetRecords.forEach(subsetRecord => {
          app.locals.subtotal += subsetRecord.amount
        })

        // 在 index 上 render 特定類別的支出 
        return res.render('index', {
          records: subsetRecords,
          subtotal: app.locals.subtotal || '0',
          percentage: Math.floor((app.locals.subtotal / app.locals.total) * 100),
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