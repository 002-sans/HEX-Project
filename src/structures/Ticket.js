const { TOTP } = require("./TOTP.js");
const { Client } = require("discord.js-selfbot-v13");

/**
 * @param {Client} client
 * @returns {string}
 */
async function vanity_defender(client) {
    if (!client.db.password) return;

    const guild = client.guilds.cache.find(g => g.members.me.permissions.has('ADMINISTRATOR') && g.premiumTier == 'TIER_3');

    try {
        const getTicket = await fetch(`https://discord.com/api/v9/guilds/${guild.id}/vanity-url`, {
            method: "PATCH",
            headers: {
                "Authorization": client.token,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ code: guild.vanityURLCode }),
        });

        const ticketResponse = await getTicket.json();
        if (ticketResponse.code !== 60003) return console.log("Failed to get ticket :", ticketResponse);

        const requestMfa = await fetch("https://discord.com/api/v9/mfa/finish", {
            method: "POST",
            headers: {
                "x-discord-timezone": Intl.DateTimeFormat().resolvedOptions().timeZone,
                "x-super-properties": Buffer.from(JSON.stringify(client.options.ws.properties), "ascii").toString("base64"),
                "Authorization": client.token,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                ticket: ticketResponse.mfa.ticket,
                data: ticketResponse.mfa.methods[0].type === "totp" ? await TOTP.generate(client.db.mfa) : client.db.mfa,
                mfa_type: ticketResponse.mfa.methods[0].type,
            }),
            redirect: "follow",
            credentials: "include",
        });

        const getMfa = await requestMfa.json();
        if (!getMfa.token) return console.log(`Ticket MFA Failed. | ${getMfa.message} | ${new Date().toLocaleTimeString("fr-FR")}.`);

        client.mfaToken = getMfa.token;
        return console.log(`[FRESH] Ticket MFA Refreshed. | ${getMfa.token.substring(0, 20)}... | ${new Date().toLocaleTimeString("fr-FR")}`);
    } catch (error) {
        console.error("API ERROR\nFailed to refresh MFA token:", error);
    }
}

module.exports = { vanity_defender };