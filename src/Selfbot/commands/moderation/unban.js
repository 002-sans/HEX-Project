const { Client, Message } = require("discord.js-selfbot-v13");

module.exports = {
    name: "unban",
    description: "Débanni un/tous les utilisateur(s) du serveur",
    dir: "moderation",
    usage: "<membre/all>",
    permission: "BAN_MEMBERS",
    premium: true,
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {string[]} args
    */
    run: async (client, message, args) => {
        if (!message.guild) return message.edit("***Cette commande ne peut être utilisée que sur un serveur***");
        
        switch(args[0]){
            case 'all':
                const bans = await message.guild.bans.fetch().catch(() => false);
                if (!bans || bans.size == 0) return message.edit("***Il n'y a aucun membre banni sur ce serveur***");

                bans.forEach(ban => message.guild.bans.remove(ban.user).catch(() => false));
                message.edit(`***\`${bans.size}\` utilisateurs ont été débannis***`);

                break;

            default:
                const user = message.mentions.users.first() || client.users.cache.get(args[0]) || await client.users.fetch(args[0]).catch(() => false);
                if (!user || !args[0]) return message.edit(`***Aucun utilisateur de trouvé pour \`${args[0] ?? 'rien'}\`***`);

                message.guild.bans.remove(user)
                    .then( () => message.edit(`***\`${user.displayName}\` a été débanni***`))
                    .catch(() => message.edit(`***\`${user.displayName}\` n'a pas pu être débanni***`));
                
                break;
        }
    }
};