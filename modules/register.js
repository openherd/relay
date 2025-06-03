const nacl = require('tweetnacl');
const util = require('tweetnacl-util');
const fs = require('node:fs')
const config = require("../config.js")
const { solvePoW } = require("./pow.js");

if (!fs.existsSync("./.data/.publickey") || !fs.existsSync("./.data/.secretkey")) throw new Error("No keys found. Run ./keygen to make some!")

module.exports = async function (msg) {
    msg = JSON.stringify(msg);

    const signature = util.encodeBase64(
        nacl.sign.detached(util.decodeUTF8(msg), util.decodeBase64(fs.readFileSync("./.data/.secretkey", "utf8")))
    );
    const publicKey = fs.readFileSync("./.data/.publickey", "utf8")
    const { nonce, hash } = solvePoW(publicKey, 5);
    const res = await fetch(config.beaconURL + '/beacon/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            publicKey,
            message: msg,
            signature,
            nonce,
        }),
    });
    const json = await res.json()
    if (res.status >= 400) throw new Error(json.error);
    console.log(json)
}