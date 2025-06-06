const config = require("../config")
const os = require('node:os');
const fs = require("node:fs")
const xss = require("xss");
function getRelativeTime(date) {
    const now = Date.now();
    const diffInSeconds = Math.round((date.getTime() - now) / 1000);

    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

    const timeUnits = {
        second: 60,
        minute: 60,
        hour: 24,
        day: 30,
        month: 12,
        year: Infinity,
    };

    let unit = 'second';
    let value = diffInSeconds;

    for (const [key, cutoff] of Object.entries(timeUnits)) {
        if (Math.abs(value) < cutoff) {
            unit = key;
            break;
        }
        value /= cutoff;
    }

    return rtf.format(Math.round(value), unit);
}
function getSystemMemoryUsagePercentage() {
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();

    const usedMemory = totalMemory - freeMemory;

    return (usedMemory / totalMemory) * 100;
}
function getPostCount() {
    return fs.readdirSync("./.posts").length
}
function getPosts() {
    return fs.readdirSync("./.posts").sort((a, b) => {
        return new Date(JSON.parse(JSON.parse(fs.readFileSync(`./.posts/${b}`)).data).date) - (new Date(JSON.parse(JSON.parse(fs.readFileSync(`./.posts/${a}`)).data).date))
    }).map(a => {
        const post = JSON.parse(JSON.parse(fs.readFileSync(`./.posts/${a}`)).data)
        return `<div class="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                            <div class="flex justify-between items-start mb-2">
                                <span class="font-mono text-xs text-gray-500">ID: ${xss(post.id.slice(0, 6))}...</span>
                                <span class="text-xs text-gray-500">${xss(getRelativeTime(new Date(post.date)))}</span>
                            </div>
                            <p class="text-gray-800">${xss(post.text)}</p>
                        </div>`
    }).join("")
}
function getUptime() {

    const uptimeSeconds = process.uptime();

    const days = Math.floor(uptimeSeconds / (24 * 60 * 60));
    const hours = Math.floor((uptimeSeconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((uptimeSeconds % (60 * 60)) / 60);

    let uptimeString = '';

    if (days > 0) {
        uptimeString += `${days} day${days !== 1 ? 's' : ''}`;
        if (hours > 0 || minutes > 0) uptimeString += ', ';
    }

    if (hours > 0) {
        uptimeString += `${hours} hour${hours !== 1 ? 's' : ''}`;
        if (minutes > 0) uptimeString += ', ';
    }

    if (minutes > 0 || (days === 0 && hours === 0)) {
        uptimeString += `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }

    return uptimeString;
}
module.exports = function () {
    return `<!DOCTYPE html>
<html lang="en">
   <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>OpenHerd Relay Node</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
      <style>
         /* Custom CSS to apply Inter font to the whole body */
         body {
         font-family: 'Inter', sans-serif;
         }
      </style>
   </head>
   <body class="bg-gradient-to-br from-indigo-500 to-purple-600 min-h-screen flex items-center justify-center p-4">
      <div class="bg-white p-6 md:p-8 rounded-xl shadow-2xl w-full max-w-6xl">
         <!-- Main Content Layout - Grid for larger screens -->
         <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <!-- Left Content Column (Main Info) -->
            <div class="lg:col-span-7">
               <!-- Logo Section -->
               <div class="mb-6 text-center">
                  <span class="text-6xl" role="img" aria-label="Cow logo">🐄</span>
                  <h1 class="text-4xl font-extrabold text-gray-900 mt-4">OpenHerd Relay</h1>
                  <p class="text-lg text-gray-600 mt-2">Your Local Anonymous Gateway</p>
               </div>
               <!-- Description Section -->
               <p class="text-gray-700 leading-relaxed mb-6">
                  This is a lightweight <strong class="font-semibold">OpenHerd Relay Node</strong>. Relays act as digital dead drops, providing a temporary cache for anonymous posts and replies.
                  They accept and serve messages via HTTP, making them ideal for public Wi-Fi, mesh networks, or constrained devices.
               </p>
               <p class="text-gray-700 leading-relaxed mb-6">
                  This OpenHerd Relay is also discoverable on this network via <strong class="font-semibold">Bonjour</strong>.
               </p>
               <!-- What is OpenHerd? Section -->
               <div class="bg-purple-50 rounded-lg p-5 mb-6 text-left">
                  <h2 class="text-2xl font-bold text-purple-700 mb-3 text-center">What is OpenHerd?</h2>
                  <p class="text-gray-800 leading-relaxed">
                     OpenHerd is a decentralized, anonymous communication platform built on a Free and Open Source Software (FOSS)
                     peer-to-peer architecture. It allows users to share short, ephemeral messages within a local vicinity,
                     similar to a digital bulletin board. Each post uses a unique cryptographic key for enhanced anonymity.
                     It aims to provide a local, privacy-focused communication space without central control.
                  </p>
               </div>
               <!-- Relay Info Section -->
               <div class="bg-blue-50 rounded-lg p-5 mb-6 text-left">
                  <h2 class="text-2xl font-bold text-blue-700 mb-3 text-center">Relay Information</h2>
                  <ul class="list-none p-0 space-y-2 text-gray-800">
                     <li class="flex justify-between items-center">
                        <strong class="font-semibold text-blue-800">Nickname:</strong>
                        <span class="text-gray-700 ml-2">${config.nickname}</span>
                     </li>
                     <li class="flex justify-between items-center">
                        <strong class="font-semibold text-blue-800">Notes:</strong>
                        <span class="text-gray-700 ml-2">${config.notes}</span>
                     </li>
                     <li class="flex justify-between items-center">
                        <strong class="font-semibold text-blue-800">Location:</strong>
                        <span class="text-gray-700 ml-2">${config.location.displayName}</span>
                     </li>
                     <li class="flex justify-between items-center">
                        <strong class="font-semibold text-blue-800">Operator:</strong>
                        <span class="text-gray-700 ml-2">${config.operator}</span>
                     </li>
                  </ul>
               </div>
               <!-- Client Info Section -->
               <div class="bg-red-50 rounded-lg p-5 mb-6 text-left">
                  <h2 class="text-2xl font-bold text-red-700 mb-3 text-center">Get the OpenHerd Client</h2>
                  <p class="text-gray-800 leading-relaxed">
                     Ready to join the herd? Download an OpenHerd client to start posting and interacting with your local community:
                  </p>
                  <ul class="list-disc list-inside space-y-2 text-gray-800">
                     <li><a href="https://app.openherd.dispherical.com" class="text-red-600 hover:underline font-semibold">OpenHerd PWA</a></li>
                     <li class="text-gray-500 text-sm">Check the official <a href="https://github.com/openherd" class="text-gray-600 hover:underline">OpenHerd GitHub</a> for releases.</li>
                  </ul>
               </div>
               <!-- Disclaimer Section -->
               <p class="text-sm text-gray-500 italic mb-4">
                  Posts on this relay are not guaranteed to be permanent and may expire, be flushed, or be deleted upon reboot.
                  This node does not run a full libp2p instance and primarily facilitates local synchronization.
               </p>
            </div>
            <!-- Right Content Column -->
            <div class="lg:col-span-5 flex flex-col space-y-6">
               <!-- Status Monitor Section -->
               <div class="bg-yellow-50 rounded-lg p-5 text-left h-auto">
                  <h2 class="text-2xl font-bold text-yellow-700 mb-3 text-center">Relay Status</h2>
                  <div class="flex flex-col space-y-3">
                     <div class="flex justify-between items-center">
                        <span class="font-semibold text-yellow-800">Status:</span>
                        <span class="bg-green-100 text-green-800 px-2 py-1 rounded-md font-medium">Online</span>
                     </div>
                     <div class="flex justify-between items-center">
                        <span class="font-semibold text-yellow-800">Messages Cached:</span>
                        <span class="text-gray-700">${getPostCount()}</span>
                     </div>
                     <div class="flex justify-between items-center">
                        <span class="font-semibold text-yellow-800">Uptime:</span>
                        <span class="text-gray-700">${getUptime()}</span>
                     </div>
                     <div class="flex justify-between items-center">
                        <span class="font-semibold text-yellow-800">Memory Usage:</span>
                        <div class="w-32 bg-gray-200 rounded-full h-2.5">
                           <div class="bg-green-500 h-2.5 rounded-full" style="width: ${getSystemMemoryUsagePercentage()}%"></div>
                        </div>
                     </div>
                  </div>
               </div>
               <!-- Post Creator Section -->
               <div class="bg-indigo-50 rounded-lg p-5 text-left">
                  <h2 class="text-2xl font-bold text-indigo-700 mb-3 text-center">Create a Post</h2>
                  <div id="postForm" class="space-y-3">
                     <div>
                        <label for="postContent" class="block text-sm font-medium text-gray-700 mb-1">Message</label>
                        <textarea id="postContent" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="What's happening in your area?"></textarea>
                     </div>
                     <div class="flex justify-between items-center" onclick="newPost()">
                        <span class="text-xs text-gray-500">Posts are anonymized and ephemeral</span>
                        <button type="submit" class="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out">Send to Herd</button>
                     </div>
                  </div>
               </div>
               <!-- Cached Posts Section -->
               <div class="bg-blue-50 rounded-lg p-5 text-left">
                  <h2 class="text-2xl font-bold text-blue-700 mb-3 text-center">Recent Posts</h2>
                  <div class="space-y-4 max-h-80 overflow-y-auto pr-1">
                     <!-- Post Item Template -->
                     ${getPosts()}
                  </div>
               </div>
            </div>
         </div>
         <br>
         <!-- Copyright Notice Section -->
         <p class="text-xs text-gray-400">
            &copy; <span id="year">2025</span> <a href="https://github.com/openherd" class="text-gray-400 hover:underline">OpenHerd</a> - AGPL 3.0 Licensed
            <script>document.querySelector("#year").innerText=new Date().getFullYear()</script>
         </p>
      </div>
      </div>
      <script src="https://unpkg.com/openpgp@6.1.1/dist/openpgp.min.js"></script>
      <script>
         function skewLocation(lat, lon, minDistanceKm = 2, maxDistanceKm = 2.7) {
         const earthRadiusKm = 6371;
         
         const minDistRad = minDistanceKm / earthRadiusKm;
         const maxDistRad = maxDistanceKm / earthRadiusKm;
         
         const randomDist = minDistRad + Math.random() * (maxDistRad - minDistRad);
         const randomAngle = Math.random() * 2 * Math.PI;
         
         const newLat = lat + (randomDist * Math.cos(randomAngle)) * (180 / Math.PI);
         
         const newLon = lon + (randomDist * Math.sin(randomAngle)) * (180 / Math.PI) / Math.cos(lat * Math.PI / 180);
         
         return { latitude: newLat, longitude: newLon };
         }
          async function newPost() {
         const skl = skewLocation(${config.location.latitude}, ${config.location.longitude})
         const latitude = skl.latitude
         const longitude = skl.longitude
         const text = document.querySelector("#postContent").value
         const postDate = new Date();
         
         const { privateKey, publicKey } = await openpgp.generateKey({
         type: 'rsa',
         rsaBits: 4096,
         userIDs: [{ name: 'Anon', email: 'anon@example.com' }],
         passphrase: "post"
         });
         const key = await openpgp.readKey({ armoredKey: privateKey });
         
         
         const textToSign = JSON.stringify({
         id: key.getFingerprint(),
         text,
         latitude,
         date: postDate.toISOString(),
         longitude
         });
         const message = await openpgp.createMessage({ text: textToSign });
         
         const privateKeyObj = await openpgp.readPrivateKey({ armoredKey: privateKey });
         const decryptedPrivateKey = await openpgp.decryptKey({ privateKey: privateKeyObj, passphrase: 'post' });
         
         const signature = await openpgp.sign({
         message: message,
         signingKeys: decryptedPrivateKey,
         detached: true
         })
         var packet = {
         signature: signature,
         publicKey,
         id: key.getFingerprint(),
         data: textToSign
         };
         fetch("/_openherd/inbox", { 
         method: "POST",
         headers: {
             'Content-Type': 'application/json'
         },
         body: JSON.stringify([packet])
         }).then(e=>{
         window.location.reload()
         })
         
         }
      </script>
   </body>
</html>`
}