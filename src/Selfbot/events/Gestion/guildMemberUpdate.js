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
        const addedRoles = newMember.roles.cache.filter(role => !oldMember.roles.cache.has(role.id));

        for (const role of addedRoles.values()) {
            const limitRole = client.db.limitrole.find(r => r.id === roleData.id || r.ID === roleData.id);
            if (limitRole) {
                const roleData = await role.fetch();
                const max = limitRole.max ?? limitRole.MAX;
                const membersWithRole = newMember.guild.members.cache.filter(m => m.roles.cache.has(roleData.id)).size;

                const newName = `${roleData.name.replace(/\s*\[\d+\/\d+\]$/, '')} [${membersWithRole}/${max}]`;
                if (roleData.name !== newName) 
                    roleData.setName(newName);

                if (membersWithRole > max) {
                    await newMember.roles.remove(roleData.id, "Limite de membres atteinte pour ce rôle");
                }
            }
        }
    }
}