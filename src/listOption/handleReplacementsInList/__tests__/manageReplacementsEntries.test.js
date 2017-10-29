import { createReplacementsEntriesFromReplacementsCollection } from "../manageReplacementsEntries"

describe(_getTopDescribeText(__filename), () => {
  describe("createReplacementsEntriesFromReplacementsCollection", () => {
    it("returns the expected entries", () => {
      const replacementsEntries = createReplacementsEntriesFromReplacementsCollection([{
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
