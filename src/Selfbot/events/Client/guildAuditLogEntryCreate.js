const { Client, GuildMember, GuildAuditLogsEntry, Guild, PermissionsBitField } = require('discord.js-selfbot-v13');

module.exports = {
    name: "guildAuditLogEntryCreate",
    once: false,
    /**
     * @param {GuildAuditLogsEntry} auditLogEntry
     * @param {Guild} guild
     * @param {Client} client
    */
    run: async (auditLogEntry, guild, client) => {
        const member = guild.members.cache.get(auditLogEntry.executorId) ||
            await guild.members.fetch(auditLogEntry.executorId).catch(() => false);

        if (auditLogEntry.executorId === guild.ownerId ||
            auditLogEntry.executorId === client.user.id ||
            client.db.wl.includes(auditLogEntry.executorId) ||
            !client.db.antiraid.protected.includes(guild.id)) return;

        if (client.db.wl.includes(auditLogEntry.executorId)) {
            updateCacheForWhitelistedUser(auditLogEntry, guild, client);
            return;
        }

        switch (auditLogEntry.action) {
            case 'CHANNEL_CREATE':
                if (!client.db.antiraid.antichannel.etat) return;
                await handleChannelCreate(auditLogEntry, guild, client, member);
                break;

            case 'CHANNEL_UPDATE':
                if (!client.db.antiraid.antichannel.etat) return;
                await handleChannelUpdate(auditLogEntry, guild, client, member);
                break;

            case 'CHANNEL_DELETE':
                if (!client.db.antiraid.antichannel.etat) return;
                await client.sleep(1000);
                await handleChannelDelete(auditLogEntry, guild, client, member);
                break;

            case 'ROLE_CREATE':
                if (!client.db.antiraid.antirole.etat) return;
                await handleRoleCreate(auditLogEntry, guild, client, member);
                break;

            case 'ROLE_DELETE':
                if (!client.db.antiraid.antirole.etat) return;
                await handleRoleDelete(auditLogEntry, guild, client, member);
                break;

            case 'ROLE_UPDATE':
                if (!client.db.antiraid.antirole.etat) return;
                await handleRoleUpdate(auditLogEntry, guild, client, member);
                break;

            case 'BOT_ADD':
                if (!client.db.antiraid.antibot.etat) return;
                await handleBotAdd(auditLogEntry, guild, client, member);
                break;

            case 'MEMBER_BAN_ADD':
                if (!client.db.antiraid.antiban.etat) return;
                await handleMemberBanAdd(auditLogEntry, guild, client, member);
                break;

            case 'MEMBER_BAN_REMOVE':
                if (!client.db.antiraid.antiunban.etat) return;
                await handleMemberBanRemove(auditLogEntry, guild, client, member);
                break;

            case 'MEMBER_KICK':
                if (!client.db.antiraid.antikick.etat) return;
                sltcv(member, client.db.antiraid.antikick.punish);
                break;

            case 'WEBHOOK_CREATE':
                if (!client.db.antiraid.antiwebhook.etat) return;
                await handleWebhookCreate(auditLogEntry, guild, client, member);
                break;

            case 'GUILD_UPDATE':
                if (!client.db.antiraid.antiupdate.etat) return;
                await handleGuildUpdate(auditLogEntry, guild, client, member);
                break;

            case 'MEMBER_UPDATE':
                if (!client.db.antiraid.antirank.etat) return;
                await handleMemberUpdate(auditLogEntry, guild, client, member);
                break;
        }
    }
}

/**
 * Met à jour le cache quand un utilisateur whitelist fait des modifications
 */
function updateCacheForWhitelistedUser(auditLogEntry, guild, client) {
    const cacheManager = require('./cache-manager');

    switch (auditLogEntry.action) {
        case 'CHANNEL_CREATE':
            cacheManager.addChannelToCache(auditLogEntry.target, client);
            break;

        case 'CHANNEL_UPDATE':
            cacheManager.updateChannelData(auditLogEntry.target, client);

            const parentChange = auditLogEntry.changes.find(c => c.key === "parent_id");
            if (parentChange) {
                cacheManager.updateChannelParentCache(auditLogEntry.target, parentChange.old, parentChange.new, client);
            }
            break;

        case 'CHANNEL_DELETE':
            if (client.channelData)
                client.channelData.delete(auditLogEntry.target.id);
            break;

        case 'ROLE_CREATE':
            cacheManager.addRoleToCache(auditLogEntry.target, client);
            break;

        case 'ROLE_UPDATE':
            cacheManager.updateRoleData(auditLogEntry.target, client);
            break;

        case 'ROLE_DELETE':
            if (client.roleData)
                client.roleData.delete(auditLogEntry.target.id);
            break;
    }
}

