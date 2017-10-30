const mockReplacementHelpers = {
  replaceWithCb: jest.fn(),
}
const mockIO = {
  readFile: jest.fn(),
}
const mockSetupTerminalListUI = jest.fn()

jest.mock("../../replacementHelpers", () => mockReplacementHelpers)
jest.mock("../../utils/io", () => mockIO)
jest.mock("../../terminalUI/setupTerminalListUI", () => mockSetupTerminalListUI)

describe(_getTopDescribeText(__filename), () => {
  const handleOccurrencesDatas = require("../handleOccurrencesDatas").default

  it("returns a promise and calls the expected functions", async () => {
    const occurrencesDatas = [{}]
    const result = handleOccurrencesDatas({
      findString: "findStringValue",
      occurrencesDatas,
    })

    expect(result).toBeInstanceOf(Promise)

    expect(mockSetupTerminalListUI.mock.calls).toEqual([[{
      getListRows: expect.any(Function),
      getPreviewContentOnMove: expect.any(Function),
      onRowSelected: expect.any(Function),
      onSuccess: expect.any(Function),
    }]])
  })

  describe("getListRows", () => {
    it("returns the expected result", () => {
      const occurrencesDatas = [{
        filePath: "filePathValue",
        occurrencesCount: 2,
      }]

      handleOccurrencesDatas({
        findString: "findStringValue",
        occurrencesDatas,
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
    it("removes the item from occurrences entries", async () => {
      const occurrencesDatas = [{
        filePath: "filePathValue",
        occurrencesCount: 3,
      }]

      handleOccurrencesDatas({
        findString: "findStringValue",
        occurrencesDatas,
      })

      const {
        onRowSelected,
        getListRows,
      } = mockSetupTerminalListUI.mock.calls[0][0]

      expect(getListRows()).toEqual([{
        id: 0,
        value: "filePathValue 1 / 3",
      }, {
        id: 1,
        value: "filePathValue 2 / 3",
      }, {
        id: 2,
        value: "filePathValue 3 / 3",
      }])

      await onRowSelected({
        itemIndex: 1,
      })

      expect(getListRows()).toEqual([{
        id: 0,
        value: "filePathValue 1 / 3",
      }, {
        id: 2,
        value: "filePathValue 3 / 3",
      }])
    })
  })
})
