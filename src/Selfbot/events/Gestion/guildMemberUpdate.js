const { Client, GuildMember } = require('discord.js-selfbot-v13');

module.exports = {
    name: "guildMemberUpdate",
    once: false,
    /**
     * @param {GuildMember} oldMember
     * @param {GuildMember} newMember
     * @param {Client} client
    */
    run: async (oldMember, newMember, client) => {
        if (!client.db.filter(c => c.guildId == newMember.guild.id).length) return;

        await newMember.guild.members.fetch().catch(() => false);
        const addedRoles = newMember.roles.cache.filter(role => !oldMember.roles.cache.has(role.id));
        const oldRoles = oldMember.roles.cache.filter(role => !newMember.roles.cache.has(role.id));

        for (const role of oldRoles.values()) {
            const limitRole = client.db.limitrole.find(r => r.id === role.id || r.ID === role.id);
            
            const max = limitRole.max ?? limitRole.max;
            const membersWithRole = newMember.guild.members.cache.filter(m => m.roles.cache.has(roleData.id)).size;

            const newName = `${roleData.name.replace(/\s*\[\d+\/\d+\]$/, '')} [${membersWithRole}/${max}]`;
            if (roleData.name !== newName)
                roleData.setName(newName);
        }

        for (const role of addedRoles.values()) {
            const limitRole = client.db.limitrole.find(r => r.id === role.id || r.ID === role.id);
            if (limitRole) {
                const max = limitRole.max ?? limitRole.max;
                const membersWithRole = newMember.guild.members.cache.filter(m => m.roles.cache.has(role.id)).size;

                const newName = `${role.name.replace(/\s*\[\d+\/\d+\]$/, '')} [${membersWithRole}/${max}]`;
                if (role.name !== newName) 
                    role.setName(newName);

                if (membersWithRole > max) {
                    await newMember.roles.remove(role.id, "Limite de membres atteinte pour ce rôle");
                }
            }
        }
    }
}