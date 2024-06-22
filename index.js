const express = require('express')
const getBook = require('./getBook')
const cors = require('cors')
const app = express()

app.use(cors())

// 获取小说
app.get('/', (req, res) => {
  res.send(`<div>一个简单的应用</div>
    <div>从此地址（https://www.wwscdh.com）寻找对应的小说，然后进行拼接跳转，主要是修改地址末尾的数字（171274）为对应的小说即可。列如：</div>
    <div>https://netlify-express-ten.vercel.app/book?url=https://www.wwscdh.com/html/<span style="color:red">171274</span></div>
    `)
})
https://www.wwscdh.com
// 获取小说
app.get('/book', (req, res) => {
  const { url } = req.query
  getBook.start(url, res)
})

app.listen(3000)

