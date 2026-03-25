"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendTeamsWelcome = sendTeamsWelcome;
const https = require("https");
const http = require("http");
const url_1 = require("url");
function formatDate(isoDate) {
    const date = new Date(isoDate);
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}
function postJson(urlString, payload) {
    return new Promise((resolve, reject) => {
        const body = JSON.stringify(payload);
        const parsed = new url_1.URL(urlString);
        const isHttps = parsed.protocol === 'https:';
        const options = {
            hostname: parsed.hostname,
            port: parsed.port || (isHttps ? 443 : 80),
            path: parsed.pathname + parsed.search,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(body),
            },
        };
        const requester = isHttps ? https : http;
        const req = requester.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => (data += chunk));
            res.on('end', () => resolve(data));
        });
        req.on('error', reject);
        req.write(body);
        req.end();
    });
}
async function sendTeamsWelcome(input) {
    const webhookUrl = process.env.TEAMS_WEBHOOK_URL;
    if (!webhookUrl) {
        throw new Error('TEAMS_WEBHOOK_URL environment variable is not set — cannot send Teams message');
    }
    const humanDate = formatDate(input.startDate);
    const firstName = input.name.split(' ')[0];
    const payload = {
        '@type': 'MessageCard',
        '@context': 'https://schema.org/extensions',
        themeColor: '0078D7',
        summary: `Welcome ${input.name} to OrbisHR`,
        sections: [
            {
                activityTitle: `Welcome to OrbisHR, ${input.name}!`,
                activitySubtitle: input.role,
                activityText: `We're thrilled to welcome **${input.name}** to the team! ` +
                    `Please join us in giving ${firstName} a warm OrbisHR welcome. ` +
                    `Your onboarding journey starts now.`,
                facts: [
                    { name: 'Role', value: input.role },
                    { name: 'Start Date', value: humanDate },
                    { name: 'Channel', value: input.channel },
                    { name: 'Employee ID', value: input.employeeId },
                ],
                markdown: true,
            },
        ],
    };
    const response = await postJson(webhookUrl, payload);
    const messageTimestamp = new Date().toISOString();
    if (response.trim() !== '1') {
        throw new Error(`Teams webhook returned unexpected response: ${response.substring(0, 200)}`);
    }
    return {
        messageTimestamp,
        channel: input.channel,
        delivered: true,
    };
}
//# sourceMappingURL=send-teams-welcome.tool.js.map