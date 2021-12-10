const express = require("express");
let router = express.Router();
const jwt = require("jsonwebtoken");

router
    .route('/')
    .post(async(req, res) => {

        try {
            const userData = jwt.verify(req.body.token, global.JWTSecret);
            const toDeleteTeamUID = req.body.teamUid;

            if (typeof toDeleteTeamUID !== 'string') {
                res.status(400).send({
                    success: false,
                    message: 'Arguments have to be strings',
                    errorCode: 400
                })
                return;
            }

            await global.database.ref('teams').orderByChild('uid').equalTo(toDeleteTeamUID).once('value', async (snapshot) => {
                const result = await snapshot.val();
                const team = result[Object.keys(result)[0]];

                if (team.uid === toDeleteTeamUID) {
                    if (team.owner === userData.uid) {
                        try {
                            let update = {};
                            update[`/teams/${team.uid}`] = null;
                            global.database.ref().update(update);

                            res.status(200).send({
                                success: true,
                                message: 'Team successfully deleted'
                            })
                        } catch(error) {
                            res.status(500).send({
                                success: false,
                                message: 'Internal server error',
                                errorCode: 500
                            })
                        }
                    } else {
                        res.status(403).send({
                            success: false,
                            message: "You're not the Owner from the given team",
                            errorCode: 403
                        })
                    }
                } else {
                    res.status(404).send({
                        success: false,
                        message: 'Team not found',
                        errorCode: 404
                    })
                }
            })

        } catch (error) {
            res.status(401).send({
                success: false,
                message: "Unvalid Access token",
                errorCode: 401
            });
        }
    })

module.exports = router;