const { Client, Message, TextChannel } = require("discord.js-selfbot-v13");

module.exports = {
    name: "savechat2",
    description: "Sauvegarde les messages d'un salon en HTML",
    usage: "[channel]",
    dir: "tools",
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {string[]} args
    */
    run: async (client, message, args) => {
        let channel = message.mentions.channels.first() || client.channels.cache.get(args[0]) || await client.channels.fetch(args[0]).catch(() => false);
        if (!channel || !args[0]) channel = message.channel;

        const limit = parseInt(args[1]) || Infinity;

        if (!["GUILD_TEXT", "GROUP_DM", "DM", "GUILD_VOICE", "GUILD_NEWS", ""].includes(channel.type))
            return message.edit("***Veuillez entrer un salon textuel valide***");

        await message.edit("***Création de la sauvegarde HTML des messages***");
        
        const messages = await fetchAll(limit, channel, client)
            .then(a => a.reverse());

        const html = generateDiscordHTML(messages, channel, client);

        if (message.editable) {
            await message.edit({
                content: null,
                files: [{
                    attachment: Buffer.from(html, 'utf-8'),
                    name: `${channel.name || 'conversation'}-${Date.now()}.html`,
                }],
            });
        } else {
            await message.channel.send({
                files: [{
                    attachment: Buffer.from(html, 'utf-8'),
                    name: `${channel.name || 'conversation'}-${Date.now()}.html`,
                }],
            });
        }
    }
};

/**
 * @param {string[]} limit
 * @param {TextChannel} channel
 * @param {Client} client
*/
async function fetchAll(limit, channel, client) {
    let messages = [];
    let lastID;
    while (true) { 
        const fetchedMessages = await channel.messages.fetch({
            limit: 100,
            cache: false,
           ...(lastID && { before: lastID }),
        });
        
        if (fetchedMessages.size === 0 || (limit && messages.length >= limit)) {
            return messages.filter(msg => !msg.author?.bot).slice(0, limit);
        }
        
        messages = messages.concat(Array.from(fetchedMessages.values()));
        lastID = fetchedMessages.lastKey();
    }
}


/**
 * Génère le HTML stylé Discord
 */
