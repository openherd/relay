const { importPost } = require("./post.js")

async function find() {
    const bonjour = require('bonjour')();
    const os = require('node:os');
    const fs = require("node:fs")
    const networkInterfaces = os.networkInterfaces();
    const localIpAddresses = [];
    var exit = setTimeout(process.exit, 5000)
    Object.keys(networkInterfaces).forEach(interfaceName => {
        const interfaces = networkInterfaces[interfaceName];
        interfaces.forEach(iface => {
            if (iface.family === 'IPv4' && !iface.internal) localIpAddresses.push(iface.address);
        });
    });

    bonjour.find({ type: 'openherd', protocol: "tcp" }, async service => {
        clearTimeout(exit)
        if (localIpAddresses.includes(service.addresses.find(addr => addr.includes('.')))) return;
        const peer = `http://${service.addresses?.[0] || service.referer?.address}:${service.port}`
        try {
            (await (await fetch(`${peer}/_openherd/outbox`)).json()).map(async post => {
                try {
                    await importPost(post)
                } catch (e) {
                    console.error(e)
                }
            });
        } catch { }
        const posts = fs.readdirSync("./.posts").map(post => JSON.parse(fs.readFileSync("./.posts/" + post, "utf8")));
        var isPico = service.txt?.device?.toLowerCase()?.includes("pico");
        const batchSize = isPico ? 1 : posts.length;

        for (let i = 0; i < posts.length; i += batchSize) {
            const batch = posts.slice(i, i + batchSize);
            try {
                await fetch(`${peer}/_openherd/inbox`, {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(batch)
                })
            } catch {

            }

            if (i + batchSize < posts.length) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        exit = setTimeout(process.exit, 5000)
    });


}
find()