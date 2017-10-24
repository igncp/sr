import chalk from "chalk"

const mockFs = {
  readFile: jest.fn(),
  writeFile: jest.fn(),
}

jest.mock("fs", () => mockFs)

beforeEach(() => {
  mockFs.readFile.mockImplementation((path, format, cb) => cb(null, "contentValue"))
  mockFs.writeFile.mockImplementation((path, content, cb) => cb())
})

describe(_getTopDescribeText(__filename), () => {
  const helpers = require("../helpers")

  describe("readFile", () => {
    it("calls the expected function", async () => {
      await helpers.readFile("filePathValue")

      expect(mockFs.readFile.mock.calls).toEqual([["filePathValue", "utf-8", expect.any(Function)]])
    })

    it("returns the expected content", async () => {
      const result = await helpers.readFile("filePathValue")

      expect(result).toEqual("contentValue")
    })
  })

  describe("writeFile", () => {
    it("calls the expected function", async () => {
      await helpers.writeFile("filePathValue", "fileContentValue")

      expect(mockFs.writeFile.mock.calls).toEqual([["filePathValue", "fileContentValue", expect.any(Function)]])
    })
  })

  describe("exitWithError", () => {
    const processExit = process.exit
    const consoleLog = console.log

    beforeEach(() => {
      console.log = jest.fn()
      process.exit = jest.fn()
    })

    afterEach(() => {
      process.exit = processExit
      console.log = consoleLog
    })

    it("calls the expected functions", () => {
      helpers.exitWithError("messageValue")

      expect(process.exit.mock.calls).toEqual([[1]])
      expect(console.log.mock.calls).toEqual([[chalk.red("messageValue")]])
    })
  })
})
