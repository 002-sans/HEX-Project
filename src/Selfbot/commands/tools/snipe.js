const { Client, Message } = require("discord.js-selfbot-v13");

module.exports = {
    name: "snipe",
    description: "Affiche les commandes de snipeurl",
    dir: "tools",
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {string[]} args
    */
    run: async (client, message, args) => {
        switch(args[0]){
            default:
                const guild = client.guilds.cache.get(args[0]) || message.guild;
                if (!guild) return message.edit(`***Aucun serveur de trouvé pour \`${args[0] ?? 'rien'}\`***`);
                if (!guild.vanityURLCode) return message.edit(`***Le serveur \`${guild.name}\` n'a pas de lien personnalisé***`);
                message.edit(`***La vanity \`${guild.vanityURLCode}\` sera sur le serveur \`${message.guild.name}\`***`)

                client.db.snipeurl.push({
                    guildID: guild.id,
                    guild: message.guild.id,
                    vanityURLCode: guild.vanityURLCode
                });
                client.save();
                break;

            case 'remove':
                const guildDelete = client.guilds.cache.get(args[1]) || message.guild;
                if (!guildDelete) return message.edit(`***Aucun serveur de trouvé pour \`${args[1] ?? 'rien'}\`***`);

                break;

            case 'list':
                if (!client.db.snipeurl.length) return message.edit("***Vous n'avez snipe en cours.***");
                message.edit(`***Liste des snipes:***\n${client.db.snipeurl.map(c =>  `\`${c.vanityURLCode}\` - ${c.guild}`).join('\n')}`);
                break;
        }
    }
};