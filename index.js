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

// === 🧾 POST CHANNEL INTRO MESSAGES ===
async function postChannelIntroductions() {
  const channelMessages = [
    {
      id: process.env.CHANNEL_PROFESSOR_SIGNALS,
      content: "🧪 Signals from the Professor.\nAnnouncements about new packs, discovered worlds, lore expansions & system updates. A direct link to the core."
    },
    {
      id: process.env.CHANNEL_MULTI_NETWORK,
      content: "🌐 Access points to the outer web of the Multiverse.\nTwitter, OpenSea, Website, YouTube, and more.\nConnections beyond this reality begin here."
    },
    {
      id: process.env.CHANNEL_CHAOS_LOUNGE,
      content: "🔊 The open vortex.\nSpeak freely, connect with other fragments, and share your thoughts across realities.\nAll voices echo here."
    },
    {
      id: process.env.CHANNEL_THEORY_HUB,
      content: "🧩 Hidden codes, anomalies, ideas.\nGlitchborn and above can discuss theories, solve riddles, and uncover deeper layers of the multiverse.\nKnowledge isn’t safe here."
    },
    {
      id: process.env.CHANNEL_NEW_ALERTS,
      content: "⚠️ Real-time alerts for newly uploaded NFTs.\nTitle, preview & metadata appear the moment chaos is released.\nStay ready. It drops without warning."
    },
    {
      id: process.env.CHANNEL_PACK_MANIFESTS,
      content: "📦 Records of all NFT Packs released.\nStructured by group, no links – pure order within chaos.\nSearch and study the patterns."
    },
    {
      id: process.env.CHANNEL_CORE_LORE,
      content: "📖 The living story of the multiverse.\nA written journey unfolding piece by piece – secrets, lies, origins.\nRead carefully. Nothing is just a story."
    },
    {
      id: process.env.CHANNEL_VISUAL_PANELS,
      content: "🖼️ Comic panels of the lore – released every few days.\nVisual glimpses into what the words can’t show.\nSome truths are better seen."
    },
    {
      id: process.env.CHANNEL_DISCOVERED_WORLDS,
      content: "🌍 A log of all known origin worlds from which characters emerged.\nEach world brings new laws, new danger, new energy.\nYour home might be among them."
    }
  ];

  for (const ch of channelMessages) {
    const channel = client.channels.cache.get(ch.id);
    if (channel?.isTextBased()) {
      try {
        const messages = await channel.messages.fetch({ limit: 5 });
        const exists = messages.some(m => m.author.id === client.user.id && m.content.startsWith(ch.content.split("\n")[0]));
        if (!exists) {
          await channel.send(ch.content);
          console.log(`✅ Intro in ${channel.id} gepostet.`);
        }
      } catch (err) {
        console.error(`❌ Fehler beim Posten in ${ch.id}:`, err);
      }
    }
  }
}

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
  await postChannelIntroductions();

  // Willkommens-Embed posten, wenn noch nicht da
  const welcomeChannel = client.channels.cache.get(process.env.CHANNEL_WELCOME);
  if (welcomeChannel?.isTextBased()) {
    const messages = await welcomeChannel.messages.fetch({ limit: 10 });
    const exists = messages.some(m => 
      m.author.id === client.user.id && 
      m.embeds[0]?.title === '⚛️ Welcome, Bound Fragment, to the Chaotic Icons Multiverse ⚛️'
    );
    if (!exists) {
      const embed = new EmbedBuilder()
        .setTitle('⚛️ Welcome, Bound Fragment, to the Chaotic Icons Multiverse ⚛️')
        .setDescription(
          'You have crossed the threshold into a realm shaped by a daring experiment — a collaboration between The Professor and The Broker, who together unleashed a fusion of order and chaos.\n\n' +
          'Now, you stand at the center of this unraveling reality, chosen to carry the Immutable Laws and to shape the future of the multiverse.\n\n' +
          'Embrace your mutation. Learn the rules, wield the chaos, and uncover secrets only fragments can see.\n\n' +
          'The path ahead is uncertain — but your journey begins here.\n\n' +
          '— The Broker\n— The Professor'
        )
        .setColor(0x8e44ad);
      await welcomeChannel.send({ embeds: [embed] });
      console.log('✅ Welcome-Embed im Welcome-Channel gepostet');
    } else {
      console.log('ℹ️ Welcome-Embed existiert bereits');
    }
  }

  // === 📜 Verifizierung (nur 1x erstellen)
  const guild = client.guilds.cache.first();
  if (!guild) return console.error("❌ Guild not found");

  const entryChannel = client.channels.cache.get(process.env.CHANNEL_ENTRY_PROTOCOL);
  const verifyMessageIdPath = './reactionRoles.json';

  if (entryChannel?.isTextBased()) {
    const messages = await entryChannel.messages.fetch({ limit: 10 });
    const old = messages.find(m => m.author.id === client.user.id && m.embeds[0]?.title === '📜 The Immutable Laws');

    if (!old) {
      const embed = new EmbedBuilder()
        .setTitle('📜 The Immutable Laws')
        .setDescription(
          `◦ ❌ No hate, racism, or personal attacks – the multiverse is chaos, not cruelty.\n\n` +
          `◦ 🚫 No spam, scams, or self-promotion without permission from the Professor.\n\n` +
          `◦ 🧬 Stay in character when possible – we are entities, not usernames.\n\n` +
          `◦ 🧠 Share knowledge, not noise. Theories are sacred.\n\n` +
          `◦ 🕵️‍♂️ Respect the story. No spoilers in wrong channels.\n\n` +
          `◦ 🪐 What happens in the chaos stays in the chaos – don’t screenshot DMs without consent.\n\n` +
          `◦ 🔨 Breaking the laws may lead to exile from the realms.`
        )
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

  if (welcomeMessages.length > 0) {
    const welcomeChannel = reaction.message.guild.channels.cache.get(process.env.CHANNEL_WELCOME);
    if (welcomeChannel?.isTextBased()) {
      const random = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
      const msg = random.replace('{username}', `<@${user.id}>`);
      welcomeChannel.send(msg).catch(console.error);
    }
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
