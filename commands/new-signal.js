// 📁 commands/new-signal.js
const { SlashCommandBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('new-signal')
    .setDescription('Send a new signal from the Professor')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(opt =>
      opt.setName('title').setDescription('Signal title').setRequired(true))
    .addStringOption(opt =>
      opt.setName('type')
        .setDescription('Type of signal')
        .setRequired(true)
        .addChoices(
          { name: 'Planet', value: '🌍 Planet' },
          { name: 'Pack', value: '📦 Pack' },
          { name: 'Story', value: '📖 Story' },
          { name: 'System', value: '🧪 System' }
        ))
    .addChannelOption(opt =>
      opt.setName('link').setDescription('Link to related channel').addChannelTypes(ChannelType.GuildText)),
  async execute(interaction) {
    const title = interaction.options.getString('title');
    const type = interaction.options.getString('type');
    const link = interaction.options.getChannel('link');

    const content = `${type} Signal: **${title}**\n${link ? `Link: ${link}` : ''}`;
    await interaction.reply({ content, ephemeral: false });
  }
};