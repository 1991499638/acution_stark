const { Web3 } = require('web3');
const fs = require('fs')
const commit = require('./commit')
const proof = require('./proof')
// Connect to the Ethereum network using the HTTP provider
const ganacheUrl = 'http://127.0.0.1:7545';
const httpProvider = new Web3.providers.HttpProvider(ganacheUrl);
const web3 = new Web3(httpProvider);
web3.eth.Contract.handleRevert = true;

var bin = fs.readFileSync("./contract/BinTest.txt", "utf8")
var abi = JSON.parse(fs.readFileSync("./contract/ABITest.txt", "utf8"))

//合约的一些参数
var product_description = "0x5a64c5a9743a4d7b346c55d4250716bba6c27a19d3785e5f7641b9c1d7b4d7f7"; 
var technical_specification = "0x5a64c5a9743a4d7b346c55d4250716bba6c27a19d3785e5f7641b9c1d7b4d7f7";              
var maxBiddersCount = 100;
var fairnessFees = 1;  // ETH
var testing = true;

// 调用合约涉及的一些参数
var Accounts;
var defaultAccount;

// 生成cipher时需要的一些参数
function genCiphers(count) {
    var message = [];
    for (let i = 0; i < count; i++) {
        var randomNum = (Math.random() * 100).toFixed(0);
        message[i] = randomNum;
    }
    commit.genCommit(message);
}
// commit.genCommit(message)
// commit.verCommit(3)

async function main() {
    Accounts = await web3.eth.getAccounts();
    defaultAccount = Accounts[0];
    // 解锁所有账户，为了方便实验中所有账户的密码均设为666666
    // for (let i = 0; i < Accounts.length; i++) {
    //     await web3.eth.personal.unlockAccount(Accounts[i], "666666", 600).then(console.log(`Account${i} unlocked!`))
    //     // camera range budget urban web virtual stomach second boat permit position axis
    // }
    
    
    await Deploy();
    await interact();
}

async function Deploy() {
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
            console.log(`合约部署成功，地址: ${tx.options.address}\n`);
            // Write the Contract address to a new file
            fs.writeFileSync('MyContractAddress.bin', tx.options.address);
        } catch (error) {
            console.error(error);
        }
    } catch (error) {
        console.error('合约部署失败:', error);
    }
}

async function interact() {
    // console.log('holle')

    const deployedAddress = fs.readFileSync('MyContractAddress.bin', 'utf8');
    const MyContract = new web3.eth.Contract(abi, deployedAddress);

    // 开始投标
    console.log(`开始投标`)
    async function startBid() {
        try {
            console.log(`总共${Accounts.length}个账户`)
            genCiphers(Accounts.length - 1); // auctioneer不参与投标
            var ciphers = JSON.parse(fs.readFileSync(`./commit/commit.json`));

            for (let i = 1; i < Accounts.length; i++) {
                const receipt = await MyContract.methods.Bid(ciphers[i - 1], commit.verCommit(i - 1)).send({
                    from: Accounts[i],
                    gas: 1000000,
                    gasPrice: 10000000000,
                    value: web3.utils.toWei(fairnessFees, 'finney'),
                });
                console.log(`Account[${i}]投标成功，消耗gas：${receipt.gasUsed}`)
            }
            console.log(`投标结束\n`)
        } catch (error) {
            console.error(`投标失败\n${error}`)
        }
    }


    // 决出获胜者
    var bids = [];
    var max_bid;
    var index;
    async function ClaimWinner() {

        console.log(`开始决出胜者`)
        try {
            for (let i = 1; i < Accounts.length; i++) {
                const cipher = await MyContract.methods.getBid().call({from: Accounts[i]});
                var parts = cipher.split('*');
                bids[i - 1] = parseInt(parts[2]);
                // console.log(`${parts[2]}`)
            }
            max_bid = bids[0];
            index = 1;
            for (let i = 1; i < bids.length; i++) {
                if (max_bid < bids[i]){
                    max_bid = bids[i];
                    index = i;
                }
            }
            console.log(`胜者：index: ${index}  max_bid: ${max_bid}`)
            const cipher = await MyContract.methods.getBid().call({from: Accounts[index]});
            await MyContract.methods.ClaimWinner(Accounts[index + 1], max_bid, commit.verCommit(index, cipher)).call({from: defaultAccount})
            console.log(`获胜者已决出\n`)
        } catch (error) {
            console.error(`决出获胜者失败\n${error}`)
        }
    }

    // 生成证明
    async function genProofs() {
        console.log(`开始生成证明`)
        try {
            proof.genProofAll(max_bid, bids)
            console.log(`证明生成完毕`)
            
        } catch (error) {
            console.error(`证明生成失败\n${error}`)
        }
        
    }

    await startBid();
    await ClaimWinner();
    await genProofs();
    // try {
    //     // 获取来自合约的常量信息
    //     const total_bidders = await MyContract.methods.total_bidders().call();
    //     console.log('my number value: ' + total_bidders);

    //     // Increment my number
    //     const receipt = await MyContract.methods.Bid("1844362da5fb73b13959ccfaae0b9fda8ac69319*d3e310e8b7213979a90b2e432a17858d527d1b10*45",true).send({
    //         from: Accounts[1],
    //         gas: 1000000,
    //         gasPrice: 10000000000,
    //         value: web3.utils.toWei('1', 'ether'),
    //     });
    //     console.log('Transaction Hash: ' + typeof receipt);
    //     // console.dir(receipt);

    //     // Get the updated value of my number
    //     const myNumberUpdated = await MyContract.methods.total_bidders().call();
    //     console.log('my number updated value: ' + myNumberUpdated);
    // } catch (error) {
    //     console.error(error);
    // }
}

main();



