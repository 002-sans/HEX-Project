const { Client, Message, MessageAttachment } = require("discord.js-selfbot-v13");
const rpc = require('../../../structures/setgame.json');

module.exports = {
    name: "setgame",
    description: "Met un RPC pré configuré de jeux",
    dir: "status",
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {string[]} args
    */
    run: async (client, message, args) => {
        switch (true) {

            default:
                const text = [
                    `\`${client.db.prefix}setgame <on/off>\`・Gerrer le rpc du jeu`,
                    `\`${client.db.prefix}setgame platform\`・Choisir une platform pour le rpc du jeu`,
                    `\`${client.db.prefix}setgame clear\`・Supprime le rpc du jeu`,
                    `\`${client.db.prefix}setgame acs\`・Assasin's Creed Shadows`,
                    `\`${client.db.prefix}setgame osu\`・Osu!`,
                    `\`${client.db.prefix}setgame cs2\`・Counter Strike 2`,
                    `\`${client.db.prefix}setgame destiny\`・Destiny2`,
                    `\`${client.db.prefix}setgame minecraft\`・Minecraft`,
                    `\`${client.db.prefix}setgame cod\`・Warzone`,
                    `\`${client.db.prefix}setgame gtav\`・GTA V`,
                    `\`${client.db.prefix}setgame gtavi\`・GTA VI`,
                    `\`${client.db.prefix}setgame ow\`・OverWatch 2`,
                    `\`${client.db.prefix}setgame r6\`・Rainbow Six Siege`,
                    `\`${client.db.prefix}setgame s4\`・The Sims 4`,
                    `\`${client.db.prefix}setgame lol\`・League of Legends`,
                    `\`${client.db.prefix}setgame valorant\`・Valorant`,
                    `\`${client.db.prefix}setgame rl\`・Rocket League`,
                    `\`${client.db.prefix}setgame fallguys\`・Fall Guys`,
                    `\`${client.db.prefix}setgame rdr2\`・Red Dead Redemption 2`,
                    `\`${client.db.prefix}setgame apex\`・Apex Legends`,
                    `\`${client.db.prefix}setgame fortnite\`・Fortnite`,
                    `\`${client.db.prefix}setgame resident\`・Resident Evil Village`,
                    `\`${client.db.prefix}setgame fifa24\`・FC 24`,
                    `\`${client.db.prefix}setgame rbx\`・Roblox`,
                    
                ]

                if (client.db.type === "image") {
                    const image = await client.card("SetGame", client.db.image, text.map(r => r.split('・')[0].replaceAll('`', '')));
                    message.edit({ content: null, files: [new MessageAttachment(image, 'setgame.png')] });
                }
                else message.edit(`> ***${client.db.name} SetGame***\n${text.join('\n')}`);
                break;

            case Object.keys(rpc).includes(args[0]):
                Object.entries(rpc[args[0]]).forEach(([key, value]) => {
                    if (typeof value == 'string' && key == 'platform') rpc[args[0]][key] = client.db.setgame.platform;
                });
                
                rpc[args[0]].status = client.db.setgame.status;
                client.db.setgame = rpc[args[0]];

                client.save();
                client.multiRPC();
                message.edit(`***Le status du RPC a été modifié et tu es sur ${rpc[args[0]].name}***`)
                break;

            case args[0] == 'platform':
                if (!["desktop", "ps4", "ps5", "xbox", "samsung"].includes(args[1]))
                    return message.edit(`***Veuillez choisir une de ses platformes: ${["desktop", "ps4", "ps5", "xbox", "samsung"].map(r => `\`${r}\``).join(', ')}***`)

                message.edit(`***La platforme a été modifiée***`);
                client.db.setgame.platform = args[1];

                client.save();
                client.multiRPC();
                break;

            case args[0] == "on":
                client.db.setgame.status = true;
                client.save();
                client.multiRPC();
                message.edit("***Le rpc a été activé***");
                break;

            case args[0] == "off":
                client.db.setgame.status = false;
                client.save();
                client.multiRPC();
                message.edit("***Le rpc a été désactivé***");
                break;
        }
    }
};

/**
 * @param {string} type
 * @returns {Array<string>}
*/
function getType(type){
    switch(type){
        case 0: return "Joue à";
        case 1: return "Stream";
        case 2: return "Ecoute";
        case 3: return "Regarde";
        case 5: return "Participe à";
    }
}