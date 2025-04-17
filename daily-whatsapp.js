const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');
const cron = require('node-cron');

const client = new Client({
    authStrategy: new LocalAuth()
});

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('WhatsApp is ready!');

    // Schedule the message at 9:00 AM every day
    cron.schedule('36 23 * * *', async () => {
        const groupName = 'Phoenix'; // Change this
        const message = '🌞 Daily Reminder: Always stay grounded and serve selflessly 🙏';

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
