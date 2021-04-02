import { ButtonConstruction, ButtonOptions } from './interfaces/Button'
import { MessageReaction, User } from 'discord.js'
import { EventEmitter } from 'events'

export class Button extends EventEmitter {
  public filter: Required<ButtonConstruction>['filter']
  public emoji: ButtonConstruction['emoji']
  public message: ButtonConstruction['message']
  public user: ButtonConstruction['user']

  private activated: boolean = true
  private options?: ButtonOptions

  constructor (data: ButtonConstruction, options?: ButtonOptions) {
    super()

    this.emoji = data.emoji
    this.message = data.message
    this.user = data.user

    this.options = options

    if (this.options?.activated) this.activated = this.options.activated

    const defaultFilter = ({ emoji }: MessageReaction, user: User): boolean => {
      if (!user.equals(this.user)) return false
      return [emoji.id, emoji.name].includes(typeof this.emoji === 'string' ? this.emoji : this.emoji.id)
    }

    this.filter = data.filter ?? defaultFilter

    this.startListening()
  }

  async startListening () {
    if (!this.activated) await this.message.react(this.emoji)

    const collector = this.message.createReactionCollector(this.filter)

    if (this.options?.removeFrom) {
      const filterForAny = (_: any, user: User) => !user.equals(this.message.author) && this.activated
      const filterForTarget = (_: any, user: User) => user.equals(this.user) && this.activated

      const filter = this.options.removeFrom === 'any'
        ? filterForAny
        : filterForTarget

      const collectorToRemove = this.message.createReactionCollector(filter)
        .on('collect', (messageReaction, user) => {
          messageReaction.users.remove(user)
        })

      collector.on('end', () => collectorToRemove.stop())
    }

    const handleCollect = (messageReaction: MessageReaction, user: User) => {
      if (!this.activated) return null

      if (this.options?.once) collector.stop('once')

      if (this.options?.act) {
        return this.options.act(messageReaction, user)
      }

      this.emit('collect', messageReaction, user)
    }

    collector.on('collect', handleCollect)
  }

  deactivate () {
    const messageReaction = this.message.reactions.cache.find(({ emoji }) => {
      return [emoji.id, emoji.name].includes(typeof this.emoji === 'string' ? this.emoji : this.emoji.id)
    })

    if (messageReaction) {
      messageReaction.remove()
    }
    this.activated = false
  }

  activate () {
    this.message.react(this.emoji)
    this.activated = true
  }
}
