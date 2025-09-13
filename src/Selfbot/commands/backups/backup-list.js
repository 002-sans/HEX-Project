const { Client, Message } = require("discord.js-selfbot-v13");
const backup = require('discord.js-backup-v13');
const path = require('node:path');

module.exports = {
    name: "backup-list",
    description: "Affiche la liste de vos backups",
    dir: "backups",
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {string[]} args
    */
    run: async (client, message, args) => {
        backup.setStorageFolder(path.join(__dirname, `../../../../utils/backups/${client.user.id}/serveurs`));
        
        const backups = [];
        const backupList = await backup.list().catch(() => false);
        if (!backupList || backupList.length == 0) return message.edit("***Vous n'avez aucune backup à supprimer***");

        for (const backupId of backupList.map(r => r)) {
            const data = await backup.fetch(backupId).catch(() => false);
            if (data) backups.push(data);
        }

        const backupInfos = (await Promise.all(backups
            .sort((a, b) => a.data.name.localeCompare(b.data.name))
            .map((e, i) => `- \`${e.data.name}\`・${e.id}`)
        )).join('\n')
  
        message.edit(`> ***${client.db.name} Backup List***\n${backupInfos}`);
    }
}