const express = require("express");
let router = express.Router();
const jwt = require("jsonwebtoken");

router
    .route('/')
    .post(async (req, res) => {
        const teamName = req.body?.name;

        if (typeof teamName !== 'string') {
            res.status(400).send({
                success: false,
                message: 'Arguments have to be strings',
                errorCode: 400
            })
            return;
        }

        if (teamName?.length < 32) {

            const teamUID = global.teamUID.getUniqueID();
            const teamImages = req.body?.images;
            
            try {
                const userData = jwt.verify(req.body.token, global.JWTSecret);

                if (teamName) {
                    const team = {
                        uid: teamUID,
                        name: teamName,
                        owner: userData.uid,
                        images: teamImages
                            ? {
                                banner: teamImages?.banner ? teamImages.banner : null,
                                logo: teamImages?.logo ? teamImages.logo : null
                            }
                            : null,
                        members: {
                            [userData.uid]: {
                                uid: userData.uid,
                                permissions: {
                                    playerManagement: true,
                                    teamSettings: true
                                }
                            }
                        },
                        registrationDate: Date.now() 
                    }
        
                    await global.database.ref('teams').orderByChild('name').equalTo(team.name).once('value', async (snapshot) => {
                        const teamNameCheck = await snapshot.val();
        
                        if (teamNameCheck === null) {
                            try {
                                if (userData?.teams) {
                                    userData.teams.push(team.uid);
                                } else {
                                    userData.teams = [team.uid];
                                }
        
                                global.database.ref('teams').push().key;
                                let update = {};
                                update[`/teams/${team.uid}`] = team;
                                global.database.ref().update(update);
        
                                res.status(200).send({
                                    success: true,
                                    token: jwt.sign(userData, global.JWTSecret),
                                    data: {
                                        message: "Team successfully created!",
                                        teamUid: team.uid
                                    }
                                })
                            } catch (error) {
                                res.status(500).send({
                                    success: false,
                                    message: 'Internal server error',
                                    errorCode: 500
                                })
                            }
                        } else {
                            res.status(400).send({
                                success: false,
                                message: 'It already exists a team with this name',
                                errorCode: 400
                            })
                        }
                    })
                } else {
                    res.status(400).send({
                        success: false,
                        message: 'Invalid Arguments',
                        errorCode: 400
                    })
                }
            } catch (error) {
                res.status(401).send({
                    success: false,
                    message: "Unvalid Access token",
                    errorCode: 401
                });
            }
        } else {
            res.status(400).send({
                success: false,
                message: "Team name is too long",
                errorCode: 400,
            })
        }
    })

module.exports = router;