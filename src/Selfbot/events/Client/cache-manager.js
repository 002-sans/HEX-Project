const { Client } = require('discord.js-selfbot-v13');

/**
 * Gestionnaire de cache pour l'antiraid
 * Maintient les caches des positions des salons, rôles et structure des catégories
 */
module.exports = {
    /**
     * Initialise tous les caches nécessaires pour l'antiraid
     * @param {Client} client 
     */
    initializeCaches(client) {
        if (!client.channelData) client.channelData = new Map();
        if (!client.roleData) client.roleData = new Map();
        if (!client.antiraid) client.antiraid = new Map();

        client.guilds.cache.forEach(guild => {
            this.initializeGuildCaches(guild, client);
        });
    },

    /**
     * Initialise les caches pour un serveur spécifique
     * @param {Guild} guild 
     * @param {Client} client 
     */
    initializeGuildCaches(guild, client) {
        guild.channels.cache.forEach(channel => {
            client.channelData.set(channel.id, {
                id: channel.id,
                name: channel.name,
                type: channel.type,
                position: channel.position,
                parentId: channel.parentId,
                topic: channel.topic,
                nsfw: channel.nsfw,
                bitrate: channel.bitrate,
                userLimit: channel.userLimit,
                rateLimitPerUser: channel.rateLimitPerUser,
                permissionOverwrites: channel.permissionOverwrites?.cache.map(overwrite => ({
                    id: overwrite.id,
                    allow: overwrite.allow.bitfield.toString(),
                    deny: overwrite.deny.bitfield.toString(),
                    type: overwrite.type
                })) || []
            });
        });

        guild.roles.cache.forEach(role => {
            client.roleData.set(role.id, {
                id: role.id,
                name: role.name,
                color: role.color,
                hoist: role.hoist,
                mentionable: role.mentionable,
                permissions: role.permissions,
                position: role.position
            });
        });

        guild.channels.cache
            .filter(channel => channel.type === "GUILD_CATEGORY")
            .forEach(category => {
                const children = category.children.map(child => child.id);
                client.antiraid.set(category.id, children);
            });
    },

    /**
     * Met à jour le cache des parents de salons
     */
    updateChannelParentCache(channel, oldParentId, newParentId, client) {
        if (oldParentId && client.antiraid.has(oldParentId)) {
            const oldChildren = client.antiraid.get(oldParentId);
            const index = oldChildren.indexOf(channel.id);
            if (index !== -1) {
                oldChildren.splice(index, 1);
            }
        }

        if (newParentId) {
            if (!client.antiraid.has(newParentId)) {
                client.antiraid.set(newParentId, []);
            }
            const newChildren = client.antiraid.get(newParentId);
            if (!newChildren.includes(channel.id)) {
                newChildren.push(channel.id);
            }
        }
    },

    /**
     * Met à jour les données d'un salon dans le cache (pour les utilisateurs WL)
     */
    updateChannelData(channel, client) {
        if (client.channelData && client.channelData.has(channel.id)) {
            client.channelData.set(channel.id, {
                id: channel.id,
                name: channel.name,
                type: channel.type,
                position: channel.position,
                parentId: channel.parentId,
                topic: channel.topic,
                nsfw: channel.nsfw,
                bitrate: channel.bitrate,
                userLimit: channel.userLimit,
                rateLimitPerUser: channel.rateLimitPerUser,
                permissionOverwrites: channel.permissionOverwrites?.cache.map(overwrite => ({
                    id: overwrite.id,
                    allow: overwrite.allow.bitfield.toString(),
                    deny: overwrite.deny.bitfield.toString(),
                    type: overwrite.type
                })) || []
            });
        }
    },

    /**
     * Met à jour les données d'un rôle dans le cache (pour les utilisateurs WL)
     */
    updateRoleData(role, client) {
        if (client.roleData && client.roleData.has(role.id)) {
            client.roleData.set(role.id, {
                id: role.id,
                name: role.name,
                color: role.color,
                hoist: role.hoist,
                mentionable: role.mentionable,
                permissions: role.permissions,
                position: role.position
            });
        }
    },

    /**
     * Ajoute un nouveau salon au cache
     */
    addChannelToCache(channel, client) {
        client.channelData.set(channel.id, {
            id: channel.id,
            name: channel.name,
            type: channel.type,
            position: channel.position,
            parentId: channel.parentId,
            topic: channel.topic,
            nsfw: channel.nsfw,
            bitrate: channel.bitrate,
            userLimit: channel.userLimit,
            rateLimitPerUser: channel.rateLimitPerUser,
            permissionOverwrites: channel.permissionOverwrites?.cache.map(overwrite => ({
                id: overwrite.id,
                allow: overwrite.allow.bitfield.toString(),
                deny: overwrite.deny.bitfield.toString(),
                type: overwrite.type
            })) || []
        });

        if (channel.parentId && client.antiraid.has(channel.parentId)) {
            client.antiraid.get(channel.parentId).push(channel.id);
        }
    },

    /**
     * Ajoute un nouveau rôle au cache
     */
    addRoleToCache(role, client) {
        client.roleData.set(role.id, {
            id: role.id,
            name: role.name,
            color: role.color,
            hoist: role.hoist,
            mentionable: role.mentionable,
            permissions: role.permissions,
            position: role.position
        });
    },

    /**
     * Repositionne correctement un salon selon son type et sa position d'origine
     */
    async repositionChannel(channel, cachedData, guild, client) {
        try {
            if (cachedData.parentId) {
                const parent = guild.channels.cache.get(cachedData.parentId);
                if (parent) {
                    await channel.setParent(parent).catch(() => false);
                }
            }

            if (cachedData.type === "GUILD_CATEGORY") {
                await channel.setPosition(cachedData.position).catch(() => false);
            } else if (cachedData.parentId) {
                const parent = guild.channels.cache.get(cachedData.parentId);
                if (parent) {
                    const siblings = parent.children
                        .filter(c => c.type === cachedData.type)
                        .sort((a, b) => a.position - b.position);

                    let targetPosition = cachedData.position;
                    if (siblings.size > 0) {
                        const maxPosition = Math.max(...siblings.map(c => c.position));
                        targetPosition = Math.min(cachedData.position, maxPosition + 1);
                    }

                    await channel.setPosition(targetPosition).catch(() => false);
                }
            } else {
                await channel.setPosition(cachedData.position).catch(() => false);
            }
        } catch (error) {
            console.log(`❌ Erreur lors du repositionnement de ${channel.name}:`, error.message);
        }
    },

    /**
     * Repositionne correctement un rôle selon sa position d'origine
     */
    async repositionRole(role, cachedData, guild, client) {
        try {
            await role.setPosition(cachedData.position).catch(() => false);
        } catch (error) {
            console.log(`❌ Erreur lors du repositionnement du rôle ${role.name}:`, error.message);
        }
    },

    /**
     * Met à jour les IDs des catégories dans les caches des salons enfants
     * Ceci inclut les salons supprimés qui seront recréés plus tard
     */
    updateChildrenCategoryIds(oldCategoryId, newCategoryId, client) {
        let updatedCount = 0;
        for (const [channelId, channelData] of client.channelData.entries()) {
            if (channelData.parentId === oldCategoryId) {
                channelData.parentId = newCategoryId;
                client.channelData.set(channelId, channelData);
                updatedCount++;
                console.log(`📝 Cache du salon ${channelData.name} mis à jour: ${oldCategoryId} → ${newCategoryId}`);
            }
        }
        console.log(`✅ ${updatedCount} caches de salons mis à jour pour pointer vers la nouvelle catégorie`);
    }
};