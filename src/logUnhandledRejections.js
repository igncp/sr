// @flow

export default (processDep: any) => {
  if (!processDep.env.LISTENING_TO_UNHANDLED_REJECTION) {
    processDep.on("unhandledRejection", (reason) => {
      if (reason.url) {
        throw new Error(`unhandledRejection with url: ${reason.url}`)
      }

      throw reason
    })

    // Avoid memory leak by adding multiple listeners
    processDep.env.LISTENING_TO_UNHANDLED_REJECTION = "true"
  }
}
