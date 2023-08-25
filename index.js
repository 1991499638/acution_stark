"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var genstark_1 = require("@guildofweavers/genstark");
const f = (2 ** 32) - (3 * (2 ** 25)) + 1;
var max = [6, 7];
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
var fooStark = genFooStark(0);
// create a proof that if we start computation at 1, we end up at 127 after 64 steps
// var start = 10n;
var startpa = Date.now()
console.log(`开始生成证明\n`)
var proofArray = [];

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
var gtime = [];
function genProof(assertions, input) {
    var start = Date.now()
    var proof = fooStark.prove(assertions, [[BigInt(input)]]);
    return [proof, Date.now() - start];
}
//function to verify a proof
var vtime = [];
function verProof(assertions, proof) {
    var result = fooStark.verify(assertions, proof);
    return [result, Date.now() - start];
}

for (let i = 0; i < bids.length; i++) {
    var assertions = [
        { register: 0, step: 0, value: BigInt(bids[i]) },
        { register: 0, step: 1, value: BigInt(max[0] - bids[i]) }// value at last step is 127
    ];
    var start = Date.now()
    console.log(`第${i+1}位投标者\nbid:${bids[i]}\n开始生成第${i+1}份证明`)
    var proof = fooStark.prove(assertions, [[BigInt(bids[i])]]);
    console.log(`生成第${i+1}份证明耗时: ${Date.now() - start} ms\n\n`)
    proofArray[i] = proof;
}
console.log(`生成证明总耗时: ${Date.now() - startpa} ms\n\n`)
// console.log(`${proofArray.length}\n${typeof proofArray[0]}`)
// verify that if we start at 1 and run the computation for 64 steps, we get 127
console.log(`开始验证\n`)
var startva = Date.now()
for (let i = 0; i < bids.length; i++) {
    var assertions = [
        { register: 0, step: 0, value: BigInt(bids[i]) },
        { register: 0, step: 1, value: BigInt(max[0] - bids[i]) }// value at last step is 127
    ];
    var start = Date.now()
    console.log(`开始验证第${i+1}份证明`)
    var result = fooStark.verify(assertions, proofArray[i]);
    console.log(`验证第${i+1}份证明: ${result}\n耗时: ${Date.now() - start} ms\n\n`)
}
console.log(`验证证明总耗时: ${Date.now() - startva} ms`)
console.log(result); // true
