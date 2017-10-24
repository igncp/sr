import {
  createListKeysHandlers,
} from "../createListKeysHandlers"

describe(_getTopDescribeText(__filename), () => {
  describe("handleEnter", () => {
    let args

    beforeEach(() => {
      args = {
        list: {
          getScroll: jest.fn(() => "scrollValue"),
          select: jest.fn(),
        },
        screen: {
          render: jest.fn(),
        },
        onEnter: jest.fn(() => true),
        handleMoveDown: jest.fn(),
        handleMoveUp: jest.fn(),
        getRowsLength: jest.fn(() => 10),
        onMove: jest.fn(),
      }
    })

    it("calls the expected functions when not shouldnt move", async () => {
      args.onEnter = jest.fn(() => false)

      const { handleEnter } = createListKeysHandlers(args)

      await handleEnter()

      expect(args.list.getScroll.mock.calls).toEqual([[]])
      expect(args.onEnter.mock.calls).toEqual([[{
        itemIndex: "scrollValue",
      }]])
    })

    it("calls the expected functions when should move down", async () => {
      const { handleEnter } = createListKeysHandlers(args)

      await handleEnter()

      expect(args.list.getScroll.mock.calls).toEqual([[], []])
      expect(args.onEnter.mock.calls).toEqual([[{
        itemIndex: "scrollValue",
      }]])
      expect(args.list.select.mock.calls).toEqual([["scrollValue1"]])
      expect(args.screen.render.mock.calls).toEqual([[]])
      expect(args.onMove.mock.calls).toEqual([[{
        itemIndex: "scrollValue1",
      }]])
    })

    it("calls the expected functions when should move up", async () => {
      args.list.getScroll = jest.fn(() => 0)

      const { handleEnter } = createListKeysHandlers(args)

      await handleEnter()

      expect(args.list.getScroll.mock.calls).toEqual([[], []])
      expect(args.onEnter.mock.calls).toEqual([[{
        itemIndex: 0,
      }]])
      expect(args.list.select.mock.calls).toEqual([[0]])
      expect(args.screen.render.mock.calls).toEqual([[]])
      expect(args.onMove.mock.calls).toEqual([[{
        itemIndex: 0,
      }]])
    })

    it("calls the expected functions when it reaches the top", async () => {
      args.list.getScroll = jest.fn(() => 11)

      const { handleEnter } = createListKeysHandlers(args)

      await handleEnter()

      expect(args.list.getScroll.mock.calls).toEqual([[], []])
      expect(args.onEnter.mock.calls).toEqual([[{
        itemIndex: 11,
      }]])
      expect(args.list.select.mock.calls).toEqual([[9]])
      expect(args.screen.render.mock.calls).toEqual([[]])
      expect(args.onMove.mock.calls).toEqual([[{
        itemIndex: 9,
      }]])
    })

    it("calls the expected functions when it is in transition reaches the top", async () => {
      args.list.getScroll = jest.fn(() => 11)

      const {
        handleEnter,
        handleMoveDown,
      } = createListKeysHandlers(args)

      handleEnter()
      handleMoveDown()
      await handleEnter()

      expect(args.list.getScroll.mock.calls).toEqual([[], []])
      expect(args.onEnter.mock.calls).toEqual([[{
        itemIndex: 11,
      }]])
      expect(args.list.select.mock.calls).toEqual([])
      expect(args.screen.render.mock.calls).toEqual([])
      expect(args.onMove.mock.calls).toEqual([[{
        itemIndex: 9,
      }]])
    })
  })
})
