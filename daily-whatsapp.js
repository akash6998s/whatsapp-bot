const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');
const cron = require('node-cron');
const express = require('express');
const fs = require('fs');

// Load Suvichar data from JSON file
const suvichar = JSON.parse(fs.readFileSync('suvichar.json', 'utf8'));

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

    // Variable to keep track of the current Suvichar index
    let suvicharIndex = 0;

    // Schedule the message to send every minute for testing purposes
    cron.schedule('* * * * *', async () => {
        const groupName = 'Phoenix'; // Replace with your group name
        const message = suvichar[suvicharIndex]; // Get the current Suvichar message

        // Get all chats and find the desired group
        const chats = await client.getChats();
        const group = chats.find(chat => chat.isGroup && chat.name === groupName);

        if (group) {
            await client.sendMessage(group.id._serialized, message);
            console.log(`✅ Sent Suvichar #${suvicharIndex + 1}:`, message);

            // Increment the index, reset to 0 if it exceeds the length of the array
            suvicharIndex = (suvicharIndex + 1) % suvichar.length;
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
