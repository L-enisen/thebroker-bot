// 📁 commands/nft-post.js
const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('nft-post')
    .setDescription('Post a new NFT preview')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(opt => opt.setName('pack').setDescription('Pack name').setRequired(true))
    .addStringOption(opt => opt.setName('nft').setDescription('NFT name').setRequired(true))
    .addStringOption(opt => opt.setName('image').setDescription('Image URL').setRequired(true))
    .addStringOption(opt => opt.setName('meta1').setDescription('Metadata 1'))
    .addStringOption(opt => opt.setName('meta2').setDescription('Metadata 2')),
  async execute(interaction) {
    const pack = interaction.options.getString('pack');
    const nft = interaction.options.getString('nft');
    const image = interaction.options.getString('image');
    const meta1 = interaction.options.getString('meta1');
    const meta2 = interaction.options.getString('meta2');

    const embed = new EmbedBuilder()
      .setTitle(`🧬 ${nft} – ${pack}`)
      .setImage(image)
      .addFields(
        meta1 ? { name: 'Metadata 1', value: meta1, inline: true } : {},
        meta2 ? { name: 'Metadata 2', value: meta2, inline: true } : {}
      )
      .setColor(0x2ecc71);

    await interaction.reply({ embeds: [embed] });
  }
};
