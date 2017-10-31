const mockReplacementHelpers = {
  replaceWithCb: jest.fn(),
}
const mockIO = {
  writeFile: jest.fn(),
  readFile: jest.fn(),
}
const mockSetupTerminalListUI = jest.fn()
const mockManageReplacementsEntries = {
  createReplacementsEntriesFromReplacementsCollection: jest.fn(),
  updateReplacementsEntriesForFilePath: jest.fn(),
}

jest.mock("../../../utils/io", () => mockIO)
jest.mock("../../../terminalUI/setupTerminalListUI", () => mockSetupTerminalListUI)
jest.mock("../../../replacementHelpers", () => mockReplacementHelpers)
jest.mock("../manageReplacementsEntries", () => mockManageReplacementsEntries)

beforeEach(() => {
  mockIO.readFile.mockReturnValue("readFileContent")
})

describe(_getTopDescribeText(__filename), () => {
  const handleReplacementsInList = require("../handleReplacementsInList").default

  const setupTest = ({
    replacementIndex = "replacementIndexValue",
  }) => {
    mockManageReplacementsEntries.createReplacementsEntriesFromReplacementsCollection
      .mockReturnValue([{
        filePath: "filePathValue",
        id: "idValue",
        replacementIndex,
        replacementsCount: "replacementsCountValue",
      }])
    mockReplacementHelpers.replaceWithCb.mockReturnValue("replaceWithCbResult")

    handleReplacementsInList({
      searchPattern: "searchPatternValue",
      searchReplacement: "searchReplacementValue",
      shouldBeCaseSensitive: "shouldBeCaseSensitiveValue",
      getListReplacementsCollection: () => [],
    })
  }

  it("returns a promise that calls setupTerminalListUI when the entries have at least one item", () => {
    mockManageReplacementsEntries.createReplacementsEntriesFromReplacementsCollection.mockReturnValue([{}])

    const result = handleReplacementsInList({
      finalOptions: {},
      getListReplacementsCollection: () => [],
    })

    expect(result).toBeInstanceOf(Promise)
    expect(mockSetupTerminalListUI.mock.calls).toEqual([[{
      getListRows: expect.any(Function),
      getPreviewContentOnMove: expect.any(Function),
      onRowSelected: expect.any(Function),
      onSuccess: expect.any(Function),
    }]])
  })

  it("returns a promise that resolves when the entries have 0 items", async () => {
    mockManageReplacementsEntries.createReplacementsEntriesFromReplacementsCollection.mockReturnValue([])

    const result = await handleReplacementsInList({
      finalOptions: {},
      getListReplacementsCollection: () => [],
    })

    expect(result).toEqual({
      wasEmpty: true,
    })
  })

  describe("onRowSelected", () => {
    it("calls the expected functions", async () => {
      setupTest({})

      const { onRowSelected } = mockSetupTerminalListUI.mock.calls[0][0]

      await onRowSelected({
        itemIndex: 0,
      })

      expect(mockIO.readFile.mock.calls).toEqual([["filePathValue"]])
      expect(mockIO.writeFile.mock.calls).toEqual([["filePathValue", "replaceWithCbResult"]])
      expect(mockReplacementHelpers.replaceWithCb.mock.calls).toEqual([[{
        cb: expect.any(Function),
        fileContent: "readFileContent",
        searchPattern: "searchPatternValue",
        shouldBeCaseSensitive: "shouldBeCaseSensitiveValue",
      }]])
      expect(mockManageReplacementsEntries.updateReplacementsEntriesForFilePath.mock.calls).toEqual([[{
        filePath: "filePathValue",
        replacementsEntries: [{
          filePath: "filePathValue",
          id: "idValue",
          replacementIndex: "replacementIndexValue",
          replacementsCount: "replacementsCountValue",
        }],
        searchPattern: "searchPatternValue",
        searchReplacement: "searchReplacementValue",
        shouldBeCaseSensitive: "shouldBeCaseSensitiveValue",
      }]])
    })

    it("passes the expected fn to replaceWithCb when replacementIndex is different", async () => {
      setupTest({
        replacementIndex: 0,
      })

      const { onRowSelected } = mockSetupTerminalListUI.mock.calls[0][0]

      await onRowSelected({
        itemIndex: 0,
      })

      const { cb } = mockReplacementHelpers.replaceWithCb.mock.calls[0][0]

      const result = cb({
        originalStr: "originalStrValue",
        replacementIndex: 1,
      })

      expect(result).toEqual("originalStrValue")
    })

    it("passes the expected fn to replaceWithCb when replacementIndex is equal", async () => {
      setupTest({
        replacementIndex: 1,
      })

      const { onRowSelected } = mockSetupTerminalListUI.mock.calls[0][0]

      await onRowSelected({
        itemIndex: 0,
      })

      const { cb } = mockReplacementHelpers.replaceWithCb.mock.calls[0][0]

      const result = cb({
        originalStr: "originalStrValue",
        replacementIndex: 1,
      })

      expect(result).toEqual("searchReplacementValue")
    })
  })

  describe("getPreviewContentOnMove", () => {
    it("calls the expected functions", async () => {
      setupTest({})

      const { getPreviewContentOnMove } = mockSetupTerminalListUI.mock.calls[0][0]
      const result = await getPreviewContentOnMove({
        itemIndex: 0,
      })

      expect(mockIO.readFile.mock.calls).toEqual([["filePathValue"]])
      expect(result).toEqual({
        content: "replaceWithCbResult",
        focusPosition: 0,
      })
      expect(mockReplacementHelpers.replaceWithCb.mock.calls).toEqual([[{
        cb: expect.any(Function),
        fileContent: "readFileContent",
        searchPattern: "searchPatternValue",
        shouldBeCaseSensitive: "shouldBeCaseSensitiveValue",
      }]])
    })

    it("passes the expected cb to replaceWithCb when same replacement index", async () => {
      setupTest({
        replacementIndex: 0,
      })

      const { getPreviewContentOnMove } = mockSetupTerminalListUI.mock.calls[0][0]

      await getPreviewContentOnMove({
        itemIndex: 0,
      })

      const { cb } = mockReplacementHelpers.replaceWithCb.mock.calls[0][0]

      const cbResult = cb({
        originalStr: "originalStrValue",
        replacementIndex: 0,
      })

      expect(cbResult).toEqual("{black-fg}{white-bg}searchReplacementValue{/white-bg}{/black-fg}")
    })

    it("passes the expected cb to replaceWithCb when different replacement index", async () => {
      setupTest({
        replacementIndex: 0,
      })

      const { getPreviewContentOnMove } = mockSetupTerminalListUI.mock.calls[0][0]

      await getPreviewContentOnMove({
        itemIndex: 0,
      })

      const { cb } = mockReplacementHelpers.replaceWithCb.mock.calls[0][0]

      const cbResult = cb({
        originalStr: "originalStrValue",
        replacementIndex: 1,
      })

      expect(cbResult).toEqual("originalStrValue")
    })
  })

  describe("getListRows", () => {
    it("returns the expected rows", () => {
      setupTest({})

      const { getListRows } = mockSetupTerminalListUI.mock.calls[0][0]

      const result = getListRows()

      expect(result).toEqual([{
        id: "idValue",
        value: "filePathValue replacementIndexValue1 / replacementsCountValue",
      }])
    })
  })
})
