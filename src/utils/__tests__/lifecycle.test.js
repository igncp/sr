import chalk from "chalk"

describe(_getTopDescribeText(__filename), () => {
  const {
    exitWithError,
  } = require("../lifecycle")

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
      exitWithError("messageValue")

      expect(process.exit.mock.calls).toEqual([[1]])
      expect(console.log.mock.calls).toEqual([[chalk.red("messageValue")]])
    })
  })
})
