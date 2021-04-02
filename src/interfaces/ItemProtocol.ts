import { Instances } from './Item'

export interface ItemProtocol {
  required: boolean
  name: string
  key: string
  value: string
  isList: boolean
  instanceOf: Instances
  setter: RegExp
  splitBy: string
}
