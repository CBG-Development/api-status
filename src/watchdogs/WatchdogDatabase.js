const databaseWatchdog = async () => {

    global.logDatabase.log("Database Watchdog started!");

    /*
    global.database.ref("players").on("child_added", (snapshot) => {
        const playerUID = snapshot.val().uid;
        global.logDatabase.log(`A player with the UID: "${playerUID}" was addded to the Database!`);
    })
    */

    global.database.ref('players').startAt(Date.now()).on("child_added", (snapshot) => {
        const playerUID = snapshot.val().uid;
        global.logDatabase.log(`A player with the UID: "${playerUID}" was addded to the Database!`);
    })
}

module.exports = databaseWatchdog;