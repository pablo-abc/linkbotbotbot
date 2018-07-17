module.exports = controller => {
  controller.hears(
    /(<https?:\/\/((www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*))(\|\2)?>)/g,
    'direct_message,mention,direct_mention,ambient',
    (bot, message) => {
      for (const m of message.match) {
        const mReg = /https?:\/\/((www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*))/.exec(m)
        console.log(mReg)
        const id = message.channel + message.user + mReg[0]
        const link = '<' + mReg[0] + '>'
        const userId = message.user
        const channelId = message.channel
        const linkInfo = {
          userId,
          channelId,
          id,
          link
        }
        controller.storage.links.get(id)
          .then(link => {
            if (!link) {
              return controller.storage.links.save(linkInfo)
            }
          })
      }
    })

  controller.hears(
    /links channel( <#(.*)\|.*>)?/i,
    'direct_message,direct_mention,mention',
    (bot, message) => {
      let channel = message.channel
      const matchedChannel = message.match[2]
      if (matchedChannel) channel = matchedChannel
      controller.storage.links.find({channelId: channel})
        .then(links => {
          if (links.length === 0) { return bot.reply(message, `No links found in <#${channel}>`) }
          const parsedLinks = links.reduce((result, link) => {
            const line = `Link ${link.link}. Added by <@${link.userId}> on <#${link.channelId}>`
            return `${result}${line}\n`
          }, ``)
          bot.reply(message, parsedLinks)
        })
    })

  controller.hears(
    /links user( <@(.*)>)?/i,
    'direct_message,direct_mention,mention',
    (bot, message) => {
      let user = message.user
      console.log(message.match[2])
      console.log(user)
      if (message.match[2]) user = message.match[2]
      controller.storage.links.find({userId: user})
        .then(links => {
          if (links.length === 0) { return bot.reply(message, `No links found by <@${user}>`) }
          const parsedLinks = links.reduce((result, link) => {
            const line = `Link ${link.link}. Added by <@${user}> on <#${link.channelId}>`
            return `${result}${line}\n`
          }, ``)
          bot.reply(message, parsedLinks)
        })
    })

  controller.hears(
    /links count( (user <@(.*)>|(channel)( <#(.*)\|.*>)?))?/,
    'direct_message,direct_mention,mention',
    (bot, message) => {
      let options = {}
      let answer = ``
      if (message.match[3]) {
        options = {userId: message.match[3]}
        answer = ` by <@${message.match[3]}>`
      }
      if (message.match[6]) {
        options = {channelId: message.match[6]}
        answer = ` in <#${message.match[6]}>`
      } else if (message.match[4]) {
        options = {channelId: message.channel}
        answer = ` in this channel`
      }
      controller.storage.links.find(options)
        .then(links => bot.reply(message, `There are ${links.length} links stored inside me${answer}`))
    })

  controller.hears(/stop/i, 'direct_mention,mention,direct_message', (bot, message) => {
    bot.reply(message, `I will never stop, <@${message.user}>`)
  })

  controller.hears('.*', 'direct_mention,mention,direct_message', (bot, message) => {
    bot.reply(message, `I don't understand that command, <@${message.user}>.\nTry to stop being stupid.`)
  })
}
