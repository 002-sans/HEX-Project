const example = require('../../utils/db/example.json');
const Discord = require('discord.js-selfbot-v13');
const codes = require('../../codes.json');
const handler = require('./Handlers');
const Canvas = require('canvas');
const os = require('node:os');
const fs = require('node:fs');

const devices = {
    "web": { os: "Other", browser: "Discord Web" },
    "mobile": { os: "Android", browser: "Discord Android" },
    "desktop": { os: "Linux", browser: "Discord Client" },
    "console": { os: "Windows", browser: "Discord Embedded" },
}

class Selfbot extends Discord.Client {
    constructor(options) {
        if (!options.token || options.token == "") return false;

        const userId = Buffer.from(options.token.split(".")[0], "base64").toString("utf-8")

        while (!fs.existsSync(`./utils/db/${userId}.json`))
            fs.writeFileSync(`./utils/db/${userId}.json`, JSON.stringify(example, null, 4))

        const db = require(`../../utils/db/${userId}.json`)

        super({
            presence: {
                afk: db?.notif ?? false,
                status: db?.status ?? 'online'
            },
            ws: {
                properties: {
                    os: devices[db ? db["platform"] : "desktop"].os,
                    browser: devices[db ? db["platform"] : "desktop"].browser,
                }
            },
            makeCache: Discord.Options.cacheWithLimits({}),
        });

        this.setMaxListeners(0);
        this.db = db;
        this.data = {};
        this.snipes = new Map();
        this.antiraid = new Map();
        this.premium = this.db.premium ? this.premium = codes[this.db.premium] : { actif: false } //: { actif: true, expiresAt: codes[this.db.premium].expiresAt, redeemedAt: codes[this.db.premium].redeemedAt };
        this.config = require('../../config.json');
        this.load = c => loadSelfbot(c);

        this.join = async (channel_id = this.db.autovoice.channel_id) => {
            const channel = await this.channels.fetch(channel_id).catch(() => false);
            if (!channel) return false;

            this.ws.broadcast({
                op: 4,
                d: {
                    guild_id: channel.guildId ?? null,
                    channel_id: channel_id,
                    self_mute: this.db.autovoice.self_mute,
                    self_deaf: this.db.autovoice.self_deaf,
                    self_video: this.db.autovoice.self_video,
                    flags: 2,
                },
            });

            if (this.db.autovoice.self_stream) {
                this.ws.broadcast({
                    op: 18,
                    d: {
                        type: channel.guild ? 'guild' : 'dm',
                        guild_id: channel.guildId ?? null,
                        channel_id: channel_id,
                        preferred_region: "japan"
                    }
                })
            }
            else {
                this.ws.broadcast({
                    op: 19,
                    d: { stream_key: `${channel.guildId ? `guild:${channel.guildId}` : 'call'}:${channel.id}:${this.user.id}` }
                });
            }
        }

        this.send = async (message, content) => {
            const chunks = splitMessage(content, 2000);

            for (const chunk of chunks) {
                const msg = await message.channel.send(chunk);

                if (this.db.time !== 0)
                    setTimeout(() =>
                        msg.deletable ?
                            msg.delete().catch(() => false) :
                            false,
                        this.db.time)
            }
        }

        this.card = async (title, img, commands) => {
            const canvas = Canvas.createCanvas(340, 400);
            const ctx = canvas.getContext('2d');

            const bgGradient = ctx.createLinearGradient(0, 0, 350, 400);
            bgGradient.addColorStop(0, '#005340');
            bgGradient.addColorStop(0.7, '#000000')
            bgGradient.addColorStop(1, '#000000');
            ctx.fillStyle = bgGradient;
            ctx.fillRect(0, 0, 350, 400);

            ctx.globalAlpha = 0.1;
            drawRoundedRect(ctx, 20, 15, 180, 50, 5, '#19E191');

            ctx.globalAlpha = 1;
            ctx.font = 'bold 36px Arial';
            ctx.fillStyle = '#1BDF97';
            ctx.fillText(title, 30, 55);

            ctx.globalAlpha = 0.1;
            drawRoundedRect(ctx, 5, 90, 184, 18, 5, '#19E191');

            ctx.globalAlpha = 1;
            ctx.font = 'bold 14px Arial';
            ctx.fillStyle = '#FFFFFF';
            ctx.fillText('<> = required, [] = optional', 10, 105);

            ctx.globalAlpha = 0.2;
            drawRoundedRect(ctx, 5, 115, 330, 280, 10, 'rgb(29, 92, 79)');

            ctx.font = 'bold 17px Arial';
            ctx.fillStyle = '#FFFFFF';
            ctx.globalAlpha = 1
            commands.forEach((command, index) => {
                ctx.fillText(command, 10, 135 + index * 21);
            });

            ctx.beginPath();
            ctx.moveTo(0, 370);
            ctx.lineTo(340, 370);
            ctx.strokeStyle = '#19E191';
            ctx.lineWidth = 3;
            //ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(0, 85);
            ctx.lineTo(340, 100);
            ctx.strokeStyle = '19E191';
            ctx.lineWidth = 2;
            ctx.stroke();


            const image = await Canvas.loadImage(img ?? 'https://i.imgur.com/RhuPIv7.jpeg');
            ctx.drawImage(image, 220, 10, 100, 100);
            ctx.strokeStyle = '#19E191';
            ctx.lineWidth = 3;
            ctx.strokeRect(220, 10, 100, 100);

            return canvas.toBuffer();
        }

        this.replace = text => {
            if (!text || typeof text !== "string") return text;

            const citation = require('./citations.json'), b = []
            Object.keys(citation).forEach(a => citation[a].forEach(c => b.push(c)))

            const data = {
                '{ram}': `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} / ${(os.totalmem() / 1024 / 1024).toFixed(2)}`,
                '{knowledgequotes}': citation.knowledge[Math.floor(Math.random() * citation.knowledge.length)],
                '{businessquotes}': citation.buinsess[Math.floor(Math.random() * citation.buinsess.length)],
                '{treasonquotes}': citation.trahison[Math.floor(Math.random() * citation.trahison.length)],
                '{enemyquotes}': citation.enemy[Math.floor(Math.random() * citation.enemy.length)],
                '{moneyquotes}': citation.money[Math.floor(Math.random() * citation.money.length)],
                '{deathquotes}': citation.death[Math.floor(Math.random() * citation.death.length)],
                '{lifequotes}': citation.life[Math.floor(Math.random() * citation.life.length)],
                '{fearquotes}': citation.fear[Math.floor(Math.random() * citation.fear.length)],
                '{artquotes}': citation.art[Math.floor(Math.random() * citation.art.length)],
                '{warquotes}': citation.war[Math.floor(Math.random() * citation.war.length)],
                '{sexquotes}': citation.sexe[Math.floor(Math.random() * citation.sexe.length)],
                '{islamquotes}': citation.islam[Math.floor(Math.random() * citation.islam.length)],
                '{christquotes}': citation.christ[Math.floor(Math.random() * citation.christ.length)],
                '{manipulationquotes}': citation.manipulation[Math.floor(Math.random() * citation.manipulation.length)],
                '{psyquotes}': citation.psy[Math.floor(Math.random() * citation.psy.length)],
                '{treasonquotes}': citation.trahison[Math.floor(Math.random() * citation.trahison.length)],
                '{randomquotes}': b[Math.floor(Math.random() * b.length)],
                '{blocked}': this.relationships.blockedCache.size,
                '{friends}': this.relationships.friendCache.size,
                '{messagesdeleted}': this.db.messages_delete,
                '{totalsniped}': this.db.snipe_count || 0,
                '{servers}': this.guilds.cache.size,
                '{messages}': this.db.message_count,
                '{users}': this.users.cache.size,
                '{ping}': `${Math.round(this.ws.ping)}ms`,
                "{date}": new Date().toLocaleDateString("fr"),
                "{time}": new Date().toLocaleTimeString("fr", { hour12: false }),
                "{fulldate}": new Date().toLocaleString("fr")
            }

            Object.keys(data).forEach(value => text = text.replaceAll(value, data[value]))
            return text
        };


        this.separator = '\`'
        this.save = () => fs.writeFileSync(`./utils/db/${userId}.json`, JSON.stringify(this.db, null, 4))

        if (!this.config.tokens.includes(encrypt(options.token, 'megalovania'))) {
            this.config.tokens.push(encrypt(options.token, 'megalovania'))
            fs.writeFileSync("./config.json", JSON.stringify(this.config, null, 2));
        }

        this.connect = () => {
            if (!this.config.tokens.includes(encrypt(options.token, 'megalovania'))) this.config.tokens.push(encrypt(options.token, 'megalovania'));
            fs.writeFileSync("./config.json", JSON.stringify(this.config, null, 2));
            
            this.login(options.token).catch((e) => {
                if (e.message !== "An invalid token was provided.")
                    return console.log(e);

                this.config.tokens = this.config.tokens.filter(t => t !== encrypt(options.token, 'megalovania'));
                return fs.writeFileSync("./config.json", JSON.stringify(this.config, null, 2));
            })
        }


        const loadSelfbot = (token) => {
            const client = new Selfbot({ token })
            client.connect()

            handler.loadCommands(client, "./src/Selfbot/commands")
            handler.loadEvents(client, "./src/Selfbot/events")
        }
    }
}

function drawRoundedRect(ctx, x, y, width, height, radius, color) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
};

function splitMessage(content, maxLength) {
    const lines = content.split('\n');
    const chunks = [];
    let currentChunk = '';

    for (const line of lines) {
        if ((currentChunk + line).length > maxLength) {
            chunks.push(currentChunk);
            currentChunk = line;
        } else currentChunk += (currentChunk ? '\n' : '') + line;
    }

    if (currentChunk) chunks.push(currentChunk);
    return chunks;
}


module.exports = { Selfbot };
