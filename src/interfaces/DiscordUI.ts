import { Message, TextChannel, User } from 'discord.js'
import { Page } from '../Page'

export interface DiscordUIData {
  /** The channel this UI will appear and collect messages */
  channel: TextChannel
  /** The user who will manage this UI */
  user: User
  /** What pages will be used */
  pages: Page[]
}

export type Filter = (message: Message) => boolean
export type ItemNameAndValue = (message: Message) => { name: string, value: string }

export interface Handler {
  /**
   * A filter to check whether the message will be collected
   * @example
   * (message: Message): boolean => message.content.length > 0
   */
  filter: Filter
  /**
   * Get the item name and its new value by the message input
   * @example
   * (message: Message): { name: string, value: string } => {
   *  const [name, value] = message.content.split('=')
   *
   *  return { name, value }
   * }
   */
  itemAndValue: ItemNameAndValue
  /**
   * Only collect messages that starts with this prefix  `default=''`
   */
  prefix: string
}
