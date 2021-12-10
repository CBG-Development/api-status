const express = require("express");
const fetch = require('node-fetch');
let router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { getTournamentProvider, createTournament, createTournamentCodes } = require("../apis/LeagueOfLegends");


router
    .route('/lol/create')
    .post(async (req, res) => {
        let providerID = undefined;

        try {

            const providerRegion = req.body?.region;
            const tournamentName = req.body?.name;
            const tournamentCodeCount = req.body?.count;
            const matchData = req.body?.matchData;
            const decoded = jwt.verify(req.body?.token, global.JWTSecret);

            if (decoded?.permissions?.tournament) {
                if (providerRegion && tournamentName) {

                    const providerId = await getTournamentProvider(providerRegion); 
                    
                    if (!providerId?.status) {

                        const tournamentId = await createTournament(tournamentName, providerId);

                        if (!tournamentId.status) {

                            const tournamentCodes = await createTournamentCodes(tournamentId, matchData, tournamentCodeCount);

                            if (!tournamentCodes.status) {
                                const result = {
                                    tournamentId,
                                    providerId,
                                    tournamentCodes,
                                    matchData
                                }
    
                                res.status(200).send({
                                    success: true,
                                    data: result,
                                })
                                return
                            }

                            res.status(400).send({
                                success: false,
                                data: tournamentCodes,
                            })
                            return
                        }

                        res.status(400).send({
                            success: false,
                            data: tournamentId,
                        })
                        return
                    }

                    res.status(400).send({
                        success: false,
                        data: providerId,
                    })
                    return

                } else {
                    res.status(400).send({
                        success: false,
                        message: 'Invalid Arguments',
                        errorCode: 400
                    })
                }
            } else {
                res.status(401).send({
                    success: false,
                    message: 'Unauthorized',
                    errorCode: 401
                })
            }
        } catch (error) {
            console.error(error)
            res.status(401).send({
                success: false,
                message: "Unvalid Access token",
                errorCode: 401
            })
        }
    })

module.exports = router;