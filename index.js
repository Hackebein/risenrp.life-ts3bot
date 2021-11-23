const { TeamSpeak } = require("ts3-nodejs-library")

const notificationMessages = [
    "Der Affe {{user}} braucht Bananen",
    "Da will sich {{user}} beschweren",
    "{{user}} sagt: kommt ausm knick",
    "{{user}}: alter Sack bearbeite mich",
    "{{user}}, gang gang",
    "Pleb {{user}} will Support",
    "{{user}}: besser isses das Ihr mich jetzt bearbeitet!",
    "{{user}} stinkt nach Einhorn pup",
    "{{user}} pupst nur in deiner Anwesenheit",
    "{{user}} will Schokolade",
    "{{user}} ist total daneben",
    "Der warme Bruder {{user}} erwartet dich",
    "Sei nett, {{user}} ist da",
    "{{user}} hat Wasser im Ohr",
    "{{user}} macht mimimi",
    "{{user}} braucht Hilfe",
    "{{user}} denkt er ist der beste",
    "{{user}} hat ein Ei gelegt",
    "{{user}} hat seine Eier verloren",
    "{{user}} ist jetzt eine Geisel",
    "{{user}} drückt der Stift",
    "{{user}} vegetiert vor sich hin",
    "jajajaja {{user}} nein nein",
    "{{user}} steht in der Ecke, zum weinen",
    "{{user}} ist jetzt Rentner",
    "{{user}}, der dessen Name nicht gesagt werden darf",
    "Der Fisch hat einen neunen Namen, {{user}}",
    "{{user}} braucht einen Joke",
    "{{user}} verblutet",
    "Der Dussel {{user}} will was von dir",
    "{{user}} gewinnt morgen im Lotto"
];

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
                let messageIndex = Math.floor(Math.random() * notificationMessages.length)
                let randomMessage = notificationMessages[messageIndex]
                    .replace('{{user}}', movingClient.client.nickname)
                    .replace('{{supporter}}', client.nickname)
                console.log("Pinging '" + client.nickname + "' (" + randomMessage+ ")")
                client.message(randomMessage)
            }).catch(e => {
                console.error(e)
            })
        })
    })

}).catch(e => {
    console.error(e)
})