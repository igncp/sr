import pjson from "../../package"

const mockCommander = {
  version: jest.fn(),
  option: jest.fn(),
  usage: jest.fn(),
  parse: jest.fn(),
  args: ["firstArgValue", "secondArgValue", "thirdArgValue"],
}
const mockHandleParsedCommandOpts = jest.fn()
const mockLogUnhandledRejections = jest.fn()
const mockProcess = {
  argv: "processArgvValue",
  stdin: {
    isTTY: true,
  },
}

jest.mock("../handleParsedCommandOpts", () => mockHandleParsedCommandOpts)
jest.mock("commander", () => mockCommander)
jest.mock("../logUnhandledRejections", () => mockLogUnhandledRejections)

beforeEach(() => {
  mockCommander.delimiters = null
  mockCommander.version.mockImplementation(() => mockCommander)
  mockCommander.option.mockImplementation(() => mockCommander)
  mockCommander.usage.mockImplementation(() => mockCommander)
  mockCommander.parse.mockImplementation(() => mockCommander)
})

describe(_getTopDescribeText(__filename), () => {
  const cli = require("../cli")

  it("calls the expected functions", () => {
    cli({
      process: mockProcess,
    })

    expect(mockCommander.version.mock.calls).toEqual([[pjson.version]])
    expect(mockCommander.option.mock.calls).toEqual([
      ["-i, --case-insensitive", "case insensitive search [default=false]"],
      ["-p, --preview", "preview results without modifying files (not applicable to list) [default=false]"],
      ["-c, --confirm", "confirm selection of options [default=false]"],
      ["-e, --existing", "show existing matches of the replacement string, in a list"],
      ["-d, --delimiters", "adds word delimeters to the search pattern [default=false]"],
      ["-f, --files-list-path", "opens this file and uses the files paths inside"],
      ["--disable-list", "disable list to select replacements interactively"],
    ])
    expect(mockCommander.usage.mock.calls).toEqual([["[options] <searchPath searchPattern replacementString>"]])
    expect(mockCommander.parse.mock.calls).toEqual([["processArgvValue"]])
    expect(mockLogUnhandledRejections.mock.calls).toEqual([[mockProcess]])
  })

  it("calls handleParsedCommandOpts with the expected result", async () => {
    await cli({
      process: mockProcess,
    })

    expect(mockHandleParsedCommandOpts.mock.calls).toEqual([[{
      filesList: null,
      searchPath: "firstArgValue",
      searchPattern: "secondArgValue",
      searchReplacement: "thirdArgValue",
      shouldBeCaseSensitive: true,
      shouldBePreview: false,
      shouldConfirmOptions: false,
      shouldDisplayExisting: false,
      shouldUseList: true,
    }]])
  })

  it("calls handleParsedCommandOpts with the expected result when passing delimiters", async () => {
    mockCommander.delimiters = true

    await cli({
      process: mockProcess,
    })

    expect(mockHandleParsedCommandOpts.mock.calls).toEqual([[{
      filesList: null,
      searchPath: "firstArgValue",
      searchPattern: "\\bsecondArgValue\\b",
      searchReplacement: "thirdArgValue",
      shouldBeCaseSensitive: true,
      shouldBePreview: false,
      shouldConfirmOptions: false,
      shouldDisplayExisting: false,
      shouldUseList: true,
    }]])
  })
})
