const { Client, Message } = require("discord.js-selfbot-v13");
const backup = require('discord.js-backup-v13');
const path = require('node:path');

module.exports = {
    name: "backup-purge",
    description: "Supprime toutes vos backups",
    dir: "backups",
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {string[]} args
    */
    run: async (client, message, args) => {
        backup.setStorageFolder(path.join(__dirname, `../../../../utils/backups/${client.user.id}/serveurs`));

        const backupList = await backup.list().catch(() => false);
        if (!backupList || backupList.length) return message.edit("***Vous n'avez aucune backup à supprimer***");

        backupList.forEach(backupId => backup.remove(backupId).catch(() => false));
        message.edit(`***\`${backupList.length}\` backups ont été supprimées***`);
    }
}