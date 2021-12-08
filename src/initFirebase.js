/**
 * Database Connect
 */
 const initFirebase = async () => {

    /**
     * Firebase Variables
     */
    const admin = require('firebase-admin');
    const serviceAccount = require("../databaseCert.json");
    const LogConsole = require('./tools/logConsole');

    /**
     * Add Database to the Log System
     */
    global.logDatabase = new LogConsole("Firebase App");

    /**
     * Init Firebase
     */
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://cbs-gaming-default-rtdb.europe-west1.firebasedatabase.app/"
    })
    global.database = admin.database(); // Add Realtime Database as a global variable

    /**
     * Check Firebase Realtime Database Connection
     */
    global.database.ref('.info/connected').on("value", async (snap) => {
        if (snap.val() === true) {
            global.logDatabase.log("Realtime Database connected!");
            global.databaseCon = true;
        } else {
            global.logDatabase.log("Realtime Database disconnected!");
            global.databaseCon = false;
        }
    });
}

module.exports = initFirebase;