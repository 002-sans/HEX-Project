const { SlashCommandBuilder, Client, Message, ChatInputCommandInteraction } = require("discord.js");

module.exports = 
{
    name: "premium",
    description: "Gère les premiums.",
    aliases: [],
    guildOwnerOnly: false,
    botOwnerOnly: false,
    staffOnly: true,
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {string} args 
    */
    async execute(client, message, args) 
    {},
    /**
     * @param {Client} client
     * @param {ChatInputCommandInteraction} interaction
    */
    async executeSlash(client, interaction) 
    {
        switch(interaction.options.getSubcommand()){
            case 'create':
                // Crée un code
                // Ajoute l'expiration avec ms (function perso)
                // Envoie à un utilisateur (si donner)
        }
    },
    get data() 
    {
        return new SlashCommandBuilder()
            .setName(this.name)
            //.setContexts([0, 1, 2])
            .setDescription(this.description)
            .addSubcommand(o =>
                o.setName('create')
                .setDescription("Crée un code premium")
                .addStringOption(o =>
                    o.setName('temps')
                    .setDescription("La durée du code premium")
                    .addChoices([
                        { name: '3 Jours (essaie)', value: '3d' },
                        { name: '7 Jours', value: '7d' },
                        { name: '14 Jours', value: '14d' },
                        { name: '31 Jours', value: '31d' },
                        { name: '2 Mois', value: '62d' },
                        { name: '3 Mois', value: '93d' },
                        { name: '6 Mois', value: '186d' },
                        { name: '1 an', value: '1y' },
                    ])
                    .setRequired(true)
                )
                .addUserOption(o =>
                    o.setName('utilisateur')
                    .setDescription("L'utilisateur à qui donner le code")
                    .setRequired(false)
                )
            )
    }
}