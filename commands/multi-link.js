// 📁 commands/multi-link.js
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('multi-link')
    .setDescription('Post multiverse links')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(opt => opt.setName('twitter').setDescription('Twitter link'))
    .addStringOption(opt => opt.setName('website').setDescription('Website URL'))
    .addStringOption(opt => opt.setName('opensea').setDescription('OpenSea collection'))
    .addStringOption(opt => opt.setName('youtube').setDescription('YouTube link'))
    .addStringOption(opt => opt.setName('mail').setDescription('Contact email')),
  async execute(interaction) {
    const twitter = interaction.options.getString('twitter');
    const website = interaction.options.getString('website');
    const opensea = interaction.options.getString('opensea');
    const youtube = interaction.options.getString('youtube');
    const mail = interaction.options.getString('mail');

    let content = '🌐 Multiverse Network Access:\n';
    if (twitter) content += `🐦 Twitter: ${twitter}\n`;
    if (website) content += `🌐 Website: ${website}\n`;
    if (opensea) content += `🪙 OpenSea: ${opensea}\n`;
    if (youtube) content += `📺 YouTube: ${youtube}\n`;
    if (mail) content += `✉️ Mail: ${mail}`;

    await interaction.reply({ content, ephemeral: false });
  }
};
