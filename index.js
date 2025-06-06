const bonjour = require('bonjour')();
const register = require("./modules/register.js");
const Location = require("./modules/location.js");
const WiFi = require("./modules/wifi.js");
const config = require("./config.js");
const express = require('express')
const { importPost } = require("./modules/post.js")
const fs = require("node:fs")
const app = express();
const { execSync } = require('child_process');

app.use(express.json());


(async () => {
  const { location } = await Location()
  const wifi = await WiFi()



  app.get('/_openherd/outbox', (req, res) => {
    const posts = fs.readdirSync("./.posts").map(post => JSON.parse(fs.readFileSync("./.posts/" + post, "utf8")))
    res.json(posts)
  })

  app.post('/_openherd/inbox', (req, res) => {
    if (!Array.isArray(req.body)) {
      return res.status(400).json({ error: "Expected an array of posts" });
    }
    const posts = req.body
    posts.map(async post => {
      try {
        await importPost(post)
      } catch (e) {
        console.error(e)
      }
    })
    res.json({ ok: true })
  })
  app.all('/*', (req, res) => {
    res.send(require("./modules/dashboard")())
  })
  const server = app.listen(3009, async () => {
    const port = server.address().port
    bonjour.publish({ name: 'openherd-relay', type: 'openherd', port, protocol: "tcp" });
    console.log(`Relay listening on port ${port}`)
    async function sync() {
      config.bootstrappingPeers.map(async peer => {
        try {
          await fetch(`${peer}/_openherd/inbox`, {
            method: "POST",
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(fs.readdirSync("./.posts").map(post => JSON.parse(fs.readFileSync("./.posts/" + post, "utf8"))))
          });
          (await (await fetch(`${peer}/_openherd/outbox`)).json()).map(async post => {
            try {
              await importPost(post)
            } catch (e) {
              console.error(e)
            }
          });
        } catch {

        }

      })
    }
    setInterval(sync, 1000 * 60 * 5)
    sync()

    try {
      await register({
        lat: location.lat.toString(),
        lng: location.lng.toString(),
        nickname: config.nickname,
        operator: config.operator,
        notes: config.notes,
        ssid: wifi.ssid,
        macAddress: wifi.macAddress
      })
    } catch {

    }
  function startDiscovery() {
    try {
      execSync(`${process.argv[0]} modules/discovery`);
    } catch (error) {
      console.error('Error running discovery module:', error.message);
    }
  }

  setInterval(startDiscovery, 60 * 1000);
  startDiscovery();
  })





})();