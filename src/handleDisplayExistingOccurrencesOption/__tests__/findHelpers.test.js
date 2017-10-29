const mockIO = {
  readFile: jest.fn(),
}

jest.mock("../../utils/io", () => mockIO)

describe(_getTopDescribeText(__filename), () => {
  const { findOccurrencesInFile } = require("../findHelpers")

  describe("findOccurrencesInFile", () => {
    it("returns the expected values when there is a match", async () => {
      mockIO.readFile.mockReturnValue("a foo b foo")

      const result = await findOccurrencesInFile({
        filePath: "filePathValue",
        findString: "foo",
      })

      expect(mockIO.readFile.mock.calls).toEqual([["filePathValue"]])
      expect(result).toEqual({
        filePath: "filePathValue",
        occurrencesCount: 2,
      })
    })

    it("returns the expected values when there is no match", async () => {
      mockIO.readFile.mockReturnValue("a b")

      const result = await findOccurrencesInFile({
        filePath: "filePathValue",
        findString: "foo",
      })

      expect(mockIO.readFile.mock.calls).toEqual([["filePathValue"]])
      expect(result).toEqual({
        filePath: "filePathValue",
        occurrencesCount: 0,
      })
    })
  })
})
