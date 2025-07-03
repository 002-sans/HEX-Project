const { Client, Message } = require("discord.js-selfbot-v13");
const codes = require('../../../../codes.json');
const fs = require('node:fs');

module.exports = {
    name: "premium",
    description: "Active le premium du bot",
    usage: "[code]",
    dir: "settings",
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {string[]} args
    */
    run: async (client, message, args) => {
        if (!args[0] && !client.premium.actif) return message.edit(`***Vous n'êtes pas premium du bot***`);
        if (client.premium.actif) return message.edit(`\`\`\`💲 VOUS ETES UN MEMBRE PREMIUM 💲\`\`\`\n- \`Code\`・${client.db.premium}\n- \`Expire\`・<t:${Math.round(client.premium.expiresAt / 1000)}:R>\n- \`Utilisé\`・<t:${Math.round(client.premium.redeemedAt / 1000)}:R>`)

        if (!Object.keys(codes).includes(args[0].toLowerCase())) return message.edit(`***Le code \`${args[0]}\` est invalide***`);
        if (codes[args[0]].used) return message.edit(`***Le code est déjà utilisé par une autre personne***`);

        codes[args[0]] = {
            used: true,
            actif: true,
            code: args[0],
            by: client.user.id,
            expiresAt: Date.now() + ms(codes[args[0]].expiresAt),
            redeemedAt: Date.now()
        }

        client.premium = codes[args[0]];
        client.db.premium = args[0];
        client.save()
        client.saveCode();

        fs.writeFileSync('./codes.json', JSON.stringify(codes, null, 4));
        message.edit(`***Vous avez activé la version premium du bot !***`);
    }
};

function ms(timeString) {
    const match = timeString.match(/(\d+)([smhdwy])/);
    if (!match) return null;
    
    const value = parseInt(match[1]);
    const unit = match[2];
    
    switch (unit) {
        case 's': return value * 1000;
        case 'm': return value * 60 * 1000;
        case 'h': return value * 60 * 60 * 1000;
        case 'd': return value * 24 * 60 * 60 * 1000;
        case 'w': return value * 7 * 24 * 60 * 60 * 1000;
        case 'y': return value * 365 * 24 * 60 * 60 * 1000;
        default: return null;
    }
}