// --- 📁 index.js ---
require('./server.js'); // Startet Webserver
const { Client, GatewayIntentBits, Partials, EmbedBuilder, PermissionsBitField } = require('discord.js');
const { DateTime } = require('luxon');
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

client.commands = new Map();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}

function scheduleDailyMessages() {
  const channelId = process.env.CHANNEL_CHAOS_LOUNGE;
  client.channels.fetch(channelId).then(channel => {
    if (!channel || !channel.isTextBased()) {
      console.error('❌ Kanal für Tagesbegrüßungen nicht gefunden!');
      return;
    }

    function sendMorningMessage() {
      channel.send('🌞 Good morning').catch(console.error);
    }

    function sendEveningMessage() {
      channel.send('🌙 Good evening').catch(console.error);
    }

    function msUntil(hour, minute = 0, second = 0) {
      const now = DateTime.now().setZone('America/New_York');
      let target = now.set({ hour, minute, second, millisecond: 0 });

      if (target <= now) {
        target = target.plus({ days: 1 });
      }

      const diff = target.diff(now).as('milliseconds');
      return diff;
    }

    setTimeout(function morningTimeout() {
      sendMorningMessage();
      setInterval(sendMorningMessage, 24 * 60 * 60 * 1000);
    }, msUntil(6, 0, 0)); // 6:00 New York Time

    setTimeout(function eveningTimeout() {
      sendEveningMessage();
      setInterval(sendEveningMessage, 24 * 60 * 60 * 1000);
    }, msUntil(20, 0, 0)); // 20:00 New York Time
  }).catch(console.error);
}

client.once('ready', async () => {
  console.log(`✅ Chaotic Bot online as ${client.user.tag}`);

  scheduleDailyMessages();

  setTimeout(async () => {
    const welcomeChannel = await client.channels.fetch(process.env.CHANNEL_WELCOME).catch(() => null);
    if (welcomeChannel?.isTextBased()) {
      const messages = await welcomeChannel.messages.fetch({ limit: 10 }).catch(() => null);
      const alreadyPosted = messages?.find(msg =>
        msg.author.id === client.user.id &&
        msg.content.includes('⚛️ Welcome, Bound Fragment')
      );
      if (!alreadyPosted) {
        welcomeChannel.send(`⚛️ Welcome, Bound Fragment, to the Chaotic Icons Multiverse ⚛️\n\nYou have crossed the threshold into a realm shaped by a daring experiment — a collaboration between The Professor and The Broker, who together unleashed a fusion of order and chaos.\n\nNow, you stand at the center of this unraveling reality, chosen to carry the Immutable Laws and to shape the future of the multiverse.\n\nEmbrace your mutation. Learn the rules, wield the chaos, and uncover secrets only fragments can see.\n\nThe path ahead is uncertain — but your journey begins here.\n\n— The Broker\n— The Professor`).then(msg => msg.pin()).catch(console.error);
      }
    }

    // 📣 Erklärungen in Channeln pinnen
    const channelMessages = [
      { id: process.env.CHANNEL_PROFESSOR_SIGNALS, content: `🧪 Signals from the Professor.\nAnnouncements about new packs, discovered worlds, lore expansions & system updates.` },
      { id: process.env.CHANNEL_MULTI_NETWORK, content: `🌐 Access points to the outer web of the Multiverse.\nTwitter, OpenSea, Website, YouTube, and more.` },
      { id: process.env.CHANNEL_CHAOS_LOUNGE, content: `🔊 The open vortex.\nSpeak freely, connect with other fragments, and share your thoughts.` },
      { id: process.env.CHANNEL_THEORY_HUB, content: `🧩 Hidden codes, anomalies, ideas.\nGlitchborn and above can discuss theories, solve riddles, and uncover secrets.` },
      { id: process.env.CHANNEL_NEW_ALERTS, content: `⚠️ Real-time alerts for newly uploaded NFTs.` },
      { id: process.env.CHANNEL_PACK_MANIFESTS, content: `📦 Records of all NFT Packs released.` },
      { id: process.env.CHANNEL_CORE_LORE, content: `📖 The living story of the multiverse.` },
      { id: process.env.CHANNEL_VISUAL_PANELS, content: `🖼️ Comic panels of the lore.` },
      { id: process.env.CHANNEL_DISCOVERED_WORLDS, content: `🌍 A log of all known origin worlds.` },
    ];

    for (const { id, content } of channelMessages) {
      const ch = await client.channels.fetch(id).catch(() => null);
      if (!ch?.isTextBased()) continue;

      const messages = await ch.messages.fetch({ limit: 10 }).catch(() => null);
      const exists = messages?.find(msg => msg.author.id === client.user.id && msg.content === content);
      if (!exists) ch.send(content).then(msg => msg.pin()).catch(console.error);
    }

    // 📜 Entry Protocol (Rules Embed + Reaktion)
    const entryChannel = await client.channels.fetch(process.env.CHANNEL_ENTRY_PROTOCOL).catch(() => null);
    if (entryChannel?.isTextBased()) {
      const messages = await entryChannel.messages.fetch({ limit: 10 }).catch(() => null);
      const alreadyExists = messages?.find(msg => msg.embeds[0]?.title === '📜 Die Immutable Laws');

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
            await member.send(`🧹 You've arrived at the edge of all things. Welcome, Fragment.`);
          } catch {
            console.log('❌ Konnte DM nicht senden.');
          }

          const welcomeChannel = member.guild.channels.cache.get(process.env.CHANNEL_WELCOME);
          if (welcomeChannel?.isTextBased()) {
            const randomMessage = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
            const message = randomMessage.replace('{username}', `<@${member.id}>`);
            welcomeChannel.send(message).catch(console.error);
          }
        });
      }
    }
  }, 3000);
});

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
    await member.send(`👁 Welcome. You are a Watcher now.`);
  } catch {
    console.log('❌ Konnte Watcher-DM nicht senden.');
  }
});

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
    console.error('❌ Fehler beim Command:', error);
    await interaction.reply({ content: 'Something went wrong.', ephemeral: true });
  }
});

client.login(process.env.TOKEN);

process.on('unhandledRejection', error => {
  console.error('Unhandled promise rejection:', error);
});