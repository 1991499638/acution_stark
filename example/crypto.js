const crypto = require('crypto');

// 哈希加密示例
const hash = crypto.createHash('sha256');
hash.update('Hello, World!');
const hashedData = hash.digest('hex');
    console.log(`hash: ${hashedData}`)

// 生成 RSA 密钥对并进行加密示例
const NodeRSA = require('node-rsa');
    // 生成密钥对
// const key = new NodeRSA({b: 360});
// const publicKey = key.exportKey('public');
// var parts = publicKey.split('-----');
// console.log('公钥: '+parts[2])
// const privateKey = key.exportKey('private');

    // 本例公私钥
// 公钥: 
// -----BEGIN PUBLIC KEY-----
// MEkwDQYJKoZIhvcNAQEBBQADOAAwNQIuAM663sfXuONaQNWNgP4lhZRLfbF13+Bg
// nZ55pUhcWDDdHvxEwpH24ytm3o/TSwIDAQAB
// -----END PUBLIC KEY-----
// 私钥: 
// -----BEGIN RSA PRIVATE KEY-----
// MIHkAgEAAi4Azrrex9e441pA1Y2A/iWFlEt9sXXf4GCdnnmlSFxYMN0e/ETCkfbj
// K2bej9NLAgMBAAECLUmOtmxXNsM2vvD9i5NimHgesFevgHxUwv+qQPHOiORgtiOe
// sS7mb+Wh2whl6QIXD2IPjBltgy/bR4HgwhyuXQotZy2fvl8CFw1wVjCgke0Npbft
// AMIl3biIqgS727qVAhcM4e5rQZA44QceZ2I2rZZITJGhas/wuQIXCy4OdgvO+m/l
// EpsXi2ynBNKk5qVGCfUCFwaaA83r7fiJELfNty9Ca7rDkNa/I9Wd
// -----END RSA PRIVATE KEY-----
const publicKey = 
`-----BEGIN PUBLIC KEY-----
MEkwDQYJKoZIhvcNAQEBBQADOAAwNQIuAM663sfXuONaQNWNgP4lhZRLfbF13+Bg
nZ55pUhcWDDdHvxEwpH24ytm3o/TSwIDAQAB
-----END PUBLIC KEY-----`
const privateKey = 
`-----BEGIN RSA PRIVATE KEY-----
MIHkAgEAAi4Azrrex9e441pA1Y2A/iWFlEt9sXXf4GCdnnmlSFxYMN0e/ETCkfbj
K2bej9NLAgMBAAECLUmOtmxXNsM2vvD9i5NimHgesFevgHxUwv+qQPHOiORgtiOe
sS7mb+Wh2whl6QIXD2IPjBltgy/bR4HgwhyuXQotZy2fvl8CFw1wVjCgke0Npbft
AMIl3biIqgS727qVAhcM4e5rQZA44QceZ2I2rZZITJGhas/wuQIXCy4OdgvO+m/l
EpsXi2ynBNKk5qVGCfUCFwaaA83r7fiJELfNty9Ca7rDkNa/I9Wd
-----END RSA PRIVATE KEY-----`

// 公钥加密
const encrypt = new NodeRSA(publicKey);
const encryptedData = encrypt.encrypt(90, 'base64');
console.log('Encrypted Data:', encryptedData);

// 使用私钥解密
const decrypt = new NodeRSA(privateKey);
const decryptedData = decrypt.decrypt(encryptedData, 'utf8');
console.log('Decrypted Data:', decryptedData);