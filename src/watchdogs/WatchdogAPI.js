const fetch = require('node-fetch');
const LogConsole = require('../tools/logConsole');
const watchdogLog = new LogConsole('WatchDog API');

/**
 * Watchdog API
 * @param {string} apiURL API URL
 * @param {number} intervalTime interval time in ms
 * @param {string} serviceName header name
 */
module.exports = function watchdogAPI(apiURL, intervalTime, serviceName) {

    setInterval(async () => {
        try {
            await fetch(apiURL, 
                {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                    }
                }
            ).then(async response => {

                if (!response.ok) {
                    global.serverStatus[serviceName] = {
                        serviceName: serviceName,
                        status: false,
                        message: "Service is unavailable"
                    };
                }

                const result = await response.json();

                global.serverStatus[serviceName] = {
                    serviceName: result.service ? result.service : serviceName,
                    status: result.status,
                    message: result.message
                }
            })
        } catch(error) {
            watchdogLog.log(`[${serviceName}] Timeout -> Service not reachable!`)
            global.serverStatus[serviceName] = {
                serviceName: serviceName,
                status: false,
                message: "Service is unavailable"
            };
        }
    }, intervalTime);
}