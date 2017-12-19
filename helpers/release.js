#!/usr/bin/env node

const fs = require('fs')
const execSync = require('child_process').execSync

const releaseType = process.argv[2]
const POSSIBLE_RELEASE_TYPES = [
  'patch',
  'minor',
  'major'
]
const REGEX_STR = '#define VERSION "(.*?)"'

if (POSSIBLE_RELEASE_TYPES.indexOf(releaseType) === -1) {
  console.log('Please, input the release type.')
  console.log('It can be one of these: ' + POSSIBLE_RELEASE_TYPES.join(', ') + '.')

  process.exit(1)
}

const versionFileContent = fs.readFileSync('src/version.h', 'utf-8')
const currentVersionMatch = versionFileContent.match(new RegExp(REGEX_STR))

if (!currentVersionMatch) {
  console.log('Could not find the current version')

  process.exit(1)
}

const currentVersionFragments = currentVersionMatch[1]
  .split('.')
  .map(Number)

if (releaseType === 'patch') {
  currentVersionFragments[2] += 1
} else if (releaseType === 'minor') {
  currentVersionFragments[2] = 0
  currentVersionFragments[1] += 1
} else if (releaseType === 'major') {
  currentVersionFragments[2] = 0
  currentVersionFragments[1] = 0
  currentVersionFragments[0] += 1
}

const newVersion = currentVersionFragments.join('.')
const newVersionFileContent = versionFileContent
  .replace(new RegExp(REGEX_STR), `#define VERSION "${newVersion}"`)

fs.writeFileSync('src/version.h', newVersionFileContent)

execSync(`
git reset && \
  git add src/version.h && \
  git commit -m "v${newVersion}" && \
  git tag "v${newVersion}"
`)

console.log(`Bumped the version to: v${newVersion}`)
console.log('When pushing, don\'t forget to add --follow-tags')
