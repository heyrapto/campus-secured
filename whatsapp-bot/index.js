const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const cors = require('cors');
const qrcode = require('qrcode-terminal');

const app = express();
app.use(express.json());
app.use(cors());

// Initialize the WhatsApp Client
// Note: puppeteer options may need tweaking depending on deployment environment
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});

client.on('qr', (qr) => {
  console.log('QR CODE — scan in WhatsApp to connect the bot:');
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('WhatsApp bot connected and ready!');
});

// Incoming message handler
client.on('message', async msg => {
  const cmd = msg.body.trim().toUpperCase();
  const phone = msg.from; // format: 2348XXXXXXXX@c.us

  // Simple hardcoded app URL for local testing, would use process.env.APP_URL in prod
  const APP_URL = process.env.APP_URL || 'http://localhost:3000';

  if (cmd === 'REGISTER') {
    await msg.reply('Reply with: REGISTER [your student ID]');
  } else if (cmd.startsWith('REGISTER ')) {
    const studentId = cmd.split(' ')[1];
    
    // Simulate linking, since bot is separate from Next.js db it would need to call a Next.js endpoint.
    // For simplicity of this guide, we assume the student is registered on web first.
    await msg.reply('Registered! You will receive campus emergency alerts.');
  } else if (cmd === 'SAFE') {
    await msg.reply('Noted. Stay alert and report anything suspicious.');
  } else if (cmd === 'SOS') {
    await msg.reply(
      'Open the web app to trigger a full alert with location:\n' + APP_URL
    );
  } else if (cmd === 'HELP') {
    await msg.reply(
      '*Campus Shield Commands*\n\n' +
      'REGISTER [ID] - Link account\n' +
      'SOS - Get web app link for emergency\n' +
      'SAFE - Confirm you are safe\n' +
      'HELP - List commands'
    );
  }
});

// HTTP endpoints called by Next.js API routes
app.post('/broadcast', async (req, res) => {
  const { numbers, message } = req.body;
  
  if (!numbers || !message) {
    return res.status(400).json({ error: 'Missing numbers or message' });
  }

  let sentCount = 0;
  for (const num of numbers) {
    try {
      await client.sendMessage(`${num}@c.us`, message);
      sentCount++;
      await new Promise(r => setTimeout(r, 500)); // avoid rate limit
    } catch (e) {
      console.error(`Failed to send to ${num}:`, e.message);
    }
  }
  res.json({ sent: sentCount });
});

app.post('/notify-contacts', async (req, res) => {
  const { contacts, studentName, alertId, incidentType } = req.body;
  const APP_URL = process.env.APP_URL || 'http://localhost:3000';

  const msg =
    `🆘 ${studentName} triggered a ${incidentType} alert.\n\n` +
    `Track live: ${APP_URL}/track/${alertId}`;

  for (const contact of contacts) {
    if (contact.whatsapp) {
      try {
        await client.sendMessage(`${contact.whatsapp}@c.us`, msg);
      } catch (e) {
        console.error(`Failed to send to contact ${contact.whatsapp}:`, e.message);
      }
    }
  }
  res.json({ ok: true });
});

app.get('/ping', (req, res) => res.send('alive'));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`WhatsApp bot HTTP server running on port ${PORT}`);
});

client.initialize();
