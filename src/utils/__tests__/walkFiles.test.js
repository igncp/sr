const mockWalk = {
  walk: jest.fn(),
}

const mockPath = {
  resolve: jest.fn(),
}

jest.mock("path", () => mockPath)
jest.mock("walk", () => mockWalk)

const mockWalker = {
  on: jest.fn(),
}

beforeEach(() => {
  mockWalk.walk.mockReturnValue(mockWalker)

  mockPath.resolve.mockReturnValue("pathResolvedValue")
})

describe(_getTopDescribeText(__filename), () => {
  const walkFiles = require("../walkFiles").default

  it("calls the expected functions", async () => {
    walkFiles({
      walkPath: "walkPathValue",
      handleFile: "handleFileValue",
      handleEnd: "handleEndValue",
    })

    expect(mockPath.resolve.mock.calls).toEqual([["walkPathValue"]])
    expect(mockWalk.walk.mock.calls).toEqual([["pathResolvedValue", { followLinks: false }]])

    expect(mockWalker.on.mock.calls).toEqual([
      ["file", "handleFileValue"],
      ["end", expect.any(Function)],
    ])
  })

  it("calls handleEnd on finished", async () => {
    const handleEnd = jest.fn()
    const promise = walkFiles({
      walkPath: "walkPathValue",
      handleFile: "handleFileValue",
      handleEnd,
    })

    const resolveTriggerFn = mockWalker.on.mock.calls
      .find(c => c[0] === "end")[1]

    resolveTriggerFn()

    expect(handleEnd.mock.calls).toEqual([])

    await promise

    expect(handleEnd.mock.calls).toEqual([[]])
  })
})
