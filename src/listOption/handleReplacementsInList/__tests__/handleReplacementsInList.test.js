const mockReplacementHelpers = {
  replaceWithCb: jest.fn(),
}
const mockIO = {
  writeFile: jest.fn(),
  readFile: jest.fn(),
}
const mockSetupTerminalListUI = jest.fn()
const mockHandleReplacementsInListHelpers = {
  createReplacementEntriesFromReplacementsCollection: jest.fn(),
  resetReplacementIndex: jest.fn(),
}

jest.mock("../../../utils/io", () => mockIO)
jest.mock("../../setupTerminalListUI/setupTerminalListUI", () => mockSetupTerminalListUI)
jest.mock("../../../replacementHelpers", () => mockReplacementHelpers)
jest.mock("../handleReplacementsInListHelpers", () => mockHandleReplacementsInListHelpers)

beforeEach(() => {
  mockIO.readFile.mockReturnValue("readFileContent")
})

describe(_getTopDescribeText(__filename), () => {
  const handleReplacementsInList = require("../handleReplacementsInList").default

  const setupTest = ({
    replacementIndex = "replacementIndexValue",
  }) => {
    mockHandleReplacementsInListHelpers.createReplacementEntriesFromReplacementsCollection
      .mockReturnValue([{
        filePath: "filePathValue",
        id: "idValue",
        replacementIndex,
        replacementsCount: "replacementsCountValue",
      }])
    mockReplacementHelpers.replaceWithCb.mockReturnValue("replaceWithCbResult")

    handleReplacementsInList({
      finalOptions: {
        searchPattern: "searchPatternValue",
        searchReplacement: "searchReplacementValue",
        shouldBeCaseSensitive: "shouldBeCaseSensitiveValue",
      },
      getListReplacementsCollection: () => [],
    })
  }

  it("returns a promise that calls setupTerminalListUI", () => {
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

  describe("getPreviewContentOnMove", () => {
    it("calls the expected functions", async () => {
      setupTest({})

      const { getPreviewContentOnMove } = mockSetupTerminalListUI.mock.calls[0][0]
      const result = await getPreviewContentOnMove({
        itemIndex: 0,
      })

      expect(mockIO.readFile.mock.calls).toEqual([["filePathValue"]])
      expect(result).toEqual("replaceWithCbResult")
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

      const cbResult = cb("originalValue")

      expect(cbResult).toEqual("{black-fg}{white-bg}searchReplacementValue{/white-bg}{/black-fg}")
    })

    it("passes the expected cb to replaceWithCb when different replacement index", async () => {
      setupTest({
        replacementIndex: 1,
      })

      const { getPreviewContentOnMove } = mockSetupTerminalListUI.mock.calls[0][0]

      await getPreviewContentOnMove({
        itemIndex: 0,
      })

      const { cb } = mockReplacementHelpers.replaceWithCb.mock.calls[0][0]

      const cbResult = cb("originalValue")

      expect(cbResult).toEqual("originalValue")
    })
  })

  describe("onRowSelected", () => {
    it("calls the expected functions", async () => {
      setupTest({})

      const removeItem = jest.fn()
      const { onRowSelected } = mockSetupTerminalListUI.mock.calls[0][0]

      await onRowSelected({
        itemIndex: 0,
        removeItem,
      })

      expect(mockIO.readFile.mock.calls).toEqual([["filePathValue"]])
      expect(mockIO.writeFile.mock.calls).toEqual([["filePathValue", "replaceWithCbResult"]])
      expect(removeItem.mock.calls).toEqual([[]])
      expect(mockHandleReplacementsInListHelpers.resetReplacementIndex.mock.calls).toEqual([[{
        replacementsEntries: [],
      }]])
      expect(mockReplacementHelpers.replaceWithCb.mock.calls).toEqual([[{
        cb: expect.any(Function),
        fileContent: "readFileContent",
        searchPattern: "searchPatternValue",
        shouldBeCaseSensitive: "shouldBeCaseSensitiveValue",
      }]])
    })

    it("passes the expected function to replaceWithCb when localReplacementIndex is different", async () => {
      setupTest({
        replacementIndex: 1,
      })

      const removeItem = jest.fn()
      const { onRowSelected } = mockSetupTerminalListUI.mock.calls[0][0]

      await onRowSelected({
        itemIndex: 0,
        removeItem,
      })

      const { cb } = mockReplacementHelpers.replaceWithCb.mock.calls[0][0]

      const result = cb("textValue")

      expect(result).toEqual("textValue")
    })

    it("passes the expected function to replaceWithCb when localReplacementIndex is same", async () => {
      setupTest({
        replacementIndex: 0,
      })

      const removeItem = jest.fn()
      const { onRowSelected } = mockSetupTerminalListUI.mock.calls[0][0]

      await onRowSelected({
        itemIndex: 0,
        removeItem,
      })

      const { cb } = mockReplacementHelpers.replaceWithCb.mock.calls[0][0]

      const result = cb("textValue")

      expect(result).toEqual("searchReplacementValue")
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
