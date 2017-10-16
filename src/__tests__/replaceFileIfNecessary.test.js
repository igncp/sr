const mockHelpers = {
  writeFile: jest.fn(),
  readFile: jest.fn(),
}

jest.mock("../helpers", () => mockHelpers)

beforeEach(() => {
  jest.spyOn(console, "log").mockImplementation(() => null)
})

afterEach(() => {
  console.log.mockRestore()
})

describe(_getTopDescribeText(__filename), () => {
  const replaceFileIfNecessary = require("../replaceFileIfNecessary").default

  it("calls the expected functions when passing a valid change without preview", async () => {
    mockHelpers.readFile.mockReturnValue("fileContentValue")

    await replaceFileIfNecessary({
      filePath: "filePathValue",
      finalOptions: {
        searchPattern: "Value",
        searchReplacement: "NewValue",
      },
    })

    expect(mockHelpers.readFile.mock.calls).toEqual([["filePathValue"]])
    expect(mockHelpers.writeFile.mock.calls).toEqual([["filePathValue", "fileContentNewValue"]])
  })

  it("calls the expected functions when passing a valid change with shouldUseList", async () => {
    mockHelpers.readFile.mockReturnValue("fileContentValue")

    const replacementsCollection = []

    await replaceFileIfNecessary({
      filePath: "filePathValue",
      finalOptions: {
        replacementsCollection,
        searchPattern: "Value",
        searchReplacement: "NewValue",
        shouldUseList: true,
      },
    })

    expect(mockHelpers.readFile.mock.calls).toEqual([["filePathValue"]])
    expect(mockHelpers.writeFile.mock.calls).toEqual([])
    expect(replacementsCollection).toEqual([{
      filePath: "filePathValue",
      replacementsCount: 1,
    }])
  })

  it("calls the expected functions when passing a valid change with preview", async () => {
    mockHelpers.readFile.mockReturnValue("fileContentValue")

    await replaceFileIfNecessary({
      filePath: "filePathValue",
      finalOptions: {
        searchPattern: "Value",
        searchReplacement: "NewValue",
        shouldBePreview: true,
      },
    })

    expect(mockHelpers.readFile.mock.calls).toEqual([["filePathValue"]])
    expect(mockHelpers.writeFile.mock.calls).toEqual([])
  })

  it("calls the expected functions when passing a no-change", async () => {
    mockHelpers.readFile.mockReturnValue("fileContentValue")

    await replaceFileIfNecessary({
      filePath: "filePathValue",
      finalOptions: {
        searchPattern: "Value",
        searchReplacement: "Value",
        shouldBePreview: true,
      },
    })

    expect(mockHelpers.readFile.mock.calls).toEqual([["filePathValue"]])
    expect(mockHelpers.writeFile.mock.calls).toEqual([])
  })

  describe("replace", () => {
    const { replace } = replaceFileIfNecessary._test

    it("replaces case insensitive when expected", () => {
      const result = replace({
        fileContent: "contentValue",
        finalOptions: {
          shouldBeCaseSensitive: false,
          searchPattern: "value",
          searchReplacement: "Replacement",
        },
      })

      expect(result).toEqual({
        newFileContent: "contentReplacement",
        replacementsCount: 1,
      })
    })

    it("replaces case sensitive when expected", () => {
      const result = replace({
        fileContent: "contentValue",
        finalOptions: {
          shouldBeCaseSensitive: true,
          searchPattern: "value",
          searchReplacement: "Replacement",
        },
      })

      expect(result).toEqual({
        newFileContent: "contentValue",
        replacementsCount: 0,
      })
    })
  })
})
