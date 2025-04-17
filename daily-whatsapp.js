const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');
const cron = require('node-cron');
const express = require('express');
const fs = require('fs');

// Load Suvichar list
const suvicharList = require('./suvichar.json');

// Track current index using a file
const indexFile = './index.json';

function getCurrentIndex() {
    try {
        const data = fs.readFileSync(indexFile);
        const parsed = JSON.parse(data);
        return parsed.index;
    } catch (err) {
        return 0; // default index
    }
}

function updateIndex(newIndex) {
    fs.writeFileSync(indexFile, JSON.stringify({ index: newIndex }));
}

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('WhatsApp is ready!');

    // Schedule the message at 1:00 AM daily
    cron.schedule('* * * * *', async () => {
        console.log('⏰ Cron job triggered');
    
        const groupName = 'Phoenix';
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

// Express server
const app = express();
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('Bot is running!'));
app.listen(PORT, () => console.log(`Listening on ${PORT}`));
