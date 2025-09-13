const { Client, Message } = require("discord.js-selfbot-v13");
const backup = require('discord.js-backup-v13');
const path = require('node:path');

module.exports = {
    name: "backup-delete",
    description: "Supprime une backup",
    usage: "<backupID>",
    dir: "backups",
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {string[]} args
    */
    run: async (client, message, args) => {
        backup.setStorageFolder(path.join(__dirname, `../../../../utils/backups/${client.user.id}/serveurs`));
        const backupData = await backup.fetch(args[0]).catch(() => false);
        
        if (!backupData || !args[0]) return message.edit(`***Aucune backup de trouvée pour \`${args[0] ?? 'rien'}\`***`);
        
        backup.remove(backupData.id)
            .then( () => message.edit(`***La backup de \`${backupData.data.name}\` a été supprimée***`))
            .catch(() => message.edit(`***Impossible de supprimer la backup de \`${backupData.data.name}\`***`));
    }
};
