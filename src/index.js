const express = require('express');
const app = express();
const { UniqueID } = require('nodejs-snowflake');
const initFirebase = require('./initFirebase');
const databaseWatchdog = require('./watchdogs/WatchdogDatabase');
const WatchdogAPI = require('./watchdogs/WatchdogAPI')
const path = require('path');
const cors = require('cors');
const config = require('../config.json');

/**
 * Express Variables
 */
const port = 3030;
const host = '0.0.0.0';

/**
 * Logging
 */
const LogConsole = require('./tools/logConsole');
global.systemLog = new LogConsole("System");
global.expressLog = new LogConsole("Express");
global.routesLog = new LogConsole("Routes");

/**
 * Sets Standard Global Variables
 */
global.dateToday = new Date(Date.now()).toUTCString();
global.userUID = new UniqueID(
    {
        returnNumber: false,
        customEpoch: 1046818800,
        machineID: 0001,
    }
);
global.teamUID = new UniqueID(
    {
        returnNumber: false,
        customEpoch: 1609455600,
        machineID: 1201,
    }
);

/**
 * Secrets
 */
global.JWTSecret = config.jwtsecret;
global.lolapikey = config.riotgamesapikey;

const fileOptions = {
    root: path.join(__dirname + '/assets/')
};

/**
 * WatchDog API
 */
global.serverStatus = {};
WatchdogAPI('http://raips.goip.de:3040/api/v1/status', 15000, 'cbg-discord-bot');
app.get('/api/v1/status', (req, res) => {
    res.status(200).send(
        {
            status: global.serverStatus
        }
    )
});

/**
 * API Express
 */
const bodyParser = require('body-parser');

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/api/v1/images/logo', (req, res) => {
    res.sendFile('images/logo.png', fileOptions);
});

app.get('/api/v1/images/playerUnknown', (req, res) => {
    res.sendFile('images/playerUnknown.jpg', fileOptions);
})

const route_user = require('./routes/player');
app.use('/api/v1/player', route_user);

const route_tournament = require('./routes/tournament');
app.use('/api/v1/tournament', route_tournament);

const route_teams= require('./routes/teams/teams');
app.use('/api/v1/teams', route_teams);

app.use('/', (req, res) => {
    res.status(400).send(
        {
            code: 400,
            message: "Invalid Request"
        }
    );
});

app.listen(port, host, async () => {
    global.expressLog.log(`

        App listenings at http://localhost:${port}
    `);

    initFirebase();
    databaseWatchdog();
});