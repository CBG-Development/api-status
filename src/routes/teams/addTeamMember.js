const express = require("express");
let router = express.Router();
const jwt = require("jsonwebtoken");

router
    .route('/')
    .post(async (req, res) => {

        try {
            const userData = jwt.verify(req.body.token, global.JWTSecret);
            const teamUid = req.body?.teamUid;
            const newMemberUid = req.body?.playerUid
            console.log(newMemberUid)

            if (typeof teamUid !== 'string' || typeof newMemberUid !== 'string') {
                res.status(400).send({
                    success: false,
                    message: 'Arguments have to be strings',
                    errorCode: 400
                })
                return;
            }

            if (teamUid && newMemberUid) {

                await global.database.ref(`teams/${teamUid}/members`).child(userData.uid).once('value', async (snapshot) => {
                    const member = await snapshot.val();

                    if (member?.uid === userData.uid) {
                        if (member.permissions?.playerManagement === true) {

                            await global.database.ref(`teams/${teamUid}/members`).child(newMemberUid).once('value', async (snapshot) => {
                                const _result = await snapshot.val();

                                if (_result === null) {
                                    let update = {};
                                    update[`/teams/${teamUid}/members/${newMemberUid}`] = {
                                        permissions: {
                                            playerManagement: false,
                                            teamSettings: false
                                        },
                                        uid: newMemberUid
                                    };
                                    global.database.ref().update(update);

                                    res.status(200).send({
                                        success: true,
                                        message: "Player was added to the team"
                                    })
                                } else {
                                    res.status(400).send({
                                        success: false,
                                        message: "Player is already a member of this team",
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