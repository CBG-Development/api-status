const express = require("express");
const fetch = require('node-fetch');
let router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

router
    .route('/')
    .get(async (req, res) => {
        /**
         * Get Player Data
         */
    })

router
    .route('/registration')
    .post(async (req, res) => {
        /**
         * Player Registration
         */
        try {
            const uid = global.userUID.getUniqueID();
            const name = req.body.name;
            const birthday = req.body.birthday;
            const gamerTag = req.body.gamerTag;
            let errorMessage = null;

            const plainPassword = req.body.password;
            let hashedPassword;
            await bcrypt.hash(plainPassword, 10).then((hash) => {
                hashedPassword = hash;
            })

            await global.database.ref(`players`).orderByChild('gamerTag').equalTo(gamerTag).get().then((snapshot) => {
                if (snapshot.val() !== null) {
                    errorMessage = "There is already a player with that GamerTag registrated";
                }
            })

            if (errorMessage === null) {
                global.database.ref(`players/${uid}`).set({
                    uid: uid,
                    name: name,
                    password: hashedPassword,
                    birthday: birthday,
                    gamerTag: gamerTag,
                    registrationDate: Date.now(),
                    connections: {
                        leagueoflegends: null
                    },
                    permissions: {
                        admin: false,
                        tournament: false
                    },
                    images: {},
                    teams: {}
                });
    
                res.status(200).send(
                    {
                        success: true,
                        message: 'Player is now registrated',
                    }
                );
            } else {
                res.status(409).send(
                    {
                        success: false,
                        message: errorMessage,
                        errorCode: "409"
                    }
                )
            }
        } catch (error) {
            console.log(error);
            res.status(409).send(
                {
                    success: false,
                    message: "Invalid Input!",
                    errorCode: "409"
                }
            )
        }
        
    })

router
    .route('/login')
    .post(async (req, res) => {
        /**
         * Player Login
         */
        try {
            const gamerTag = req.body.gamerTag;
            const plainPassword = req.body.password;
            let errorMessage = null;

            let userData = {};
            await global.database.ref(`players`).orderByChild('gamerTag').equalTo(gamerTag).get().then(async (snapshot) => {
                if (snapshot.val() !== null) {
                    const password = snapshot.val()[Object.keys(snapshot.val())[0]].password;

                    if (await bcrypt.compare(plainPassword, password)) {
                        userData = snapshot.val()[Object.keys(snapshot.val())[0]];
                        delete userData.password;
                    } else {
                        errorMessage = "Wrong Password!";
                    }
                } else {
                    errorMessage = "There is no User with this GamerTag";
                }
            })

            if (errorMessage === null) {
                jwt.sign(userData, global.JWTSecret, (err, token) => {
                    if (!err) {
                        res.status(200).send(
                            {
                                success: true,
                                token: token
                            }
                        )
                    } else {
                        res.status(500).send(
                            {
                                success: false,
                                message: "Internal Server Error",
                                errorCode: 500
                            }
                        )
                    }
                });
            } else {
                res.status(400).send(
                    {
                        success: false,
                        message: errorMessage,
                        errorCode: "400"
                    }
                );
            }

        } catch (error) {
            res.status(500).send(
                {
                    success: false,
                    message: "Internal Server Error",
                    errorCode: 500
                }
            )
            global.routesLog(`[/player] ${error}`);
        }
    })

router
    .route('/remove')
    .post(async (req, res) => {
        /**
         * Remove Player from System
         */
    })

