import pjson from "../../package"

const mockCommander = {
  version: jest.fn(),
  option: jest.fn(),
  usage: jest.fn(),
  parse: jest.fn(),
  args: ["firstArgValue", "secondArgValue", "thirdArgValue"],
}
const mockHandleParsedCommandOpts = jest.fn()

jest.mock("../handleParsedCommandOpts", () => mockHandleParsedCommandOpts)
jest.mock("commander", () => mockCommander)

const processArgv = process.argv

beforeEach(() => {
  process.argv = "processArgvValue"
  mockCommander.version.mockImplementation(() => mockCommander)
  mockCommander.option.mockImplementation(() => mockCommander)
  mockCommander.usage.mockImplementation(() => mockCommander)
  mockCommander.parse.mockImplementation(() => mockCommander)
})

afterEach(() => {
  process.argv = processArgv
})

describe(_getTopDescribeText(__filename), () => {
  const cli = require("../cli")

  it("calls the expected functions", () => {
    cli()

    expect(mockCommander.version.mock.calls).toEqual([[pjson.version]])
    expect(mockCommander.option.mock.calls).toEqual([
      ["-i, --case-insensitive", "case insensitive search [default=false]"],
      ["-p, --preview", "preview results without modifying files (not applicable to list) [default=false]"],
      ["-c, --confirm", "confirm selection of options [default=false]"],
      ["-l, --list", "select replacements using an interactive list (no preview)"],
    ])
    expect(mockCommander.usage.mock.calls).toEqual([["[options] <searchPath searchPattern replacementString>"]])
    expect(mockCommander.parse.mock.calls).toEqual([["processArgvValue"]])
  })

  it("calls handleParsedCommandOpts with the expected result", () => {
    cli()

    expect(mockHandleParsedCommandOpts.mock.calls).toEqual([[{
      searchPath: "firstArgValue",
      searchPattern: "secondArgValue",
      searchReplacement: "thirdArgValue",
      shouldBeCaseSensitive: true,
      shouldBePreview: false,
      shouldConfirmOptions: false,
      shouldUseList: false,
    }]])
  })
})
