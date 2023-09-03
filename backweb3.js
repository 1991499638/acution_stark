const { Web3 } = require('web3');
const fs = require('fs')

// Connect to the Ethereum network using the HTTP provider
const ganacheUrl = 'http://127.0.0.1:8545';
const httpProvider = new Web3.providers.HttpProvider(ganacheUrl);
const web3 = new Web3(httpProvider);
web3.eth.Contract.handleRevert = true;

var bin = fs.readFileSync("./contract/BinTest.txt", "utf8")
var abi = JSON.parse(fs.readFileSync("./contract/ABITest.txt", "utf8"))

async function main() {
    const accounts = (await web3.eth.personal.getAccounts());
    await web3.eth.personal.unlockAccount(accounts[0], "666666", 600).then(console.log('Account0 unlocked!'))
    await web3.eth.personal.unlockAccount(accounts[1], "666666", 600).then(console.log('Account1 unlocked!'))
    
    await Deploy();
    await interact();
}

async function Deploy() {
    try {
        // Get the list of accounts in the connected node (e.g., Ganache)
        const providersAccounts = await web3.eth.getAccounts();
        const defaultAccount = providersAccounts[0];

        // console.dir(abi)
        // console.log(bin)
        const parameter = ["0x5a64c5a9743a4d7b346c55d4250716bba6c27a19d3785e5f7641b9c1d7b4d7f7", "0x5a64c5a9743a4d7b346c55d4250716bba6c27a19d3785e5f7641b9c1d7b4d7f7", "100", "1", true];
        const MyContract = new web3.eth.Contract(abi);
        // console.dir(MyContract)
        const myContract = MyContract.deploy({
            data: `0x${bin}`,
            arguments: parameter,
        });
        const gas = await myContract.estimateGas({
            from: defaultAccount,
        });
        console.log('estimated gas:', gas);
        try {
            // Deploy the contract to the Ganache network
            const tx = await myContract.send({
                from: defaultAccount,
                gas,
                gasPrice: 10000000000,
            });
            console.log('Contract deployed at address: ' + tx.options.address);
            // Write the Contract address to a new file
            fs.writeFileSync('MyContractAddress.bin', tx.options.address);
        } catch (error) {
            console.error(error);
        }
    } catch (error) {
        console.error('An error occurred:', error);
    }
}

async function interact() {
    // console.log('holle')
    const providersAccounts = await web3.eth.getAccounts();
    const defaultAccount = providersAccounts[0];
    const deployedAddress = fs.readFileSync('MyContractAddress.bin', 'utf8');
    const MyContract = new web3.eth.Contract(abi, deployedAddress);

    try {
        // Get the current value of my number
        const myNumber = await MyContract.methods.total_bidders().call();
        console.log('my number value: ' + myNumber);

        // Increment my number
        const receipt = await MyContract.methods.Bid("0xfffe0102030405060708fffe0102030405060708fffe",true).send({
            from: providersAccounts[1],
            gas: 1000000,
            gasPrice: 10000000000,
            value: web3.utils.toWei('1', 'ether'),
        });
        console.log('Transaction Hash: ' + typeof receipt);
        // console.dir(receipt);

        // Get the updated value of my number
        const myNumberUpdated = await MyContract.methods.total_bidders().call();
        console.log('my number updated value: ' + myNumberUpdated);
    } catch (error) {
        console.error(error);
    }
}

main();



