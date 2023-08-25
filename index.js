"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var genstark_1 = require("@guildofweavers/genstark");
var fs = require("fs");
const f = (2 ** 32) - (3 * (2 ** 25)) + 1;
var max = [6, 7];  //the first is the last value of the bids field, the second is the max bid
var bids = [1, 2, 3, 4, 5, 6]; 

// define a STARK for this computation
function genFooStark(i) {
    var fooStark = (0, genstark_1.instantiateScript)(Buffer.from(`
    define Foo over prime field (${f.toString()}) {

    secret input startValue: element[1];

    // define transition function
    transition 1 register {
        for each (startValue) {
            init { yield startValue; }
            for steps [1..127] { yield ${max[i]} - $r0 ; }
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

//function to check any bid <= bid.last
function lastCheck() {
    fooStark = genFooStark(0);
    for (let i = 0; i < bids.length; i++) {
        var assertions = desAssertions(bids[i], max[0] - bids[i]);
        var proof = genProof(assertions, bids[i]);
        var result = verProof(assertions, proof[0]);
        console.log(`验证第${i+1}份证明: ${result[0]}\n`)
    }
}
//function to generated all proof
function genProofAll() {
    fooStark = genFooStark(1);
    for (let i = 0; i < bids.length; i++) {
        var assertions = desAssertions(bids[i], max[1] - bids[i]);
        var proof = genProof(assertions, bids[i]);
        // Serialize the proof and write into file
        var buf = fooStark.serialize(proof[0]);
        fs.writeFileSync(`proof/buf${i}.json`, buf);
    }
}

//function to verify proof
function verAnyProof(i) {
    fooStark = genFooStark(1);
    var assertions = desAssertions(bids[i], max[1] - bids[i]);
    console.log(`开始验证`)
    // Read proof from file and Deserialize the proof 
    var fileBuf = fs.readFileSync(`proof/buf${i}.json`);
    var parsedProof = fooStark.parse(fileBuf);
    var result = verProof(assertions, parsedProof);
    console.log(`验证结果：${result[0]}\n总耗时：${result[1]}`)
}

function test() {
    console.log(`开始检查投标\n`)
    var start = Date.now();
    lastCheck();
    console.log(`检查投标总耗时：${Date.now() - start}`);
    start = Date.now();
    genProofAll();
    console.log(`生成证明总耗时：${Date.now() - start}`);
    // console.log(`验证第3份证明`)
    // verAnyProof(3-1);
}
test();
console.log(`测试完毕\n`)

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
