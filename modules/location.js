const config = require("../config.js")

/**
 * Gets the current location either from WiFi geolocation or configured coordinates
 * @async
 * @returns {Promise<LocationResponse>} Location information
 * @throws {Error} If WiFi scanning fails or API request fails
 */
module.exports = async function () {
    if (!config.location.useWifi) return {
        accuracy: 0,
        location: {
            lat: config.location.latitude,
            lng: config.location.longitude,
            displayName: config.location.displayName
        }
    }
    const wifi = require('node-wifi');

    wifi.init({
        iface: null
    });

    return new Promise((resolve, reject) => {
        wifi.scan(async (error, networks) => {
            if (error) {
                reject(error);
            } else {
                try {
                    const formattedNetworks = networks.map(network => ({
                        macAddress: network.bssid,
                        channel: network.channel,
                        signalStrength: network.signal_level,
                        ssid: network.ssid
                    }));
                    const response = await (await fetch("https://api.beacondb.net/v1/geolocate", {
                        method: "POST",
                        body: JSON.stringify(formattedNetworks),
                        headers: {
                            "User-Agent": "OpenHerdBeacon/1.2.0 (rpi0w; bonjour +https://github.com/openherd/beacon)"
                        }
                    })).json();
                    response.location.displayName = config.location.displayName
                    resolve(response);
                } catch (err) {
                    reject(err);
                }
            }
        });
    });
}
/**
 * @typedef {Object} LocationResponse
 * @property {number} accuracy - Accuracy radius in meters
 * @property {Object} location - Location coordinates
 * @property {number} location.lat - Latitude
 * @property {number} location.lng - Longitude
 * @property {number} location.displayName - Display name
 */