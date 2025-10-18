const { Client, Message } = require("discord.js-selfbot-v13");

module.exports = {
    name: "info",
    description: "Affiche les informations d'une sourate",
    dir: "islam",
    usage: "[sourate]",
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {string[]} args
    */
    run: async (client, message, args) => {
        const sourate = Number(args[0]) ? args[0] : Math.floor(Math.random() * 114) + 1;

        if (sourate < 1 || sourate > 114)
            return message.edit("***Veuillez entrer un nombre d'une sourate entre 1 et 114***");

        const res = await fetch('https://cdn.jsdelivr.net/gh/fawazahmed0/quran-api@1/info.json');
        if (!res)
            return message.edit("***Contact avec l'API impossible***");

        const data = await res.json();
        if (!data.chapters)
            return message.edit("***Probleme rencontre lors de la recuperation des versets***");

        const verset = data.chapters.find(c => c.chapter == sourate);
        message.edit(`***Chapitre:*** \`n°${verset.chapter}\`\n***Nom de la sourate:*** \`${verset.name}\`***Nom de la sourate (anglais):*** \`${verset.englishname}\`\n***Nom de la sourate (arabe):*** \`${verset.arabicname}\`\n***Nombre de versets:*** \`n°${verset.verses.length}/${data.verses.count}\`\n***Lieu de la Revelation:*** \`${verset.revelation}\``);
    }
};