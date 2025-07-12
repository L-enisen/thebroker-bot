// 📁 commands/planet.js
const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, AttachmentBuilder } = require('discord.js');
const path = require('path');
const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('planet')
    .setDescription('Log a newly discovered planet')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(opt =>
      opt.setName('name')
        .setDescription('Planet name')
        .setRequired(true))
    .addStringOption(opt =>
      opt.setName('filename')
        .setDescription('Filename from images_planets folder')
        .setRequired(true)),
  async execute(interaction) {
    const name = interaction.options.getString('name');
    const filename = interaction.options.getString('filename');
    const filePath = path.join(__dirname, '..', 'images_planets', filename);

    if (!fs.existsSync(filePath)) {
      return interaction.reply({ content: '❌ File not found.', ephemeral: true });
    }

    const file = new AttachmentBuilder(filePath);
    const embed = new EmbedBuilder()
      .setTitle(`🌍 New Planet Discovered: ${name}`)
      .setImage(`attachment://${filename}`)
      .setColor(0x1abc9c);

    await interaction.reply({ embeds: [embed], files: [file] });
  }
};
