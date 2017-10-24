if (!process.env.LISTENING_TO_UNHANDLED_REJECTION) {
  process.on("unhandledRejection", (reason) => {
    throw reason
  })

  // Avoid memory leak by adding multiple listeners
  process.env.LISTENING_TO_UNHANDLED_REJECTION = true
}

global._getTopDescribeText = (filename) => {
  return filename.split("/").slice(-1)[0]
    .replace(".test.js", "")
}
