const { Client, Message } = require("discord.js-selfbot-v13");

module.exports = {
    name: "proxy",
    description: "Génère des proxys valides",
    usage: "<type>",
    premium: true,
    dir: "tools",
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {string[]} args
    */
    run: async (client, message, args) => {
        if (!['all', 'http', 'socks4', 'socks5'].includes(args[0])) return message.edit(`> ***Veuillez choisir un type de proxy valide***\n${['all', 'http', 'socks4', 'socks5'].map(r => `- ${r}`).join('\n')}`);

        const r = await fetch(`https://api.proxyscrape.com/?request=displayproxies&proxytype=${args[0]}&timeout=1500`).then(async a => await a.text())
        
        message.edit({
            content: null,
            files: [{
                attachment: Buffer.from(r, 'utf-8'),
                name: `proxy_${args[0]}.txt`
            }]
        })
    }
};
