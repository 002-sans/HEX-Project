const { Client, Message } = require("discord.js-selfbot-v13");

module.exports = {
    name: "mute",
    description: "Mute un membre du serveur",
    dir: "moderation",
    usage: "<membre/list> [temps]",
    permission: "MODERATE_MEMBERS",
    premium: true,
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {string[]} args
    */
    run: async (client, message, args) => {
        if (!message.guild) return message.edit("***Cette commande ne peut être utilisée que sur un serveur***");
        
        switch(args[0]){
            case 'list':
                await message.guild.members.fetch().catch(() => false)
                const mutes = message.guild.members.cache.filter(m => m.isCommunicationDisabled());
                if (mutes.size === 0) return message.edit("***Aucun membre n'est mute sur ce serveur***");

                message.edit(`> ***Voici la liste des \`${mutes.size}\` membres mutes***\n${mutes.map(r => `- ${r} (\`${r.user.displayName}\` | <t:${Math.round(r.communicationDisabledUntilTimestamp / 1000)}:R>)`).join('\n')}`);
                break;

            default:
                const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || await message.guild.members.fetch(args[0]).catch(() => false);
                let time = ms(args[1]) ? args[1] : '27d';

                if (!member || !args[0]) return message.edit(`***Aucun membre de trouvé pour \`${args[0] ?? 'rien'}\`***`);
                if (!member.moderatable) return message.edit(`***Je n'ai pas la permission de mute \`${member.user.displayName}\`***`);

                member.timeout(ms(time))
                    .then( () => message.edit(`***\`${member.user.displayName}\` a été mute pendant \`${time.replace('d', 'j')}\`***`))
                    .catch(() => message.edit(`***\`${member.user.displayName}\` n'a pas pu être mute***`));

                break;
        }
    }
};

function ms(timeString) {
    if (!timeString) return null;
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