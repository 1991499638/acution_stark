const { Web3 } = require('web3');
const fs = require('fs')

// Connect to the Ethereum network using the HTTP provider
const ganacheUrl = 'http://127.0.0.1:8545';
const httpProvider = new Web3.providers.HttpProvider(ganacheUrl);
const web3 = new Web3(httpProvider);
async function main() {
    try {
        // Get the current block number from the network
        const currentBlockNumber = await web3.eth.getBlockNumber();
        console.log('Current block number:', currentBlockNumber);

        // Get the list of accounts in the connected node (e.g., Ganache)
        const accounts = (await web3.eth.personal.getAccounts());
        await web3.eth.personal.unlockAccount(accounts[0], "666666", 600).then(console.log('Account unlocked!'))
        await web3.eth.personal.unlockAccount(accounts[1], "666666", 600).then(console.log('Account unlocked!'))
        var bin = fs.readFileSync("./contract/BinTest.txt", "utf8")
        var abi = JSON.parse(fs.readFileSync("./contract/ABITest.txt", "utf8"))
        // console.dir(abi)
        // console.log(bin)
        const parameter = [1];
        const MyContract = new web3.eth.Contract(abi);
        const myContract = MyContract.deploy({
            data: `0x${bin}`,
            arguments: parameter,
        });
        const gas = await myContract.estimateGas({
            from: accounts[0],
        });
        console.log('estimated gas:', gas);

        console.log(`${typeof bin}\n${typeof abi}`)
        // await web3.eth.sendTransaction({
        //     from: accounts[0],
        //     gasPrice: "20000000000",
        //     gas: "21000",
        //     to: accounts[1],
        //     value: "1000000000000000000",
        //     data: ""
        // }, '666666').then(console.log);
    } catch (error) {
        console.error('An error occurred:', error);
    }
}

main();

// async function deploy() {
//     const providersAccounts = await web3.eth.getAccounts();
//     const defaultAccount = providersAccounts[0];
//     console.log('deployer account:', defaultAccount);

//     const myContract = MyContract.deploy({
//         data: '0x' + bytecode,
//         arguments: [1],
//     });

//     // optionally, estimate the gas that will be used for development and log it
//     const gas = await myContract.estimateGas({
//         from: defaultAccount,
//     });
//     console.log('estimated gas:', gas);

//     try {
//         // Deploy the contract to the Ganache network
//         const tx = await myContract.send({
//             from: defaultAccount,
//             gas,
//             gasPrice: 10000000000,
//         });
//         console.log('Contract deployed at address: ' + tx.options.address);

//         // Write the Contract address to a new file
//         const deployedAddressPath = path.join(__dirname, 'MyContractAddress.bin');
//         fs.writeFileSync(deployedAddressPath, tx.options.address);
//     } catch (error) {
//         console.error(error);
//     }
// }

// deploy();