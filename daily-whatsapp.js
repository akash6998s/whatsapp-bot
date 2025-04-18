const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');
const cron = require('node-cron');
const express = require('express');
const fs = require('fs');
const puppeteer = require('puppeteer'); // Add this


// Load Suvichar list
const suvicharList = require('./suvichar.json');
const counterPath = './counter.json';

let currentIndex = 0;

// Read current index from counter.json
if (fs.existsSync(counterPath)) {
    const data = fs.readFileSync(counterPath);
    currentIndex = JSON.parse(data).index || 0;
}

// Initialize WhatsApp client
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        executablePath: puppeteer.executablePath(), // Use Chromium bundled with puppeteer
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});


// Show QR code
client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

// Once WhatsApp is ready
client.on('ready', () => {
    console.log('✅ WhatsApp is ready!');

    // Run every minute (for testing)
    cron.schedule('* * * * *', async () => {
        const groupName = 'Phoenix'; // Replace with your group name
        const chats = await client.getChats();
        const group = chats.find(chat => chat.isGroup && chat.name === groupName);

        if (!group) {
            console.log('❌ Group not found:', groupName);
            return;
        }

        if (currentIndex >= suvicharList.length) {
            console.log('🎉 All suvichars sent!');
            return;
        }

        const message = `आज का सुविचार\n\n"${suvicharList[currentIndex]}"\n\n— जय श्री गुरुदेव`;

        try {
            await client.sendMessage(group.id._serialized, message);
            console.log(`✅ Sent Suvichar #${currentIndex + 1}: ${suvicharList[currentIndex]}`);
            currentIndex++;

            // Save updated index
            fs.writeFileSync(counterPath, JSON.stringify({ index: currentIndex }));
        } catch (err) {
            console.error('❌ Failed to send message:', err.message);
        }
    });
});

client.initialize();

// Render-friendly Express setup
const app = express();
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('Bot is running!'));
app.listen(PORT, () => console.log(`Listening on ${PORT}`));
