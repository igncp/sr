import {
  removeItemsFromArrayWhere,
  addItemsInArrayAtIndexPos,
} from "../arrays"

describe(_getTopDescribeText(__filename), () => {
  describe("removeItemsFromArrayWhere", () => {
    it("removes the expected items", () => {
      const valueIsEven = v => v % 2 === 0
      const arr = [0, 10, 3, 20]

      removeItemsFromArrayWhere(arr, valueIsEven)

      expect(arr).toEqual([3])
    })
  })

  describe("addItemsInArrayAtIndexPos", () => {
    it("add the items at the expected pos", () => {
      const items = ["foo", "bar"]

      const arr = [0, 1, 2, 3]

      addItemsInArrayAtIndexPos(items, arr, 2)

      expect(arr).toEqual([0, 1, "foo", "bar", 2, 3])
    })
  })
})
