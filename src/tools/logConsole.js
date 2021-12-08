const fs = require('fs');

const date = new Date(Date.now());
const fileName = `${date.getUTCFullYear()}-${date.getUTCDate()}-${date.getUTCDay()}.log`;

const logPath = "./logs/";
const lastLogFile = logPath + fileName;

const createLogFile = () => {

    fs.open(logPath + fileName, 'a', (error) => {
        if (error) throw error;
        global.systemLog.log("Log System successfully started!");
    })

    fs.appendFile(
        lastLogFile,
        "\n----------------------------------------\n" +
        "Session from " + date.toISOString() + "\n" +
        "----------------------------------------\n\n",
        (error) => {
            if (error) throw error;
        })
};

/**
 * Log System
 */
createLogFile();

/**
 * Log something
 */
 module.exports = class LogConsole {

    heading = "";

    constructor(heading) {
        this.heading = heading;
    }

    log(message) {
        const consoleMessage = `[${global.dateToday}][${this.heading}] ${message}`;

        console.log(consoleMessage);
        this.writeLog(consoleMessage);
    }

    writeLog(text) {
        fs.appendFile(lastLogFile, text + "\n", (error) => {
            if (error) throw (error);
        })
    }
}