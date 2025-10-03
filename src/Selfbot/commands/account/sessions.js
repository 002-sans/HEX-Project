const { Client, Message, MessageAttachment } = require("discord.js-selfbot-v13");

module.exports = {
    name: "sessions",
    description: "Affiche le menu des sessions",
    dir: "account",
    premium: true,
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {string[]} args
    */
    run: async (client, message, args) => {
        switch(args[0]){
            case 'show':
                const data = await client.api.auth.sessions.get()
                if (data.user_sessions.length == 0) return message.edit("***Vous n'avez aucune session en cours***");
                
                message.edit(`> ***Liste de vos sessions***\n${data.user_sessions.map(r => `- <t:${Math.floor(new Date(r.approx_last_used_time).getTime() / 1000)}:R>・${r.client_info.os}`).join('\n')}`)
                break;

            case 'protect':
                if (!['on', 'off'].includes(args[1])) return message.edit('***Paramètre manquant: `on`/`off`***');

                client.db.sessions.enable = args[1] == 'on' ? true : false;
                client.save();

                message.edit(`***La protection du compte est maintenant \`${args[1] == 'on' ? 'activée' : 'désactivée'}\`***`);
                break;

            case 'wl':
                if (!args[1]) return message.edit('***Veuillez entrer une localisation ou appareil à whitelist***');
                if (client.db.sessions.wl.includes(args[1])) return message.edit(`***\`${args[1]}\` est déjà whitelist***`);

                client.db.sessions.wl.push(args[1]);
                client.save();

                message.edit(`***\`${args[1]}\` est maintenant whitelist***`);
                break;

            case 'unwl':
                if (!args[1]) return message.edit('***Veuillez entrer une localisation ou appareil à unwhitelist***');
                if (!client.db.sessions.wl.includes(args[1])) return message.edit(`***\`${args[1]}\` n'est pas whitelist***`);

                client.db.sessions.wl = client.db.sessiions.wl.filter(c => c !== args[1])
                client.save();

                message.edit(`***\`${args[1]}\` n'est plus whitelist***`);
                break;

            default: 
                const text = [
                    `- \`${client.db.prefix}sessions show\`・Affiche la liste de vos sessions`,
                    `- \`${client.db.prefix}sessions protect on\`・Active la protection du compte`,
                    `- \`${client.db.prefix}sessions protect off\`・Désactive la protection du compte`,
                    `- \`${client.db.prefix}sessions wl [localisation]\`・Whitelist la connexion d'une localisation`,
                    `- \`${client.db.prefix}sessions wl [appareil]\`・Whitelist la connexion d'un appareil`,
                    `- \`${client.db.prefix}sessions unwl <loc/app>\`・Retire un élément de la whitelist`
                ];
            
                if (client.db.type === "image"){
                    const image = await client.card("Sessions", client.db.image, text.map(r => r.split('・')[0].replaceAll('`', '')));
                    message.edit({ content: null, files: [new MessageAttachment(image, 'sessions.png')] });
                }
                else message.edit(`> ***${client.db.name} Sessions***\n${text.join('\n')}`);
                break;
        }
    }
};