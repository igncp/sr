const mockFs = {
  readFile: jest.fn(),
  writeFile: jest.fn(),
}

jest.mock("fs", () => mockFs)

beforeEach(() => {
  mockFs.readFile.mockImplementation((path, format, cb) => cb(null, "contentValue"))
  mockFs.writeFile.mockImplementation((path, content, cb) => cb())
})

describe(_getTopDescribeText(__filename), () => {
  const {
    readFile,
    writeFile,
  } = require("../io")

  describe("readFile", () => {
    it("calls the expected function", async () => {
      await readFile("filePathValue")

      expect(mockFs.readFile.mock.calls).toEqual([["filePathValue", "utf-8", expect.any(Function)]])
    })

    it("returns the expected content", async () => {
      const result = await readFile("filePathValue")

      expect(result).toEqual("contentValue")
    })
  })

  describe("writeFile", () => {
    it("calls the expected function", async () => {
      await writeFile("filePathValue", "fileContentValue")

      expect(mockFs.writeFile.mock.calls).toEqual([["filePathValue", "fileContentValue", expect.any(Function)]])
    })
  })
})
