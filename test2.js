"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var genstark_1 = require("@guildofweavers/genstark");
var fs = require("fs");
const f = (2 ** 32) - (3 * (2 ** 25)) + 1;
var bids = [1, 2, 3, 4, 5, 6]; 

// define a STARK for this computation
function genFooStark(max) {
    var fooStark = (0, genstark_1.instantiateScript)(Buffer.from(`
    define Foo over prime field (${f.toString()}) {

    secret input startValue: element[1];

    // define transition function
    transition 1 register {
        for each (startValue) {
            init { yield startValue; }
            for steps [1..127] { yield ${max} - $r0 ; }
        }
    }

    // define transition constraints
    enforce 1 constraint {
        for all steps { enforce transition($r) = $n; }
    }
}`));
    return fooStark;
}
var fooStark;
// create a proof that if we start computation at 1, we end up at 127 after 64 steps

//function to design a assertions
// t0 = bids[i], t1 = max - bids[i]
function desAssertions(t0, t1) {
    var assertions = [
        { register: 0, step: 0, value: BigInt(t0) },
        { register: 0, step: 1, value: BigInt(t1) }
    ];
    return assertions;
}

//function to generated a proof
function genProof(assertions, input) {
    var start = Date.now()
    var proof = fooStark.prove(assertions, [[BigInt(input)]]);
    return [proof, Date.now() - start];
}
//function to verify a proof
function verProof(assertions, proof) {
    var start = Date.now()
    var result = fooStark.verify(assertions, proof);
    return [result, Date.now() - start];
}

var proofArray = []
var ProofArray = []
function genProofAny(max, bid) {
    fooStark = genFooStark(max);
        var assertions = desAssertions(bid, max - bid);
        var proof = genProof(assertions, bid);

        var buf = fooStark.serialize(proof[0]);
            var proofTest = fooStark.parse(buf)
            var result = verProof(assertions, proofTest)
            console.log(`验证: ${result[0]}`)
                console.log(`${proofTest == proof[0]}   ${fooStark.sizeOf(proof[0])}  ${fooStark.sizeOf(proofTest)}`)
        var bufString = buf.toString('hex');
        var fileBufString = Buffer.from(bufString, 'hex')
        console.log(`${buf.length}    ${fileBufString.length}`)
        console.log(`${typeof fileBufString}   ${typeof buf}  ${Buffer.compare(fileBufString, buf)}`)
        var proofTruth = fooStark.parse(fileBufString)
        var verifyResult = verProof(assertions, proofTruth)
        console.log(`验证: ${verifyResult[0]}`)
        // fs.writeFileSync(`proof/Buffer${i}.json`, Buf.toString());
        // var fileBuf = fs.readFileSync(`proof/buf${i}.json`);
        // console.log(fileBuf.length === fooStark.sizeOf(buf));
}

// function to generated all proof
function genProofAll(max, bids) {
    fooStark = genFooStark(max);
    for (let i = 0; i < bids.length; i++) {
        var assertions = desAssertions(bids[i], max - bids[i]);
        var proof = genProof(assertions, bids[i]);
        // Serialize the proof and write into file
        // var Buf = proof[0];
        var buf = fooStark.serialize(proof[0]);
        proofArray[i] = buf
        // ProofArray[i] = proof[0]
        // console.dir(proof[0])
        // console.log(`0x${buf.toString('hex')}`)
        fs.writeFileSync(`proof/buf${i}.json`, buf.toString('hex'));
        var fileBuf = fs.readFileSync(`proof/buf${i}.json`);
        console.log(fileBuf == buf)
        // fs.writeFileSync(`proof/Buffer${i}.json`, Buf.toString());
        // var fileBuf = fs.readFileSync(`proof/buf${i}.json`);
        // console.log(fileBuf.length === fooStark.sizeOf(buf));
    }
}

//function to verify proof
function verAnyProof(i, max, bids) {
    fooStark = genFooStark(max);
    var assertions = desAssertions(bids, max - bids);
    // console.log(`开始验证`)
    // Read proof from file and Deserialize the proof 
    var fileBuf = fs.readFileSync(`proof/buf${i}.json`);
    var FileBuf = fs.readFileSync(`proof/Buf${i}.json`);
    console.log(`${typeof fileBuf}`)
    // var parsedProof = fooStark.parse(Buffer.from(fileBuf.slice(2), 'hex'));
    console.log(`${proofArray[0] == Buffer.from(fileBuf, 'hex')}`)
    console.log(`${ProofArray[0] == Buffer.from(FileBuf, 'hex')}`)
    // var result = verProof(assertions, parsedProof);
    // console.log(`  账户${i}验证结果：${result[0]}   耗时：${result[1]} ms`)
}

function test() {
    console.log(`开始检查投标`)
    var start = Date.now();
    genProofAny(6, bids[0]);
    // console.log(`生成证明总耗时：${Date.now() - start}`);
    // console.log(`验证第0份证明`)
    // verAnyProof(0, 6, 1);
}
test();
// console.log(`测试完毕\n`)
// console.log(`${verAnyProof(0, 99, 62)}`);

// Serialize the proof
// console.log('序列化证明');
// let start = Date.now();
// const buf = fooStark.serialize(proof);
// fs.writeFileSync('buf.json', buf);
// const fileBuf = fs.readFileSync('buf.json');
// assert(fileBuf.length === fooStark.sizeOf(proof));
// console.log(`Proof serialized in ${Date.now() - start} ms; size: ${Math.round(fileBuf.byteLength / 1024 * 100) / 100} KB`);
// console.log('-'.repeat(20));

// // Deserialize the proof
// console.log('反序列化证明');
// start = Date.now();
// const parsedProof = fooStark.parse(buf);
// console.log(`Proof parsed in ${Date.now() - start} ms`);
// console.log('-'.repeat(20));
