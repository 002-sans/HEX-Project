const { SlashCommandBuilder, Client, Message, ChatInputCommandInteraction } = require("discord.js");
const codes = require('../../../../codes.json');

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
        switch(interaction.options.getSubcommand())
        {
            case 'create':
                const keyName = interaction.options.getString('nom') ?? Math.floor(10000000 + Math.random() * 90000000);
                const temps = interaction.options.getString('temps');
                const user = interaction.options.getUser('utilisateur');
                
                if (isNaN(client.ms(temps))) return interaction.reply({ content: 'Veuillez entrer un temps valide', flags: 64 });
                if (codes[keyName]) return interaction.reply({ content: 'Une clé avec ce nom existe déjà', flags: 64 });

                codes[keyName] = { expiresAt: temps };
                client.saveCode();

                if (user) user.send(`**\`🔑\`・Vous avez reçu une clé premium\n\`⏳\`・La clé expire <t:${Math.round((Date.now() + client.ms(temps)) / 1000)}:R> (\`${keyName}\`)**`)
                    .then(() => interaction.reply({ content: `\`✅\`・La clé premium \`${keyName}\` (expire <t:${Math.round((Date.now() + client.ms(temps)) / 1000)}:R>) a été envoyé à ${user}`,  flags: 64 }))
                    .catch(e => interaction.reply({ content: `\`❌\`・La clé premium n'a pas pu être envoyé à ${user}.\n\`🔑\`・La clé expire <t:${Math.round((Date.now() + client.ms(temps)) / 1000)}:R> (\`${keyName}\`)`, flags: 64 }))

                else interaction.reply({ content: `\`✅\`・La clé premium \`${keyName}\` (expire <t:${Math.round((Date.now() + client.ms(temps)) / 1000)}:R>) a bien été crée`,  flags: 64 });
                break;

            case 'list':
                const keys = Object.keys(codes);
                if (keys.length === 0) return interaction.reply({ content: "Aucune clé premium n'a été trouvée", flags: 64 });

                const embed = {
                    title: 'Liste des clés premium',
                    description: keys.map(key => `\`${key}\` - Expire <t:${Math.round(codes[key].expiresAt / 1000)}:R> ${codes[key].used ? `- <@${codes[key].by}>` : ''}`).join('\n'),
                    color: 0x000000,
                }

                interaction.reply({ embeds: [embed], flags: 64 });
                break;

            case 'show':
                const userPremium = interaction.options.getUser('utilisateur');
                if (!userPremium) return interaction.reply({ content: 'Veuillez spécifier un utilisateur valide', flags: 64 });

                break;
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
                .addStringOption(o => 
                    o.setName('nom')
                    .setDescription('Le nom customisé de la clé premium')
                    .setMinLength(4)
                    .setMaxLength(10)
                    .setRequired(false)
                )
                .addUserOption(o =>
                    o.setName('utilisateur')
                    .setDescription("L'utilisateur à qui donner le code")
                    .setRequired(false)
                )
            )

            .addSubcommand(o =>
                o.setName('list')
                .setDescription("Affiche la liste des codes premium")
            )
    }
}