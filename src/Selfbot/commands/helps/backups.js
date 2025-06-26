const { Client, Message, MessageAttachment } = require("discord.js-selfbot-v13");
const page = 'backups'

module.exports = {
    name: page,
    description: "Affiche les commandes backups",
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {string[]} args
    */
    run: async (client, message, args) => {
        const perPage = 13; 
        let separation = 0;
        
        for (const file of client.commands.filter(c => c.dir == page).values()) {
            const { name, usage = '' } = client.commands.find(c => c.name == file.name);
            const length = " » ".length + client.db.prefix.length + name.length + usage.length;
            if (!separation || separation < length) separation = length;
        }

        switch(client.db.type){
            default:
                message.edit(`> ***${client.db.name} ${page.charAt(0).toUpperCase() + page.slice(1).toLowerCase()}***\n${client.commands.filter(c => c.dir == page).map(fileData => `\`${client.db.prefix}${fileData.name}${fileData.usage ? ` ${fileData.usage}` : ''}\`・${fileData.description ?? 'Aucune description'} ${fileData.premium && !client.premium.actif ? '|*「Premium Requis」*' : ''}`).join('\n')}`)
                break;

            case 'speed':
                message.edit(`⛧ __**${client.db.name} ${page.charAt(0).toUpperCase() + page.slice(1).toLowerCase()}**__ ⛧\n${client.commands.filter(c => c.dir == page).map(fileData => `\`${client.db.prefix}${fileData.name}${fileData.usage ? ` ${fileData.usage}` : ''}\` ➜ ***${fileData.description ?? 'Aucune description'} ${fileData.premium && !client.premium.actif ? '|*「Premium Requis」*' : ''}***`).join('\n')}`);
                break;

            case 'nighty':
                message.edit(`\`\`\`ini\n${client.commands.filter(c => c.dir == page).map(fileData => `[ ${client.db.prefix}${fileData.name}${fileData.usage ? ` ${fileData.usage}` : ''}] ${fileData.description ?? 'Aucune description'} ${fileData.premium && !client.premium.actif ? '|*「Premium Requis」*' : ''}`).join('\n')}\`\`\``);
                break;

            case 'codeblock':
                message.edit('>>> ' + `⛧ __**${client.db.name} ${page.charAt(0).toUpperCase() + page.slice(1).toLowerCase()}**__ ⛧\`\`\`ansi\n <> = Obligatoire | [] = Optionnel\`\`\`\`\`\`ansi\n${client.commands.filter(c => c.dir == page).map(command => `${client.db.prefix}${command.name}${command.usage ? command.usage : ''} ${" ".repeat(separation- " » ".length - client.db.prefix.length - command.name.length - (command.usage?.length ?? 0))} » ${command.description ?? 'Aucune description'} ${command.premium && !client.premium.actif ? '|*「Premium Requis」*' : ''}`).join('\n')}\`\`\``.replaceAll(" <", " [2;31m<").replaceAll("> ", ">[0m ").replaceAll(" [", " [2;34m[").replaceAll("] ", "][0m "))
                break;
                
            case 'image':
                const pageImage = Math.max(1, parseInt(args[0], 10) || 1);
                const startIndex = (pageImage - 1) * perPage;
                const paginatedCommandes = client.commands.filter(c => c.dir == page).map(fileData => `${client.db.prefix}${fileData.name} ${fileData.usage ?? ''} ${client.commands.filter(c => c.dir == fileData.name).length > 13 ? "[2]" : ''} ${fileData.premium && !client.premium.actif ? '|「Premium Requis」' : ''}`).slice(startIndex, startIndex + perPage);

                if (paginatedCommandes.length === 0) return message.edit(`***Page \`${pageImage}\` invalide***`);

                const image = await client.card(client.db.name, client.db.image, paginatedCommandes);
                message.edit({ content: null, files: [new MessageAttachment(image, `${page}.png`)] });
                break;
        }
    }
};