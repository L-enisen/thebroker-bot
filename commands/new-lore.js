// 📁 commands/new-lore.js
const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('new-lore')
    .setDescription('Post a new lore piece')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(opt => opt.setName('text').setDescription('Lore text').setRequired(true)),
  async execute(interaction) {
    const text = interaction.options.getString('text');
    const embed = new EmbedBuilder()
      .setTitle('📖 New Lore Discovered')
      .setDescription(text)
      .setColor(0x9b59b6);

    await interaction.reply({ embeds: [embed] });
  }
};