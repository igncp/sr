// @flow

type T_getLineNumberOfPositionInString = ({|
  position: number,
  string: string,
|}) => number

export const getLineNumberOfPositionInString: T_getLineNumberOfPositionInString = ({
  position,
  string,
}) => {
  const lines = string.split("\n")
  let accPos = 0
  let lineNumber = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    accPos += line.length + 1

    if (accPos > position) {
      lineNumber = i
      break
    }
  }

  return lineNumber
}
