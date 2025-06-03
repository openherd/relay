const bonjour = require('bonjour')();
const register = require("./modules/register.js");
const Location = require("./modules/location.js");
const WiFi = require("./modules/wifi.js");
const config = require("./config.js");
const express = require('express')
const { importPost } = require("./modules/post.js")
const fs = require("node:fs")
const app = express();

app.use(express.json());

(async () => {
  const { location } = await Location()
  const wifi = await WiFi()
  try {
    await register({
      lat: location.lat.toString(),
      lng: location.lng.toString(),
      nickname: config.nickname,
      operator: config.operator,
      ssid: wifi.ssid,
      macAddress: wifi.macAddress
    })
  } catch {

  }


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

  const server = app.listen(3009, () => {
    const port = server.address().port
    bonjour.publish({ name: 'OpenHerd Beacon', type: 'http', port });
    console.log(`Relay listening on port ${port}`)
  })
  async function sync() {
    config.bootstrappingPeers.map(async peer => {
      try {
        await fetch(`${peer}/_openherd/inbox`, {
          method: "POST",
          body: JSON.stringify(fs.readdirSync("./.posts").map(post => JSON.parse(fs.readFileSync("./.posts/" + post, "utf8"))))
        });
        (await (await fetch(`${peer}/_openherd/outbox`)).json()).map(async post => {
          try {
            await importPost(post)
          } catch (e) {
            console.error(e)
          }
        })
      } catch {

      }

    })
  }
  setInterval(sync, 1000 * 60 * 5)
})();