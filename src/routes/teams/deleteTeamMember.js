const express = require("express");
let router = express.Router();
const jwt = require("jsonwebtoken");

router
    .route('/')
    .post(async (req, res) => {

        try {
            const userData = jwt.verify(req.body.token, global.JWTSecret);
            const playerUid = req.body?.playerUid;
            const teamUid = req.body?.teamUid;

            if (typeof playerUid !== 'string' || typeof teamUid !== 'string') {
                res.status(400).send({
                    success: false,
                    message: 'Arguments have to be strings',
                    errorCode: 400
                })
                return;
            }

            if (playerUid && teamUid) {

                await global.database.ref(`teams/${teamUid}/members`).child(userData.uid).once('value', async (snapshot) => {
                    const member = snapshot.val();

                    if (member?.uid === userData.uid) {
                        if (member.permissions?.playerManagement === true) {
                            await global.database.ref(`teams/${teamUid}`).child('owner').once('value', (snapshot) => {
                                const ownerUid = snapshot.val();

                                if (ownerUid !== playerUid) {
                                    let update = {};
                                    update[`/teams/${teamUid}/members/${playerUid}`] = null;
                                    global.database.ref().update(update);

                                    res.status(200).send({
                                        success: true,
                                        message: "Player was removed from the team"
                                    })
                                } else {
                                    res.status(400).send({
                                        success: false,
                                        message: 'You cannot remove the Owner from the team',
                                        errorCode: 400
                                    })
                                }
                            })
                        } else {
                            res.status(403).send({
                                success: false,
                                message: "You have no permissions for this action",
                                errorCode: 403
                            })
                        }
                    } else {
                        res.status(403).send({
                            success: false,
                            message: "You're not a member of this team",
                            errorCode: 403
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

        } catch(error) {
            console.log(error)
            res.status(401).send({
                success: false,
                message: "Unvalid Access token",
                errorCode: 401
            });
        }
    })

module.exports = router;