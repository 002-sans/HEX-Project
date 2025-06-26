const Discord = require('discord.js-selfbot-v13');
const cron = require('node-cron');
const fs = require('node:fs')
let clans = 0;

module.exports = {
    name: "ready",
    once: true,
    /**
     * @param {Discord.Client} client
    */
    run: async (client) => {
        console.log(`[SELFBOT] ${client.user.displayName} est connecté`);
		if (!fs.existsSync(`./utils/backups/${client.user.id}`)) fs.mkdirSync(`./utils/backups/${client.user.id}`)
		if (!fs.existsSync(`./utils/backups/${client.user.id}/serveurs`)){
			fs.mkdirSync(`./utils/backups/${client.user.id}/serveurs`)
			fs.mkdirSync(`./utils/backups/${client.user.id}/emojis`)
		}
        //client.user.setPresence({ activities: client.db.rpc.filter(r => r.enable) });
        client.join();

        clients[client.user.id] = { 
            user: client.user, 
            token: client.token, 
            destroy: () => client.destroy() 
        };

        if (client.db.first_connection){
            const channel = await client.channels.createGroupDM([]).catch(() => false);
            if (!channel) return;

            await channel.edit({
                name: `${client.db.name} Panel`,
                icon: 'https://i.imgur.com/RhuPIv7.jpeg'                
            }).catch(() => false)
            
            const msg = await channel.send(`▸ Bienvenue sur le panel **${client.db.name}**\n\n**Prefix** : \`${client.db.prefix}\`\n\n▸ *Ce panel ce créé lors de la connexion à ${client.db.name} uniquement pour que vous utilisez ce panel lors de l’utilisation de ${client.db.name}*\n\n▸ *Evitez les commandes en publique car les utilisateurs peuvent vous report même si nous avons un systeme de delete auto sur nos commandes cela est déconseillé.*\n\n▸ Si vous rencontrez des problemes lors de l’utilisation de ${client.db.name} rendez-vous ici : \n\n[**Contacter le support**](<https://discord.gg/XVmkYPbaCH>)`).catch(() => false)
            if (msg) {
                await msg.react("💎").catch(() => false);
                await msg.markUnread().catch(() => false);
            }
            
            client.db.first_connection = false;
            client.save();
        }

        cron.schedule('*/10 * * * *', () => {
            if (client.db.premium.actif && client.db.premium.expireAt < Date.now()) {
                client.premium = {actif: false};
                client.save();
            }

            client.db.counter.forEach(o => {
                const channel = client.channels.cache.get(o.channelId);
                if (channel) channel.setName(newMessage.content
                    .replaceAll('{memberCount}', message.guild.memberCount)
                    .replaceAll('{roleCount}', message.guild.roles.cache.size)
                    .replaceAll('{boostCount}', message.guild.premiumSubscriptionCount)
                    .replaceAll('{guildLeveel}', getGuild(message.guild.premiumTier))
                ).catch(() => false);
            })
        });

        if (client.db.multiclan) setClan(client);
        setInterval(() => client.db.multiclan ? setClan(client) : false, 1000 * 20)
    }
}

/**
 * @async
 * @param {Client} client
 * @returns {Promise<Response>}
*/
async function setClan(client) {
    const allClans = client.guilds.cache.filter(g => g.features.includes('GUILD_TAGS')).map(g => g);
    if (!allClans.length) return;

    clans++
    if (clans >= allClans.length) clans = 0;

    return await fetch('https://discord.com/api/v10/users/@me/clan', {
        method: "PUT",
        headers: { authorization: client.token, 'Content-Type': 'application/json' },
        body: JSON.stringify({ identity_guild_id: allClans[clans].id, identity_enabled: true }),
    })
    .catch(() => false)
}

function getGuild(type){
    switch(type){
        case "NONE": return 0;
        case "TIER_1": return 1;
        case "TIER_2": return 2;
        case "TIER_3": return 3;
    }
}