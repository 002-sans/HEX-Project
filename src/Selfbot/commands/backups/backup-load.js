const { Client, Message } = require("discord.js-selfbot-v13");
const backup = require('discord-backup');
const path = require('node:path');

module.exports = {
    name: "backup-load",
    description: "Charge une backup dans le serveur actuel",
    usage: "<backupID>",
    permission: "ADMINISTRATOR",
    dir: "backups",
    premium: true,
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {string[]} args
    */
    run: async (client, message, args) => {
        if (!message.guild) return message.edit(`***Aucun serveur de trouvé pour \`${args[0] ?? 'rien'}\`***`);

        backup.setStorageFolder(path.join(__dirname, `../../../../utils/backups/${client.user.id}/serveurs`));
        const backupData = await backup.fetch(args[0]).catch(() => false);

        if (!backupData || !args[0]) return message.edit(`***Aucune backup de trouvée pour \`${args[0] ?? 'rien'}\`***`);

        client.data['backup'] = Date.now() + 1000 * 60 * 20;
        setTimeout(() => delete client.data['backup'], 1000 * 60 * 20);

        await backup.load(backupData.id, message.guild).catch(() => false);
    }
};
