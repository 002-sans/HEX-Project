const { Client, Message } = require("discord.js-selfbot-v13");

module.exports = {
    name: "autobump",
    description: "Affiche le menu de l'autobump",
    dir: "gestion",
    premium: true,
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {string[]} args
    */
    run: async (client, message, args) => {
        let channel = message.mentions.channels.first() || client.channels.cache.get(args[1]) || await client.channels.fetch(args[1]).catch(() => { });
        if (!channel || !args[1]) channel = message.channel;

        switch (args[0]) {
            case 'add':
                if (channel.type !== "GUILD_TEXT")
                    return message.edit("***Veuillez entrer un salon textuel valide***");

                if (client.db.autobump.includes(channel.id))
                    return message.edit(`***Le salon ${channel} est deja un autobump***`);

                channel.sendSlash('302050872383242240', 'bump').catch(() => false);
                client.db.autobump.push(channel.id);
                client.save();

                message.edit(`***L'autobump a ete active sur le salon ${channel}***`);
                break;

            case 'del':
                if (!client.db.autobump.includes(channel.id))
                    return message.edit(`***Le salon ${channel} n'est pas un autobump***`);

                client.db.autobump = client.db.autobump.filter(c => c !== channel.id);
                client.save();

                message.edit(`***Le salon ${channel} a ete retire de l'autobump***`);
                break;

            case 'list':
                message.edit(`> ***Liste des auto bumps***\n${!client.db.autobump.length ? 'Aucun Salon' :
                    client.db.autobump.map(r => `- <#${r}>`).join('\n')
                    }`)
                break;

            default:
                const text = [
                    `- \`${client.db.prefix}autobump add <channelId>\`・Ajoute un salon a l'autobump`,
                    `- \`${client.db.prefix}autobump del <channelId>\`・Retire un salon de l'autobump`,
                    `- \`${client.db.prefix}autobump list\`・Affiche la liste des autobumps`,
                    `- \`${client.db.prefix}autobump\`・Affiche ce menu`,
                ];

                if (client.db.type === "image") {
                    const image = await client.card("Autobump", client.db.image, text.map(r => r.split('・')[0].replaceAll('`', '')));
                    message.edit({ content: null, files: [new MessageAttachment(image, 'Autobump.png')] });
                }
                else message.edit(`> ***${client.db.name} Auto Bump***\n${text.join('\n')}`);
                break;
        }
    }
};