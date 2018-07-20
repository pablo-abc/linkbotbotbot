module.exports = function (controller) {
  controller.on('user_channel_join,user_group_join', function (bot, message) {
    bot.reply(message, 'Welcome, <@' + message.user + '>')
  })

  controller.on('reaction_added,reaction_removed', (bot, event) => {
    if (!event.reaction.includes('+1') && !event.reaction.includes('thumbsup')) { return }
    controller.storage.Link.find({ts: event.item.ts, channel: event.item.channel})
      .then(links => {
        if (links.length === 0) { return }
        links.map(link => {
          bot.api.reactions.get({timestamp: links[0].ts, channel: links[0].channel}, (err, response) => {
            if (err) return console.log(err)
            if (!response.message.reactions) response.message.reactions = []
            const tCount = response.message.reactions.reduce((total, reaction) => {
              return reaction.name.includes('+1') || reaction.name.includes('thumbsup')
                ? total + reaction.count
                : total
            }, 0)
            link.thumbsup = tCount
            controller.storage.Link.save(link)
          })
        })
      })
  })
  
  controller.on('team_join', (bot, event) => {
    controller.storage.SlackUser.insert({
      username: event.user.name,
      teamId: event.user.team_id,
      slackId: event.user.id
    });
  });
  
  controller.on('bot_channel_join', (bot, message) => {
    console.log('It joined')
  });
}
