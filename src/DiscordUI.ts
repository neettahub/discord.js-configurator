import { Message, TextChannel, User } from 'discord.js'
import EventEmitter from 'events'
import { Button } from './Button'
import { DiscordUIData, Handler, ItemNameAndValue, Filter } from './interfaces/DiscordUI'
import { StilizeData } from './interfaces/Page'
import { Page } from './Page'

export class DiscordUI extends EventEmitter {
  private _pages: Page[]
  private _actualPage: Page
  private _actualPageNumber: number
  private _user: User
  private _channel: TextChannel
  public message!: Message

  private _filter!: Filter
  private _getItemNameAndValue!: ItemNameAndValue
  private _prefix!: string

  constructor (data: DiscordUIData) {
    super()
    this._pages = data.pages
    this._actualPage = data.pages[0]
    this._actualPageNumber = 0
    this._user = data.user
    this._channel = data.channel

    this.setupMessageHandler()
  }

  private checkFulfilled (wasFulfilled: boolean) {
    const everyPageFulfilled = this._pages.every((page) => page.isFulfilled)
    if (everyPageFulfilled && !wasFulfilled) this.emit('UIFulfilled')
    if (!everyPageFulfilled && wasFulfilled) this.emit('UINotFulfilledAnymore')
  }

  private setupMessageHandler (messageHandler?: Handler) {
    if (messageHandler) {
      this._filter = messageHandler.filter
      this._getItemNameAndValue = messageHandler.itemAndValue
      this._prefix = messageHandler.prefix
    } else {
      this._filter = (message: Message) => message.author.equals(this._user) && message.content.length > 0 && message.channel.id === this._channel.id
      this._prefix = ''
      this._getItemNameAndValue = (message: Message) => {
        const [name, value] = message.content.slice(this._prefix.length).split('=')

        return { name, value }
      }
    }
    this._channel.send(this._actualPage.stilize(this.stilizeData()))
      .then((message) => {
        this.startMessageCollector(message)
        this.startButtons(message)
      })
  }

  startMessageCollector (createdMessage: Message) {
    const collector = this._channel.createMessageCollector(this._filter)

    collector.on('collect', (message: Message) => {
      if (this._filter(message) && message.content.toLowerCase().startsWith(this._prefix)) {
        if (message.deletable) message.delete()

        const { name = '', value = '' } = this._getItemNameAndValue(message)
        const item = this._actualPage.items.find((item) => item.name.toLowerCase() === name.toLowerCase())

        if (item) {
          const wasFulfilled = this._actualPage.isFulfilled
          const updated = item.setValue(value)

          this.checkFulfilled(wasFulfilled)

          this.update(createdMessage)

          if (updated && !wasFulfilled && this._actualPage.isFulfilled) {
            this.emit('pageFulfilled', this._actualPage)
          }

          if (wasFulfilled && !this._actualPage.isFulfilled) {
            this.emit('pageNotFulfilledAnymore', this._actualPage)
          }
        }
      }
    })

    this.emit('start', createdMessage, collector)
  }

  private update (message: Message) {
    message.edit(this._actualPage.stilize(this.stilizeData()))
  }

  private stilizeData (): StilizeData {
    return {
      all: {
        fulfilled: {
          items: this._pages.reduce((acc, page) => acc + page.items.filter((item) => item.isFulfilled).length, 0),
          pages: this._pages.filter((page) => page.isFulfilled).length
        },
        toBeFulfilled: {
          pages: this._pages.filter((page) => !page.isFulfilled).length,
          items: this._pages.reduce((acc, page) => acc + page.items.filter((item) => !item.isFulfilled).length, 0)
        },
        items: this._pages.reduce((acc, cur) => acc + cur.items.length, 0),
        pages: this._pages.length
      },
      page: {
        missingItemsToBeFulfilled: this._actualPage.items.filter((item) => !item.isFulfilled).length,
        itemsFulfilled: this._actualPage.items.filter((item) => item.isFulfilled).length
      }
    }
  }

  private startButtons (message: Message) {
    if (this._pages.length > 1) {
      const data = (emoji: any) => ({ message, user: this._user, emoji })

      const [next, last] = [
        new Button(data('➡️'), { removeFrom: 'any', act: () => this.nextPage(message) }),
        new Button(data('⬅️'), { removeFrom: 'any', act: () => this.lastPage(message) })
      ]
    }
  }

  private nextPage (message: Message): void {
    this._actualPageNumber = this._actualPageNumber === (this._pages.length - 1)
      ? 0
      : this._actualPageNumber + 1

    this._actualPage = this._pages[this._actualPageNumber]

    this.update(message)
  }

  private lastPage (message: Message): void {
    this._actualPageNumber = this._actualPageNumber === 0
      ? this._pages.length - 1
      : this._actualPageNumber - 1

    this._actualPage = this._pages[this._actualPageNumber]
    this.update(message)
  }

  toJSON () {
    return this._pages.map((page) => page.toJSON())
  }
}
