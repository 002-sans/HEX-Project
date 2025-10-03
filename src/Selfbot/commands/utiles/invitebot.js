const { Client, Message } = require("discord.js-selfbot-v13");

module.exports = {
    name: "invitebot",
    description: "Envoie le lien d'invitation du bot",
    aliases: [],
    usage: "<botId>",
    dir: "utiles",
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {string[]} args
    */
    run: async (client, message, args) => {
        let user = message.mentions.users.first() || client.users.cache.get(args[0]) || await client.users.fetch(args[0]).catch(() => false);
        if (!args[0] || !user) return message.edit("***Veuillez entrer l'ID d'un bot***")

        if (!user.bot) return message.edit(`***\`${user.displayName}\` n'est pas un bot***`)
        return message.edit(`> [\`Inviter ${user.displayName}\`](<https://discord.com/oauth2/authorize?client_id=${user.id}&scope=bot&permissions=8>)`);
    }
};