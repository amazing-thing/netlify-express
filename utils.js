const fs = require('fs')
const path = require('path')

// 删除对应文件夹
function deleteFolderRecursive(dir) {
  if (fs.existsSync(dir)) {
    fs.readdirSync(dir).forEach(file => {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) {
        // 如果是目录，则递归调用
        deleteFolderRecursive(fullPath);
      } else {
        // 如果是文件，则删除文件
        fs.unlinkSync(fullPath);
      }
    });
  } else {
    // 如果没有则创建一个文件夹
    fs.mkdirSync(dir);
  }
}

module.exports = {
  deleteFolderRecursive
}
