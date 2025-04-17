const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');
const cron = require('node-cron');
const express = require('express');

// Initialize WhatsApp client
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true, // Ensure it's running in headless mode
        args: ['--no-sandbox', '--disable-setuid-sandbox'] // Required for some environments like Render
    }
});

// Generate QR code for WhatsApp login
client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

// Once WhatsApp is ready
client.on('ready', () => {
    console.log('WhatsApp is ready!');

    // Schedule the message at 11:30 PM every day
    cron.schedule('40 0 * * *', async () => {
        const groupName = 'Phoenix'; // Replace with your group name
        const message = '🌙 Night Reminder: Always stay grounded and serve selflessly 🙏';

        const chats = await client.getChats();
        const group = chats.find(chat => chat.isGroup && chat.name === groupName);

        if (group) {
            await client.sendMessage(group.id._serialized, message);
            console.log('✅ Message sent to:', groupName);
        } else {
            console.log('❌ Group not found');
        }
    });
});

client.initialize();

// Express fallback for Render deployment
const app = express();
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('Bot is running!'));
app.listen(PORT, () => console.log(`Listening on ${PORT}`));
