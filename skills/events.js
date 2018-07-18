module.exports = function(controller) {

    controller.on('user_channel_join,user_group_join', function(bot, message) {

        bot.reply(message, 'Welcome, <@' + message.user + '>');

    });
    
    controller.on('reaction_added', (bot, event) => {
      console.log(event)
      if (!event.reaction.includes('+1') && !event.reaction.includes('thumbsup'))
        return
      controller.storage.links.find({ts: event.item.ts, channel: event.item.channel})
      .then(links => {
          if (links.length === 0)
            return
          bot.api.reactions.get({ts: links[0].ts, channel: links[0].channelId})
        })
    });
}
