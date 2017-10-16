import texts from "../texts"

const mockInquirer = {
  prompt: jest.fn(),
}
const mockWalk = {
  walk: jest.fn(),
}
const mockHelpers = {
  exitWithError: jest.fn(),
}
const mockHandleReplacementsInList = jest.fn()
const mockReplaceFileIfNecessary = jest.fn()

jest.mock("walk", () => mockWalk)
jest.mock("inquirer", () => mockInquirer)
jest.mock("../helpers", () => mockHelpers)
jest.mock("../listOption/handleReplacementsInList", () => mockHandleReplacementsInList)
jest.mock("../replaceFileIfNecessary", () => mockReplaceFileIfNecessary)

beforeEach(() => {
  mockWalk.walk.mockImplementation(() => ({
    on: jest.fn(),
  }))
})

describe(_getTopDescribeText(__filename), () => {
  const handleParsedCommandOpts = require("../handleParsedCommandOpts").default

  describe("handleParsedCommandOpts", () => {
    const { POSSIBLE_QUESTIONS } = handleParsedCommandOpts._test

    beforeEach(() => {
      jest.spyOn(console, "log").mockImplementation(() => null)
      jest.spyOn(POSSIBLE_QUESTIONS, "confirm")
    })

    afterEach(() => {
      console.log.mockRestore()
      POSSIBLE_QUESTIONS.confirm.mockRestore()
    })

    it("exits if there is no searchPath", async () => {
      mockInquirer.prompt.mockImplementation(() => ({}))

      await handleParsedCommandOpts({})

      expect(mockHelpers.exitWithError.mock.calls).toEqual([[texts.ERRORS.MISSING_PATH]])
    })

    it("subscribes the expected methods to walk", async () => {
      const walker = {
        on: jest.fn(),
      }

      mockWalk.walk.mockReturnValue(walker)
      mockInquirer.prompt.mockImplementation(() => ({}))

      await handleParsedCommandOpts({})

      expect(walker.on.mock.calls).toEqual([
        ["file", expect.any(Function)],
        ["end", expect.any(Function)],
      ])
    })

    it("calls the expected functions when shouldConfirmOptions", async () => {
      mockInquirer.prompt.mockReturnValueOnce({})
      mockInquirer.prompt.mockReturnValueOnce({ confirm: true })

      await handleParsedCommandOpts({
        shouldConfirmOptions: true,
        searchPath: "searchPathValue",
      })

      expect(mockHelpers.exitWithError.mock.calls).toEqual([])
      expect(POSSIBLE_QUESTIONS.confirm.mock.calls).toEqual([[]])
    })
  })

  describe("buildQuestions", () => {
    const {
      buildQuestions,
      POSSIBLE_QUESTIONS,
    } = handleParsedCommandOpts._test

    it("returns the expected questions", () => {
      expect(buildQuestions({})).toEqual([
        POSSIBLE_QUESTIONS.path(),
        POSSIBLE_QUESTIONS.search(),
        POSSIBLE_QUESTIONS.replace(),
      ])

      expect(buildQuestions({
        searchPath: "searchPathValue",
        searchPattern: "searchPatternValue",
        searchReplacement: "searchReplacementValue",
      })).toEqual([])
    })
  })

  describe("confirmOptions", () => {
    const { confirmOptions } = handleParsedCommandOpts._test

    beforeEach(() => {
      jest.spyOn(process, "exit").mockImplementation(() => null)
      jest.spyOn(console, "log").mockImplementation(() => null)
    })

    afterEach(() => {
      process.exit.mockRestore()
      console.log.mockRestore()
    })

    it("exits if the answer is negative", async () => {
      mockInquirer.prompt.mockReturnValue({ confirm: false })

      await confirmOptions({})

      expect(process.exit.mock.calls).toEqual([[0]])
    })

    it("does not exit if the answer is positive", async () => {
      mockInquirer.prompt.mockReturnValue({ confirm: true })

      await confirmOptions({})

      expect(process.exit.mock.calls).toEqual([])
    })
  })

  describe("handleEnd", () => {
    const { getHandleEndFn } = handleParsedCommandOpts._test

    it("calls the expected functions when shouldUseList", async () => {
      const finalOptions = {
        shouldUseList: true,
        replacementsPromises: ["promiseValue"],
      }

      await getHandleEndFn(finalOptions)()

      expect(mockHandleReplacementsInList.mock.calls).toEqual([[{
        finalOptions,
      }]])
    })

    it("calls the expected functions when !shouldUseList", async () => {
      const finalOptions = {
        shouldUseList: false,
        replacementsPromises: ["promiseValue"],
      }

      await getHandleEndFn(finalOptions)()

      expect(mockHandleReplacementsInList.mock.calls).toEqual([])
    })

    it("waits for the promises to finish", async () => {
      let isResolved = false
      const p1 = new Promise(r => setTimeout(r, 5)).then(() => {isResolved = true})
      const p2 = new Promise(r => setTimeout(r, 1))
      const finalOptions = {
        shouldUseList: true,
        replacementsPromises: [p1, p2],
      }

      const p = getHandleEndFn(finalOptions)()

      expect(isResolved).toEqual(false)
      expect(mockHandleReplacementsInList.mock.calls).toEqual([])

      await p

      expect(isResolved).toEqual(true)
      expect(mockHandleReplacementsInList.mock.calls).toEqual([[{
        finalOptions,
      }]])
    })
  })

  describe("validateSearchQuestion", () => {
    const { validateSearchQuestion } = handleParsedCommandOpts._test

    it("returns the expected results", () => {
      expect(validateSearchQuestion("foo")).toEqual(true)

      expect(validateSearchQuestion(" ")).toEqual(texts.ERRORS.MISSING_SEARCH)
      expect(validateSearchQuestion("")).toEqual(texts.ERRORS.MISSING_SEARCH)
    })
  })

  describe("getHandleFileFn", () => {
    const { getHandleFileFn } = handleParsedCommandOpts._test

    it("calls the expected functions", () => {
      mockReplaceFileIfNecessary.mockReturnValue("replacementValue")

      const next = jest.fn()
      const replacementsPromises = []

      getHandleFileFn({
        replacementsPromises,
      })("rootValue", { name: "statValue" }, next)

      expect(next.mock.calls).toEqual([[]])
      expect(replacementsPromises).toEqual(["replacementValue"])
      expect(mockReplaceFileIfNecessary.mock.calls).toEqual([[{
        filePath: "rootValue/statValue",
        finalOptions: {
          replacementsPromises: [
            "replacementValue",
          ],
        },
      }]])
    })
  })
})
