module.exports = controller => {
  const parseLinks = (bot, message, limit, links, answer)=> {
            const parsedLinks = links.reduce((result, link) => {
              if (limit && link.created < limit)
                return result
              let tags = link.tags ? link.tags : 'No tags for this link'
              tags = tags.toString().replace(/,/g, ', ')
              const line = `┌ Link ${link.link}. Added${answer}\n >─── Tags: \`${tags}\`. Date: _${new Date(link.created * 1000)}_\n└─── ${link.thumbsup}:+1:`
              return `${result}${line}\n`
            }, ``)
            bot.reply(message, parsedLinks)
  }

  controller.hears(
    /delete (<https?:\/\/((www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*))(\|\2)?>)/i,
    'direct_message,mention,direct_mention',
    (bot, message) => {
      const mReg = /https?:\/\/((www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*))/.exec(message.match[1])
      controller.storage.links.find({userId: message.user, link: '<' + mReg[0].toLowerCase() + '>', channelId: message.channel})
      .then(links => {
        if (links.length === 0)
          return bot.reply(message, 'You have not stored this link here')
        bot.reply(message, {
          attachments: [
            {
              title: 'Do you want to delete this link?',
              text: message.match[1],
              callback_id: `delete_link`,
              attachment_type: 'default',
              actions: [
                {
                  name: 'delete',
                  text: 'Delete',
                  value: message.channel + message.user + mReg[0],
                  type: 'button',
                  style: 'danger',
                  confirm: {
                    title: 'Are you sure?',
                    text: 'This will delete this link permanently from this channel',
                    ok_text: 'I am sure',
                    dismiss_text: 'Not sure, actually'
                  }
                }
                ]
            }
            ]
        })
      })
    })
  
  controller.hears(
    /(<https?:\/\/((www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*))(\|\2)?>( *\[[a-z][a-z0-9]*\])*)/ig,
    'direct_message,mention,direct_mention,ambient',
    (bot, message) => {
      for (const m of message.match) {
        let tags = m.match(/\[[a-z][a-z0-9]*\]/ig)
        if (tags) tags = tags.map(tag => tag.toLowerCase())
        const mReg = /https?:\/\/((www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*))/.exec(m)
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
          thumbsup: 0,
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
    /links shared(( by (<@([^>]*)>|me))?( (on|in) ((this channel)|(<#([^\|>]*)\|.*>)))?)?( (from )?this (week|month|day))?( about (([a-z][a-z0-9]*(, [a-z][a-z0-9]*)*)( (and|or) ([a-z][a-z0-9]*))?))?/i,
    'direct_message,direct_mention,mention',
    (bot, message) => {
      let options = {}
      let answer = ``
      let limit = null
      let tags = []
      let channel = message.channel
      if (message.match[3]) {
        if (message.match[4]) {
          options.userId = message.match[3]
          answer += ` by <@${message.match[3]}>`
        } else {
          options.userId = message.user
          answer += ` by you`
        }
      }
      if (message.match[10]) {
        options.channelId = message.match[10]
        channel = message.match[10]
        answer += ` on <#${message.match[10]}>`
      }
      if (message.match[7] || !message.match[7]) {
        options.channelId = message.channel
        answer += ` on this channel`
      }
      if (message.match[13]) {
        switch (message.match[13].toLowerCase()) {
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
      if (message.match[14]) {
        tags = message.match[16].split(',').map(tag => tag.toString().trim().toLowerCase())
        tags = tags.map(tag => {
          return {tags: '[' + tag + ']'}
        })
        if (message.match[18]) {
          tags = tags.concat({tags: '[' + message.match[20].toLowerCase() + ']'})
          switch (message.match[19].toLowerCase()) {
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
          parseLinks(bot, message, limit, links, answer)
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