router
    .route('/connect/lol')
    .post(async (req, res) => {
        const token = req.body.token;

        try {
            const decoded = jwt.verify(token, global.JWTSecret);
            const summonerName = req.body.summonerName;
            const server = req.body.server;

            if (summonerName && server) {
                try {
                    const apiurl = `https://${server.toLowerCase()}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${encodeURIComponent(summonerName)}`;
                    await fetch(apiurl, 
                        {
                            method: 'GET',
                            headers: {
                                'Accept-Charset': 'application/x-www-forum-urlencoded; charset=UTF=8',
                                'X-Riot-Token': global.lolapikey
                            }
                        }
                    ).then(async response => {
                        if (!response.ok) {
                            let data = {
                                success: false,
                                errorCode: response.status
                            };
                            if (response.status === 404) data.message = "Summoner Name not found";
                            if (response.status === 400) data.message = "Bad Request";

                            res.status(response.status).send(data);
                            return;
                        }

                        const result = await response.json();

                        result.server = server;

                        decoded.connections = {
                            leagueoflegends: result
                        };

                        global.database.ref().child('connections').push().key;
                        let update = {};
                        update[`/players/${decoded.uid}/connections/leagueoflegends`] = result;
                        global.database.ref().update(update);

                        res.status(200).send(
                            {
                                success: true,
                                token: jwt.sign(decoded, global.JWTSecret)
                            }
                        )
                    })
                } catch(error) {
                    console.log(error)
                    res.status(500).send(
                        {
                            success: false,
                            message: "Internal Server Error",
                            errorCode: 500
                        }
                    )
                }
            }
        } catch (error) {
            console.log(error)
            res.status(401).send({
                success: false,
                message: "Unvalid Access token",
                errorCode: 401
            })
        }
    })

router
    .route('/disconnect/lol')
    .post(async (req, res) => {
        if (req.body.token) {
            try {
                const decoded = jwt.verify(req.body.token, global.JWTSecret)
                try {
                    global.database.ref().child('connections').push().key;
                    let update = {};
                    update[`/players/${decoded.uid}/connections/leagueoflegends`] = null;
                    global.database.ref().update(update);
                
                    delete decoded.connections;

                    res.status(200).send(
                        {
                            success: true,
                            token: jwt.sign(decoded, global.JWTSecret)
                        }
                    )
                    
                } catch(error) {
                    res.status(500).send({
                        success: false,
                        message: "Internal Server Error",
                        errorCode: 500
                    })
                }
            } catch(error) {
                res.status(401).send({
                    success: false,
                    message: "Unvalid Access token",
                    errorCode: 401
                })
            }
        } else {
            res.status(400).send({
                success: false,
                message: "Bad Request",
                errorCode: 400
            })
        }
    })

router
    .route('/update/lol')
    .post(async (req, res) => {
        if (req.body.token) {
            try {
                const decoded = jwt.verify(req.body.token, global.JWTSecret)

                try {
                    const apiurl = `https://${decoded?.connections?.leagueoflegends?.server.toLowerCase()}.api.riotgames.com/lol/summoner/v4/summoners/${decoded?.connections?.leagueoflegends?.id}`;
                    await fetch(apiurl, 
                        {
                            method: 'GET',
                            headers: {
                                'Accept-Charset': 'application/x-www-forum-urlencoded; charset=UTF=8',
                                'X-Riot-Token': global.lolapikey
                            }
                        }
                    ).then(async response => {
                        if (!response.ok) {
                            let data = {
                                success: false,
                                errorCode: response.status
                            };
                            if (response.status === 404) data.message = "Summoner Name not found";
                            if (response.status === 400) data.message = "Bad Request";

                            res.status(response.status).send(data);
                            return;
                        }

                        const result = await response.json();

                        result.server = decoded?.connections?.leagueoflegends?.server;

                        decoded.connections.leagueoflegends = result;

                        global.database.ref().child('connections').push().key;
                        let update = {};
                        update[`/players/${decoded.uid}/connections/leagueoflegends`] = result;
                        global.database.ref().update(update);

                        res.status(200).send(
                            {
                                success: true,
                                token: jwt.sign(decoded, global.JWTSecret)
                            }
                        )
                    })
                } catch(error) {
                    res.status(500).send({
                        success: false,
                        message: "Internal Server Error",
                        errorCode: 500
                    })
                }
            } catch(error) {
                res.status(401).send({
                    success: false,
                    message: "Unvalid Access token",
                    errorCode: 401
                })
            }
        } else {
            res.status(400).send({
                success: false,
                message: "Bad Request",
                errorCode: 400
            })
        }
    })

module.exports = router;
