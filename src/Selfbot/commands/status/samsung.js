const { Client, Message } = require("discord.js-selfbot-v13");

const games = {
    "clash-royale": "com.supercell.clashroyale",
    "clash-of-clans": "com.supercell.clashofclans",
    "brawl-stars": "com.supercell.brawlstars",
    "league": "com.riotgames.league.wildrift",
    "warzone": "com.activision.callofduty.warzone",
    "roblox": "com.roblox.client",
    "uno": "com.matteljv.uno",
    "geometry-dash": "com.robtopx.geometryjumplite",
    "subway": "com.kiloo.subwaysurf",
    "candy-crush": "com.king.candycrushsaga",
    "piano-tiles": "com.youmusic.magictiles",
    "minecraft": "com.mojang.minecraftpe",
    "fnaf": "com.scottgames.fivenightsatfreddys",
    "dokkan": "com.bandainamcogames.dbzdokkanww",
    "pokemon-go": "com.nianticlabs.pokemongo",
    "jcc-pokemon": "jp.pokemon.pokemontcgp",
    "genshin": "com.miHoYo.GenshinImpact",
    "stumble-guys": "com.kitkagames.fallbuddies",
    "blue-archive": "com.nexon.bluearchive",
    "honkai-impact": "com.miHoYo.bh3global",
    "honkai-star-rail": "com.HoYoverse.hkrpgoversea",
    "treasure-cruise": "com.namcobandaigames.spmoja010E",
    "sds": "com.netmarble.nanagb"
}

module.exports = {
    name: "samsung",
    description: "Joue à un RPC samsung",
    dir: "samsungrpc",
    usage: '<jeu> <START/UPDATE/STOP>',
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {string[]} args
    */
    run: async (client, message, args) => {
        if (!Object.keys(games).includes(args[0])) return;
        if (!['START', 'UPDATE', 'STOP'].includes(args[1]?.toUpperCase())) return message.edit("***Veuillez choisir un type valide***");

        const rpc = await client.user.setSamsungActivity(games[args[0]], args[1].toUpperCase()).catch(() => false);
        if (rpc) return message.edit("***Votre RPC Samsung a été modifié***");
        else return message.edit("***Votre RPC Samsung n'a pas pu être modifié***");
    }
};