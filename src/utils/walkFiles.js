// @flow

import path from "path"

import walk from "walk"

type T_walkFiles = ({|
  filesList: ?string[],
  handleEnd: Function,
  handleFile: Function,
  walkPath: string,
|}) => Promise<void>

const createSingleWalker = ({
  walkPath,
  handleFile,
}) => {
  return new Promise((resolve) => {
    const resolvedWalkPath = path.resolve(walkPath)

    const walker = walk.walk(resolvedWalkPath, { followLinks: false })

    walker.on("file", handleFile)
    walker.on("end", resolve)
  })
}

const createMultipleWalker = async ({
  handleEnd,
  handleFile,
  walkPaths,
}) => {
  const promises = walkPaths.map((walkPath) => {
    return createSingleWalker({
      walkPath,
      handleFile,
    })
  })

  await Promise.all(promises)

  handleEnd()
}

const walkFiles: T_walkFiles = ({
  filesList,
  handleEnd,
  handleFile,
  walkPath,
}) => {
  const walkPaths = filesList || [walkPath]

  return createMultipleWalker({
    handleEnd,
    handleFile,
    walkPaths,
  })
}

export default walkFiles
