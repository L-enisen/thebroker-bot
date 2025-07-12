// 📁 commands/side-quest.js
const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

const quests = [
  
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('side-quest')
    .setDescription('Reveal a random side quest')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    const quest = quests[Math.floor(Math.random() * quests.length)];
    const embed = new EmbedBuilder()
      .setTitle('🧩 New Side Quest')
      .setDescription(quest)
      .setColor(0xf39c12);

    await interaction.reply({ embeds: [embed] });
  }
};