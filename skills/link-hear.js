module.exports = controller => {
  controller.hears(
    /(<https?:\/\/((www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*))(\|\2)?>( *\[[a-z][a-z0-9]*\])*)/ig,
    'direct_message,mention,direct_mention,ambient',
    (bot, message) => {
      for (const m of message.match) {
        const mReg = /https?:\/\/((www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*))/.exec(m)
        const tags = m.match(/\[[a-z][a-z0-9]*\]/ig)
        const id = message.channel + message.user + mReg[0]
        const link = '<' + mReg[0].toLowerCase() + '>'
        const userId = message.user
        const channelId = message.channel
        const ts = message.ts
        const team = message.team
        const created = message.event_time
        const linkInfo = {
          userId,
          channelId,
          id,
          link,
          ts,
          team,
          tags,
          created
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
    /links shared(( by <@([^>]*)>)?( on ((this channel)|(<#([^\|>]*)\|.*>)))?)?( (from )?this (week|month|day))?/i,
    'direct_message,direct_mention,mention',
    (bot, message) => {
      console.log(message.match[11])
      let options = {}
      let answer = ``
      let limit = null
      if (message.match[3]) {
        options.userId = message.match[3]
        answer += ` by <@${message.match[3]}>`
      }
      if (message.match[8]) {
        options.channelId = message.match[8]
        answer += ` in <#${message.match[8]}>`
      }
      if (message.match[6]) {
        options.channelId = message.channel
        answer += ` on this channel`
      }
      if (message.match[11]) {
        switch (message.match[11].toLowerCase()) {
          case 'day':
            limit = new Date().getTime()/1000 - 86400
            break
          case 'week':
            bot.reply(message, 'Got here too')
            limit = new Date().getTime()/1000 - 604800
            break
          case 'month':
            limit = new Date().getTime()/1000 - 2592000
            break
        }
        bot.reply(message, 'Got here')
      }
      controller.storage.links.find(options)
        .then(links => {
          if (links.length === 0) { return bot.reply(message, `No links found${answer}`) }
          const parsedLinks = links.reduce((result, link) => {
            if (limit && link.created < limit)
              return result
            let tags = link.tags ? link.tags : 'No tags for this link'
            tags = tags.toString().replace(/,/g, ', ')
            const line = `┌Link ${link.link}. Added by <@${link.userId}> on <#${link.channelId}>\n└───Tags: ${tags}`
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
