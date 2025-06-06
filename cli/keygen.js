const nacl = require('tweetnacl');
const util = require('tweetnacl-util');
const fs = require("node:fs")
const keypair = nacl.sign.keyPair();
const publicKey = util.encodeBase64(keypair.publicKey);
const secretKey = util.encodeBase64(keypair.secretKey);

if (!fs.existsSync("./.data/.publickey") || !fs.existsSync("./data/.secretkey")) {
    fs.writeFileSync("./.data/.publickey", publicKey)
    fs.writeFileSync("./.data/.secretkey", secretKey)

    console.log(`Generated keypair (${publicKey})`)
}
