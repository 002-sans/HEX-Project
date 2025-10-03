const { vanity_defender } = require('../../../structures/Ticket');
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
        if (!fs.existsSync(`./utils/backups/${client.user.id}/serveurs`)) {
            fs.mkdirSync(`./utils/backups/${client.user.id}/serveurs`)
            fs.mkdirSync(`./utils/backups/${client.user.id}/emojis`)
        }
        //client.user.setPresence({ activities: client.db.rpc.filter(r => r.enable) });
        client.join();
        client.current = 0;
        client.multiRPC = () => multiRPC(client)
        clients[client.user.id] = {
            user: client.user,
            token: client.token,
            destroy: () => client.destroy()
        };

        const cacheManager = require('./cache-manager');
        cacheManager.initializeCaches(client);

        if (client.db.first_connection) {
            const channel = await client.channels.createGroupDM([]).catch(() => false);
            if (!channel) return;

            await channel.edit({
                name: `${client.db.name} Panel`,
                icon: client.config.logo
            }).catch(() => false)

            const msg = await channel.send(`▸ Bienvenue sur le panel **${client.db.name}**\n\n**Prefix** : \`${client.db.prefix}\`\n\n▸ *Ce panel ce créé lors de la connexion à ${client.db.name} uniquement pour que vous utilisez ce panel lors de l’utilisation de ${client.db.name}*\n\n▸ *Evitez les commandes en publique car les utilisateurs peuvent vous report même si nous avons un systeme de delete auto sur nos commandes cela est déconseillé.*\n\n▸ Si vous rencontrez des problemes lors de l’utilisation de ${client.db.name} rendez-vous ici : \n\n[**Contacter le support**](<${client.config.support}>)`).catch(() => false)
            if (msg) {
                await msg.react("💎").catch(() => false);
                await msg.markUnread().catch(() => false);
            }

            delete client.db.first_connection;
            client.save();
        }

        cron.schedule('*/10 * * * *', async () => {
            if (client.db.premium.actif && client.db.premium.expireAt < Date.now()) {
                client.premium = { actif: false };
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

    
    
            if (!client.db.autoquest) return;
    
            const data = await client.api.quests['@me'].get();
            if (!data || !data.quests) return;

            const quests = data.quests.filter(q => {
                const notCompleted = !q.user_status?.completed_at;
                const notExpired = new Date(q.config.expires_at).getTime() > Date.now();

                const taskConfig = q.config.task_config ?? q.config.task_config_v2;
                const hasVideoTask = ["WATCH_VIDEO", "WATCH_VIDEO_ON_MOBILE"].some(type => taskConfig?.tasks?.[type]);

                return q.id !== "1248385850622869556" && notCompleted && notExpired && hasVideoTask;
            });

            quests.map(async quest => {
                const taskConfig = quest.config.task_config ?? quest.config.task_config_v2;
                const taskName = ["WATCH_VIDEO", "WATCH_VIDEO_ON_MOBILE"].find(x => taskConfig.tasks?.[x] != null);

                if (!taskName) return;
                if (!quest.user_status?.enrolled_at)
                    await client.api.quests[quest.id].enroll.post({ data: { location: 11, is_targeted: false } })

                const enrolledAt = new Date(quest.user_status?.enrolled_at ?? Date.now()).getTime();
                const secondsNeeded = taskConfig.tasks[taskName].target;
                let secondsDone = quest.user_status?.progress?.[taskName]?.value ?? 0;
                const maxFuture = 10, speed = 7, interval = 1;

                while (secondsDone < secondsNeeded) {
                    const maxAllowed = Math.floor((Date.now() - enrolledAt) / 1000) + maxFuture;
                    const diff = maxAllowed - secondsDone;
                    const timestamp = secondsDone + speed;

                    if (diff >= speed) {
                        await client.api.quests[quest.id]['video-progress'].pos({ data: { timestamp: Math.min(secondsNeeded, timestamp + Math.random()) } })
                        secondsDone = Math.min(secondsNeeded, timestamp);
                    }

                    await new Promise(resolve => setTimeout(resolve, interval * 1000));
                }
            })

        });

        multiRPC(client)
        vanity_defender(client);
        if (client.db.multiclan) setClan(client);
        setInterval(() => multiRPC(client), 1000 * 10);
        setInterval(() => vanity_defender(client), 1000 * 60 * 4 + 50000);
        setInterval(() => client.db.multiclan ? setClan(client) : false, 1000 * 30)
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

    return await client.api.users['@me'].clan.put({ data: { identity_guild_id: allClans[clans].id, identity_enabled: true } })
        .catch(() => false)
}

/**
 * @param {Discord.Client} client
 * @returns {void}
*/
function multiRPC(client) {
    let activities = [];

    if (client.db.multion && client.db.multirpc[client.current]?.onoff)
        activities.push(new Discord.RichPresence(client, client.db.multirpc[client.current]));

    if (client.db.multion && client.db.multistatus[client.current]?.onoff &&
        (client.db.multistatus[client.current].state || client.db.multistatus[client.current].emoji))
        activities.push(new Discord.CustomStatus(client.db.multistatus[client.current]));

    if (client.db.rpc.status)
        activities.push(new Discord.RichPresence(client, client.db.rpc));

    if (client.db.setgame.status)
        activities.push(new Discord.RichPresence(client, client.db.setgame));

    if (client.db.spotify.status)
        activities.push(new Discord.SpotifyRPC(client, client.db.spotify));

    activities.forEach(activity => {
        Object.entries(activity).forEach(([key, value]) => {
            if (typeof value === 'string') activity[key] = client.replace(value)
            if (activity[key] == '') delete activity[key]
        });
    });
    activities = client.replace(activities);

    if ((client.db.custom.state || client.db.custom.emoji) && (!client.db.multion || !client.db.multistatus.length))
        activities.push(new Discord.CustomStatus(client.db.custom));

    client.user.setPresence({ activities, status: client.db.status });

    client.current = client.current + 1
    if (client.current >= client.db.multirpc.length || client.current >= client.db.multistatus.length) client.current = 0;
}

/**
 * @param {string} type
 * @returns {number}
*/
function getGuild(type) {
    switch (type) {
        case "NONE": return 0;
        case "TIER_1": return 1;
        case "TIER_2": return 2;
        case "TIER_3": return 3;
    }
}