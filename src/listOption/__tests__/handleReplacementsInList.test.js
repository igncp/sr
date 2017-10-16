const mockSetupTerminalListUI = jest.fn()
const mockHelpers = {
  readFile: jest.fn(),
  writeFile: jest.fn(),
}

jest.mock("../setupTerminalListUI", () => mockSetupTerminalListUI)
jest.mock("../../helpers", () => mockHelpers)

describe(_getTopDescribeText(__filename), () => {
  const handleReplacementsInList = require("../handleReplacementsInList").default

  it("returns a promise", () => {
    const result = handleReplacementsInList({
      finalOptions: {
        replacementsCollection: [],
      },
    })

    expect(result).toBeInstanceOf(Promise)
  })

  it("calls setupTerminalListUI with the expected content", () => {
    handleReplacementsInList({
      finalOptions: {
        replacementsCollection: [],
      },
    })

    expect(mockSetupTerminalListUI.mock.calls).toEqual([[{
      getListRows: expect.any(Function),
      getPreviewContentOnMove: expect.any(Function),
      onRowSelected: expect.any(Function),
      onSuccess: expect.any(Function),
    }]])
  })

  describe("getListRows", () => {
    it("passes the expected getListRows", () => {
      handleReplacementsInList({
        finalOptions: {
          replacementsCollection: [{
            replacementsCount: 2,
            filePath: "filePathValue",
          }],
        },
      })

      const { getListRows } = mockSetupTerminalListUI.mock.calls[0][0]

      const result = getListRows()

      expect(result).toEqual([{
        id: 0,
        value: "filePathValue 1 / 2",
      }, {
        id: 1,
        value: "filePathValue 2 / 2",
      }])
    })
  })

  describe("onRowSelected", () => {
    it("calls the expected functions", async () => {
      handleReplacementsInList({
        finalOptions: {
          searchPattern: "Content",
          searchReplacement: "REPLACED",
          replacementsCollection: [{
            replacementsCount: 2,
            filePath: "filePathValue",
          }],
        },
      })

      mockHelpers.readFile.mockImplementation(() => "fileContentValue")

      const { onRowSelected } = mockSetupTerminalListUI.mock.calls[0][0]

      const removeItem = jest.fn()

      await onRowSelected({
        itemIndex: 0,
        removeItem,
      })

      expect(mockHelpers.readFile.mock.calls).toEqual([["filePathValue"]])
      expect(mockHelpers.writeFile.mock.calls).toEqual([["filePathValue", "fileREPLACEDValue"]])
      expect(removeItem.mock.calls).toEqual([[]])
    })
  })
})
