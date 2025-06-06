const nacl = require('tweetnacl');
const util = require('tweetnacl-util');
const fs = require('fs');
const readline = require('readline');
const { solvePoW } = require("../modules/pow.js")
const secretKey = util.decodeBase64(fs.readFileSync("./.data/.secretkey", "utf8"));
const publicKey = fs.readFileSync("./.data/.publickey", "utf8");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: true
});

rl.question("Enter the password you want to set: ", (password) => {
  const message = JSON.stringify({ password });
  const { nonce } = solvePoW(publicKey, 5);
  const signature = util.encodeBase64(
    nacl.sign.detached(util.decodeUTF8(message), secretKey)
  );

  fetch("https://beacon.openherd.dispherical.com/beacon/update", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      publicKey,
      message,
      signature,
      nonce
    })
  })
    .then(res => res.json())
    .then(json => {
      console.log("Registered:", json);
      rl.close();
    })
    .catch(err => {
      console.error("Failed:", err);
      rl.close();
    });
});