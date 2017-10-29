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
    await walkFiles({
      walkPath: "walkPathValue",
      handleFile: "handleFileValue",
      handleEnd: "handleEndValue",
    })

    expect(mockPath.resolve.mock.calls).toEqual([["walkPathValue"]])
    expect(mockWalk.walk.mock.calls).toEqual([["pathResolvedValue", { followLinks: false }]])

    expect(mockWalker.on.mock.calls).toEqual([
      ["file", "handleFileValue"],
      ["end", "handleEndValue"],
    ])
  })
})
