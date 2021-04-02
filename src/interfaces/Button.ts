/* eslint-disable no-undef */
import { GuildEmoji, Message, MessageReaction, User } from 'discord.js'

export interface ButtonConstruction {
  message: Message
  user: User
  emoji: string | GuildEmoji
  filter?: (reaction: MessageReaction, user: User) => boolean
}

export interface ButtonOptions {
  /** While using this option, any event will be emitted */
  act?: (reaction: MessageReaction, user: User) => any
  /** The collector will stop after the first collection */
  once?: boolean
  /**
   * - any: Removes all added reactions (including the target user)
   * - target: Removes added reactions from the target
   * - null: It does not remove any reaction
   */
  removeFrom?: 'any' | 'target'
  /** Whether it should be activated or not at the start */
  activated?: boolean
}
