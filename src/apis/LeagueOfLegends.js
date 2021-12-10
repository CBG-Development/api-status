const fetch = require('node-fetch');
const apipath = "lol/tournament-stub/v4";
const providerURL = "https://carl-benz-gaming.de/";

/**
 * Register callback URL for Tournaments
 * @param {string} region 
 * @param {string} url
 * @return {object} Returns object with providerId
 */
 exports.getTournamentProvider = async (region) => {
    try {
        const apiurl = `https://americas.api.riotgames.com/${apipath}/providers`;
        
        const body = {
            region: region,
            url: providerURL
        }

        const response = await fetch(apiurl, 
            {
                method: 'POST',
                headers: {
                    'Accept-Charset': 'application/x-www-forum-urlencoded; charset=UTF=8',
                    'X-Riot-Token': global.lolapikey
                },
                body: JSON.stringify(body)
            }
        )

        const data = await response.json();

        return data;

    } catch (error) {
        console.log(error)
        return {
            status: 500,
            message: "Internal Server Error"
        }
    }
}

/**
 * Register an Tournament
 * @param {string} name 
 * @param {integer} providerId 
 * @returns {object} Returns object with tournament id
 */
exports.createTournament = async (name, providerId) => {
    try {
        const apiurl = `https://americas.api.riotgames.com/${apipath}/tournaments`;
        
        const body = {
            name: name,
            providerId: providerId
        }

        const response = await fetch(apiurl, 
            {
                method: 'POST',
                headers: {
                    'Accept-Charset': 'application/x-www-forum-urlencoded; charset=UTF=8',
                    'X-Riot-Token': global.lolapikey
                },
                body: JSON.stringify(body)
            }
        )

        const data = await response.json();

        return data;

    } catch (error) {
        console.log(error)
        return {
            status: 500,
            message: "Internal Server Error"
        }
    }
}

exports.createTournamentCodes = async function createTournamentCodes(tournamentId, matchData, tournamentCodeCount) {
    try {
        const apiurl = `https://americas.api.riotgames.com/${apipath}/codes?tournamentId=${tournamentId}&count=${tournamentCodeCount}`;
        
        const body = matchData;

        const response = await fetch(apiurl, 
            {
                method: 'POST',
                headers: {
                    'Accept-Charset': 'application/x-www-forum-urlencoded; charset=UTF=8',
                    'X-Riot-Token': global.lolapikey
                },
                body: JSON.stringify(body)
            }
        )

        const data = await response.json();

        return data;

    } catch (error) {
        console.log(error)
        return {
            status: 500,
            message: "Internal Server Error"
        }
    }
}


/*
 try {
    const apiurl = `https://americas.api.riotgames.com/${apipath}/providers`;
    await fetch(apiurl, 
        {
            method: 'POST',
            headers: {
                'Accept-Charset': 'application/x-www-forum-urlencoded; charset=UTF=8',
                'X-Riot-Token': global.lolapikey
            },
            body: {
                region: providerRegion,
                url: providerURL
            }
        }
    ).then(async response => {
        if (!response.ok) {
            let data = {
                success: false,
                errorCode: response.status
            };
            if (response.status === 403) data.message = "Forbidden";
            if (response.status === 404) data.message = "Bad Region";
            if (response.status === 400) data.message = "Bad Request";

            res.status(response.status).send(data);
            return;
        }

        providerID = await response.json();
        console.log(providerID);

        try {
            const apiurl = `https://americas.api.riotgames.com/${apiurl}/tournaments`;
            await fetch(apiurl, 
                {
                    method: 'POST',
                    headers: {
                        'Accept-Charset': 'application/x-www-forum-urlencoded; charset=UTF=8',
                        'X-Riot-Token': global.lolapikey
                    },
                    body: {
                        name: tournamentName,
                        providerId: providerID
                    }
                }
            ).then(async response => {
                if (!response.ok) {
                    let data = {
                        success: false,
                        errorCode: response.status
                    };
                    if (response.status === 404) data.message = "Bad Region";
                    if (response.status === 400) data.message = "Bad Request";

                    res.status(response.status).send(data);
                    return;
                }

                const tournamentID = await response.json();

                try {
                    const apiurl = `https://americas.api.riotgames.com/${apiurl}/codes?count=20&tournamentId=${tournamentID}`;
                    await fetch(apiurl, 
                        {
                            method: 'POST',
                            headers: {
                                'Accept-Charset': 'application/x-www-forum-urlencoded; charset=UTF=8',
                                'X-Riot-Token': global.lolapikey
                            },
                            body: matchData
                        }
                    ).then(async response => {
                        if (!response.ok) {
                            let data = {
                                success: false,
                                errorCode: response.status
                            };
                            if (response.status === 404) data.message = "Bad Region";
                            if (response.status === 400) data.message = "Bad Request";
    
                            res.status(response.status).send(data);
                            return;
                        }
    
                        const codes = await response.json();
    
                        res.status(200).send({
                            success: true,
                            data: codes,
                        })
                        
    
                    })
                } catch (error) {
                    console.log(error)
                    res.status(500).send({
                        success: false,
                        message: 'Internal server error',
                        errorCode: 500
                    })
                }
                

            })
        } catch (error) {
            console.log(error)
            res.status(500).send({
                success: false,
                message: 'Internal server error',
                errorCode: 500
            })
        }
        

    })
} catch (error) {
    res.status(500).send({
        success: false,
        message: 'Internal server error',
        errorCode: 500
    })
}
*/