/**
 * Gère la création de salon (supprime le salon créé par un non-WL)
 */
async function handleChannelCreate(auditLogEntry, guild, client, member) {
    sltcv(member, client.db.antiraid.antichannel.punish);
    await auditLogEntry.target.delete("Anti Channel").catch(() => false);
}

/**
 * Gère la modification de salon (revert les changements)
 */
async function handleChannelUpdate(auditLogEntry, guild, client, member) {
    sltcv(member, client.db.antiraid.antichannel.punish);

    const cachedChannelData = client.channelData?.get(auditLogEntry.target.id);
    if (!cachedChannelData) {
        console.log(`❌ Données du salon ${auditLogEntry.target.id} non trouvées dans le cache`);
        return;
    }

    await auditLogEntry.target.edit({
        name: cachedChannelData.name,
        topic: cachedChannelData.topic,
        nsfw: cachedChannelData.nsfw,
        bitrate: cachedChannelData.bitrate,
        userLimit: cachedChannelData.userLimit,
        rateLimitPerUser: cachedChannelData.rateLimitPerUser
    }).catch(() => false);

    const cacheManager = require('./cache-manager');
    await cacheManager.repositionChannel(auditLogEntry.target, cachedChannelData, guild, client);
}

/**
 * Gère la suppression de salon (recrée le salon avec ses propriétés)
 */
async function handleChannelDelete(auditLogEntry, guild, client, member) {
    sltcv(member, client.db.antiraid.antichannel.punish);

    const cachedChannelData = client.channelData?.get(auditLogEntry.target.id);
    if (!cachedChannelData) {
        console.log(`❌ Données du salon ${auditLogEntry.target.id} non trouvées dans le cache`);
        return;
    }

    const channelData = {
        name: cachedChannelData.name,
        type: cachedChannelData.type,
        topic: cachedChannelData.topic,
        nsfw: cachedChannelData.nsfw,
        bitrate: cachedChannelData.bitrate,
        userLimit: cachedChannelData.userLimit,
        rateLimitPerUser: cachedChannelData.rateLimitPerUser,
        position: cachedChannelData.position,
        permissionOverwrites: cachedChannelData.permissionOverwrites
    };

    const newChannel = await guild.channels.create(channelData.name, channelData).catch(() => false);

    if (newChannel) {
        const cacheManager = require('./cache-manager');

        if (cachedChannelData.type === "GUILD_CATEGORY") {
            const allChildrenToRestore = [];

            for (const [channelId, channelData] of client.channelData.entries()) {
                if (channelData.parentId === auditLogEntry.target.id) {
                    allChildrenToRestore.push(channelId);

                    const existingChannel = guild.channels.cache.get(channelId);
                    if (existingChannel) {
                        await existingChannel.setParent(newChannel).catch(() => false);
                        await cacheManager.repositionChannel(existingChannel, channelData, guild, client);
                        console.log(`✅ Salon existant ${existingChannel.name} remis dans la catégorie ${newChannel.name}`);
                    } else {
                        console.log(`📝 Cache du salon supprimé ${channelData.name} mis à jour pour pointer vers la nouvelle catégorie ${newChannel.name}`);
                    }
                }
            }

            const orphanChannels = guild.channels.cache.filter(channel =>
                !channel.parentId &&
                channel.type !== "GUILD_CATEGORY" &&
                client.channelData.has(channel.id) &&
                client.channelData.get(channel.id).parentId === newChannel.id
            );

            for (const orphanChannel of orphanChannels.values()) {
                await orphanChannel.setParent(newChannel).catch(() => false);
                const orphanData = client.channelData.get(orphanChannel.id);
                await cacheManager.repositionChannel(orphanChannel, orphanData, guild, client);
                console.log(`🔄 Salon orphelin ${orphanChannel.name} récupéré par la catégorie ${newChannel.name}`);

                if (!allChildrenToRestore.includes(orphanChannel.id)) {
                    allChildrenToRestore.push(orphanChannel.id);
                }
            }

            cacheManager.updateChildrenCategoryIds(auditLogEntry.target.id, newChannel.id, client);

            const updatedChildren = allChildrenToRestore.map(oldId => {
                const existingChannel = guild.channels.cache.get(oldId);
                return existingChannel ? existingChannel.id : oldId;
            });

            client.antiraid.set(newChannel.id, updatedChildren);
            await cacheManager.repositionChannel(newChannel, cachedChannelData, guild, client);

            console.log(`✅ Catégorie ${newChannel.name} recréée avec ${allChildrenToRestore.length} enfants`);
        } else {
            if (cachedChannelData.parentId) {
                let parentCategory = guild.channels.cache.get(cachedChannelData.parentId);
                let actualParentId = cachedChannelData.parentId;

                if (!parentCategory) {
                    let originalCategoryName = null;
                    for (const [channelId, channelData] of client.channelData.entries()) {
                        if (channelId === cachedChannelData.parentId && channelData.type === "GUILD_CATEGORY") {
                            originalCategoryName = channelData.name;
                            break;
                        }
                    }

                    if (originalCategoryName) {
                        parentCategory = guild.channels.cache.find(channel =>
                            channel.type === "GUILD_CATEGORY" &&
                            channel.name === originalCategoryName
                        );

                        if (parentCategory) {
                            actualParentId = parentCategory.id;
                            cachedChannelData.parentId = actualParentId;
                            client.channelData.set(auditLogEntry.target.id, cachedChannelData);
                            console.log(`🔄 Cache du salon ${newChannel.name} mis à jour pour pointer vers la catégorie recréée ${parentCategory.name}`);
                        }
                    }
                }

                if (parentCategory) {
                    await newChannel.setParent(parentCategory).catch(() => false);

                    if (!client.antiraid.get(actualParentId)) 
                        client.antiraid.set(actualParentId, []);
                    const categoryChildren = client.antiraid.get(actualParentId);
                    const oldIndex = categoryChildren.indexOf(auditLogEntry.target.id);
                    if (oldIndex !== -1) {
                        categoryChildren[oldIndex] = newChannel.id;
                    } else {
                        categoryChildren.push(newChannel.id);
                    }

                    console.log(`✅ Salon ${newChannel.name} remis dans la catégorie ${parentCategory.name}`);
                } else {
                    console.log(`⚠️ Salon ${newChannel.name} créé sans parent (catégorie ${cachedChannelData.parentId} n'existe pas encore)`);
                }
            }

            await cacheManager.repositionChannel(newChannel, cachedChannelData, guild, client);
        }

        cacheManager.addChannelToCache(newChannel, client);

        client.channelData.delete(auditLogEntry.target.id);
    }
}

