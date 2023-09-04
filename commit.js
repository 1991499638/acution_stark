var Pedersen = require("./pedersen/main")
var fs = require("fs")
var crypto = require('crypto');
// p and q, the p is a large prime number, the q is a generator
// 20 bytes
const pederson = new Pedersen(
    '925f15d93a513b441a78826069b4580e3ee37fc5',
    '959144013c88c9782d5edd2d12f54885aa4ba687'
)
//only the person who known the correct secret can generate the other public parameter H
// const secret = pederson.newSecret()
// if (secret.length !== 40) {
//     throw 'generated invalid key'
// } else {
//     console.log(secret)
// }
var secret = '763cff582aab107fa0c48ecdd17bedc74e771c22'
var message = ['7650','760','750','765','650',]

//generate all commit
function genCommit(message) {
    var ciphers = [];
    for (let i = 0; i < message.length; i++) {
        var r = crypto.randomBytes(20).toString('hex');
        var commit = pederson.commit(message[i], secret, r);
        var cipher = `${commit[0]}*${commit[1]}*${message[i]}`
        ciphers.push(cipher);
    }
    fs.writeFileSync(`./commit/commit.json`, JSON.stringify(ciphers, null, 2))
    console.log(`全部承诺生成完毕`)
}
// genCommit(message)
function verCommit( i, other) {
    var ciphers = JSON.parse(fs.readFileSync(`./commit/commit.json`));
    var cipher = ciphers[i];
    var parts = cipher.split('*'); // 假设数据格式是 "commit*commit*message"
    var commit = [parts[0], parts[1]];
    var message = typeof other !== 'undefined' ? other :parts[2];
    var result = pederson.verify(message, [commit], secret);
    // console.log(`${result}`)
    return result;
}

module.exports = {genCommit, verCommit}