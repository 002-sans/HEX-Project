const { Client, Message } = require("discord.js-selfbot-v13");
const { exec } = require('node:child_process');

module.exports = {
    name: "update",
    description: "Met à jour la machine",
    dir: "owner",
    owner: true,
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {string[]} args
    */
    run: async (client, message, args) => {
        exec('git stash', (err, stdout, stderr) => {
            if (err) 
                return message.edit(`***Erreur lors du \`git stash\` :***\n\`\`\`${err}\`\`\``);

            exec('git pull', async (err, stdout, stderr) => {
                if (err) 
                    return message.edit(`***Erreur lors de la mise à jour :***\n\`\`\`${err}\`\`\``);

                if (stdout.includes('Already up to date')) 
                    return message.edit('***La machine est déjà à jour.***');

                await message.edit(`***📥 La machine a été mise à jour.\n🔁 Redémarrage dans <t:${Math.round((Date.now() + 5000) / 1000)}:R>***`);
                
                await new Promise(res => setTimeout(res, 5000));
                await message.delete();

                exec('pm2 restart 1337');
            });
        });
    }
};
