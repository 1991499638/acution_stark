const { Web3 } = require('web3');
const fs = require('fs')
const os = require('os');

const commit = require('./commit')
const proof = require('./proof')
// Connect to the Ethereum network using the HTTP provider
const ganacheUrl = 'http://127.0.0.1:7545';
const httpProvider = new Web3.providers.HttpProvider(ganacheUrl);
const web3 = new Web3(httpProvider);
web3.eth.Contract.handleRevert = true;

var bin = fs.readFileSync("./contract/BinNew.txt", "utf8")
var abi = JSON.parse(fs.readFileSync("./contract/ABINew.txt", "utf8"))

//合约的一些参数
var init = 10;
var submit = 100;
var verify = 10;
var winner_pay = 10;
var destroy = 10;
var product_description = "0x5a64c5a9743a4d7b346c55d4250716bba6c27a19d3785e5f7641b9c1d7b4d7f7";
var technical_specification = "0x5a64c5a9743a4d7b346c55d4250716bba6c27a19d3785e5f7641b9c1d7b4d7f7";
var maxBiddersCount = 100;
var fairnessFees = 1;  // ETH
var testing = true;

// 调用合约涉及的一些参数
var totalAccounts;
var Accounts;
var defaultAccount;

// 生成cipher时需要的一些参数
function genCiphers(count) {
    var message = [];
    for (let i = 0; i < count; i++) {
        var randomNum = Math.floor(Math.random() * 99) + 1;
        message[i] = randomNum;
    }
    commit.genCommit(message);
}

var gasDeploy = BigInt(0);
var timeDeploy = 0;
async function main() {
    totalAccounts = await web3.eth.getAccounts();
    Accounts = totalAccounts.slice(0, 10);
    defaultAccount = Accounts[0];
    // 解锁所有账户，为了方便实验中所有账户的密码均设为666666
    // for (let i = 0; i < Accounts.length; i++) {
    //     await web3.eth.personal.unlockAccount(Accounts[i], "666666", 600).then(console.log(`Account${i} unlocked!`))
    //     // camera range budget urban web virtual stomach second boat permit position axis
    // }

    var start = Date.now();
    gasDeploy = await Deploy();
    timeDeploy = Date.now() - start;
    console.log(`部署合约耗时：${Date.now() - start} ms\n`)
    await interact();
    console.log(`拍卖总耗时：${Date.now() - start} ms`)
}


async function Deploy() {
    var gas = BigInt(0);
    try {
        const parameter = [init, submit, verify, winner_pay, destroy, product_description, technical_specification, maxBiddersCount, fairnessFees, testing];
        const MyContract = new web3.eth.Contract(abi);
        // console.dir(MyContract)
        const myContract = MyContract.deploy({
            data: `0x${bin}`,
            arguments: parameter,
        });
        gas = await myContract.estimateGas({
            from: defaultAccount,
        });
        // console.log('预估gas:', gas);
        try {
            // Deploy the contract to the Ganache network
            const tx = await myContract.send({
                from: defaultAccount,
                gas,
                gasPrice: 10000000000,
            });
            console.log(`合约部署成功，地址: ${tx.options.address}`);
            // Write the Contract address to a new file
            fs.writeFileSync('MyContractAddress.bin', tx.options.address);
        } catch (error) {
            console.error(error);
        }
    } catch (error) {
        console.error('合约部署失败:', error);
    }
    return gas;
}

