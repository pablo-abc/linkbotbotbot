# linkbotbotbot
##### The totally not useless link saving bot
---

This bot's whole purpose is to store the links being shared in the channel he's invited to (or links shared to him directly) in order to be able to retrieve them later. How is this useful? I don't know. Maybe you could use it as a sort of bookmark.

## What can he do?

* Store links.
* Show links shared in a the channel.
* Query links by user who shared them, channel it was shared in, tags, etc.
* Deletes links stored by user.

## How to use it?

linkbotbotbot hears and stores by default all the links in the channel he's invited to without needing to use any command. He does this silently as not to clutter the channel with unnecessary messages.

To use the rest of the commands, if you're on a **multi user channel**, you have to mention linkbotbot at the *beginning* or at the *end* of your message.

If you're talking to linkbotbotbot directly you can omit the mention.

### Tags

You can add tags after a link in order to be able to search for links with them.
To add tags you can use the following syntax:

> [www.xkcd.com](https://xkcd.com/) [tag1] [tag2] [tag3]

Spaces between tags are optional but tags must always go next to each other, after the link.

### Search

You can search links that are stored inside of linkbotbotbot.

#### Query by user

You can search links shared by a specific user using the following syntax:

> links shared by [@bobbytables](https://xkcd.com/327/)

#### Query by channel

You can search links shared in a specific channel.

Query on the channel you're in:

> links shared on this channel

Query on a specific channel:

> links shared on [#emacs](https://xkcd.com/378/)

#### Query by timeframe

You can search links shared the past day, week or month by using the following syntax:

> links shared this day

#### Query by tags

You can search by looking for a specific tag or tags like this:

And syntax:
> links shared about tag1, tag2 and tag3
> links shared about tag1, tag2, tag3

Or syntax:
> links shared about tag1, tag2, tag3

#### Combining queries

You can combine the queries before as you like as long as they follow the same order we presented them as:

> links shared by [@bobbytables](https://xkcd/327/) on [#emacs](https://xkcd/378/) this week about hacking and noodles

### Deleting links

If you want to delete a link that has been stored by you, you can do it in the channel where it is stored by writing this:

> delete [www.linktobeaborted.com](https://xkcd.com/545/)