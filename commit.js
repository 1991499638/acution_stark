var Pedersen = require("./pedersen/main")
var fs = require("fs")
// p and q, the p is a large prime number, the q is a generator
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
var massage = ['7650','760','750','765','650',]
var r = [
    'e93c58e6f7f3f4b6f6f0e55f3a4191b87d58b7b1',
    'e93c58e6f7f3f4b6f6f0e55f3a4191b87d58b7b1',
    'e93c58e6f7f3f4b6f6f0e55f3a4191b87d58b7b1',
    'e93c58e6f7f3f4b6f6f0e55f3a4191b87d58b7b1',
    'e93c58e6f7f3f4b6f6f0e55f3a4191b87d58b7b1'
]
//generate all commit
function genCommit(massage, r) {
    for (let i = 0; i < massage.length; i++) {
        var commit = pederson.commit(massage[i], secret, r[i]);
        fs.writeFileSync(`./commit/commit${i}.json`, JSON.stringify(commit, null, 2))
    }
    console.log(`全部承诺生成完毕`)
}
// genCommit(massage, r)
function verCommit(massage, i) {
    var commit = JSON.parse(fs.readFileSync(`./commit/commit${i}.json`)) 
    console.log(`${typeof commit[0]}`)
    console.dir(commit)
    var result = pederson.verify(massage[i], [commit], secret);
    console.log(`${result}`)
}
verCommit(massage, 0)
// var testA = pederson.commit(massage, secret, r)
// console.dir(testA)
// console.log(`${typeof testA}`)
