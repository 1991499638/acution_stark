var {Web3} = require('web3');
var url = 'http://loaclhost:8545'
var web3 = new Web3(new Web3.providers.HttpProvider(url));
web3.setProvider('ws://localhost:8546');
const account = "0x2615b77264aCE0E06d7C3Cfb6671605E37250616";
web3.eth.getBalance(account, (err, wei) => {
        balance = web3.utils.fromWei(wei, 'ether')
        console.log(`${balance}`)
    })
console.log(`${web3.version}`)