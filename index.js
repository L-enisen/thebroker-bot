require("./server.js");
const { Client, GatewayIntentBits, Partials, EmbedBuilder, PermissionsBitField } = require('discord.js');
require('dotenv').config();
const welcomeMessages = require('./welcomeMessages');
const fs = require('node:fs');

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

// --- COMMANDS LADEN ---
client.commands = new Map();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}

function scheduleDailyMessages() {
  const channelId = process.env.CHANNEL_CHAOS_LOUNGE; // Definiere in .env z.B. CHANNEL_DAILY_GREETING=1234567890
  const channel = client.channels.cache.get(channelId);
  if (!channel) {
    console.error('❌ Kanal für Tagesbegrüßungen nicht gefunden!');
    return;
  }

  function sendMorningMessage() {
    channel.send('🌞 Good morning').catch(console.error);
  }

  function sendEveningMessage() {
    channel.send('🌙 Good evening').catch(console.error);
  }

  // Hilfsfunktion: Warte bis zur nächsten gewünschten Zeit
  function msUntil(hour, minute = 0, second = 0) {
    const now = new Date();
    const target = new Date();
    target.setHours(hour, minute, second, 0);
    if (target <= now) target.setDate(target.getDate() + 1);
    return target - now;
  }

  // Timer für Morgen-Nachricht
  setTimeout(function morningTimeout() {
    sendMorningMessage();
    setInterval(sendMorningMessage, 24 * 60 * 60 * 1000); // alle 24h wiederholen
  }, msUntil(6, 0, 0));

  // Timer für Abend-Nachricht
  setTimeout(function eveningTimeout() {
    sendEveningMessage();
    setInterval(sendEveningMessage, 24 * 60 * 60 * 1000); // alle 24h wiederholen
  }, msUntil(20, 0, 0));
}

// --- READY EVENT ---
client.once('ready', () => {
  console.log(`✅ Chaotic Bot online as ${client.user.tag}`);

  const guild = client.guilds.cache.first();
  if (!guild) return console.error("❌ Guild not found!");

  setTimeout(() => {
    // --- 📌 WILLKOMMENSMESSAGE ---
    const welcomeChannel = client.channels.cache.get(process.env.CHANNEL_WELCOME);
    if (welcomeChannel?.isTextBased()) {
      welcomeChannel.messages.fetch({ limit: 10 }).then(messages => {
        const alreadyPosted = messages.find(msg =>
          msg.author.id === client.user.id &&
          msg.content.includes('⚛️ Welcome, Bound Fragment')
        );

        if (!alreadyPosted) {
          welcomeChannel.send(`⚛️ Welcome, Bound Fragment, to the Chaotic Icons Multiverse ⚛️

You have crossed the threshold into a realm shaped by a daring experiment — a collaboration between The Professor and The Broker, who together unleashed a fusion of order and chaos.

Now, you stand at the center of this unraveling reality, chosen to carry the Immutable Laws and to shape the future of the multiverse.

Embrace your mutation. Learn the rules, wield the chaos, and uncover secrets only fragments can see.

The path ahead is uncertain — but your journey begins here.

— The Broker  
— The Professor`).then(msg => msg.pin()).catch(console.error);
        }
      }).catch(console.error);
    }

    // --- 📣 CHANNEL ERKLÄRUNGEN ---
    const channelMessages = [
      {
        id: process.env.CHANNEL_PROFESSOR_SIGNALS,
        content: `🧪 Signals from the Professor.\nAnnouncements about new packs, discovered worlds, lore expansions & system updates.\nA direct link to the core.`,
      },
      {
        id: process.env.CHANNEL_MULTI_NETWORK,
        content: `🌐 Access points to the outer web of the Multiverse.\nTwitter, OpenSea, Website, YouTube, and more.\nConnections beyond this reality begin here.`,
      },
      {
        id: process.env.CHANNEL_CHAOS_LOUNGE,
        content: `🔊 The open vortex.\nSpeak freely, connect with other fragments, and share your thoughts across realities.\nAll voices echo here.`,
      },
      {
        id: process.env.CHANNEL_THEORY_HUB,
        content: `🧩 Hidden codes, anomalies, ideas.\nGlitchborn and above can discuss theories, solve riddles, and uncover deeper layers of the multiverse.\nKnowledge isn’t safe here.`,
      },
      {
        id: process.env.CHANNEL_NEW_ALERTS,
        content: `⚠️ Real-time alerts for newly uploaded NFTs.\nTitle, preview & metadata appear the moment chaos is released.\nStay ready. It drops without warning.`,
      },
      {
        id: process.env.CHANNEL_PACK_MANIFESTS,
        content: `📦 Records of all NFT Packs released.\nStructured by group, no links – pure order within chaos.\nSearch and study the patterns.`,
      },
      {
        id: process.env.CHANNEL_CORE_LORE,
        content: `📖 The living story of the multiverse.\nA written journey unfolding piece by piece – secrets, lies, origins.\nRead carefully. Nothing is just a story.`,
      },
      {
        id: process.env.CHANNEL_VISUAL_PANELS,
        content: `🖼️ Comic panels of the lore – released every few days.\nVisual glimpses into what the words can’t show.\nSome truths are better seen.`,
      },
      {
        id: process.env.CHANNEL_DISCOVERED_WORLDS,
        content: `🌍 A log of all known origin worlds from which characters emerged.\nEach world brings new laws, new danger, new energy.\nYour home might be among them.`,
      },
    ];

    for (const { id, content } of channelMessages) {
      const ch = client.channels.cache.get(id);
      if (!ch?.isTextBased()) continue;

      ch.messages.fetch({ limit: 10 }).then(messages => {
        const exists = messages.find(msg =>
          msg.author.id === client.user.id && msg.content === content
        );
        if (!exists) ch.send(content).then(msg => msg.pin()).catch(console.error);
      }).catch(console.error);
    }

    // --- 📜 VERIFIZIERUNGSMESSAGE MIT REAKTION ---
    const entryChannel = client.channels.cache.get(process.env.CHANNEL_ENTRY_PROTOCOL);
    if (entryChannel?.isTextBased()) {
      entryChannel.messages.fetch({ limit: 10 }).then(async messages => {
        const alreadyExists = messages.find(msg =>
          msg.author.id === client.user.id &&
          msg.embeds[0]?.title === '📜 Die Immutable Laws'
        );

        if (!alreadyExists) {
          const embed = new EmbedBuilder()
            .setTitle('📜 Die Immutable Laws')
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

          const collector = msg.createReactionCollector({
            filter: (reaction, user) => reaction.emoji.name === '🌀' && !user.bot,
            dispose: true,
          });

          collector.on('collect', async (reaction, user) => {
            const guild = reaction.message.guild;
            const member = await guild.members.fetch(user.id).catch(() => null);
            if (!member) return;

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
            } catch {
              console.log('❌ Konnte dem Bound Fragment keine DM senden.');
            }

            // --- 📣 Channel-Begrüßung im Welcome-Channel ---
            const welcomeChannel = member.guild.channels.cache.get(process.env.CHANNEL_WELCOME);
            if (welcomeChannel && welcomeChannel.isTextBased()) {
              const randomMessage = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
              const message = randomMessage.replace('{username}', `<@${member.id}>`);
              welcomeChannel.send(message).catch(console.error);
            }
          });
        }
      }).catch(console.error);
    }
  }, 3000);
});

