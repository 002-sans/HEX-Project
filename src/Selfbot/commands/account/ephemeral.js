const { Client, Message, MessageAttachment } = require("discord.js-selfbot-v13");

module.exports = {
    name: "ephemeral",
    description: "Affiche le menu d'ephemerals",
    dir: "account",
    premium: true,
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {string[]} args
    */
    run: async (client, message, args) => {
        switch (args[0]) {
            case 'on':
                if (client.db.ephemeral.enable) return message.edit('***Les messages éphémérals sont déjà activés***');

                client.db.ephemeral.enable = true;
                client.save();

                message.edit("***Les messages éphémérals ont été `activés`***");
                break;

            case 'off':
                if (!client.db.ephemeral.enable) return message.edit('***Les messages éphémérals sont déjà désactivés***');

                client.db.ephemeral.enable = false;
                client.save();

                message.edit("***Les messages éphémérals ont été `désactivés`***");
                break;

            case 'wl':
                const channel = message.mentions.channels.first() ||
                    client.channels.cache.get(args[1]) ||
                    message.mentions.users.first()?.dmChannel ||
                    client.users.cache.get(args[1])?.dmChannel;

                const guild = client.guilds.cache.get(args[1]) ||
                    client.guilds.cache.find(g => g.name.toLowerCase().includes(args[1]?.toLowerCase));

                if (!channel && !guild) return message.edit(`***Aucun salon ou serveur de trouvé pour \`${args[1] ?? 'rien'}\`***`);

                if (channel){
                    if (client.db.ephemeral.channels.includes(channel.id))
                        return message.edit(`***Le salon ${channel} est déjà whitelist***`);
    
                    client.db.ephemeral.channels.push(channel.id);
                    client.save();

                    return message.edit(`***Le salon ${channel} a été ajouté à la whitelist***`);
                }

                if (guild){
                    if (client.db.ephemeral.guilds.includes(guild.id))
                        return message.edit(`***Le serveur ${guild.name} est déjà whitelist***`);
    
                    client.db.ephemeral.guilds.push(guild.id);
                    client.save();

                    return message.edit(`***Le serveur ${guild.name} a été ajouté à la whitelist***`);
                }
                break;

            case 'unwl':
                if (args[1] == 'all') {
                    client.db.ephemeral.guilds = [];
                    client.db.ephemeral.channels = [];
                    client.save();

                    return message.edit(`***La whitelist a été supprimée***`);
                }


                if (client.db.ephemeral.channels.includes(args[1])){
                    if (!client.db.ephemeral.channels.includes(args[1]))
                        return message.edit(`***Le salon ${args[1]} n'est pas whitelist***`);
    
                    client.db.ephemeral.channels = client.db.ephemeral.channels.filter(id => id !== args[1]);
                    client.save();

                    return message.edit(`***Le salon avec comme ID \`${args[1]}\` a été retiré de la whitelist***`);
                }

                if (client.db.ephemeral.guilds.includes(args[1])){
                    if (!client.db.ephemeral.guilds.includes(args[1]))
                        return message.edit(`***Le serveur ${args[1]} n'est pas whitelist***`);
    
                    client.db.ephemeral.guilds = client.db.ephemeral.guilds.filter(id => id !== args[1]);
                    client.save();

                    return message.edit(`***Le serveur avec comme ID \`${args[1]}\` a été retiré de la whitelist***`);
                }
                else message.edit(`***Aucun salon ou serveur de trouvé pour \`${args[1] ?? 'rien'}\`***`);
                break;

            case 'list':
                message.edit(`***Salons:***\n${client.db.ephemeral.channels.length == 0 ? 'Aucun salon' : client.db.ephemeral.channels.map(c => `<#${c}> (\`${c}\`)`).join('\n')}
                              
                              ***Serveurs:***\n${client.db.ephemeral.guilds.length == 0 ? 'Aucun serveur' : client.db.ephemeral.guilds.map(c => `${client.guilds.cache.get(c)?.name ?? c} (\`${c}\`)`).join('\n')}`.replaceAll('  ', ''))
                break;

            default:
                const text = [
                    `- \`${client.db.prefix}ephemeral on\`・Active les messages éphémères`,
                    `- \`${client.db.prefix}ephemeral off\`・Désctive les messages éphémères`,
                    `- \`${client.db.prefix}ephemeral wl [channelId]\`・Supprime la suppression dans un salon`,
                    `- \`${client.db.prefix}ephemeral wl [guildId]\`・Supprime la suppression d'un serveur`,
                    `- \`${client.db.prefix}ephemeral unwl [channelId]\`・Retire un salon de la whitelist`,
                    `- \`${client.db.prefix}ephemeral unwl [guildId]\`・Retire un serveur de la whitelist`,
                    `- \`${client.db.prefix}ephemeral unwl all\`・Réinitialise vos ephemerals`,
                    `- \`${client.db.prefix}ephemeral list\`・Affiche la liste des salons et serveurs ephemeral`,
                ];

                if (client.db.type === "image") {
                    const image = await client.card("Messages Ephemerals", client.db.image, text.map(r => r.split('・')[0].replaceAll('`', '')));
                    message.edit({ content: null, files: [new MessageAttachment(image, 'ephemerals.png')] });
                }
                else message.edit(`> ***${client.db.name} Ephemerals***\n${text.join('\n')}`);
                break;
                break;
        }
    }
};