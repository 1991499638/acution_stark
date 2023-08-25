"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-target: ES2020
var genstark_1 = require("@guildofweavers/genstark");
var fs = require('fs');
// define a STARK for this computation
var fooStark = (0, genstark_1.instantiateScript)(Buffer.from("\ndefine Foo over prime field (2^32 - 3 * 2^25 + 1) {\n\n    secret input startValue: element[1];\n\n    // define transition function\n    transition 1 register {\n        for each (startValue) {\n            init { yield startValue; }\n            for steps [1..63] { yield $r0 + 2; }\n        }\n    }\n\n    // define transition constraints\n    enforce 1 constraint {\n        for all steps { enforce transition($r) = $n; }\n    }\n}"));
// create a proof that if we start computation at 1, we end up at 127 after 64 steps

var assertions = 
    [
        { register: 0, step: 0, value: 1n },
        { register: 0, step: 63, value: 127n } // value at last step is 127
    ];
console.log("\n" + typeof assertions[0].register + "  " + typeof assertions[0].step + "  " + typeof assertions[0].value + "\n")

// 自定义序列化函数，处理 BigInt
function BigIntToString(key, value) {
    if (typeof value === 'bigint') {
        return value.toString() + 'n'; // 将 BigInt 转换为字符串格式
    } else if(typeof value === 'object') {
        BigIntToString(value)
    }
    return value;
}

function StringToBigint(key, value) {
    if (typeof value === 'string' && value.endsWith('n')) {
        return BigInt(value.slice(0, -1)); // 去除 'n' 后缀并将字符串转换为 BigInt
    } else if(typeof value === 'object' && value.type === 'undefined') {
        StringToBigint(value)
    } else if(typeof value === 'object' && value.type === 'Buffer') {  //Buffer 反序列化
        return Buffer.from(value.data)
    } 
    return value;
}

//Assertions序列化测试
var serializedAssertions = JSON.stringify(assertions, BigIntToString, 2); // 第三个参数是缩进空格数
fs.writeFileSync('assertions.json', serializedAssertions);
var readFileAssertions= fs.readFileSync('assertions.json', 'utf-8');
var parsedAssertions = JSON.parse(readFileAssertions, StringToBigint);
console.log(typeof serializedAssertions)
// console.log(typeof parsedAssertions[0].register)
console.log("\n" + typeof parsedAssertions[0].register + "  " + typeof parsedAssertions[0].step + "  " + typeof parsedAssertions[0].value + "\n")


//proof序列化测试
var proof = fooStark.prove(parsedAssertions, [[1n]]);
var serializedProof = JSON.stringify(proof, BigIntToString, 2); // 第三个参数是缩进空格数
fs.writeFileSync('proof.json', serializedProof);
var readFileProof= fs.readFileSync('proof.json', 'utf-8');
var parsedProof = JSON.parse(readFileProof, StringToBigint);

//
// function printObjectProperties(obj, prefix = '') {
//     for (const key in obj) {
//       if (obj.hasOwnProperty(key)) {
//         const value = obj[key];
//         const fullKey = prefix ? `${prefix}.${key}` : key;
  
//         if (typeof value === 'object') {
//           printObjectProperties(value, fullKey);
//         } else {
//             console.log(`\nname: ${fullKey}   typeof: ${typeof value}   value: ${value}`);
//         }
//       }
//     }
//   }
// printObjectProperties(proof.evRoot)
// verify that if we start at 1 and run the computation for 64 steps, we get 127


var result = fooStark.verify(parsedAssertions, parsedProof);
console.log(result); // true

console.dir(proof.evRoot)
console.log(`${typeof parsedProof.evRoot}`)
console.dir(parsedProof.evRoot)

console.log(`\n${typeof proof.evRoot}   ${typeof proof.evProof}   ${typeof proof.ldProof}   ${typeof proof.iShapes}
${typeof proof.evRoot.type}   ${typeof proof.evRoot.data}
${typeof proof.evProof.values[0].type}   ${typeof proof.evProof.values[0].data}
${typeof proof.ldProof.lcRoot}   ${typeof proof.ldProof.lcProof}\n`)
// console.log(printObjectProperties(assertions))
exports.modules = {assertions, serializedAssertions, parsedAssertions, proof}