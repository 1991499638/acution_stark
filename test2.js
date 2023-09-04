// 生成0到10之间的随机数
const commit = require('./commit')

var message = [];
for (let i = 0; i < 6; i++) {
    var randomNum = (Math.random() * 100).toFixed(0);
    message[i] = randomNum;
}
console.log(typeof message);
console.dir(message)
commit.genCommit(message)
