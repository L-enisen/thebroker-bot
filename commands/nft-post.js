// 📁 commands/nft-post.js
const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('nft-post')
    .setDescription('Post a new Chaotic Icons NFT with OpenSea link')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(opt =>
      opt.setName('pack')
        .setDescription('Pack name')
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('nft')
        .setDescription('NFT name')
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('opensea')
        .setDescription('OpenSea link')
        .setRequired(true)
    ),

  async execute(interaction) {
    const pack = interaction.options.getString('pack');
    const nft = interaction.options.getString('nft');
    const opensea = interaction.options.getString('opensea');

    const embed = new EmbedBuilder()
      .setTitle('🧬 New NFT Released')
      .setDescription(`📦 **Pack:** ${pack}\n🎨 **NFT:** ${nft}`)
      .setColor(0x8e44ad);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('View on OpenSea')
        .setStyle(ButtonStyle.Link)
        .setURL(opensea)
    );

    await interaction.reply({ embeds: [embed], components: [row] });
  }
};