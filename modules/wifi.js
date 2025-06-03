const wifi = require('node-wifi');
module.exports = async function () {
    wifi.init({
        iface: null
    });
    return new Promise((resolve, reject) => {
        wifi.getCurrentConnections(async (error, networks) => {
            if (error) {
                reject(error);
            } else {
                try {
                    const formattedNetworks = networks.map(network => ({
                        macAddress: network.bssid,
                        ssid: network.ssid
                    }));

                    resolve(formattedNetworks[0]);
                } catch (err) {
                    reject(err);
                }
            }
        });
    });
}