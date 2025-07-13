require("./server.js");
require('dotenv').config();
const fs = require('fs');
const { Client, GatewayIntentBits, Partials, EmbedBuilder, PermissionsBitField } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

const welcomeMessages = require('./welcomeMessages');

// === 🔁 LOAD COMMANDS ===
client.commands = new Map();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}

// === 📌 SCHEDULE DAILY MESSAGES ===
function scheduleDailyMessages() {
  const channel = client.channels.cache.get(process.env.CHANNEL_CHAOS_LOUNGE);
  if (!channel) return console.error('❌ Chaos Lounge not found');

  function msUntil(hour, min = 0) {
    const now = new Date();
    const target = new Date();
    target.setHours(hour, min, 0, 0);
    if (target < now) target.setDate(target.getDate() + 1);
    return target - now;
  }

  setTimeout(() => {
    channel.send('🌞 Good morning');
    setInterval(() => channel.send('🌞 Good morning'), 24 * 60 * 60 * 1000);
  }, msUntil(6));

  setTimeout(() => {
    channel.send('🌙 Good evening');
    setInterval(() => channel.send('🌙 Good evening'), 24 * 60 * 60 * 1000);
  }, msUntil(20));
}

// === ✅ READY EVENT ===
client.once('ready', async () => {
  console.log(`✅ Chaotic Bot online as ${client.user.tag}`);

  scheduleDailyMessages();

  const guild = client.guilds.cache.first();
  if (!guild) return console.error("❌ Guild not found");

  const entryChannel = client.channels.cache.get(process.env.CHANNEL_ENTRY_PROTOCOL);
  const welcomeChannel = client.channels.cache.get(process.env.CHANNEL_WELCOME);
  const verifyMessageIdPath = './reactionRoles.json';

  // === 📜 Verifizierung (nur 1x erstellen)
  if (entryChannel?.isTextBased()) {
    const messages = await entryChannel.messages.fetch({ limit: 10 });
    const old = messages.find(m => m.author.id === client.user.id && m.embeds[0]?.title === '📜 The Immutable Laws');

    if (!old) {
      const embed = new EmbedBuilder()
        .setTitle('📜 The Immutable Laws')
        .setDescription(`◦ ❌ No hate, racism, or personal attacks – the multiverse is chaos, not cruelty.\n\n` +
                        `◦ 🚫 No spam, scams, or self-promotion without permission from the Professor.\n\n` +
                        `◦ 🧬 Stay in character when possible – we are entities, not usernames.\n\n` +
                        `◦ 🧠 Share knowledge, not noise. Theories are sacred.\n\n` +
                        `◦ 🕵️‍♂️ Respect the story. No spoilers in wrong channels.\n\n` +
                        `◦ 🪐 What happens in the chaos stays in the chaos – don’t screenshot DMs without consent.\n\n` +
                        `◦ 🔨 Breaking the laws may lead to exile from the realms.`)
        .setColor(0x8e44ad)
        .setFooter({ text: 'React with 🌀 to accept your role.' });

      const msg = await entryChannel.send({ embeds: [embed] });
      await msg.react('🌀');

      fs.writeFileSync(verifyMessageIdPath, JSON.stringify({ messageId: msg.id }));
      console.log('📩 Verifizierungsnachricht erstellt & gespeichert');
    } else {
      fs.writeFileSync(verifyMessageIdPath, JSON.stringify({ messageId: old.id }));
      console.log('🔁 Verifizierungsnachricht existiert bereits');
    }
  }
});

// === 👁️ Auto-Rolle Watcher bei Serverbeitritt ===
client.on('guildMemberAdd', async (member) => {
  const watcherRole = member.guild.roles.cache.get(process.env.ROLE_WATCHER);
  if (!watcherRole) {
    return console.error('❌ Rolle "Watcher" nicht gefunden. Bitte ROLE_WATCHER in .env prüfen.');
  }

  try {
    await member.roles.add(watcherRole);
    console.log(`✅ Rolle "Watcher" an ${member.user.tag} vergeben.`);
  } catch (err) {
    console.error(`❌ Fehler beim Vergeben der Watcher-Rolle an ${member.user.tag}:`, err);
  }
});

// === 📥 Reaction Collector (dauerhaft)
client.on('messageReactionAdd', async (reaction, user) => {
  if (user.bot || reaction.emoji.name !== '🌀') return;

  const data = JSON.parse(fs.readFileSync('./reactionRoles.json'));
  if (reaction.message.id !== data.messageId) return;

  const guild = reaction.message.guild;
  const member = await guild.members.fetch(user.id);

  const boundFragment = guild.roles.cache.get(process.env.ROLE_BOUND_FRAGMENT);
  const watcher = guild.roles.cache.get(process.env.ROLE_WATCHER);

  if (boundFragment && !member.roles.cache.has(boundFragment.id)) {
    await member.roles.add(boundFragment).catch(console.error);
  }

  if (watcher && member.roles.cache.has(watcher.id)) {
    await member.roles.remove(watcher).catch(console.error);
  }

  try {
    await member.send(
      `🧹 You've arrived at the edge of all things. Welcome, Fragment.\n` +
      `A piece of the Chaotic Icons Multiverse has returned — you.\n\n` +
      `Your journey begins not complete, but full of potential.\n` +
      `Find what was lost. Shape what could be. Chaos awaits. 🔥`
    );
  } catch (err) {
    console.log("❌ Couldn't DM user.");
  }

  const welcomeMessages = require('./welcomeMessages');
  const welcomeChannel = reaction.message.guild.channels.cache.get(process.env.CHANNEL_WELCOME);
  if (welcomeChannel?.isTextBased()) {
    const random = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
    const msg = random.replace('{username}', `<@${user.id}>`);
    welcomeChannel.send(msg).catch(console.error);
  }
});

// === 📤 Slash Commands
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  const member = await interaction.guild.members.fetch(interaction.user.id);
  if (!member.permissions.has(PermissionsBitField.Flags.Administrator)) {
    return interaction.reply({ content: '⛔ Only the Architect can use this power.', ephemeral: true });
  }

  try {
    await command.execute(interaction, client);
  } catch (err) {
    console.error(err);
    interaction.reply({ content: '❌ Command failed.', ephemeral: true });
  }
});

// === 🔑 Login
client.login(process.env.TOKEN);

// === 🌀 Keep Alive (Replit)
const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('🌀 Chaotic Bot is alive!'));
app.listen(process.env.PORT || 3000, () => console.log('🌐 Webserver ready'));
