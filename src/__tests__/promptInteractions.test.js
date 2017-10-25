import texts from "../texts"

const mockInquirer = {
  prompt: jest.fn(),
}
const mockLifecycleUtils = {
  exitWithError: jest.fn(),
}

jest.mock("inquirer", () => mockInquirer)
jest.mock("../utils/lifecycle", () => mockLifecycleUtils)

describe(_getTopDescribeText(__filename), () => {
  const {
    _test,
    confirmOptions,
  } = require("../promptInteractions")

  describe("buildQuestions", () => {
    const {
      buildQuestions,
      POSSIBLE_QUESTIONS,
    } = _test

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

  describe("validateSearchQuestion", () => {
    const { validateSearchQuestion } = _test

    it("returns the expected results", () => {
      expect(validateSearchQuestion("foo")).toEqual(true)

      expect(validateSearchQuestion(" ")).toEqual(texts.ERRORS.MISSING_SEARCH)
      expect(validateSearchQuestion("")).toEqual(texts.ERRORS.MISSING_SEARCH)
    })
  })
})
