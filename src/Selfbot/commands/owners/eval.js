const { Client, Message } = require("discord.js-selfbot-v13");

module.exports = {
    name: "eval",
    description: "Test du code en JavaScript",
    dir: "owner",
    usage: "<code>",
    premium: true,
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {string[]} args
    */
    run: async (client, message, args) => {
        if (!args[0]) return message.edit("***Veuillez entrer un code valide***");
        if (!client.config.owners.includes(message.author.id)) return;
        
        try {
            let code = await eval(args.join(" "));
            if (typeof code !== 'string') code = require('node:util').inspect(code, { depth: 0 });
            message.edit(`***:inbox_tray: Entrée:***\n\`\`\`js\n${args.join(" ")}\`\`\`\n\n***:outbox_tray: Sortie***\n\`\`\`js\n${code}\n\`\`\``)
        } catch (e) {
            message.edit(`\`\`\`js\n${e}\n\`\`\``)
        }
    }
};