const mockWalk = {
  walk: jest.fn(),
}
const mockHandleReplacementsInList = jest.fn()
const mockReplacementHelpers = {
  replaceFileIfNecessary: jest.fn(),
}

jest.mock("walk", () => mockWalk)
jest.mock("../listOption/handleReplacementsInList/handleReplacementsInList", () => mockHandleReplacementsInList)
jest.mock("../replacementHelpers", () => mockReplacementHelpers)

beforeEach(() => {
  mockWalk.walk.mockImplementation(() => ({
    on: jest.fn(),
  }))
})

describe(_getTopDescribeText(__filename), () => {
  const handleParsedCommandOpts = require("../handleParsedCommandOpts").default

  describe("handleEnd", () => {
    const { getHandleEndFn } = handleParsedCommandOpts._test

    it("calls the expected functions when shouldUseList", async () => {
      const finalOptions = {
        shouldUseList: true,
      }

      await getHandleEndFn({
        finalOptions,
        fileReplacementPromises: [],
      })()

      expect(mockHandleReplacementsInList.mock.calls).toEqual([[{
        finalOptions,
      }]])
    })

    it("calls the expected functions when !shouldUseList", async () => {
      const finalOptions = {
        shouldUseList: false,
      }
      const fileReplacementPromises = ["promiseValue"]

      await getHandleEndFn({
        finalOptions,
        fileReplacementPromises,
      })()

      expect(mockHandleReplacementsInList.mock.calls).toEqual([])
    })

    it("waits for the promises to finish", async () => {
      let isResolved = false
      const p1 = new Promise(r => setTimeout(r, 5)).then(() => {isResolved = true})
      const p2 = new Promise(r => setTimeout(r, 1))
      const finalOptions = {
        shouldUseList: true,
      }
      const fileReplacementPromises = [p1, p2]

      const p = getHandleEndFn({
        finalOptions,
        fileReplacementPromises,
      })()

      expect(isResolved).toEqual(false)
      expect(mockHandleReplacementsInList.mock.calls).toEqual([])

      await p

      expect(isResolved).toEqual(true)
      expect(mockHandleReplacementsInList.mock.calls).toEqual([[{
        finalOptions,
      }]])
    })
  })

  describe("getHandleFileFn", () => {
    const { getHandleFileFn } = handleParsedCommandOpts._test

    it("calls the expected functions", () => {
      mockReplacementHelpers.replaceFileIfNecessary.mockReturnValue("replacementValue")

      const next = jest.fn()
      const onFileReplacementPromise = jest.fn()

      getHandleFileFn({
        finalOptions: {
          replacementsCollection: [],
          searchPattern: "searchPatternValue",
          searchReplacement: "searchReplacementValue",
          shouldBeCaseSensitive: "shouldBeCaseSensitiveValue",
          shouldBePreview: "shouldBePreviewValue",
          shouldUseList: "shouldUseListValue",
        },
        onFileReplacementPromise,
      })("rootValue", { name: "statValue" }, next)

      expect(next.mock.calls).toEqual([[]])
      expect(onFileReplacementPromise.mock.calls).toEqual([[{
        fileReplacementPromise: "replacementValue",
      }]])
      expect(mockReplacementHelpers.replaceFileIfNecessary.mock.calls).toEqual([[{
        filePath: "rootValue/statValue",
        replacementsCollection: [],
        searchPattern: "searchPatternValue",
        searchReplacement: "searchReplacementValue",
        shouldBeCaseSensitive: "shouldBeCaseSensitiveValue",
        shouldBePreview: "shouldBePreviewValue",
        shouldUseList: "shouldUseListValue",
      }]])
    })
  })
})