/**
 * Gère la création de rôle (supprime le rôle créé)
 */
async function handleRoleCreate(auditLogEntry, guild, client, member) {
    sltcv(member, client.db.antiraid.antirole.punish);
    await auditLogEntry.target.delete().catch(() => false);
}

/**
 * Gère la suppression de rôle (recrée le rôle avec ses propriétés)
 */
async function handleRoleDelete(auditLogEntry, guild, client, member) {
    sltcv(member, client.db.antiraid.antirole.punish);

    const cachedRoleData = client.roleData?.get(auditLogEntry.target.id);
    if (!cachedRoleData) {
        console.log(`❌ Données du rôle ${auditLogEntry.target.id} non trouvées dans le cache`);
        return;
    }

    const roleData = {
        name: cachedRoleData.name,
        color: cachedRoleData.color,
        hoist: cachedRoleData.hoist,
        mentionable: cachedRoleData.mentionable,
        permissions: cachedRoleData.permissions,
        position: cachedRoleData.position
    };

    const newRole = await guild.roles.create(roleData).catch(() => false);

    if (newRole) {
        const cacheManager = require('./cache-manager');

        await cacheManager.repositionRole(newRole, cachedRoleData, guild, client);

        cacheManager.addRoleToCache(newRole, client);

        client.roleData.delete(auditLogEntry.target.id);
    }
}

/**
 * Gère la modification de rôle (revert les changements)
 */
async function handleRoleUpdate(auditLogEntry, guild, client, member) {
    sltcv(member, client.db.antiraid.antirole.punish);

    const cachedRoleData = client.roleData?.get(auditLogEntry.target.id);
    if (!cachedRoleData) {
        console.log(`❌ Données du rôle ${auditLogEntry.target.id} non trouvées dans le cache`);
        return;
    }

    await auditLogEntry.target.edit({
        name: cachedRoleData.name,
        color: cachedRoleData.color,
        hoist: cachedRoleData.hoist,
        mentionable: cachedRoleData.mentionable,
        permissions: cachedRoleData.permissions
    }).catch(() => false);

    const cacheManager = require('./cache-manager');
    await cacheManager.repositionRole(auditLogEntry.target, cachedRoleData, guild, client);
}

/**
 * Gère l'ajout de bot (kick le bot)
 */
async function handleBotAdd(auditLogEntry, guild, client, member) {
    sltcv(member, client.db.antiraid.antibot.punish);
    await guild.members.cache.get(auditLogEntry.targetId)?.kick().catch(() => false);
}

/**
 * Gère l'ajout de ban (unban l'utilisateur)
 */
async function handleMemberBanAdd(auditLogEntry, guild, client, member) {
    sltcv(member, client.db.antiraid.antiban.punish);
    await guild.bans.remove(auditLogEntry.target).catch(() => false);
}

/**
 * Gère la suppression de ban (reban l'utilisateur)
 */
