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
})
