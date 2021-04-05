import { ItemConstruction, Instances } from './interfaces/Item'

export class Item {
  private fulfilled: boolean

  public readonly key: Required<ItemConstruction>['key']
  public readonly name: Required<ItemConstruction>['name']
  public readonly instanceOf: Required<ItemConstruction>['instanceOf']
  private _value: Required<ItemConstruction>['value']
  private _splitBy: Required<ItemConstruction>['splitBy']
  public readonly required: Required<ItemConstruction>['required']
  public readonly isList: Required<ItemConstruction>['isList']
  public readonly setter: Required<ItemConstruction>['setter']

  constructor (data: ItemConstruction) {
    this.required = data.required ?? true
    this.isList = data.isList ?? false
    this.key = data.key
    this.name = data.name
    this.setter = data.setter ?? Item.defaultSetter(data.instanceOf)
    this.instanceOf = data.instanceOf
    this._splitBy = data.splitBy ?? ','
    this._value = data.value

    if (data.fulfilled) this.fulfilled = data.fulfilled

    this.required
      ? this.fulfilled = false
      : this.fulfilled = true
  }

  get isRequired (): boolean {
    return this.required
  }

  get isFulfilled (): boolean {
    return this.fulfilled
  }

  get value (): Item['_value'] {
    return this._value
  }

  public setValue (newValue: string): boolean {
    const value = String(newValue).trim()

    if (this.isList) {
      const values = value.split(this._splitBy).map((value) => String(value).trim())
      const allAcceptable = values.every((value) => this.setter(value))
      if (allAcceptable) {
        this.instanceOf === 'number'
          ? this._value = values.map((value) => Number(value))
          : this._value = values

        this.fulfilled = true
      } else {
        const notAccepteds = values.filter((value) => !this.setter(value))

        this._value = `list of '${notAccepteds.join(', ')}' do not match this item type.`

        this.isRequired
          ? this.fulfilled = false
          : this.fulfilled = true
      }

      return allAcceptable
    }

    const acceptable = this.setter(value)

    if (acceptable) {
      if (this.instanceOf === 'number') this._value = Number(value)
      else if (this.instanceOf === 'S/N') this._value = value.toLowerCase() === 's'
      else this._value = value

      this.fulfilled = true
    } else {
      this._value = `value '${value}' does not match this item type.`
      this.isRequired
        ? this.fulfilled = false
        : this.fulfilled = true
    }

    return acceptable
  }

  private static defaultSetter (instance: Instances): (value: string) => boolean {
    switch (instance) {
      case 'text': return (value) => /.+/.test(value)
      case 'number': return (value) => /^\d+$/.test(value)
      case 'url': return (value) => /^(https?|ftp):\/\/(-\.)?([^\s/?\\.#-]+\.?)+(\/[^\s]*)?$/.test(value)
      case 'S/N': return (value) => /^[sn]{1}$/i.test(value)
      default: return (value) => /.+/.test(value)
    }
  }
}
