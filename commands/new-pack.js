// 📁 commands/new-pack.js
const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, AttachmentBuilder } = require('discord.js');
const path = require('path');
const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('new-pack')
    .setDescription('Post a new NFT Pack')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(opt =>
      opt.setName('packname')
        .setDescription('Name of the Pack')
        .setRequired(true))
    .addStringOption(opt =>
      opt.setName('description')
        .setDescription('Description of the pack')
        .setRequired(true))
    .addStringOption(opt =>
      opt.setName('filename')
        .setDescription('Filename from images_packs folder')
        .setRequired(true)),
  async execute(interaction) {
    const name = interaction.options.getString('packname');
    const description = interaction.options.getString('description');
    const filename = interaction.options.getString('filename');
    const filePath = path.join(__dirname, '..', 'images_packs', filename);

    if (!fs.existsSync(filePath)) {
      return interaction.reply({ content: '❌ File not found.', ephemeral: true });
    }

    const file = new AttachmentBuilder(filePath);
    const embed = new EmbedBuilder()
      .setTitle(`📦 New Pack: ${name}`)
      .setDescription(description)
      .setImage(`attachment://${filename}`)
      .setColor(0x3498db);

    await interaction.reply({ embeds: [embed], files: [file] });
  }
};
