const { Message, Client } = require('discord.js-selfbot-v13');

module.exports = {
    name: "messageDelete",
    once: false,
    /**
     * @param {Message} message
     * @param {Client} client
    */
    run: async (message, client) => {
        if (!client.snipes.get(message.channel.id)) client.snipes.set(message.channel.id, [])
        if (client.snipes.get(message.channel.id).length > 5) client.snipes.get(message.channel.id).splice(5, 1)

        client.snipes.get(message.channel.id).push({
            content: message.content ?? "Aucun message",
            author: message.author,
            images: message.attachments.size > 0 ? message.attachments.first().url : null,
            date: Date.now()
        });
    }
};
