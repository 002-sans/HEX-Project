const { Client, Message } = require("discord.js-selfbot-v13");
const backup = require('discord.js-backup-v13');
const path = require('node:path');

module.exports = {
    name: "backup-info",
    description: "Affiche les informations d'une backup",
    dir: "backups",
    usage: "<backupID>",
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {string[]} args
    */
    run: async (client, message, args) => {
        backup.setStorageFolder(path.join(__dirname, `../../../../utils/backups/${client.user.id}/serveurs`));
        
        const backupData = await backup.fetch(args[0]).catch(() => false);
        if (!backupData || !args[0]) return message.edit(`***Aucune backup de trouvée pour \`${args[0] ?? 'rien'}\`***`);

        message.edit(`> ***Informations de la backup \`${backupData.data.name}\`***\n- \`Nom du serveur\`・${backupData.data.name}\n- \`ID du serveur\`・${backupData.data.guildID}\n- \`Icone du serveur\`・${backupData.data.iconURL ? `[Lien de l'icone](${backupData.data.iconURL})` : 'Aucune'}\n- \`Bannière du serveur\`・${backupData.data.bannerURL ? `[Lien de la bannière](${backupData.data.bannerURL})` : 'Aucune'}\n- \`Splash du serveur\`・${backupData.data.splashURL ? `[Lien de la bannière d'invitation](${backupData.data.splashURL})` : 'Aucune'}\n- \`Taille du fichier\`・${backupData.size} KB\n- \`Crée\`・<t:${Math.round(backupData.data.createdTimestamp / 1000)}:R>`)
    }
}