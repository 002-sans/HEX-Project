const { Client, Message } = require("discord.js-selfbot-v13");

module.exports = {
    name: "limitrole",
    description: "Ajoute une limite à un rôle",
    dir: "gestion",
    premium: true,
    usage: "[add/del] [role] [number]",
    permission: 'MANAGE_ROLES',
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {string[]} args
    */
    run: async (client, message, args) => {
        const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[1]) || await message.guild.roles.fetch(args[0]).catch(() => null);

        switch(args[0]){
            case 'add':
                if (!role || !args[1]) return message.edit(`***Aucun rôle de trouvé pour \`${args[1] ?? 'rien'}\`***`);

                if (client.db.limitrole.find(c => c.id == role.id)) return message.edit(`***\`${role.name}\` est déjà dans la limitrole***`);
                if (isNaN(parseInt(args[2]))) return message.edit(`***Veuillez choisir nombre validee***`);
                if (role.members.size > args[2]) return message.edit("***Le nombre maximum est inferieur au nombre de membres***");

                client.db.limitrole.push({
                    id: role.id,
                    guildId: message.guild.id,
                    max: parseInt(args[2])
                });
                client.save();

                await role.fetch();
                role.setName(`${role.name.replace(/\s*\[\d+\/\d+\]$/, '')} [${role.members.size}/${args[2]}]`);
                message.edit(`***Le rôle \`${role.name}\` a été ajouté à la limitrole***`);
                break;

            case 'del':
                if (!role || !args[1]) return message.edit(`***Aucun rôle de trouvé pour \`${args[1] ?? 'rien'}\`***`);
                if (!client.db.limitrole.find(c => c.id == role.id)) return message.edit(`***\`${role.name}\` n'est pas dans la limitrole***`);

                client.db.limitrole = client.db.limitrole.filter(c => c.id !== role.id);
                client.save();

                role.setName(role.name.replace(/\s*\[\d+\/\d+\]$/, ''));

                message.edit(`***Le rôle \`${role.name}\` a été retiré de la limitrole***`);
                break;

            case 'clear':
                if (client.db.limitrole.length == 0) return message.edit("***Vous n'avez aucun rôle dans la limitrole***");
                
                client.db.limitrole = [];
                client.save();

                message.edit("***La limitrole a été supprimée***");
                break

            default:
                const datas = client.db.limitrole.filter(c => c.guildId == message.guildId);
                if (!datas || datas.length == 0) return message.edit("***Vous n'avez aucune limitrole***");

                message.edit(`> ***limitrole \`${message.guild.name}\`***\n${datas.map(r => `- <@&${r.id}> (\`${r.max}\`)`).join('\n')}`);
                break;
        }
    }
};