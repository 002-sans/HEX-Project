const { Client, Message } = require("discord.js-selfbot-v13");
const status = [ 'online', 'idle', 'dnd' ];

module.exports = {
    name: "lanterne",
    description: "Modifie votre status chaques deux secondes",
    usage: '[stop]',
    dir: "status",
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {string[]} args
    */
    run: async (client, message, args) => {
        if (args[0] == 'stop'){
            if (!client.lanterne) return message.edit("***La lanterne n'est pas activée***");

            clearInterval(client.lanterne)
            delete client.lanterne;

            return message.edit("***La lanterne a été désactivée***");
        }

        message.edit("***Votre activitée va être mise à jour automatiquement***")
        let i = 0
        client.lanterne = setInterval(() => {
            if (i === status.length) i = 0
            client.user.setStatus(status[i]); i++
        }, 2000)
    }
};