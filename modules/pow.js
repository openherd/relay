const crypto = require('crypto');

function solvePoW(publicKey, difficulty = 5) {
  const prefix = '0'.repeat(difficulty);
  let nonce = 0;

  while (true) {
    const hash = crypto.createHash('sha256')
      .update(publicKey + nonce)
      .digest('hex');

    if (hash.startsWith(prefix)) {
      return { nonce, hash };
    }
    nonce++;
  }
}


module.exports = { solvePoW }