import { colors } from "../constants"

const mockBlessed = {
  screen: jest.fn(),
  list: jest.fn(),
  box: jest.fn(),
}

jest.mock("blessed", () => mockBlessed)

describe(_getTopDescribeText(__filename), () => {
  const {
    createListWithBox,
    createPreviewBox,
    createScreen,
  } = require("../createTerminalListUIElements")

  describe("createListWithBox", () => {
    const box = {
      append: jest.fn(),
    }

    mockBlessed.box.mockReturnValue(box)
    mockBlessed.list.mockReturnValue("listValue")

    const result = createListWithBox({
      items: "itemsValue",
      screen: "screenValue",
    })

    expect(result).toEqual({
      list: "listValue",
      listBox: box,
    })
    expect(mockBlessed.list.mock.calls).toEqual([[{
      height: "100%",
      items: "itemsValue",
      keys: false,
      mouse: true,
      parent: box,
      style: {
        selected: {
          fg: colors.blue,
          bg: colors.grey,
        },
        item: {
          fg: colors.white,
          bg: colors.black,
        },
        fg: colors.white,
        focus: {
          bg: colors.grey,
          item: {
            bg: colors.grey,
          },
        },
        bg: colors.black,
        border: {
          fg: colors.white,
        },
      },
    }]])
    expect(mockBlessed.box.mock.calls).toEqual([[{
      border: {
        type: "line",
      },
      height: "100%",
      left: 0,
      parent: "screenValue",
      style: {
        fg: colors.white,
        bg: colors.black,
        border: {
          fg: colors.white,
        },
        focus: {
          bg: colors.grey,
        },
      },
      tags: true,
      top: 0,
      width: "50%",
    }]])
  })

  describe("createScreen", () => {
    it("calls the expected functions", () => {
      mockBlessed.screen.mockReturnValue("screenValue")

      const result = createScreen()

      expect(mockBlessed.screen.mock.calls).toEqual([[{
        smartCSR: true,
      }]])
      expect(result).toEqual("screenValue")
    })
  })

  describe("createPreviewBox", () => {
    it("calls the expected functions", () => {
      const box = {
        key: jest.fn(),
      }

      mockBlessed.box.mockReturnValue(box)

      createPreviewBox({
        screen: "screenValue",
      })

      expect(mockBlessed.box.mock.calls).toEqual([[{
        top: 0,
        left: "50%",
        width: "50%",
        height: "100%",
        shadow: true,
        alwaysScroll: true,
        scrollbar: {
          ch: " ",
          inverse: true,
        },
        scrollable: true,
        tags: true,
        border: {
          type: "line",
        },
        style: {
          fg: colors.white,
          bg: colors.black,
          border: {
            fg: colors.white,
          },
          focus: {
            bg: colors.grey,
          },
        },
      }]])
      expect(box.key.mock.calls).toEqual([
        [["up"], expect.any(Function)],
        [["down"], expect.any(Function)],
        [["home"], expect.any(Function)],
        [["end"], expect.any(Function)],
      ])
    })

    describe("key handlers", () => {
      let screen
      let box

      beforeEach(() => {
        box = {
          getScrollHeight: jest.fn(),
          key: jest.fn(),
          scroll: jest.fn(),
          scrollTo: jest.fn(),
        }
        screen = {
          render: jest.fn(),
        }

        mockBlessed.box.mockReturnValue(box)

        createPreviewBox({
          screen,
        })
      })

      it("subscribes the expected up key handler", () => {
        const fn = box.key.mock.calls.find(c => c[0][0] === "up") [1]

        fn()

        expect(box.scroll.mock.calls).toEqual([[-1]])
        expect(screen.render.mock.calls).toEqual([[]])
      })

      it("subscribes the expected down key handler", () => {
        const fn = box.key.mock.calls.find(c => c[0][0] === "down") [1]

        fn()

        expect(box.scroll.mock.calls).toEqual([[1]])
        expect(screen.render.mock.calls).toEqual([[]])
      })

      it("subscribes the expected home key handler", () => {
        const fn = box.key.mock.calls.find(c => c[0][0] === "home") [1]

        fn()

        expect(box.scrollTo.mock.calls).toEqual([[0]])
        expect(screen.render.mock.calls).toEqual([[]])
      })

      it("subscribes the expected end key handler", () => {
        box.getScrollHeight.mockReturnValue("scrollHeightValue")

        const fn = box.key.mock.calls.find(c => c[0][0] === "end") [1]

        fn()

        expect(box.scrollTo.mock.calls).toEqual([["scrollHeightValue"]])
        expect(screen.render.mock.calls).toEqual([[]])
      })
    })
  })
})