function generateDiscordHTML(messages, channel, client) {
    const channelName = channel.name || 'Conversation privée';
    const serverName = channel.guild?.name || 'Messages privés';
    
    return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${channelName} - ${serverName}</title>
    <style>
        ${getDiscordCSS()}
    </style>
</head>
<body>
    <div class="discord-container">
        <div class="header">
            <div class="channel-info">
                <h1># ${channelName}</h1>
                <p>${serverName} • ${messages.length} messages • Sauvegardé le ${new Date().toLocaleString('fr-FR')}</p>
            </div>
        </div>
        <div class="messages-container">
            ${messages.map(msg => generateMessageHTML(msg)).join('')}
        </div>
    </div>
</body>
</html>`;
}

/**
 * Génère le HTML pour un message
 */
function generateMessageHTML(message) {
    const avatar = message.author.displayAvatarURL({ size: 64 });
    const displayName = message.author.displayName || message.author.username;
    const username = message.author.username;
    const timestamp = formatTimestamp(message.createdTimestamp);
    const content = formatMessageContent(message.content);
    const attachments = formatAttachments(message.attachments);
    const embeds = formatEmbeds(message.embeds);
    
    return `
    <div class="message">
        <div class="message-avatar">
            <img src="${avatar}" alt="${displayName}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiM3Mjg5ZGEiLz4KPHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyUzYuNDggMjIgMTIgMjJTMjIgMTcuNTIgMjIgMTJTMTcuNTIgMiAxMiAyWk0xMiA2QzEzLjY2IDYgMTUgNy4zNCAxNSA5UzEzLjY2IDEyIDEyIDEyUzkgMTAuNjYgOSA5UzEwLjM0IDYgMTIgNlpNMTIgMjBDOS43NCAyMCA3Ljc5IDE4Ljg1IDYuNzggMTcuMDZDNi44MyAxNS4xNyA5LjUgMTQgMTIgMTRTMTcuMTcgMTUuMTcgMTcuMjIgMTcuMDZDMTYuMjEgMTguODUgMTQuMjYgMjAgMTIgMjBaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4KPC9zdmc+'">
        </div>
        <div class="message-content">
            <div class="message-header">
                <span class="message-author">${displayName}</span>
                <span class="message-username">@${username}</span>
                <span class="message-timestamp">${timestamp}</span>
            </div>
            ${content ? `<div class="message-text">${content}</div>` : ''}
            ${attachments}
            ${embeds}
        </div>
    </div>`;
}

/**
 * Formate le contenu du message
 */
function formatMessageContent(content) {
    if (!content) return '';
    
    return content
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/__(.*?)__/g, '<u>$1</u>')
        .replace(/~~(.*?)~~/g, '<del>$1</del>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
        .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
        .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>')
        .replace(/\n/g, '<br>');
}

/**
 * Formate les pièces jointes
 */
function formatAttachments(attachments) {
    if (!attachments.size) return '';
    
    return `<div class="attachments">
        ${attachments.map(attachment => {
            const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(attachment.url);
            if (isImage) {
                return `<div class="attachment-image">
                    <img src="${attachment.url}" alt="${attachment.name}" onclick="window.open('${attachment.url}', '_blank')">
                </div>`;
            } else {
                return `<div class="attachment-file">
                    <a href="${attachment.url}" target="_blank">📎 ${attachment.name}</a>
                </div>`;
            }
        }).join('')}
    </div>`;
}

/**
 * Formate les embeds
 */
function formatEmbeds(embeds) {
    if (!embeds.length) return '';
    
    return embeds.map(embed => {
        const color = embed.color ? `#${embed.color.toString(16).padStart(6, '0')}` : '#202225';
        
        return `<div class="embed" style="border-left-color: ${color}">
            ${embed.author ? `<div class="embed-author">
                ${embed.author.iconURL ? `<img src="${embed.author.iconURL}" alt="">` : ''}
                <span>${embed.author.name}</span>
            </div>` : ''}
            ${embed.title ? `<div class="embed-title">${embed.title}</div>` : ''}
            ${embed.description ? `<div class="embed-description">${formatMessageContent(embed.description)}</div>` : ''}
            ${embed.fields?.length ? embed.fields.map(field => 
                `<div class="embed-field ${field.inline ? 'inline' : ''}">
                    <div class="embed-field-name">${field.name}</div>
                    <div class="embed-field-value">${formatMessageContent(field.value)}</div>
                </div>`
            ).join('') : ''}
            ${embed.image ? `<div class="embed-image">
                <img src="${embed.image.url}" alt="" onclick="window.open('${embed.image.url}', '_blank')">
            </div>` : ''}
            ${embed.thumbnail ? `<div class="embed-thumbnail">
                <img src="${embed.thumbnail.url}" alt="">
            </div>` : ''}
            ${embed.footer ? `<div class="embed-footer">
                ${embed.footer.iconURL ? `<img src="${embed.footer.iconURL}" alt="">` : ''}
                <span>${embed.footer.text}</span>
            </div>` : ''}
        </div>`;
    }).join('');
}

/**
 * Formate le timestamp
 */
