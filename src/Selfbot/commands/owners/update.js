const { Client, Message } = require("discord.js-selfbot-v13");
const { exec } = require('node:child_process');

module.exports = {
    name: "update",
    description: "Met a jour la machine",
    dir: "owner",
    owner: true,
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {string[]} args
    */
    run: async (client, message, args) => {
        exec('git stash', (err, stdout, stderr) => {
            if (err) return message.edit(`***Erreur lors du git stash: ${err}***`);

            exec('git pull', async (err, stdout, stderr) => {
                if (err) return message.edit(`***Erreur lors de la mise a jour: ${err}***`);
                if (stdout.includes('Already up to date')) return message.edit('***La machine est deja a jour***');

                await message.edit(`***La machine a ete mise a jour.\nRedemarrage dans <t:${Math.round(Date.now() + 5000)}:R>***`)
                await client.sleep(5000);
                await message.delete();
                
                exec('pm2 restart 1337');
            })
        });
    }
};