const axios = require('axios')
const apiUrl = process.env.LINK_API_URL
const token = process.env.BOT_TOKEN
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

module.exports = controller => {
  const registerUser = (response, message, bot) => {
      const params = {
        username: response.user.name,
        password: message.match[1],
        email: response.user.profile.email,
        slackId: message.user,
        teamId: response.user.team_id
      };
      axios.post(apiUrl + '/users', params)
      .then(response => {
        //console.log(response)
        bot.reply(message, 'User created. Check your email for a verification link.')
      }).catch(err => {
        try {
          console.log(err)
          const error = err.response.data.error
          if (error.details.messages.email || error.details.messages.username)
            bot.reply(message, 'User or email already exist')
        } catch(error) {
          bot.reply(message, 'There was a problem')
        }
      })
  };

  controller.hears(/register (.*)/i, 'direct_message,direct_mention', (bot, message) => {

    bot.api.users.info({user: message.user}, (err, response) => {
      if (!err)
        registerUser(response, message, bot)
    })
  })
}