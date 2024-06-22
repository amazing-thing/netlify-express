const fs = require('fs')
const config = require('./config')
const path = require('path')
const jszip = require('jszip')
const { deleteFolderRecursive } = require('./utils')

function translateNovel(response) {
  // 从哪个文件夹读取数据
  const dirPath = path.join('/tmp', `/${response.bookName + response.uid}`)

  // 新章节目录
  const newFileDir = path.join('/tmp', `/${response.bookName + response.uid}-new`)
  // 初始化文件夹
  deleteFolderRecursive(newFileDir)

  // 新章节文件名字递增
  let fileNameCount = 1

  // 记录当前是第几章
  let num = 0

  // 内容数据
  let chunk = ''


  fs.readdir(dirPath, (err, files) => {
    // 正确排序
    const _files = files.sort((a, b) => {
      const pattern = /^(\d+)\./;
      const numberA = parseInt(a.match(pattern)[1]);
      const numberB = parseInt(b.match(pattern)[1]);

      return numberA - numberB;
    })
    _files.forEach((file, index) => {
      // 文件路径
      const filePath = path.join(dirPath, file)
      // 读取文件内容
      let res = fs.readFileSync(filePath)

      let str = res.toString()

      // 正则后得到的数

      // 每一张数据收集
      chunk += str

      // 重置下标
      num++

      // 到达指定章数生成一个文件 
      if (num === config.splitNum) {
        const newPath = path.join(newFileDir, `${fileNameCount}.txt`)
        fs.writeFileSync(newPath, chunk)
        fileNameCount += 1
        num = 0
        chunk = ''
      } else {
        // 最后几张不构成20章的
        if (index === _files.length - 1) {
          const newPath = path.join(newFileDir, `${fileNameCount}.txt`)
          fs.writeFile(newPath, chunk, (err, res) => {
            if (!err) {
              console.log('成功了');
              downloadZip(response)
            }
          })
        }
      }
    })
  })

  async function downloadZip(ctx) {
    const zip = new jszip()
    // 循环压缩目录下的数据，注意这里只压缩了第一层数据，如果多层级数据需要更复杂的写法
    fs.readdirSync(newFileDir).forEach(file => {
      const filePath = path.join(newFileDir, file)
      const fileContent = fs.readFileSync(filePath)
      zip.file(file, fileContent)
    })
    const zipContent = await zip.generateAsync({ type: 'nodebuffer' })
    console.log(zipContent);
    // 返回
    ctx.setHeader('Content-Type', 'application/octet-stream')
    ctx.setHeader('Content-Disposition', `attachment; filename="${encodeURI(ctx.bookName)}.zip"`)
    ctx.send(zipContent) // 发送压缩包内容

    deleteFolderRecursive(dirPath)
    deleteFolderRecursive(newFileDir)
  }
}


module.exports = { translateNovel }