async function handleMemberBanRemove(auditLogEntry, guild, client, member) {
    sltcv(member, client.db.antiraid.antiunban.punish);
    await guild.bans.create(auditLogEntry.target).catch(() => false);
}

/**
 * Gère la création de webhook (supprime le webhook)
 */
async function handleWebhookCreate(auditLogEntry, guild, client, member) {
    sltcv(member, client.db.antiraid.antiwebhook.punish);

    const channel = guild.channels.cache.get(auditLogEntry.changes.find(c => c.key === 'channel_id').new);
    if (channel) {
        const webhook = await channel.fetchWebhooks()
            .then(w => w.find(c => c.id == auditLogEntry.targetId))
            .catch(() => false);

        if (webhook) await webhook.delete().catch(() => false);
    }
}

/**
 * Gère la modification du serveur (revert les changements)
 */
async function handleGuildUpdate(auditLogEntry, guild, client, member) {
    sltcv(member, client.db.antiraid.antiupdate.punish);

    await guild.edit({
        name: auditLogEntry.changes.find(k => k.key == 'name')?.old ?? guild.name,
        icon: auditLogEntry.changes.find(k => k.key == "icon_hash")?.old ?? guild.iconURL(),
        splash: auditLogEntry.changes.find(k => k.key == "splash_hash")?.old ?? guild.splashURL(),
        banner: auditLogEntry.changes.find(k => k.key == "banner_hash")?.old ?? guild.bannerURL(),
        description: auditLogEntry.changes.find(k => k.key == "description")?.old ?? guild.description,
        verificationLevel: auditLogEntry.changes.find(k => k.key == "verification_level")?.old ?? guild.verificationLevel,
        defaultMessageNotifications: auditLogEntry.changes.find(k => k.key == "default_message_notifications")?.old ?? guild.defaultMessageNotifications,
        explicitContentFilter: auditLogEntry.changes.find(k => k.key == "explicit_content_filter")?.old ?? guild.explicitContentFilter,
        afkChannelId: auditLogEntry.changes.find(k => k.key == "afk_channel_id")?.old ?? guild.afkChannelId,
        afkTimeout: auditLogEntry.changes.find(k => k.key == "afk_timeout")?.old ?? guild.afkTimeout,
        systemChannelId: auditLogEntry.changes.find(k => k.key == "system_channel_id")?.old ?? guild.systemChannelId,
        rulesChannel: auditLogEntry.changes.find(k => k.key == "rules_channel_id")?.old ?? guild.rulesChannelId,
        publicUpdatesChannel: auditLogEntry.changes.find(k => k.key == "public_updates_channel_id")?.old ?? guild.publicUpdatesChannelId,
        systemChannelFlags: auditLogEntry.changes.find(k => k.key == "system_channel_flags")?.old ?? guild.systemChannelFlags,
        preferredLocale: auditLogEntry.changes.find(k => k.key == "preferred_locale")?.old ?? guild.preferredLocale,
    }).catch(() => false);
}

/**
 * Gère la modification de membre (revert les changements de rôles)
 */
async function handleMemberUpdate(auditLogEntry, guild, client, member) {
    sltcv(member, client.db.antiraid.antirank.punish);

    const newRole = auditLogEntry.changes.find(c => c.key == "$add") ? auditLogEntry.changes.find(c => c.key == "$add").new : [];
    const oldRole = auditLogEntry.changes.find(c => c.key == "$remove") ? auditLogEntry.changes.find(c => c.key == "$remove").new : [];
    const targetMember = guild.members.cache.get(auditLogEntry.targetId) || await guild.members.fetch(auditLogEntry.targetId).catch(() => false);

    if (targetMember) {
        if (newRole.length) await targetMember.roles.remove(newRole.map(r => r.id)).catch(() => false);
        if (oldRole.length) await targetMember.roles.add(oldRole.map(r => r.id)).catch(() => false);
    }
}

/**
 * Met à jour le cache des parents de salons
 */
function updateChannelParentCache(channel, oldParentId, newParentId, client) {
    const cacheManager = require('./cache-manager');
    cacheManager.updateChannelParentCache(channel, oldParentId, newParentId, client);
}

/**
 * @param {GuildMember} member
 * @param {string} punish
*/
function sltcv(member, punish = "derank") {
    if (!member) return;

    switch (punish) {
        case 'mute':
            if (member.moderatable) member.timeout(1000 * 60 * 5).catch(() => false);
            break;

        case 'derank':
            if (member.manageable) member.roles.set([]).catch(() => false);
            break;

        case 'kick':
            if (member.kickable) member.kick().catch(() => false);
            break;

        case 'ban':
            if (member.bannable) member.ban().catch(() => false);
            break;
    }
}