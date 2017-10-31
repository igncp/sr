describe(_getTopDescribeText(__filename), () => {
  const {
    getLineNumberOfPositionInString,
  } = require("../strings")

  it("returns the expected value for multiline string", () => {
    const lineNumber = getLineNumberOfPositionInString({
      string: "foo\nbar\nbaz",
      position: 8,
    })

    expect(lineNumber).toEqual(2)
  })

  it("returns the expected value for single line string", () => {
    const lineNumber = getLineNumberOfPositionInString({
      string: "foo bar baz",
      position: 8,
    })

    expect(lineNumber).toEqual(0)
  })
})
