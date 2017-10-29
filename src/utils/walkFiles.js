// @flow

import path from "path"

import walk from "walk"

type T_walkFiles = ({|
  walkPath: string,
  handleFile: Function,
  handleEnd: Function,
|}) => void

const walkFiles: T_walkFiles = ({
  walkPath,
  handleFile,
  handleEnd,
}) => {
  const resolvedWalkPath = path.resolve(walkPath)

  const walker = walk.walk(resolvedWalkPath, { followLinks: false })

  walker.on("file", handleFile)
  walker.on("end", handleEnd)
}

export default walkFiles
