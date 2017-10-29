// @flow

type T_removeItemsFromArrayWhere = <T: *>(T[], (T) => boolean) => void

export const removeItemsFromArrayWhere: T_removeItemsFromArrayWhere = (arr, predicate) => {
  for (let i = arr.length - 1; i >= 0; i--) {
    const item = arr[i]
    const shouldRemoveItem = predicate(item)

    if (shouldRemoveItem) {
      arr.splice(i, 1)
    }
  }
}

type T_addItemsInArrayAtIndexPos = <T: *>(T[], T[], number) => void

export const addItemsInArrayAtIndexPos: T_addItemsInArrayAtIndexPos = (items, arr, indexPos) => {
  items.forEach((item, itemIndex) => {
    arr.splice(indexPos + itemIndex, 0, (item: any))
  })
}
