export type Instances =
  'text' |
  'number' |
  'url' |
  'S/N'

export interface ItemConstruction {
  /**
   * The property to be shown at the result. Deep properties also works
   * @example
   * // key: 'very.deep.key'
   * { very: { deep: { key: value } } }
   */
  key: string
  /** The name to be used by the user `i.g.: 'VeryDeepKey'` */
  name: string
  /** The instance type for this item */
  instanceOf: Instances
  /** A default value  */
  value: string | number | boolean | (string | number)[]
  /** Whether this item is required or not (if not, it will be always fulfilled) `default=true` */
  required?: boolean
  /** Whether this item is a list `default=false` */
  isList?: boolean
  /** The setter for this item. A Function that receives the user input to test before setting the value */
  setter?: (value: string) => boolean
  /** If is a list, how it will be splitted `default=,` */
  splitBy?: string
}