function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
        return `Aujourd'hui à ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
        return date.toLocaleDateString('fr-FR', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

/**
 * CSS Discord-like
 */
function getDiscordCSS() {
    return `
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #36393f;
            color: #dcddde;
            line-height: 1.375;
        }

        .discord-container {
            max-width: 1200px;
            margin: 0 auto;
            background-color: #36393f;
        }

        .header {
            background-color: #2f3136;
            padding: 20px;
            border-bottom: 1px solid #202225;
            position: sticky;
            top: 0;
            z-index: 100;
        }

        .channel-info h1 {
            color: #ffffff;
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 5px;
        }

        .channel-info p {
            color: #b9bbbe;
            font-size: 14px;
        }

        .messages-container {
            padding: 20px;
        }

        .message {
            display: flex;
            margin-bottom: 20px;
            padding: 2px 0;
            position: relative;
        }

        .message:hover {
            background-color: rgba(4, 4, 5, 0.07);
            margin-left: -20px;
            margin-right: -20px;
            padding-left: 20px;
            padding-right: 20px;
        }

        .message-avatar {
            width: 40px;
            height: 40px;
            margin-right: 16px;
            flex-shrink: 0;
        }

        .message-avatar img {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            object-fit: cover;
        }

        .message-content {
            flex: 1;
            min-width: 0;
        }

        .message-header {
            display: flex;
            align-items: baseline;
            margin-bottom: 4px;
        }

        .message-author {
            font-weight: 500;
            color: #ffffff;
            margin-right: 8px;
            cursor: pointer;
        }

        .message-username {
            font-size: 12px;
            color: #b9bbbe;
            margin-right: 8px;
        }

        .message-timestamp {
            font-size: 12px;
            color: #72767d;
            margin-left: 8px;
        }

        .message-text {
            color: #dcddde;
            word-wrap: break-word;
            line-height: 1.375;
        }

        .message-text strong {
            font-weight: 700;
        }

        .message-text em {
            font-style: italic;
        }

        .message-text u {
            text-decoration: underline;
        }

        .message-text del {
            text-decoration: line-through;
        }

        .message-text code {
            background-color: #2f3136;
            padding: 2px 4px;
            border-radius: 3px;
            font-family: 'Consolas', 'Monaco', monospace;
            font-size: 0.875em;
        }

        .message-text pre {
            background-color: #2f3136;
            border: 1px solid #202225;
            border-radius: 4px;
            padding: 8px;
            margin: 8px 0;
            overflow-x: auto;
        }

        .message-text pre code {
            background: none;
            padding: 0;
        }

        .message-text a {
            color: #00b0f4;
            text-decoration: none;
        }

        .message-text a:hover {
            text-decoration: underline;
        }

        .attachments {
            margin-top: 8px;
        }

        .attachment-image img {
            max-width: 400px;
            max-height: 300px;
            border-radius: 4px;
            cursor: pointer;
            transition: opacity 0.2s;
        }

        .attachment-image img:hover {
            opacity: 0.8;
        }

        .attachment-file {
            background-color: #2f3136;
            border: 1px solid #202225;
            border-radius: 4px;
            padding: 8px 12px;
            margin: 4px 0;
            display: inline-block;
        }

        .attachment-file a {
            color: #00b0f4;
            text-decoration: none;
        }

        .embed {
            background-color: #2f3136;
            border-left: 4px solid #202225;
            border-radius: 4px;
            padding: 16px;
            margin: 8px 0;
            max-width: 520px;
        }

        .embed-author {
            display: flex;
            align-items: center;
            margin-bottom: 8px;
            font-size: 14px;
            font-weight: 500;
        }

        .embed-author img {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            margin-right: 8px;
        }

        .embed-title {
            font-size: 16px;
            font-weight: 600;
            color: #ffffff;
            margin-bottom: 8px;
        }

        .embed-description {
            color: #dcddde;
            margin-bottom: 8px;
        }

        .embed-field {
            margin-bottom: 8px;
        }

        .embed-field.inline {
            display: inline-block;
            width: 33%;
            vertical-align: top;
            margin-right: 16px;
        }

        .embed-field-name {
            font-size: 14px;
            font-weight: 600;
            color: #ffffff;
            margin-bottom: 2px;
        }

        .embed-field-value {
            font-size: 14px;
            color: #dcddde;
        }

        .embed-image img {
            max-width: 400px;
            max-height: 300px;
            border-radius: 4px;
            cursor: pointer;
        }

        .embed-thumbnail {
            float: right;
            margin-left: 16px;
        }

        .embed-thumbnail img {
            width: 80px;
            height: 80px;
            border-radius: 4px;
            object-fit: cover;
        }

        .embed-footer {
            display: flex;
            align-items: center;
            margin-top: 8px;
            font-size: 12px;
            color: #72767d;
        }

        .embed-footer img {
            width: 16px;
            height: 16px;
            border-radius: 50%;
            margin-right: 8px;
        }

        @media (max-width: 768px) {
            .discord-container {
                margin: 0;
            }
            
            .header, .messages-container {
                padding: 16px;
            }
            
            .message:hover {
                margin-left: -16px;
                margin-right: -16px;
                padding-left: 16px;
                padding-right: 16px;
            }
            
            .embed-field.inline {
                width: 100%;
                margin-right: 0;
            }
        }
    `;
}