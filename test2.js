// 本脚本仅用于测试部分功能


const { Web3 } = require('web3'); //  web3.js has native ESM builds and (`import Web3 from 'web3'`)
const fs = require('fs');

// Set up a connection to the Ethereum network
const web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:7545'));
web3.eth.Contract.handleRevert = true;

// Read the bytecode from the file system
var bin = fs.readFileSync("./contract/BinTest.txt", "utf8")
var abi = JSON.parse(fs.readFileSync("./contract/ABITest.txt", "utf8"))
// Create a new contract object using the ABI and bytecode

var product_description = "0x5a64c5a9743a4d7b346c55d4250716bba6c27a19d3785e5f7641b9c1d7b4d7f7"; 
var technical_specification = "0x5a64c5a9743a4d7b346c55d4250716bba6c27a19d3785e5f7641b9c1d7b4d7f7";              
var maxBiddersCount = 100;
var fairnessFees = 1;  // ETH
var testing = true;

async function Deploy() {
    const providersAccounts = await web3.eth.getAccounts();
    const defaultAccount = providersAccounts[0];
    console.log('deployer account:', defaultAccount);

    try {
        const parameter = [product_description, technical_specification, maxBiddersCount, fairnessFees, testing];
        const MyContract = new web3.eth.Contract(abi);
        // console.dir(MyContract)
        const myContract = MyContract.deploy({
            data: `0x${bin}`,
            arguments: parameter,
        });
        const gas = await myContract.estimateGas({
            from: defaultAccount,
        });
        console.log('预估gas:', gas);
        try {
            // Deploy the contract to the Ganache network
            const tx = await myContract.send({
                from: defaultAccount,
                gas,
                gasPrice: 10000000000,
            });
            console.log('合约部署地址: ' + tx.options.address);
            // Write the Contract address to a new file
            fs.writeFileSync('MyContractAddress.bin', tx.options.address);
        } catch (error) {
            console.error(error);
        }
    } catch (error) {
        console.error('合约部署失败:', error);
    }
}

Deploy();