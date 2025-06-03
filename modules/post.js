const openpgp = require("openpgp")
const fs = require("node:fs")
async function importPost({
    signature,
    publicKey,
    data,
}) {
    const key = await openpgp.readKey({
        armoredKey: publicKey,
    });
    const signedMessage = await openpgp.createMessage({
        text: data,
    });
    const signatureObject = await openpgp.readSignature({
        armoredSignature: signature,
    });
    const verificationResult = await openpgp.verify({
        message: signedMessage,
        signature: signatureObject,
        verificationKeys: key,
    });
    const { verified } = verificationResult.signatures[0];

    try {
        await verified; // throws on invalid signature
        const json = JSON.parse(data);
        fs.writeFileSync(`./.posts/${key.getFingerprint()}`, JSON.stringify({
            signature,
            publicKey,
            data,
            id: key.getFingerprint()
        }))

    } catch (e) {
        console.error("Signature verification failed:", e);

    }
    return null;
}
module.exports = { importPost }