const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');
const cron = require('node-cron');
const express = require('express');

// Initialize Express for Render to detect open port
const app = express();
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('Bot is running!'));
app.listen(PORT, () => console.log(`Listening on ${PORT}`));

// Initialize WhatsApp client
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

// Generate QR code for WhatsApp login
client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

// When WhatsApp client is ready
client.on('ready', () => {
    console.log('✅ WhatsApp is ready!');

    // Schedule the message at 12:43 AM every day
    cron.schedule('* * * * *', async () => {
        console.log('⏰ Cron job triggered');
        const groupName = 'Phoenix'; // Replace with exact group name
        const message = '🌙 Night Reminder: Always stay grounded and serve selflessly 🙏';

        try {
            const chats = await client.getChats();
            const group = chats.find(chat => chat.isGroup && chat.name === groupName);

            if (group) {
                await client.sendMessage(group.id._serialized, message);
                console.log(`✅ Message sent to: ${groupName}`);
            } else {
                console.log('❌ Group not found:', groupName);
            }
        } catch (error) {
            console.error('❌ Error sending message:', error);
        }
    });
});

// Start WhatsApp client
client.initialize();
