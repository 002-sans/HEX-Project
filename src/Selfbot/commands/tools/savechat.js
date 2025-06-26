
const { Client, Message, TextChannel, MessageAttachment } = require("discord.js-selfbot-v13");

module.exports = {
    name: "savechat",
    description: "Sauvegarde les messages d'un salon",
    usage: "[channel]",
    dir: "tools",
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {string[]} args
    */
    run: async (client, message, args) => {
        let channel = message.mentions.channels.first() || client.channels.cache.get(args[0]) || await client.channels.fetch(args[0]).catch(() => false);
        if (!channel || !args[0]) channel = message.channel

        if (!["GUILD_TEXT", "GROUP_DM", "DM", "GUILD_VOICE", "GUILD_NEWS", ""].includes(channel.type))
            return message.edit("***Veuillez entrer un salon textuel valide***");

        await message.edit("***Création de la sauvegarde des messages***")
        const messages = await fetchAll(Infinity, channel, client)
            .then(a => a.reverse());

        const results = messages
            .map(msg => `[${formatDateWithTime(msg.createdTimestamp)}] Auteur: ${msg.author.displayName} |${msg.content  ? ` Message: ${msg.content}` : ''} ${msg.attachments.size > 0 ? `Attachments: ${msg.attachments.map(r => r.url).join(', ')}` : ' '}`)
            .join('\n');

            if (message.editable) await message.edit({
                content: null,
                files: [{
                    attachment: Buffer.from(results, 'utf-8'),
                    name: `${channel.id}.txt`,
                }],
            });
            else await message.channel.send({
            files: [{
                attachment: Buffer.from(results, 'utf-8'),
                name: `${channel.id}.txt`,
            }],
        });
    }
};

/**
 * @param {string[]} limit
 * @param {TextChannel} channel
 * @param {Client} client
*/
async function fetchAll(limit, channel, client) {
    let messages = [];
    let lastID;
    while (true) { 
        const fetchedMessages = await channel.messages.fetch({
            limit: 100,
            cache: false,
           ...(lastID && { before: lastID }),
        });
        
        if (fetchedMessages.size === 0 || (limit && messages.length >= limit)) {
            return messages.filter(msg => !msg.author?.bot).slice(0, limit);
        }
        
        messages = messages.concat(Array.from(fetchedMessages.values()));
        lastID = fetchedMessages.lastKey();
    }
}


function formatDateWithTime(timestamp) {
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}
