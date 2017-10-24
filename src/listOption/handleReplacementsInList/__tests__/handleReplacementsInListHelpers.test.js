import {
  resetReplacementIndex,
  createReplacementEntriesFromReplacementsCollection,
} from "../handleReplacementsInListHelpers"

describe(_getTopDescribeText(__filename), () => {
  describe("resetReplacementIndex", () => {
    it("updates the replacement index", () => {
      const replacementsEntries = [{
        filePath: "filePathValueA",
        replacementIndex: 1,
      }, {
        filePath: "filePathValueA",
        replacementIndex: 3,
      }, {
        filePath: "filePathValueB",
        replacementIndex: 2,
      }]

      resetReplacementIndex({
        replacementsEntries,
      })

      expect(replacementsEntries).toEqual([{
        filePath: "filePathValueA",
        replacementIndex: 0,
      }, {
        filePath: "filePathValueA",
        replacementIndex: 1,
      }, {
        filePath: "filePathValueB",
        replacementIndex: 0,
      }])
    })
  })

  describe("createReplacementEntriesFromReplacementsCollection", () => {
    it("returns the expected entries", () => {
      const replacementsEntries = createReplacementEntriesFromReplacementsCollection([{
        replacementsCount: 1,
        foo: "bar",
      }, {
        replacementsCount: 2,
        bam: "baz",
      }])

      expect(replacementsEntries).toEqual([{
        foo: "bar",
        id: 0,
        replacementIndex: 0,
        replacementsCount: 1,
      }, {
        bam: "baz",
        id: 1,
        replacementIndex: 0,
        replacementsCount: 2,
      }, {
        bam: "baz",
        id: 2,
        replacementIndex: 1,
        replacementsCount: 2,
      }])
    })
  })
})
