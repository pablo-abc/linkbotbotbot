const axios = require('axios')
const apiUrl = process.env.LINK_API_URL

module.exports = controller => {
  controller.hears(/register "(.*)"/i, 'direct_message', (bot, message) => {
    bot.api.users.info({user: message.user}, (err, response) => {
      console.log(response)
    })
    // axios.post(apiUrl + '/users', params)
    bot.reply(message, `You asked me to register ${message.match[1]}`)
  })
}