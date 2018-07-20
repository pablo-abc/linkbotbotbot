const axios = require('axios')
const apiUrl = process.env.LINK_API_URL

module.exports = controller => {
  controller.hears(/register "(.*)"/i, 'direct_message', (bot, message) => {
    bot.api.users.info({user: message.user}, (err, response) => {
      const params = {
        username: response.user.name,
        password: message.match[1],
        email: response.user.profile.email,
        slackId: message.user,
        teamId: response.user.team_id
      };
      axios.post(apiUrl + '/users', params)
      .then(response => {
        bot.reply(message, 'User created')
      }).catch(err => {
        console.log(err)
        try {
          const error = err.response.data.error
          if (error.details.messages.email || error.details.messages.username)
            bot.reply(message, 'User or email already exist')
        } catch(erra) {
          bot.reply(message, 'There was a problem')
        }
      })
    })
  })
}