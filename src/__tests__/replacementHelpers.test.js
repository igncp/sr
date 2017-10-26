const mockIO = {
  writeFile: jest.fn(),
  readFile: jest.fn(),
}

jest.mock("../utils/io", () => mockIO)

beforeEach(() => {
  jest.spyOn(console, "log").mockImplementation(() => null)
})

afterEach(() => {
  console.log.mockRestore()
})

describe(_getTopDescribeText(__filename), () => {
  const {
    replaceFileIfNecessary,
    _test,
  } = require("../replacementHelpers")

  it("calls the expected functions when passing a valid change without preview", async () => {
    mockIO.readFile.mockReturnValue("fileContentValue")

    await replaceFileIfNecessary({
      filePath: "filePathValue",
      searchPattern: "Value",
      searchReplacement: "NewValue",
    })

    expect(mockIO.readFile.mock.calls).toEqual([["filePathValue"]])
    expect(mockIO.writeFile.mock.calls).toEqual([["filePathValue", "fileContentNewValue"]])
  })

  it("calls the expected functions when passing a valid change with shouldUseList", async () => {
    mockIO.readFile.mockReturnValue("fileContentValue")

    const replacementsCollection = []

    await replaceFileIfNecessary({
      filePath: "filePathValue",
      replacementsCollection,
      searchPattern: "Value",
      searchReplacement: "NewValue",
      shouldUseList: true,
    })

    expect(mockIO.readFile.mock.calls).toEqual([["filePathValue"]])
    expect(mockIO.writeFile.mock.calls).toEqual([])
    expect(replacementsCollection).toEqual([{
      filePath: "filePathValue",
      replacementsCount: 1,
    }])
  })

  it("calls the expected functions when passing a valid change with preview", async () => {
    mockIO.readFile.mockReturnValue("fileContentValue")

    await replaceFileIfNecessary({
      filePath: "filePathValue",
      searchPattern: "Value",
      searchReplacement: "NewValue",
      shouldBePreview: true,
    })

    expect(mockIO.readFile.mock.calls).toEqual([["filePathValue"]])
    expect(mockIO.writeFile.mock.calls).toEqual([])
  })

  it("calls the expected functions when passing a no-change", async () => {
    mockIO.readFile.mockReturnValue("fileContentValue")

    await replaceFileIfNecessary({
      filePath: "filePathValue",
      searchPattern: "Value",
      searchReplacement: "Value",
      shouldBePreview: true,
    })

    expect(mockIO.readFile.mock.calls).toEqual([["filePathValue"]])
    expect(mockIO.writeFile.mock.calls).toEqual([])
  })

  describe("replace", () => {
    const { replace } = _test

    it("replaces case insensitive when expected", () => {
      const result = replace({
        fileContent: "contentValue",
        shouldBeCaseSensitive: false,
        searchPattern: "value",
        searchReplacement: "Replacement",
      })

      expect(result).toEqual({
        newFileContent: "contentReplacement",
        replacementsCount: 1,
      })
    })

    it("replaces case sensitive when expected", () => {
      const result = replace({
        fileContent: "contentValue",
        searchPattern: "value",
        searchReplacement: "Replacement",
        shouldBeCaseSensitive: true,
      })

      expect(result).toEqual({
        newFileContent: "contentValue",
        replacementsCount: 0,
      })
    })
  })
})