// --- 🔁 GUILD MEMBER JOIN: WATCHER-Rolle + DM ---
client.on('guildMemberAdd', async member => {
  const watcher = member.guild.roles.cache.get(process.env.ROLE_WATCHER);
  if (watcher) {
    try {
      await member.roles.add(watcher);
      console.log(`👁️ Watcher-Rolle an ${member.user.tag} vergeben.`);
    } catch (err) {
      console.error('❌ Fehler beim Zuweisen der Watcher-Rolle:', err);
    }
  }

  try {
    await member.send(
      `👁 Welcome to the entrances of the Chaotic Icons Multiverse.\n\n` +
      `You have been assigned the role: **Watcher**.\n` +
      `You observe. You remain unseen.\n\n` +
      `Chaos is unfolding, and your job is to be a witness.\n` +
      `Be silent. They must not know you are watching.`
    );
  } catch {
    console.log('❌ Konnte dem neuen Watcher keine DM senden.');
  }
});

// --- ⌨️ INTERACTION: SLASH COMMANDS ---
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  const member = await interaction.guild.members.fetch(interaction.user.id);
  if (!member.permissions.has(PermissionsBitField.Flags.Administrator)) {
    await interaction.reply({ content: '⛔ Only the Architect can use this power.', ephemeral: true });
    return;
  }

  try {
    await command.execute(interaction, client);
  } catch (error) {
    console.error('❌ Fehler beim Ausführen des Commands:', error);
    await interaction.reply({ content: 'Something went wrong executing that command.', ephemeral: true });
  }
});

// --- 🔑 LOGIN ---
client.login(process.env.TOKEN);

// --- KEEP BOT ALIVE (Replit Webserver) ---
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('🌀 Chaotic Bot is alive!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🌐 Webserver ready at port ${PORT}`));

process.on('unhandledRejection', error => {
  console.error('Unhandled promise rejection:', error);
});