const mockCreateListKeysHandlers = {
  createListKeysHandlers: jest.fn(),
}
const mockCreateTerminalListUIElements = {
  createScreen: jest.fn(),
  createListWithBox: jest.fn(),
  createPreviewBox: jest.fn(),
}

jest.mock("../createListKeysHandlers", () => mockCreateListKeysHandlers)
jest.mock("../createTerminalListUIElements", () => mockCreateTerminalListUIElements)

const createListWithBoxReturn = {
  list: {
    focus: jest.fn(),
    key: jest.fn(),
    setItems: jest.fn(),
  },
  listBox: {
    focus: jest.fn(),
  },
}

const createPreviewBoxReturn = {
  focus: jest.fn(),
  height: 10,
  key: jest.fn(),
  scrollTo: jest.fn(),
  setContent: jest.fn(),
}

const createScreenReturn = {
  append: jest.fn(),
  destroy: jest.fn(),
  key: jest.fn(),
  render: jest.fn(),
}

beforeEach(() => {
  mockCreateTerminalListUIElements.createListWithBox.mockReturnValue(createListWithBoxReturn)
  mockCreateTerminalListUIElements.createPreviewBox.mockReturnValue(createPreviewBoxReturn)
  mockCreateTerminalListUIElements.createScreen.mockReturnValue(createScreenReturn)
  mockCreateListKeysHandlers.createListKeysHandlers.mockReturnValue({
    handleEnter: "handleEnterValue",
    handleMoveDown: "handleMoveDownValue",
    handleMovePageDown: "handleMovePageDownValue",
    handleMovePageUp: "handleMovePageUpValue",
    handleMoveUp: "handleMoveUpValue",
  })
})

const getCommonPreviewContentOnMoveFn = () => {
  return jest.fn(() => ({
    content: "previewContentValue",
    focusPosition: 30,
  }))
}

describe(_getTopDescribeText(__filename), () => {
  const setupTerminalListUI = require("../setupTerminalListUI").default

  it("calls the expected functions", async () => {
    const args = {
      getListRows: jest.fn(() => []),
      getPreviewContentOnMove: getCommonPreviewContentOnMoveFn(),
    }

    await setupTerminalListUI(args)

    expect(createListWithBoxReturn.list.key.mock.calls.length).toEqual(6)
    expect(createListWithBoxReturn.list.focus.mock.calls).toEqual([[]])
    expect(createListWithBoxReturn.listBox.focus.mock.calls).toEqual([[]])

    expect(createPreviewBoxReturn.key.mock.calls.length).toEqual(1)
    expect(createPreviewBoxReturn.setContent.mock.calls).toEqual([["previewContentValue"]])

    expect(createScreenReturn.append.mock.calls).toEqual([[createListWithBoxReturn.listBox], [createPreviewBoxReturn]])
    expect(createScreenReturn.key.mock.calls.length).toEqual(1)
    expect(createScreenReturn.render.mock.calls).toEqual([[]])

    expect(args.getListRows.mock.calls).toEqual([[]])
    expect(args.getPreviewContentOnMove.mock.calls).toEqual([[{
      itemIndex: 0,
    }]])
    expect(createPreviewBoxReturn.scrollTo.mock.calls).toEqual([[0]])

    expect(createListWithBoxReturn.list.key.mock.calls).toEqual([
      [["down"], "handleMoveDownValue"],
      [["up"], "handleMoveUpValue"],
      [["enter"], "handleEnterValue"],
      [["pageup"], "handleMovePageUpValue"],
      [["pagedown"], "handleMovePageDownValue"],
      [["right"], expect.any(Function)],
    ])

    expect(createPreviewBoxReturn.key.mock.calls).toEqual([
      [["left"], expect.any(Function)],
    ])

    expect(createScreenReturn.key.mock.calls).toEqual([
      [["C-c", "q"], expect.any(Function)],
    ])

    expect(mockCreateListKeysHandlers.createListKeysHandlers.mock.calls).toEqual([[{
      getRowsLength: expect.any(Function),
      list: createListWithBoxReturn.list,
      onEnter: expect.any(Function),
      onMove: expect.any(Function),
      screen: createScreenReturn,
    }]])
  })

  describe("subscribed key functions", () => {
    beforeEach(async () => {
      const args = {
        getListRows: jest.fn(() => []),
        getPreviewContentOnMove: getCommonPreviewContentOnMoveFn(),
      }

      await setupTerminalListUI(args)
    })

    it("adds the expected function to right in list", async () => {
      const fn = createListWithBoxReturn.list.key.mock.calls.find(c => c[0][0] === "right")[1]

      jest.clearAllMocks()

      fn()

      expect(createPreviewBoxReturn.focus.mock.calls).toEqual([[]])
    })

    it("adds the expected function to left in previewBox", async () => {
      const fn = createPreviewBoxReturn.key.mock.calls.find(c => c[0][0] === "left")[1]

      jest.clearAllMocks()

      fn()

      expect(createListWithBoxReturn.list.focus.mock.calls).toEqual([[]])
    })
  })

  it("passes the expected getRowsLength function to createListKeysHandlers", async () => {
    const args = {
      getListRows: jest.fn(() => [{}, {}]),
      getPreviewContentOnMove: getCommonPreviewContentOnMoveFn(),
    }

    await setupTerminalListUI(args)

    const { getRowsLength } = mockCreateListKeysHandlers.createListKeysHandlers.mock.calls[0][0]

    jest.clearAllMocks()

    const result = getRowsLength()

    expect(result).toEqual(2)
  })

  describe("onEnter", () => {
    it("returns false and calls expected functions if rowsValues.length is 0", async () => {
      const args = {
        getListRows: jest.fn(() => []),
        getPreviewContentOnMove: getCommonPreviewContentOnMoveFn(),
        onRowSelected: jest.fn(),
        onSuccess: jest.fn(),
      }

      await setupTerminalListUI(args)

      const { onEnter } = mockCreateListKeysHandlers.createListKeysHandlers.mock.calls[0][0]

      jest.clearAllMocks()

      const result = await onEnter({
        itemIndex: "itemIndexValue",
      })

      expect(result).toEqual(false)
      expect(args.onRowSelected.mock.calls).toEqual([[{
        itemIndex: "itemIndexValue",
      }]])
      expect(args.getListRows.mock.calls).toEqual([[]])
      expect(createScreenReturn.destroy.mock.calls).toEqual([[]])
      expect(args.onSuccess.mock.calls).toEqual([[{}]])
    })

    it("returns false and calls expected functions if rowsValues.length greater than 0", async () => {
      const args = {
        getListRows: jest.fn(() => [{ value: "valueContent" }]),
        getPreviewContentOnMove: getCommonPreviewContentOnMoveFn(),
        onRowSelected: jest.fn(),
        onSuccess: jest.fn(),
      }

      await setupTerminalListUI(args)

      const { onEnter } = mockCreateListKeysHandlers.createListKeysHandlers.mock.calls[0][0]

      jest.clearAllMocks()

      const result = await onEnter({
        itemIndex: "itemIndexValue",
      })

      expect(result).toEqual(false)
      expect(args.onRowSelected.mock.calls).toEqual([[{
        itemIndex: "itemIndexValue",
      }]])
      expect(args.getListRows.mock.calls).toEqual([[]])
      expect(createScreenReturn.destroy.mock.calls).toEqual([])
      expect(args.onSuccess.mock.calls).toEqual([])
      expect(createListWithBoxReturn.list.setItems.mock.calls).toEqual([[["valueContent"]]])
    })
  })
})
