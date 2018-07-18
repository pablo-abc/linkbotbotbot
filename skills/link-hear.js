module.exports = controller => {
  controller.hears(
    /(<https?:\/\/((www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*))(\|\2)?>( *\[[a-z][a-z0-9]*\])*)/ig,
    'direct_message,mention,direct_mention,ambient',
    (bot, message) => {
      for (const m of message.match) {
        const mReg = /https?:\/\/((www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*))/.exec(m)
        const tags = m.match(/\[[a-z][a-z0-9]*\]/ig).map(tag => tag.toLowerCase())
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
    /links shared(( by <@([^>]*)>)?( on ((this channel)|(<#([^\|>]*)\|.*>)))?)?( (from )?this (week|month|day))?( about (([a-z][a-z0-9]*(, [a-z][a-z0-9]*)*)( (and|or) ([a-z][a-z0-9]*))?))?/i,
    'direct_message,direct_mention,mention',
    (bot, message) => {
      let options = {}
      let answer = ``
      let limit = null
      let tags = []
      if (message.match[3]) {
        options.userId = message.match[3]
        answer += ` by <@${message.match[3]}>`
      }
      if (message.match[8]) {
        options.channelId = message.match[8]
        answer += ` on <#${message.match[8]}>`
      }
      if (message.match[6] || !message.match[5]) {
        options.channelId = message.channel
        answer += ` on this channel`
      }
      if (message.match[11]) {
        switch (message.match[11].toLowerCase()) {
          case 'day':
            limit = new Date().getTime()/1000 - 86400
            break
          case 'week':
            limit = new Date().getTime()/1000 - 604800
            break
          case 'month':
            limit = new Date().getTime()/1000 - 2592000
            break
        }
      }
      if (message.match[12]) {
        tags = message.match[14].split(',').map(tag => tag.toString().trim().toLowerCase())
        tags = tags.map(tag => {
          return {tags: '[' + tag + ']'}
        })
        if (message.match[16]) {
          tags = tags.concat({tags: '[' + message.match[18].toLowerCase() + ']'})
          switch (message.match[17].toLowerCase()) {
            case 'and':
              options.$and = tags
              break
            case 'or':
              options.$or = tags
              break
          }
        } else options.$and = tags
      }
      controller.storage.links.find(options)
        .then(links => {
          if (links.length === 0) { return bot.reply(message, `No links found${answer}`) }
          const parsedLinks = links.reduce((result, link) => {
            if (limit && link.created < limit)
              return result
            let tags = link.tags ? link.tags : 'No tags for this link'
            tags = tags.toString().replace(/,/g, ', ')
            const line = `┌Link ${link.link}. Added${answer}\n└───Tags: ${tags}. Date: ${new Date(link.created * 1000)}`
            return `${result}${line}\n`
          }, ``)
          bot.reply(message, parsedLinks)
        })
    })
  
  controller.hears(
    /links delete (.*)/i,
    'direct_message,direct_mention,mention',
    (bot, message) => {
      bot.reply(message, {
        attachments: [
          {
            title: 'Your links on this channel:',
            callback_id: `delete_${message.user}`,
            attachment_type: 'default',
            actions: [
              {
                name: 'link_delete',
                text: 'Delete',
                value: 'delete',
                style: 'danger',
                type: 'button',
                confirm: {
                  title: 'Are you sure?',
                  text: 'This action is permanent',
                  ok_text: 'I am sure',
                  dismiss_text: 'I am unsure'
                }
              }
              ]
          }
          ]
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
