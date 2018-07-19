module.exports = controller => {
  controller.hears(/register /i, 'direct_message', (bot, message) => {
    bot.reply(message, `You asked me to register ${message.match[0]}`)
  })
}