// @flow

import chalk from "chalk"

export const exitWithError = (errorMessage: string): void => {
  console.log(chalk.red(errorMessage))

  process.exit(1)
}
