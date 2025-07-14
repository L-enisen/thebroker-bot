// --- 📁 server.js ---
const express = require('express');
const https = require('https');

const app = express();

app.get('/', (req, res) => {
  res.send('🌀 Chaotic Bot is alive!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌐 Webserver ready at port ${PORT}`);

  // ✅ Self-Ping alle 4 Minuten, NACH Start des Webservers
  setInterval(() => {
    https.get('https://thebroker-bot.onrender.com/', res => {
      console.log(`📡 Self-ping: Status ${res.statusCode}`);
    }).on('error', err => {
      console.error('❌ Fehler beim Self-Ping:', err.message);
    });
  }, 4 * 60 * 1000); // alle 4 Minuten
});
