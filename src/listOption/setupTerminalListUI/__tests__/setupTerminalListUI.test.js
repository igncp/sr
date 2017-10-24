const mockCreateListKeysHandlers = {
  createListKeysHandlers: jest.fn(),
}
const mockCreateTerminalListUIElements = {
  createScreen: jest.fn(),
  createListWithBox: jest.fn(),
  createPreviewBox: jest.fn(),
}

jest.mock("../createListKeysHandlers", () => mockCreateListKeysHandlers)
jest.mock("../../createTerminalListUIElements", () => mockCreateTerminalListUIElements)

const createListWithBoxReturn = {
  list: {
    key: jest.fn(),
    focus: jest.fn(),
  },
  listBox: {
    focus: jest.fn(),
  },
}

const createPreviewBoxReturn = {
  key: jest.fn(),
  setContent: jest.fn(),
}

const createScreenReturn = {
  append: jest.fn(),
  key: jest.fn(),
  render: jest.fn(),
}

beforeEach(() => {
  mockCreateTerminalListUIElements.createListWithBox.mockReturnValue(createListWithBoxReturn)
  mockCreateTerminalListUIElements.createPreviewBox.mockReturnValue(createPreviewBoxReturn)
  mockCreateTerminalListUIElements.createScreen.mockReturnValue(createScreenReturn)
  mockCreateListKeysHandlers.createListKeysHandlers.mockReturnValue({})
})

describe(_getTopDescribeText(__filename), () => {
  const setupTerminalListUI = require("../setupTerminalListUI").default

  it("calls the expected functions", async () => {
    const args = {
      getListRows: jest.fn(() => []),
      getPreviewContentOnMove: jest.fn(() => "previewContentValue"),
    }

    await setupTerminalListUI(args)

    expect(createListWithBoxReturn.list.key.mock.calls.length).toEqual(4)
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
  })
})
