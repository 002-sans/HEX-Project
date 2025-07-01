const { Client, Message, MessageAttachment } = require("discord.js-selfbot-v13");
const rpc = require('../../../structures/rpc.json');

module.exports = {
    name: "setrpc",
    description: "Met un RPC pré configuré",
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
                    `\`${client.db.prefix}rpc <on/off>\`・Active ou désactive le RPC`,
                    `\`${client.db.prefix}setrpc clear\`・Supprime le RPC`,
                    `\`${client.db.prefix}setrpc js\`・JavaScript RPC`,
                    `\`${client.db.prefix}setrpc python\`・Python RPC`,
                    `\`${client.db.prefix}setrpc cpp\`・C++ RPC`,
                    `\`${client.db.prefix}setrpc twitch\`・Twitch RPC`,
                    `\`${client.db.prefix}setrpc tiktok <text>\`・TikTok RPC`,
                    `\`${client.db.prefix}setrpc youtube <text>\`・YouTube RPC`,
                    `\`${client.db.prefix}setrpc netflix <text>\`・Netflix RPC`,
                    `\`${client.db.prefix}setrpc ph <text>\`・Pornhub RPC`,
                    `\`${client.db.prefix}setrpc disney+ <text>\`・Disney + RPC`,
                    `\`${client.db.prefix}setrpc ubereats <text>\`・Uber Eats RPC`,
                    `\`${client.db.prefix}setrpc photoshop <text>\`・Photoshop RPC`,
                    `\`${client.db.prefix}setrpc kali <text>\`・Kali Linux RPC`,
                ]
                
                if (client.db.type === "image") {
                    const image = await client.card("Set RPC", client.db.image, text.map(r => r.split('・')[0].replaceAll('`', '')));
                    message.edit({ content: null, files: [new MessageAttachment(image, 'setrpc.png')] });
                }
                else message.edit(`> ***${client.db.name} SetRPC***\n${text.join('\n')}`);
                break;

            case args[0] == "clear":
                client.db.rpc.status = false;

                client.save();
                client.multiRPC();
                message.edit("***Le RPC a été supprimé***");
                break;

            case Object.keys(rpc).includes(args[0]):
                Object.entries(rpc[args[0]]).forEach(([key, value]) => {
                    if (typeof value === 'string') {
                        rpc[args[0]][key] = value.replace('{args}', args.slice(1).join(' ') || client.db.name);
                    }
                
                    if (typeof value === 'object' && value !== null) {
                        if (key === "timestamps" && "start" in value) {
                            rpc[args[0]][key].start = Date.now();
                        }
                    }
                });
                
                rpc[args[0]].status = client.db.rpc.status;
                client.db.rpc = rpc[args[0]];
                
                client.save();
                client.multiRPC();

                message.edit(`***Le status du RPC a été modifié et tu ${getType(rpc[args[0]].type)} ${args.slice(1).join(' ') || client.db.name} sur ${rpc[args[0]].name}***`);
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