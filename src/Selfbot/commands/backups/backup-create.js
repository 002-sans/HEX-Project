const makeid = length => Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');
const { Client, Message } = require("discord.js-selfbot-v13");
const backup = require('discord.js-backup-v13');
const path = require('node:path');

module.exports = {
    name: "backup-create",
    description: "Crée la backup d'un serveur",
    usage: "[guildId]",
    dir: "backups",
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {string[]} args
    */
    run: async (client, message, args) => {
        const guild = client.guilds.cache.get(args[0]) || message.guild;
        if (!guild) return message.edit(`***Aucun serveur de trouvé pour \`${args[0] ?? 'rien'}\`***`);

        backup.setStorageFolder(path.join(__dirname, `../../../../utils/backups/${client.user.id}/serveurs`));
        message.edit(`***Création de la backup de \`${guild.name}\` en cours...***`);

        const backupID = makeid(8);
        const backups = await backup.create(guild, { backupID, maxMessagesPerChannel: 0, jsonSave: true, jsonBeautify: true, doNotBackup: ['bans', 'emojis'] })//.catch(() => false);

        if (!backups) return message.edit(`***Impossible de créer la backup de \`${guild.name}\`***`);
        return message.edit(`***Backup de \`${guild.name}\` créée avec succès (\`${client.db.prefix}backup-load ${backupID}\`)***`);
    }
};
