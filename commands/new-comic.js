// 📁 commands/new-comic.js
const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, AttachmentBuilder } = require('discord.js');
const path = require('path');
const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('new-comic')
    .setDescription('Post a new comic panel')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(opt =>
      opt.setName('filename')
        .setDescription('Filename from images_comics folder')
        .setRequired(true))
    .addStringOption(opt =>
      opt.setName('description')
        .setDescription('Description of the scene')
        .setRequired(true)),
  async execute(interaction) {
    const filename = interaction.options.getString('filename');
    const description = interaction.options.getString('description');
    const filePath = path.join(__dirname, '..', 'images_comics', filename);

    if (!fs.existsSync(filePath)) {
      return interaction.reply({ content: '❌ File not found.', ephemeral: true });
    }

    const file = new AttachmentBuilder(filePath);
    const embed = new EmbedBuilder()
      .setTitle('🖼️ New Comic Panel')
      .setDescription(description)
      .setImage(`attachment://${filename}`)
      .setColor(0xe67e22);

    await interaction.reply({ embeds: [embed], files: [file] });
  }
};
