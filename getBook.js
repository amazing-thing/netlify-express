const config = require('./config')
const superagent = require('superagent')
const cheerio = require('cheerio')
const fs = require('fs')
const path = require('path')
const pakageNovel = require('./pakageNovel')
const { v4: uuidv4 } = require("uuid");
const { deleteFolderRecursive } = require('./utils')

// 获取对应章节数量
function getNovelLenth(options) {
  // 唯一值
  const uid = uuidv4()
  const { curUrl, res: response } = options
  // 小说地址
  const url = curUrl
  // 小说总章节
  let novelLength = 0
  // 已成功读取的章节数
  let finishNovel = 0
  // 小说名
  let bookName = ''
  // 目标路径文件夹
  let targetFilePath = ''

  superagent
    .get(url)
    .set(config.headers)
    .end(function (err, res) {
      if (err) {
        console.log('获取对应章节数量错误');
        getNovelLenth()
        return
      }

      const $ = cheerio.load(res.text, { decodeEntities: false })
      novelLength = $('.listmain dl dd:not(.pc_none)').length
      response.bookName = bookName = $('.info > h1').text()
      response.uid = uid

      // 设置目标路径文件夹
      targetFilePath = path.resolve(__dirname, './file', `./${bookName + uid}`)
      // 初始化文件夹
      deleteFolderRecursive(targetFilePath)

      loop_read()
    })



  // 循环读取小说
  function loop_read() {
    for (let i = 1; i <= novelLength; i++) {
      let sourceUrl = `${url}/${i}.html`
      get_url_html(sourceUrl, i)
    }
  }

  // 根据地址找到对应小说章节
  function get_url_html(sourceUrl, i) {
    superagent
      .get(sourceUrl)
      .timeout({ deadline: 10000 })
      .set(config.headers)

      .end(function (err, res) {
        console.log('根据地址找到对应小说章节');
        if (err) {
          get_url_html(sourceUrl, i)
          return
        }

        const $ = cheerio.load(res.text, { decodeEntities: false })
        parse_html($, i)
      })
  }

  // 解析对应html
  function parse_html($, i) {
    $('#chaptercontent').each((index, element) => {
      const reg = /\<p/g
      var arr = $('.content .wap_none')
      let s1 = $(element).html().replace(/<br><br>/g, '\r\n')
      let str = s1.slice(0, reg.exec(s1).index)

      save_info($(arr[0]).html() + '\n' + str, i)
    })
    // 提取有价值信息的步骤...
  }


  // 将爬取到的章节写进对应文件夹
  function save_info(data, i) {
    fs.open(`${targetFilePath}/${i}.txt`, 'a', (err, fd) => {
      if (err) {
        console.log(err)
        return
      }
      fs.write(fd, data + '\n', (err) => {
        if (err) {
          console.log(err)
        }
        fs.closeSync(fd)

        finishNovel++
        console.log(finishNovel, novelLength);
        if (finishNovel === novelLength) {
          pakageNovel.translateNovel(response)
        }
      })
    })
  }
}



// 开始
function start(curUrl, res) {
  finishNovel = 0
  getNovelLenth({ curUrl, res })
}

module.exports = {
  start
}
