"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var genstark_1 = require("@guildofweavers/genstark");
const fs = require("fs");
const f = (2 ** 32) - (3 * (2 ** 25)) + 1;

// 定义不同复杂度的计算任务
function genFooStark(steps) {
    return (0, genstark_1.instantiateScript)(Buffer.from(`
    define Foo over prime field (${f.toString()}) {

    secret input startValue: element[1];

    // define transition function
    transition 1 register {
        for each (startValue) {
            init { yield startValue; }
            for steps [1..${steps}] { yield $r0 + 1; }
        }
    }

    // define transition constraints
    enforce 1 constraint {
        for all steps { enforce transition($r) = $n; }
    }
}`));
}

// function to design assertions
function desAssertions(t0, steps) {
    var t1 = (t0 + steps) % f;
    var assertions = [
        { register: 0, step: 0, value: BigInt(t0) },
        { register: 0, step: steps, value: BigInt(t1) }
    ];
    return assertions;
}

// function to generate a proof
function genProof(fooStark, assertions, input) {
    var start = Date.now();
    var proof;
    try {
        proof = fooStark.prove(assertions, [[BigInt(input)]]);
    } catch (error) {
        console.error(`Error generating proof: ${error.message}`);
        console.error(error.stack);
        console.error(`Assertions: ${JSON.stringify(assertions)}`);
        throw error;
    }
    return [proof, Date.now() - start];
}

// function to verify a proof
function verProof(fooStark, assertions, proof) {
    var start = Date.now();
    var result = fooStark.verify(assertions, proof);
    return [result, Date.now() - start];
}

// function to test scalability
function testScalability() {
    const startValue = 1;
    const gateCounts = [63, 127, 255, 511, 1023, 2047, 4095, 8191];  // More gate counts to test scalability (2^n - 1)
    const repetitions = 5;  // Number of repetitions for each test
    let results = [];

    gateCounts.forEach(steps => {
        // Initialize fooStark for the current steps
        const fooStark = genFooStark(steps);

        let totalGenTime = 0;
        let totalVerTime = 0;
        let proof;

        // Repeat the test for a specified number of times
        for (let i = 0; i < repetitions; i++) {
            try {
                const assertions = desAssertions(startValue, steps);
                let genTime;
                [proof, genTime] = genProof(fooStark, assertions, startValue);
                totalGenTime += genTime;
            } catch (error) {
                totalGenTime = 'Error generating';
                break;
            }

            try {
                const assertions = desAssertions(startValue, steps);
                let verTime;
                const [result, verDuration] = verProof(fooStark, assertions, proof);
                totalVerTime += verDuration;
            } catch (error) {
                totalVerTime = 'Error verifying';
                break;
            }
        }

        const result = {
            gateCount: steps,
            genTime: totalGenTime / repetitions,
            verTime: totalVerTime / repetitions
        };

        results.push(result);
        console.log(result);
    });

    fs.writeFileSync("results.json", JSON.stringify(results, null, 2));
    console.log("Scalability Test Results saved to results.json");
}

testScalability();

module.exports = {genProof, verProof};
