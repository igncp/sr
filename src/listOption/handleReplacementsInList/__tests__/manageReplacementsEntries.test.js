const mockReplacementHelpers = {
  replaceFileIfNecessary: jest.fn(),
}

jest.mock("../../../replacementHelpers", () => mockReplacementHelpers)
describe(_getTopDescribeText(__filename), () => {
  const {
    createReplacementsEntriesFromReplacementsCollection,
    updateReplacementsEntriesForFilePath,
  } = require("../manageReplacementsEntries")

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

  describe("updateReplacementsEntriesForFilePath", () => {
    it("calls the expected functions", async () => {
      mockReplacementHelpers.replaceFileIfNecessary.mockReturnValue({
        replacementsCount: 2,
        filePath: "filePathValue2",
      })

      const replacementsEntries = [{
        id: 3,
        filePath: "filePathValue",
      }, {
        id: 5,
        filePath: "filePathValue4",
      }, {
        id: 4,
        filePath: "filePathValue3",
      }]

      await updateReplacementsEntriesForFilePath({
        filePath: "filePathValue",
        replacementsEntries,
        searchPattern: "searchPatternValue",
        searchReplacement: "searchReplacementValue",
        shouldBeCaseSensitive: true,
      })

      expect(mockReplacementHelpers.replaceFileIfNecessary.mock.calls).toEqual([[{
        filePath: "filePathValue",
        getShouldReplaceFile: expect.any(Function),
        searchPattern: "searchPatternValue",
        searchReplacement: "searchReplacementValue",
        shouldBeCaseSensitive: true,
      }]])

      expect(replacementsEntries).toEqual([{
        filePath: "filePathValue2",
        id: 6,
        replacementIndex: 0,
        replacementsCount: 2,
      }, {
        filePath: "filePathValue2",
        id: 7,
        replacementIndex: 1,
        replacementsCount: 2,
      }, {
        filePath: "filePathValue4",
        id: 5,
      }, {
        filePath: "filePathValue3",
        id: 4,
      }])
    })

    it("passes the expected getShouldReplaceFile function", async () => {
      mockReplacementHelpers.replaceFileIfNecessary.mockReturnValue({})

      const replacementsEntries = [{}]

      await updateReplacementsEntriesForFilePath({
        filePath: "filePathValue",
        replacementsEntries,
        searchPattern: "searchPatternValue",
        searchReplacement: "searchReplacementValue",
        shouldBeCaseSensitive: true,
      })

      const { getShouldReplaceFile } = mockReplacementHelpers.replaceFileIfNecessary.mock.calls[0][0]

      expect(getShouldReplaceFile()).toEqual(false)
    })
  })
})
