import texts from "../texts"

const mockLifecycle = {
  exitWithError: jest.fn(),
}
const mockPromptInteractions = {
  getAnswersForFinalOptions: jest.fn(),
  confirmOptions: jest.fn(),
}
const mockWalkFilesForReplacements = jest.fn()

jest.mock("../walkFilesForReplacements", () => mockWalkFilesForReplacements)
jest.mock("../promptInteractions", () => mockPromptInteractions)
jest.mock("../utils/lifecycle", () => mockLifecycle)

describe(_getTopDescribeText(__filename), () => {
  const handleParsedCommandOpts = require("../handleParsedCommandOpts").default

  it("calls the expected functions when it should confirm options", async () => {
    mockPromptInteractions.getAnswersForFinalOptions.mockReturnValue({})

    const parsedCommandOpts = {
      searchPath: "searchPathValue",
      searchPattern: "searchAnswerValue",
      searchReplacement: "searchReplacementValue",
      shouldBeCaseSensitive: "shouldBeCaseSensitiveValue",
      shouldBePreview: "shouldBePreviewValue",
      shouldConfirmOptions: true,
      shouldUseList: "shouldUseListValue",
    }

    const expectedFinalOptions = Object.assign({}, parsedCommandOpts)

    await handleParsedCommandOpts(parsedCommandOpts)

    expect(mockPromptInteractions.getAnswersForFinalOptions.mock.calls).toEqual([[parsedCommandOpts]])
    expect(mockPromptInteractions.confirmOptions.mock.calls).toEqual([[expectedFinalOptions]])
    expect(mockWalkFilesForReplacements.mock.calls).toEqual([[expectedFinalOptions]])
    expect(mockLifecycle.exitWithError.mock.calls).toEqual([])
  })

  it("calls the expected functions when it should not confirm options", async () => {
    mockPromptInteractions.getAnswersForFinalOptions.mockReturnValue({
      search: "searchAnswerValue",
    })

    const parsedCommandOpts = {
      searchPath: "searchPathValue",
      searchPattern: "searchAnswerValue",
      searchReplacement: "searchReplacementValue",
      shouldBeCaseSensitive: "shouldBeCaseSensitiveValue",
      shouldBePreview: "shouldBePreviewValue",
      shouldConfirmOptions: false,
      shouldUseList: "shouldUseListValue",
    }

    const expectedFinalOptions = Object.assign({}, parsedCommandOpts)

    await handleParsedCommandOpts(parsedCommandOpts)

    expect(mockPromptInteractions.getAnswersForFinalOptions.mock.calls).toEqual([[parsedCommandOpts]])
    expect(mockPromptInteractions.confirmOptions.mock.calls).toEqual([])
    expect(mockWalkFilesForReplacements.mock.calls).toEqual([[expectedFinalOptions]])
    expect(mockLifecycle.exitWithError.mock.calls).toEqual([])
  })

  it("uses the answers values when necessary", async () => {
    mockPromptInteractions.getAnswersForFinalOptions.mockReturnValue({
      path: "pathAnswerValue",
      replace: "replaceAnswerValue",
      search: "searchAnswerValue",
    })

    const parsedCommandOpts = {
      searchPath: "",
      searchPattern: "",
      searchReplacement: "",
      shouldBeCaseSensitive: "shouldBeCaseSensitiveValue",
      shouldBePreview: "shouldBePreviewValue",
      shouldConfirmOptions: false,
      shouldUseList: "shouldUseListValue",
    }

    const expectedFinalOptions = Object.assign({}, parsedCommandOpts, {
      searchPath: "pathAnswerValue",
      searchPattern: "searchAnswerValue",
      searchReplacement: "replaceAnswerValue",
    })

    await handleParsedCommandOpts(parsedCommandOpts)

    expect(mockPromptInteractions.getAnswersForFinalOptions.mock.calls).toEqual([[parsedCommandOpts]])
    expect(mockPromptInteractions.confirmOptions.mock.calls).toEqual([])
    expect(mockWalkFilesForReplacements.mock.calls).toEqual([[expectedFinalOptions]])
    expect(mockLifecycle.exitWithError.mock.calls).toEqual([])
  })

  it("calls exitWithError when there is no searchPath", async () => {
    mockPromptInteractions.getAnswersForFinalOptions.mockReturnValue({
      path: "",
    })

    const parsedCommandOpts = {
      searchPath: "",
      searchPattern: "searchAnswerValue",
      searchReplacement: "searchReplacementValue",
      shouldBeCaseSensitive: "shouldBeCaseSensitiveValue",
      shouldBePreview: "shouldBePreviewValue",
      shouldConfirmOptions: false,
      shouldUseList: "shouldUseListValue",
    }

    await handleParsedCommandOpts(parsedCommandOpts)

    expect(mockLifecycle.exitWithError.mock.calls).toEqual([[texts.ERRORS.MISSING_PATH]])
  })
})
