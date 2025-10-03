const { Client, Message } = require("discord.js-selfbot-v13");

module.exports = {
    name: "catalogue",
    description: "Affiche les animes qui vont sortir",
    dir: "utiles",
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {string[]} args
    */
    run: async (client, message, args) => {
        const type = args[0] == 'day' ? 'day' : 'timeline';
        const res = await fetch('https://api-v3.hyakanime.fr/agenda/' + type)
            .then(r => r.json())
            .catch(() => false);

        if (!res) return message.edit("***Connexion avec l'API impossible***");


        switch(type){
            case 'day':
                const listAnime = res.map((anime) => ({
                    ...anime,
                    timestamp: Number(anime.episode?.timestamp),
                })).sort((a, b) => a.timestamp - b.timestamp);
                message.edit(
                    listAnime.map(anime => {
                        const timestamp = Math.floor(new Date(anime.episode?.timestamp ?? Date.now()) / 1000);
                        const episodeTitle = anime.episode?.title ?? "Épisode sans titre";
                        const animeTitle = anime.episode?.animeTitle 
                            ? anime.episode.animeTitle
                                : anime.media?.title
                            ? anime.media.title
                                : anime.media?.romanji
                            ? anime.media.romanji
                                : anime.media?.titleJP
                            ? anime.media.titleJP
                                : "Titre inconnu";

                        return `<t:${timestamp}:R> • **${animeTitle.replaceAll('*', '')}** — ${episodeTitle}`;
                    }).join('\n')
                );
                break;

            default:
                message.edit(
                    res.map(dayData => 
                        dayData.airing
                            .filter(anime => anime.displayCalendar)
                            .map(anime => {
                                const date = new Date(anime.timestamp);
                                const timestamp = Math.floor(date.getTime() / 1000);
                                const animeTitle = (anime.episode?.animeTitle 
                                    ? anime.episode.animeTitle
                                        : anime.media?.title
                                    ? anime.media.title
                                        : anime.media?.romanji
                                    ? anime.media.romanji
                                        : anime.media?.titleJP
                                    ? anime.media.titleJP
                                        : "Titre inconnu"``
                                ).replaceAll('*', '');
                                const episodeTitle = `Ep ${anime.number ?? "?"}`;

                                return `<t:${timestamp}:F> • **${animeTitle}** — ${episodeTitle}`;
                            })
                            .join('\n')
                        )
                    .filter(day => day.length > 0)
                    .join('\n\n')
                );

                break;
        }

                        // const text = [
                        //     `- \`${client.db.prefix}sessions show\`・Affiche la liste de vos sessions`,
                        //     `- \`${client.db.prefix}sessions protect on\`・Active la protection du compte`,
                        //     `- \`${client.db.prefix}sessions protect off\`・Désactive la protection du compte`,
                        //     `- \`${client.db.prefix}sessions wl [localisation]\`・Whitelist la connexion d'une localisation`,
                        //     `- \`${client.db.prefix}sessions wl [appareil]\`・Whitelist la connexion d'un appareil`,
                        //     `- \`${client.db.prefix}sessions unwl <loc/app>\`・Retire un élément de la whitelist`
                        // ];
                    
                        // if (client.db.type === "image"){
                        //     const image = await client.card("Anti Groupe", client.db.image, text.map(r => r.split('・')[0].replaceAll('`', '')));
                        //     message.edit({ content: null, files: [new MessageAttachment(image, 'antigroup.png')] });
                        // }
                        // else message.edit(`> ***${client.db.name} Anti Groupe***\n${text.join('\n')}`);
        
    }
};