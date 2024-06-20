const express = require('express')
const getBook = require('./getBook')
const cors = require('cors')
const app = express()

app.use(cors())

// 获取小说
app.get('/', (req, res) => {
  res.send('一个简单的应用')
})

// 获取小说
app.get('/book', (req, res) => {
  const { url } = req.query
  getBook.start(url, res)
})

app.listen(3000)

