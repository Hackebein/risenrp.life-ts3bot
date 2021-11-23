const { TeamSpeak } = require("ts3-nodejs-library")

//create a new connection
TeamSpeak.connect({
    host: process.env.HOST,
    serverport: process.env.PORT,
    username: process.env.USERNAME,
    password: process.env.PASSWORD,
    nickname: process.env.NICKNAME
}).then(async teamspeak => {
    teamspeak.on("close", async () => {
        console.log("disconnected, trying to reconnect...")
        await teamspeak.reconnect(-1, 1000)
        console.log("reconnected!")
    })
    teamspeak.on("clientmoved", async (movingClient) => {
        let groupName;
        switch (movingClient.client.cid) {
            case "37":
                groupName = 'Notify "W-Projekt Leitung"'
                break
            case "38":
                groupName = 'Notify "W-Community"'
                break
            case "41":
                groupName = 'Notify "W-Allgemein"'
                break
            case "42":
                groupName = 'Notify "W-Unregestriert"'
                break
            default:
                return
        }
        const group = await teamspeak.getServerGroupByName(groupName)
        if (!group) throw new Error("Could not find group '" + groupName + "'!")
        const clients = await group.clientList({ clientType: 0 })
        clients.forEach(client => {
            teamspeak.getClientByDbid(client.cldbid).then(client => {
                if (!client) return
                // 108 => Ingame
                // 104 => AFK
                // 106 => Anderes TS
                if (["108", "104", "106"].includes(client.cid)) return
                console.log("Pinging '" + client.nickname + "' for '" + movingClient.client.nickname + "' joining any waiting room")
                client.message(movingClient.client.nickname + " erwartet deinen Support!")
            }).catch(e => {
                console.error(e)
            })
        })
    })

}).catch(e => {
    console.error(e)
})