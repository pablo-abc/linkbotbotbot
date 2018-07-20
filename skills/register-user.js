const axios = require('axios')
const apiUrl = process.env.LINK_API_URL

module.exports = controller => {
  controller.hears(/register "(.*)"/i, 'direct_message', (bot, message) => {
    bot.api.users.info({user: message.user}, (err, response) => {
      const params = {
        username: response.user.name,
        password: message.match[1],
        email: response.user.profile.email
      };
      axios.post(apiUrl + '/users', params)
      .then(response => {
        if (response.statusCode === 200)
          bot.reply(message, 'User created')
        else bot.reply(message, 'There was a problem')
      }).catch(err => {
        try {
        const error = err.response.data.error
        if (error.details.messages.email || error.details.messages.username)
        console.log(err.response.data.error)
        } catch() {
          bot.reply(message, 'There was a problem')
      })
    })
  })
}