var Pedersen = require("./pedersen/main")
var fs = require("fs")
var crypto = require('crypto');
var NodeRSA = require('node-rsa');
require('dotenv').config();

// p and q, the p is a large prime number, the q is a generator
// 20 bytes
const pederson = new Pedersen(
    '925f15d93a513b441a78826069b4580e3ee37fc5',
    '959144013c88c9782d5edd2d12f54885aa4ba687'
)

var secret = '763cff582aab107fa0c48ecdd17bedc74e771c22'
// var message = ['7650','760','750','765','650',]
const publicKey = 
`-----BEGIN PUBLIC KEY-----
MEkwDQYJKoZIhvcNAQEBBQADOAAwNQIuAM663sfXuONaQNWNgP4lhZRLfbF13+Bg
nZ55pUhcWDDdHvxEwpH24ytm3o/TSwIDAQAB
-----END PUBLIC KEY-----`
const privateKey = process.env.PRIVATE_KEY
const encrypt = new NodeRSA(publicKey);
const decrypt = new NodeRSA(privateKey);
// // 公钥加密
// const encrypt = new NodeRSA(publicKey);
// const encryptedData = encrypt.encrypt(90, 'base64');
// console.log('Encrypted Data:', encryptedData);

// // 使用私钥解密
// const decrypt = new NodeRSA(privateKey);
// const decryptedData = decrypt.decrypt(encryptedData, 'utf8');
// console.log('Decrypted Data:', decryptedData);

//generate all commit
function genCommit(message) {
    var ciphers = [];
    for (let i = 0; i < message.length; i++) {
        var r = crypto.randomBytes(20).toString('hex');
        var commit = pederson.commit(message[i], secret, r);
        var encryptedBid = encrypt.encrypt(message[i], 'base64');
        var cipher = `${commit[0]}*${commit[1]}*${encryptedBid}`
        ciphers.push(cipher);
    }
    fs.writeFileSync(`./commit/commit.json`, JSON.stringify(ciphers, null, 2))
    console.log(`全部承诺生成完毕`)
}
// genCommit(message)
function verCommit( i, newCipher, other = undefined) {
    var ciphers = JSON.parse(fs.readFileSync(`./commit/commit.json`));
    var cipher = typeof newCipher !== 'undefined' ? newCipher : ciphers[i];
    var parts = cipher.split('*'); // 假设数据格式是 "commit*commit*message"
    var commit = [parts[0], parts[1]];
    var Bid = typeof other !== 'undefined' ? other :parts[2];
    var message = decrypt.decrypt(Bid, 'utf8');
    var result = pederson.verify(message, [commit], secret);
    // console.log(`${result}`)
    return result;
}

function verifyCipher(cipher) {
    var parts = cipher.split('*'); // 假设数据格式是 "commit*commit*message"
    var commit = [parts[0], parts[1]];
    var Bid = parts[2];
    var message = decrypt.decrypt(Bid, 'utf8');
    var result = pederson.verify(message, [commit], secret);
    return result;
}

function decryptBid(_bid) {
    return decrypt.decrypt(_bid, 'utf8');
}

function getCommit(i) {
    var ciphers = JSON.parse(fs.readFileSync(`./commit/commit.json`));
    return ciphers[i]
}
module.exports = {genCommit, verCommit, verifyCipher, decryptBid, getCommit}