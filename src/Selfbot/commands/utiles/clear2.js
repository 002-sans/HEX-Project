const { Client, Message } = require("discord.js-selfbot-v13");
const dataObject = {};

module.exports = {
    name: "clear2",
    description: "Supprime un certain nombre de vos messages (experimental)",
    usage: "[nombre]",
    dir: "utiles",
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {string[]} args
    */
    run: async (client, message, args) => {
        
        if (args[0] == client.user.id + 'all'){
            if (dataObject[client.user.id + 'all']) return message.edit("***La commande clear all est déjà en cours***");

            const messages = [];
            const channels = client.channels.cache.filter(c => c.type === 'DM' || c.type === 'GROUP_DM');

            if (channels.size === 0) return message.edit("***Vous n'avez aucun DM et Groupes***");
            await message.edit(`***${channels.size} DM et Groupes trouvés***`);

            dataObject[client.user.id + 'all'] = true;

            const data = channels.map(async channel => {
                const channelMessages = await fetchAll(Infinity, channel, client);
                if (channelMessages.length > 0) channelMessages.filter(c => c.deletable).forEach(m => m ? messages.push(m) : false);
            })
            
            await Promise.all(data);

            for (const msg of messages.sort(() => Math.random() - 0.5).values()) {
                try {
                    await msg.delete();
                    await client.sleep(10000);
                } catch (error) { false }
            }

            return delete dataObject[client.user.id + 'all'];
        }

        if (dataObject[client.user.id + 'normal']) return message.edit("***Une commande clear est déjà en cours***");
        dataObject[client.user.id + 'normal'] = true;
        message.delete().catch(() => false);

        const messages = [];
        const channel = message.mentions.channels.first() || client.channels.cache.get(args[0]) || message.channel;
        const messagesFetched = await fetchAll(Number(args[0]) ? parseInt(args[0]) : Infinity, channel, client);
        messagesFetched.map(arrays => arrays.map(m => messages.push(m)))

        if (args[0] == 'reverse' || args[1] == 'reverse') messages.reverse();
            
        for (let i = 0; i < messages?.length ?? 0; i += 2) {
            console.log(messages[i])
            await Promise.all([
                client.api.channels[messages[i]?.channel_id].messages[messages[i]?.id].delete(),
                client.api.channels[messages[i+1]?.channel_id].messages[messages[i+1]?.id].delete()
            ]);
            await client.sleep(2500);
        }
        delete dataObject[client.user.id + 'normal'];
    }
}

/**
 * @param {string[]} limit
 * @param {Channel} channel
 * @param {Client} client
*/
async function fetchAll(limit, channel, client) {
    const res = await fetch(`https://ptb.discord.com/api/v9/${channel.guild ? `guilds/${channel.guild.id}` : `channels/${channel.id}`}/messages/search?author_id=${client.user.id}&channel_id=${channel.id}&sort_by=timestamp&sort_order=desc&offset=0`, {
        method: 'GET',
        headers: { authorization: client.token }
    })

    if (!res.ok) return false;
    
    const data = await res.json();
    return data.messages.splice(0, limit);
}