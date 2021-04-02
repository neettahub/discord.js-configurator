import { Page } from '../Page'

export const pageToJson = (page: Page): Record<string, any> => {
  return page.items.reduce((acc, item) => {
    return implementToObject(acc, item.key, item.isFulfilled ? item.value : null)
  }, {} as any)
}

function implementToObject(obj: Record<string, any>, path: string, value: any): Record<string, any> {
  let objMemo: any = obj
  const keys = path.split('.')

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]

    if (objMemo[key]) {
      objMemo = objMemo[key]
    } else {
      objMemo[key] = i === keys.length - 1 ? value : {}
      objMemo = objMemo[key]
    }
  }

  return obj
}
