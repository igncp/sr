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

jest.mock("walk", () => mockWalk)
jest.mock("inquirer", () => mockInquirer)
jest.mock("../helpers", () => mockHelpers)

beforeEach(() => {
  mockWalk.walk.mockImplementation(() => ({
    on: jest.fn(),
  }))
})

describe(_getTopDescribeText(__filename), () => {
  const handleParsedCommandOpts = require("../handleParsedCommandOpts").default

  it("exits if there is no searchPath", async () => {
    mockInquirer.prompt.mockImplementation(() => ({}))

    await handleParsedCommandOpts({})

    expect(mockHelpers.exitWithError.mock.calls).toEqual([[texts.ERRORS.MISSING_PATH]])
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
})
