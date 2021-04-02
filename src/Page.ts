import { MessageEmbed } from 'discord.js'
import { ItemConstruction } from './interfaces/Item'
import { PageOptions, StilizeData } from './interfaces/Page'
import { Item } from './Item'
import { pageToJson } from './utils/pageToJson'

export class Page {
  private _items: Item[]
  public stilize: Required<PageOptions>['stilize']

  constructor(items: (Item | ItemConstruction)[], options?: PageOptions) {
    this._items = items.map((item) => {
      if (item instanceof Item) return item
      return new Item({
        isList: options?.defaultIsList,
        required: options?.defaultRequired,
        splitBy: options?.defaultSplitBy,
        ...item
      })
    })

    const defaultStilize = (data: StilizeData): string | MessageEmbed => {
      const embed = new MessageEmbed()
        .setColor('RANDOM')
        .setDescription(items.map((item) => `${item.name} | \`${item.instanceOf}\` **=>** ${item.value}`))
        .setFooter(`${data.all.fulfilled.pages} completed pages of ${data.all.pages}`)

      return embed
    }

    this.stilize = options?.stilize ?? defaultStilize
  }

  get isFulfilled(): boolean {
    return this._items.every((item) => item.isFulfilled)
  }

  get items(): Item[] {
    return this._items
  }

  toJSON(): Record<string, any> {
    return pageToJson(this)
  }
}
