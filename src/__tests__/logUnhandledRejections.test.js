describe(_getTopDescribeText(__filename), () => {
  const logUnhandledRejections = require("../logUnhandledRejections").default

  it("registers the handler when LISTENING_TO_UNHANDLED_REJECTION is not set", () => {
    const processDep = {
      env: {
        LISTENING_TO_UNHANDLED_REJECTION: null,
      },
      on: jest.fn(),
    }

    logUnhandledRejections(processDep)

    expect(processDep.on.mock.calls).toEqual([["unhandledRejection", expect.any(Function)]])
    expect(processDep.env.LISTENING_TO_UNHANDLED_REJECTION).toEqual("true")
  })

  it("does not register the handler when LISTENING_TO_UNHANDLED_REJECTION is set", () => {
    const processDep = {
      env: {
        LISTENING_TO_UNHANDLED_REJECTION: "alreadySetValue",
      },
      on: jest.fn(),
    }

    logUnhandledRejections(processDep)

    expect(processDep.on.mock.calls).toEqual([])
    expect(processDep.env.LISTENING_TO_UNHANDLED_REJECTION).toEqual("alreadySetValue")
  })

  describe("passed function to the handler", () => {
    let fn

    beforeEach(() => {
      const processDep = {
        env: {
          LISTENING_TO_UNHANDLED_REJECTION: null,
        },
        on: jest.fn(),
      }

      logUnhandledRejections(processDep)

      fn = processDep.on.mock.calls[0][1]
    })

    it("throws the reason when there is no url", () => {
      const wrapper = () => fn("reasonValue")

      expect(wrapper).toThrow("reasonValue")
    })

    it("throws the url when present", () => {
      const wrapper = () => fn({
        url: "urlValue",
      })

      expect(wrapper).toThrow("unhandledRejection with url: urlValue")
    })
  })
})
