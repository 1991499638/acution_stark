var Pedersen = require("./pedersen/main")
// p and q
const pederson = new Pedersen(
    '925f15d93a513b441a78826069b4580e3ee37fc5',
    '959144013c88c9782d5edd2d12f54885aa4ba687'
)

// const secret = pederson.newSecret()
// if (secret.length !== 40) {
//     throw 'generated invalid key'
// } else {
//     console.log(secret)
// }
var secret = '1377d1a4a09c2b36b30f3a68dc949ea0bda92fd7'
var massage = '7650'
var testA = pederson.commit(massage, secret, 'e93c58e6f7f3f4b6f6f0e55f3a4191b87d58b7b1')
console.dir(testA)
console.log(`${typeof testA}`)
// const assertionA = [ '4b7680d6262cea707175d55e862a09ba71b55655', 'e93c58e6f7f3f4b6f6f0e55f3a4191b87d58b7b1' ]
// if (testA.toString() !== assertionA.toString()) {
//     throw 'arbitrary signature test 1 failed'
// }
var result = pederson.verify(massage, [testA], secret);
console.log(`${result}`)