async function interact() {

    const deployedAddress = fs.readFileSync('MyContractAddress.bin', 'utf8');
    const MyContract = new web3.eth.Contract(abi, deployedAddress);

    async function test() {
        // 开始投标
        var BlockNumber = [];
        var gas = [];
        var time = [];
        var i = 0;
        var j = 0;
        BlockNumber[i++] = await web3.eth.getBlockNumber();
        var start = Date.now();
        gas[j++] = await startBid();
        time[j-1] = Date.now() - start;
        console.log(`投标耗时：${Date.now() - start} ms`);
        console.log('====================================\n\n');

        // 决出获胜者
        BlockNumber[i++] = await web3.eth.getBlockNumber();
        start = Date.now();
        gas[j++] = await ClaimWinner();
        time[j-1] = Date.now() - start;
        console.log(`决出获胜者耗时：${Date.now() - start} ms`);
        console.log('====================================\n\n');

        // 生成证明
        BlockNumber[i++] = await web3.eth.getBlockNumber();
        start = Date.now();
        gas[j++] = await genProofs();
        time[j-1] = Date.now() - start;
        console.log(`生成证明耗时：${Date.now() - start} ms`);
        console.log('====================================\n\n');

        // 揭示投标
        BlockNumber[i++] = await web3.eth.getBlockNumber();
        start = Date.now();
        gas[j++] = await RevealAndVerify();
        time[j-1] = Date.now() - start;
        console.log(`揭示投标耗时：${Date.now() - start} ms`);
        console.log('====================================\n\n');

        // 验证
        BlockNumber[i++] = await web3.eth.getBlockNumber();
        start = Date.now();
        gas[j++] = await verifyWinnerBid();
        time[j-1] = Date.now() - start;
        console.log(`验证投标耗时：${Date.now() - start} ms`);
        console.log('====================================\n\n');

        // 胜者支付出价
        BlockNumber[i++] = await web3.eth.getBlockNumber();
        start = Date.now();
        gas[j++] = await WinnerPay();
        time[j-1] = Date.now() - start;
        console.log(`胜利者支付投标耗时：${Date.now() - start} ms`);
        console.log('====================================\n\n');

        // // 退还押金
        BlockNumber[i++] = await web3.eth.getBlockNumber();
        start = Date.now();
        gas[j++] = await withdraw();
        time[j-1] = Date.now() - start;
        console.log(`取回押金耗时：${Date.now() - start} ms`);
        console.log('====================================\n\n');

        // 摧毁合约
        BlockNumber[i++] = await web3.eth.getBlockNumber();
        start = Date.now();
        gas[j++] = await Destroy();
        time[j-1] = Date.now() - start;
        console.log(`摧毁合约耗时：${Date.now() - start} ms`);
        console.log('====================================\n\n');
        BlockNumber[i++] = await web3.eth.getBlockNumber();

        j = 0;
        function TotalGas(gas){
            gasTotal = BigInt(0);
            for (let i = 0; i < gas.length; i++) {
                gasTotal = gasTotal + gas[i];
            }
            return gasTotal;
        }
        function TotalTime(time){
            timeTotal = 0;
            for (let i = 0; i < time.length; i++) {
                timeTotal = timeTotal + time[i];
            }
            return timeTotal;
        }
    var i=0 , j=0
var data = `{
    "accounts": ${Accounts.length},
    "time":[
        {"deploy": ${timeDeploy}},
        {"bid": ${time[i++]}},
        {"claimWinner": ${time[i++]}},
        {"genProofs": ${time[i++]}},
        {"revealBid": ${time[i++]}},
        {"verifyWinnerBid": ${time[i++]}},
        {"winnerPay": ${time[i++]}},
        {"withdraw": ${time[i++]}},
        {"destroy": ${time[i++]}},
        {"totalTime": ${timeDeploy + TotalTime(time)}}
    ],
    "gas":[
        {"deploy": ${gasDeploy}},
        {"bid": ${gas[j++]}},
        {"claimWinner": ${gas[j++]}},
        {"genProofs": ${gas[j++]}},
        {"revealBid": ${gas[j++]}},
        {"verifyWinnerBid": ${gas[j++]}},
        {"winnerPay": ${gas[j++]}},
        {"withdraw": ${gas[j++]}},
        {"Destroy": ${gas[j++]}},
        {"totalGas": ${gasDeploy + TotalGas(gas)}}
    ]
},
`

console.log('====================================');
console.log('操作系统类型:', os.type());
console.log('CPU 架构:', os.arch());
console.log('主机名:', os.hostname());
console.log('====================================');
        try {
            fs.appendFileSync(`data/${Accounts.length}/${os.hostname()}_${Accounts.length}_${os.type()}_${os.arch()}.json`, data);
            console.log(`Data was appended to the file.`);
        } catch (err) {
            console.error('Error appending data to the file:', err);
        }
    }

    // 开始投标
    async function startBid() {
        console.log('====================================');
        console.log(`开始投标`)
        var gasTotal = BigInt(0);
        try {
            console.log(`总共${Accounts.length}个账户    ${Accounts.length-1}个投标者`)
            genCiphers(Accounts.length - 1); // auctioneer不参与投标

            for (let i = 1; i < Accounts.length; i++) {
                // var start = Date.now();
                const receipt = await MyContract.methods.Bid(commit.getCommit(i - 1), commit.verCommit(i - 1)).send({
                    from: Accounts[i],
                    gas: 1000000,
                    gasPrice: 10000000000,
                    value: web3.utils.toWei(fairnessFees, 'finney'),
                });
                gasTotal = gasTotal + receipt.gasUsed;
                // console.log(`    Account[${i}]投标成功    消耗gas：${receipt.gasUsed}    耗时：${Date.now() - start} ms`);// 177336
            }
            console.log(`投标结束    当前合约余额：${web3.utils.fromWei(await web3.eth.getBalance(deployedAddress), 'finney')} finney    总共消耗gas：${gasTotal}`)
        } catch (error) {
            console.error(`投标失败\n${error}`)
        }
        return gasTotal
    }


    // 决出获胜者
    var bids = [];
    var max_bid;
    var index;  //index+1是胜者序列
    var proofArray = [];
    async function ClaimWinner() {
        console.log('====================================');
        console.log(`开始决出胜者`)
        var gasTotal = BigInt(0);
        try {
            for (let i = 1; i < Accounts.length; i++) {
                // call 不消耗gas
                const Bid = await MyContract.methods.getBid().call({ from: Accounts[i] });
                var cipher = Bid[0];
                var proof = Bid[1];
                proofArray.push(proof)
                var parts = cipher.split('*');
                bids[i - 1] = parseInt(commit.decryptBid(parts[2])) ;
            }
            max_bid = bids[0];
            index = 1;
            for (let i = 1; i < bids.length; i++) {
                if (max_bid < bids[i]) {
                    max_bid = bids[i];
                    index = i;
                }
            }
            console.log(`    胜者：index: ${index+1}\n    max_bid: ${max_bid}`)
            const Bid = await MyContract.methods.getBid().call({ from: Accounts[index + 1] });
            var cipher = Bid[0];
            var proof = Bid[1];
            // console.log(`${Bid}`)
            var pVerify = commit.verCommit(index + 1, cipher);
            // console.log(`验证承诺：${pVerify}`)
            // Accounts[index + 1] 是胜者; send会改变合约状态 call表示只读
            var receipt = await MyContract.methods.ClaimWinner(Accounts[index + 1], bids[index], pVerify).send({ from: defaultAccount })
            gasTotal = receipt.gasUsed;
            console.log(`  获胜者已决出!\n    消耗gas：${receipt.gasUsed}`)
        } catch (error) {
            console.error(`决出获胜者失败\n${error}`)
        }
        return gasTotal;
    }

    // 生成证明
    async function genProofs() {
        console.log('====================================');
        console.log(`开始生成证明`)
        var gasTotal = BigInt(0);
        try {
            var proofCID = "0x5a64c5a9743a4d7b346c55d4250716bba6c27a19d3785e5f7641b9c1d7b4d7f7";  // CID
            proof.genProofAll(max_bid, bids)
            try {
                for (let i = 1; i < Accounts.length; i++) {
                    var receipt = await MyContract.methods.generateProof(proofCID).send({ from: Accounts[i] })
                    gasTotal = receipt.gasUsed;
                }
            } catch (error) {
                console.error(`生成证明失败！ ${error}`)
            }
            console.log(`    证明生成完毕`)

        } catch (error) {
            console.error(`证明生成失败\n${error}`)
        }
        return gasTotal;
    }

    // 揭示投标
    async function RevealAndVerify() {
        console.log('====================================');
        console.log(`开始揭示承诺`)
        var gasTotal = BigInt(0);
        try {
            const winner = await MyContract.methods.Reveal().call({ from: Accounts[0] });
            var winnerBid = winner[0];
            var winnerCipher = winner[1];
            var winnerProof = winner[2];
            console.log(`   出价：${winnerBid}\n    密文：${winnerCipher}\n    证明CID: ${winnerProof}`)
            console.log(`验证获胜者承诺：${commit.verifyCipher(winnerCipher)}`)
        } catch (error) {
            
        }
        return gasTotal;
    }

    // 开始验证
    async function verifyWinnerBid() {
        console.log('====================================');
        console.log(`开始验证胜利者投标`)
        var gasTotal = BigInt(0);
        try {
            // 这里直接一次验证所有证明
            var result = true;
            for (let i = 0; i < bids.length; i++) {
                resultProof = proof.verAnyProof(i, max_bid, bids[i]);
                try {
                    var receipt = await MyContract.methods.Verify(resultProof, commit.getCommit(i)).send({ from: Accounts[i+1] });
                    gasTotal = receipt.gasUsed;
                } catch (error) {
                    console.log(`账户${i+1}验证失败  ${error}`)
                }
                result = result && resultProof
                // console.log(`   账户${i}验证：${resultProof}`)
            }

            console.log(`验证完成, 投标整体验证为${result}`)
        } catch (error) {
            console.error(`验证获胜者投标失败：${error}`)
        }
        return gasTotal;
    }

    // 胜利者支付bid
    async function WinnerPay() {
        console.log('====================================');
        console.log(`胜利者开始支付投标`)
        var gasTotal = BigInt(0);
        // console.log(`${Accounts[index+1]}\n${await MyContract.methods.winning_bidder().call({from: defaultAccount})}`)
        // console.log(`${await MyContract.methods.winner_cipher().call({from: defaultAccount})}`)
        try {
            var receipt = await MyContract.methods.WinnerPay().send({
                from: Accounts[index + 1],
                gas: 1000000,
                gasPrice: 10000000000,
                value: web3.utils.toWei(max_bid - fairnessFees, 'finney'),
            });
            gasTotal = receipt.gasUsed;
            console.log(`当前合约余额：${web3.utils.fromWei(await web3.eth.getBalance(deployedAddress), 'finney')} finney    消耗gas: ${receipt.gasUsed}`)
        } catch (error) {
            console.error(`胜利者支付投标失败${error}`)
        }
        return gasTotal;
    }

    // 取回押金
    async function withdraw() {
        console.log('====================================');
        console.log(`开始取回押金`)
        // var time = await MyContract.methods.withdrawLock().call({from: Accounts[0]});
        // console.log(`时间：${time}`)
        var gasTotal = BigInt(0);

        try {
            for (let i = 1; i < Accounts.length; i++) {
                if (i != index + 1) {
                    // var start = Date.now();
                    var receipt = await MyContract.methods.Withdraw().send({ from: Accounts[i] });
                    gasTotal = gasTotal + receipt.gasUsed;
                    // console.log(`    账户${i}已取回押金    gas: ${receipt.gasUsed}    耗时：${Date.now() - start} ms`)
                }
            }
            console.log(`全部押金取回成功    当前合约余额：${web3.utils.fromWei(await web3.eth.getBalance(deployedAddress), 'finney')} finney    总共消耗gas: ${gasTotal}`)
        } catch (error) {
            console.error(`取回押金失败 ${error}`)
        }
        return gasTotal;
    }

    // 销毁合约
    async function Destroy() {
        console.log('====================================');
        console.log(`开始摧毁合约`)
        var gasTotal = BigInt(0);
        try {
            console.log(`当前合约余额：${web3.utils.fromWei(await web3.eth.getBalance(deployedAddress), 'finney')} finney\n当前拍卖商余额：${web3.utils.fromWei(await web3.eth.getBalance(defaultAccount), 'finney')} finney`)
            var receipt = await MyContract.methods.Destroy().send({ from: defaultAccount });
            gasTotal = receipt.gasUsed;
            console.log(`摧毁合约成功\n  当前拍卖商余额：${web3.utils.fromWei(await web3.eth.getBalance(defaultAccount), 'finney')} finney    消耗gas: ${receipt.gasUsed}`)
        } catch (error) {
            console.error(`摧毁合约失败:${error}`)
        }
        return gasTotal;
    }

    // var t1 = Date.now();
    await test();
    // console.log(`总耗时：${Date.now() - t1}`);
}
main();


