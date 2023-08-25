function genProof() {
    var start = Date.now()
    var proof = 3;
    return [proof, Date.now() - start];
}
console.log(`${genProof()[1]}`)