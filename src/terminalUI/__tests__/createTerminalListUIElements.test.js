import { colors } from "../terminalUIConstants"

const mockBlessed = {
  screen: jest.fn(),
  list: jest.fn(),
  box: jest.fn(),
}

jest.mock("blessed", () => mockBlessed)

describe(_getTopDescribeText(__filename), () => {
  const {
    _test,
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
      height: "97%",
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
      height: "90%",
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
      top: "10%",
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
        top: "10%",
        left: "50%",
        width: "50%",
        height: "90%",
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
        [["pageup"], expect.any(Function)],
        [["down"], expect.any(Function)],
        [["pagedown"], expect.any(Function)],
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
          height: 10,
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

      it("subscribes the expected pageup key handler", () => {
        const fn = box.key.mock.calls.find(c => c[0][0] === "pageup") [1]

        fn()

        expect(box.scroll.mock.calls).toEqual([[-4]])
        expect(screen.render.mock.calls).toEqual([[]])
      })

      it("subscribes the expected pagedown key handler", () => {
        const fn = box.key.mock.calls.find(c => c[0][0] === "pagedown") [1]

        fn()

        expect(box.scroll.mock.calls).toEqual([[4]])
        expect(screen.render.mock.calls).toEqual([[]])
      })
    })
  })

  describe("getPreviewBoxPageScrollRows", () => {
    const { getPreviewBoxPageScrollRows } = _test

    it("returns the expected results", () => {
      expect(getPreviewBoxPageScrollRows({ height: 20 })).toEqual(9)
      expect(getPreviewBoxPageScrollRows({ height: 100 })).toEqual(49)
      expect(getPreviewBoxPageScrollRows({ height: 2 })).toEqual(0)
    })
  })
})
