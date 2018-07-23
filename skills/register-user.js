const axios = require('axios')
const apiUrl = process.env.LINK_API_URL
const token = process.env.BOT_TOKEN
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

module.exports = controller => {
  const getConversations = (response, message, bot) => {
   const retrieve = (conversations = [], cursor) => {
     bot.api.users.conversations({
       user: message.user, 
       cursor,
       types: 'im,mpim,private_channel,public_channel'
     }, (err, response) => {
       conversations = conversations.concat(response.channels)
       if (response.response_metadata && response.response_metadata.next_cursor)
         return retrieve(conversations, response.response_metadata.next_cursor)
       registerUser(response, message, bot, conversations)
     })
   }
   retrieve()
  }
  
  const registerUser = (response, message, bot, conversations) => {
      const params = {
        username: response.user.name,
        password: message.match[1],
        email: response.user.profile.email,
        slackId: message.user,
        teamId: response.user.team_id,
        conversations
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
        getConversations(response, message, bot)
    })
  })
}