import chalk from "chalk"

import texts from "../texts"

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
  jest.spyOn(console, "log").mockImplementation(() => null)
})

afterEach(() => {
  console.log.mockRestore()
})

describe(_getTopDescribeText(__filename), () => {
  const walkFilesForReplacements = require("../walkFilesForReplacements").default

  describe("handleEnd", () => {
    const { getHandleEndFn } = walkFilesForReplacements._test

    it("calls the expected functions when shouldUseList", async () => {
      const finalOptions = {
        shouldUseList: true,
        searchPattern: "searchPatternValue",
        shouldBeCaseSensitive: "shouldBeCaseSensitiveValue",
        searchReplacement: "searchReplacementValue",
      }

      await getHandleEndFn({
        finalOptions,
        fileReplacementPromises: [],
      })()

      expect(mockHandleReplacementsInList.mock.calls).toEqual([[{
        searchPattern: "searchPatternValue",
        shouldBeCaseSensitive: "shouldBeCaseSensitiveValue",
        searchReplacement: "searchReplacementValue",
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
        searchPattern: "searchPatternValue",
        shouldBeCaseSensitive: "shouldBeCaseSensitiveValue",
        searchReplacement: "searchReplacementValue",
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
        searchPattern: "searchPatternValue",
        shouldBeCaseSensitive: "shouldBeCaseSensitiveValue",
        searchReplacement: "searchReplacementValue",
      }]])
    })
  })

  describe("getHandleFileFn", () => {
    const { getHandleFileFn } = walkFilesForReplacements._test

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
        getShouldReplaceFile: expect.any(Function),
        onFileReplaced: expect.any(Function),
        searchPattern: "searchPatternValue",
        searchReplacement: "searchReplacementValue",
        shouldBeCaseSensitive: "shouldBeCaseSensitiveValue",
      }]])
    })

    const getTestItems = (extraFinalOpts) => {
      mockReplacementHelpers.replaceFileIfNecessary.mockReturnValue("replacementValue")

      const spies = {
        onFileReplacementPromise: jest.fn(),
        onListReplacementFound: jest.fn(),
      }

      getHandleFileFn({
        finalOptions: {
          searchPattern: "searchPatternValue",
          searchReplacement: "searchReplacementValue",
          shouldBeCaseSensitive: "shouldBeCaseSensitiveValue",
          shouldBePreview: "shouldBePreviewValue",
          shouldUseList: "shouldUseListValue",
          ...extraFinalOpts,
        },
        ...spies,
      })("rootValue", { name: "statValue" }, () => null)

      const {
        getShouldReplaceFile,
        onFileReplaced,
      } = mockReplacementHelpers.replaceFileIfNecessary.mock.calls[0][0]

      return {
        getShouldReplaceFile,
        onFileReplaced,
        spies,
      }
    }

    describe("getShouldReplaceFile", () => {
      it("calls the expected functions when shouldUseList", () => {
        const {
          spies,
          getShouldReplaceFile,
        } = getTestItems({
          shouldUseList: true,
        })

        const result = getShouldReplaceFile({
          replacementsCount: "replacementsCountValue",
        })

        expect(spies.onListReplacementFound.mock.calls).toEqual([[{
          filePath: "rootValue/statValue",
          replacementsCount: "replacementsCountValue",
        }]])
        expect(console.log.mock.calls).toEqual([])
        expect(result).toEqual(false)
      })

      it("calls the expected functions when shouldBePreview", () => {
        const {
          spies,
          getShouldReplaceFile,
        } = getTestItems({
          shouldUseList: false,
          shouldBePreview: true,
        })

        const result = getShouldReplaceFile({
          replacementsCount: "replacementsCountValue",
        })

        expect(spies.onListReplacementFound.mock.calls).toEqual([])
        expect(console.log.mock.calls).toEqual([[chalk.green(`${texts.FILE_UPDATED_PREVIEW} (xreplacementsCountValue) rootValue/statValue`)]])
        expect(result).toEqual(false)
      })

      it("returns true when expected", () => {
        const {
          spies,
          getShouldReplaceFile,
        } = getTestItems({
          shouldUseList: false,
          shouldBePreview: false,
        })

        const result = getShouldReplaceFile({
          replacementsCount: "replacementsCountValue",
        })

        expect(spies.onListReplacementFound.mock.calls).toEqual([])
        expect(console.log.mock.calls).toEqual([])
        expect(result).toEqual(true)
      })
    })

    describe("onFileReplaced", () => {
      it("consoles log the expected text", () => {
        const { onFileReplaced } = getTestItems({})

        onFileReplaced({
          replacementsCount: "replacementsCountValue",
        })

        expect(console.log.mock.calls).toEqual([[chalk.green(`${texts.FILE_UPDATED} (xreplacementsCountValue) rootValue/statValue`)]])
      })
    })
  })
})
