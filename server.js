const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('🌀 Chaotic Bot is alive!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🌐 Webserver ready at port ${PORT}`));