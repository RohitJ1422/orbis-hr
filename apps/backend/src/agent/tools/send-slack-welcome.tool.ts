import * as https from 'https';
import * as http from 'http';
import { URL } from 'url';

export interface SendSlackWelcomeInput {
  employeeId: string;
  name: string;
  role: string;
  startDate: string;
  channel: string;
}

export interface SendSlackWelcomeOutput {
  timestamp: string;
  channel: string;
  ok: boolean;
}

function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function postJson(urlString: string, payload: unknown): Promise<string> {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payload);
    const parsed = new URL(urlString);
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

export async function sendSlackWelcome(
  input: SendSlackWelcomeInput,
): Promise<SendSlackWelcomeOutput> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) {
    throw new Error(
      'SLACK_WEBHOOK_URL environment variable is not set — cannot send Slack message',
    );
  }

  const humanDate = formatDate(input.startDate);
  const channel = input.channel || '#onboarding';

  const payload = {
    channel,
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `Welcome to OrbisHR, ${input.name}!`,
          emoji: true,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text:
            `We're thrilled to welcome *${input.name}* to the team!\n\n` +
            `*Role:* ${input.role}\n` +
            `*Start Date:* ${humanDate}\n\n` +
            `Please join the team in giving ${input.name.split(' ')[0]} a warm OrbisHR welcome! ` +
            `Your onboarding journey starts now.`,
        },
      },
      {
        type: 'divider',
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `Employee ID: ${input.employeeId} | Provisioned by OrbisHR Provisioner Agent`,
          },
        ],
      },
    ],
  };

  const response = await postJson(webhookUrl, payload);
  const timestamp = new Date().toISOString();

  // Slack webhook returns "ok" on success
  if (response.trim() !== 'ok') {
    throw new Error(
      `Slack webhook returned unexpected response: ${response.substring(0, 200)}`,
    );
  }

  return {
    timestamp,
    channel,
    ok: true,
  };
}
