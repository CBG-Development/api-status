const express = require("express");
let router = express.Router();

const route_createTeam = require("./createTeam");
router.use('/create', route_createTeam);

const route_deleteTeam = require("./deleteTeam");
router.use('/delete', route_deleteTeam);

const route_addTeamMember = require("./addTeamMember");
router.use('/add/member', route_addTeamMember);

const route_deleteTeamMember = require("./deleteTeamMember");
router.use('/delete/member', route_deleteTeamMember);

module.exports = router;