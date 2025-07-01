const platforms = ['desktop', 'samsung', 'xbox', 'ios', 'android', 'ps4', 'ps5'];
const { Client, Message, MessageAttachment, RichPresence } = require("discord.js-selfbot-v13");
const types = ['playing', 'listening', 'watching', 'competing', 'streaming'];

module.exports = {
    name: "rpc",
    description: "Modifie votre RPC par défaut",
    dir: "status",
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {string[]} args
    */
    run: async (client, message, args) => {
        switch (args[0]) {

            default:
                const text = [
                    `\`${client.db.prefix}rpc on\`・Active le RPC`,
                    `\`${client.db.prefix}rpc off\`・Désactive le RPC`,
                    `\`${client.db.prefix}rpc name\`・Modifie/Supprime le nom du RPC`,
                    `\`${client.db.prefix}rpc details\`・Modifie/Supprime les details du RPC`,
                    `\`${client.db.prefix}rpc state\`・Modifie/Supprime le state du RPC`,
                    `\`${client.db.prefix}rpc type\`・Modifie le type du RPC`,
                    `\`${client.db.prefix}rpc platform\`・Modifie la plateforme affiché`,
                    `\`${client.db.prefix}rpc smallimage\`・Modifie/Supprime la petite image du RPC`,
                    `\`${client.db.prefix}rpc largeimage\`・Modifie/Supprime la grande image du RPC`,
                    `\`${client.db.prefix}rpc button\`・Modifie/Supprime le premier bouton du RPC`,
                    `\`${client.db.prefix}rpc button2\`・Modifie/Supprime le deuxième bouton du RPC`,
                ]

                if (client.db.type === "image") {
                    const image = await client.card("RPC", client.db.image, text.map(r => r.split('・')[0].replaceAll('`', '')));
                    message.edit({ content: null, files: [new MessageAttachment(image, 'rpc.png')] });
                }
                else message.edit(`> ***${client.db.name} RPC***\n${text.join('\n')}`);
                break;

            case 'on':
                if (client.db.rpc.status) return message.edit("***Le RPC est déjà activé***");
                message.edit("***Le RPC a été activé***");
                client.db.rpc.status = true;
                client.save();
                client.multiRPC();
                break;

            case 'off':
                if (!client.db.rpc.status) return message.edit("***Le RPC est déjà désactivé***");
                message.edit("***Le RPC a été désactivé***");
                client.db.rpc.status = false;
                client.save();
                client.multiRPC();
                break;

            case 'name':
                message.edit(`***Le nom du RPC a été ${args[1] ? 'modifié' : 'supprimé'}***`)
                client.db.rpc.name = args.slice(1).join(' ') || 'ㅤ';
                client.save();
                client.multiRPC();
                break;

            case 'details':
                message.edit(`***Les details du RPC ont été ${args[1] ? 'modifiés' : 'supprimés'}***`);
                args[1] ? client.db.rpc.details = args.slice(1).join(' ') : delete client.db.rpc.details;
                client.save();
                client.multiRPC();
                break;

            case 'state':
                message.edit(`***Le state du RPC a été ${args[1] ? 'modifié' : 'supprimé'}***`);
                args[1] ? client.db.rpc.state = args.slice(1).join(' ') : delete client.db.rpc.state;
                client.save();
                client.multiRPC();
                break;

            case 'type':
                if (types.includes(args[1]?.toLowerCase())) return message.edit(`***Veuillez entrer un des type suivants: ${types.map(r => `\`${r}\``).join(', ')}***`);
                message.edit('***Le type du RPC a été modifié***');
                client.db.rpc.type = args[1].toUpperCase();
                client.save();
                client.multiRPC();
                break;

            case 'platform':
                if (platforms.includes(args[1]?.toLowerCase())) return message.edit(`***Veuillez entrer une des plateformes suivantes: ${platforms.map(r => `\`${r}\``).join(', ')}***`);
                message.edit('***Le type du RPC a été modifié***');
                client.db.rpc.platform = args[1]
                client.save();
                client.multiRPC();
                break;

            case 'smallimage':
                if (!args[1]) {
                    if (client.db.rpc.assets['small_image']) delete client.db.rpc.assets['small_image'];
                    if (client.db.rpc.assets['small_text']) delete client.db.rpc.assets['small_text'];
                    if (Object.keys(client.db.rpc.assets).length == 0) delete client.db.rpc.assets;

                    client.save();
                    client.multiRPC();
                    return message.edit("***La petite image du RPC a été supprimée***")
                }

                const getExtendURL = await RichPresence.getExternal(client, "1352297034669101117", args[1].replace("http://", "https://"));
                if (Array.isArray(getExtendURL) && getExtendURL.length > 0 && getExtendURL[0].external_asset_path) {
                    if (!client.db.rpc.assets) client.db.rpc.assets = {};

                    client.db.rpc.assets['small_image'] = 'mp:' + getExtendURL[0].external_asset_path;

                    if (args[2]) client.db.rpc.assets['small_text'] = args.slice(2).join(' ');
                    else delete client.db.rpc.assets['small_text'];

                    client.save();
                    client.multiRPC();
                    message.edit("***La petite image du RPC a été modifiée***");
                }
                else message.edit("***Erreur lors de l'obtention de l'URL***");
                break;

            case 'largeimage':
                if (!args[1]) {
                    if (client.db.rpc.assets['large_image']) delete client.db.rpc.assets['large_image'];
                    if (client.db.rpc.assets['large_text']) delete client.db.rpc.assets['large_text'];
                    if (Object.keys(client.db.rpc.assets).length == 0) delete client.db.rpc.assets;

                    client.save();
                    client.multiRPC();
                    return message.edit("***La grande image du RPC a été supprimée***")
                }

                const getExtendURL2 = await RichPresence.getExternal(client, "1352297034669101117", args[1].replace("http://", "https://"));
                if (Array.isArray(getExtendURL2) && getExtendURL2.length > 0 && getExtendURL2[0].external_asset_path) {
                    if (!client.db.rpc.assets) client.db.rpc.assets = {};

                    client.db.rpc.assets['large_image'] = 'mp:' + getExtendURL2[0].external_asset_path;

                    if (args[2]) client.db.rpc.assets['large_text'] = args.slice(2).join(' ');
                    else delete client.db.rpc.assets['large_text'];

                    client.save();
                    client.multiRPC();
                    message.edit("***La grande image du RPC a été modifiée***");
                }
                else message.edit("***Erreur lors de l'obtention de l'URL***");
                break;

            case 'button':
                if (!args[1] || !args[2]) {
                    if (client.db.rpc.metadata['button_urls']) client.db.rpc.metadata.button_urls[0] = null
                    if (client.db.rpc.metadata && !client.db.rpc.metadata.button_urls.filter(a => typeof a == 'string').length) delete client.db.rpc.metadata;

                    if (client.db.rpc.buttons && client.db.rpc.buttons.length == 1) client.db.rpc.buttons.splice(0, 1)
                    if (client.db.rpc.buttons && client.db.rpc.buttons.length == 2) client.db.rpc.buttons[0] = null;
                    if (client.db.rpc.buttons && !client.db.rpc.buttons.filter(a => typeof a == 'string').length) delete client.db.rpc.buttons;

                    client.save();
                    client.multiRPC();
                    message.edit("***Le premier bouton du RPC a été supprimé***");
                }
                else {
                    if (!client.db.rpc.buttons) client.db.rpc.buttons = [args.slice(2).join(' ')];
                    else client.db.rpc.buttons[0] = args.slice(2).join(' ');

                    if (!client.db.rpc.metadata) client.db.rpc.metadata = {};
                    if (!client.db.rpc.metadata['button_urls']) client.db.rpc.metadata['button_urls'] = [args[1]]
                    else client.db.rpc.metadata['button_urls'][0] = args[1]

                    client.save();
                    client.multiRPC();
                    message.edit("***Le premier bouton du RPC a été modifié***")
                }
                break;

            case 'button2':
                if (!args[1] || !args[2]) {
                    if (client.db.rpc.metadata['button_urls']) client.db.rpc.metadata.button_urls.splice(1, 1)
                    if (client.db.rpc.metadata && !client.db.rpc.metadata.button_urls.filter(a => typeof a == 'string').length) delete client.db.rpc.metadata;

                    if (client.db.rpc.buttons) client.db.rpc.buttons.splice(1, 1)
                    if (client.db.rpc.buttons && !client.db.rpc.buttons.filter(a => typeof a == 'string').length) delete client.db.rpc.buttons;

                    client.save();
                    client.multiRPC();
                    message.edit("***Le second bouton du RPC a été supprimé***");
                }
                else {
                    if (!client.db.rpc.buttons) client.db.rpc.buttons = [null, args.slice(2).join(' ')];
                    else client.db.rpc.buttons[1] = args.slice(2).join(' ');

                    if (!client.db.rpc.metadata) client.db.rpc.metadata = {};
                    if (!client.db.rpc.metadata['button_urls']) client.db.rpc.metadata['button_urls'] = [null, args[1]]
                    else client.db.rpc.metadata['button_urls'][1] = args[1]

                    client.save();
                    client.multiRPC();
                    message.edit("***Le second bouton du RPC a été modifié***");
                }
                break;

        }
    }
};