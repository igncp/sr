# TODO

### Known Fixes

None

### Functionality

- Improve preview message when displaying list
  - Add keys helpers
  - Display difference
  - Better movement
- Add option to display entries of replacement alreay existing before
- Add preview to list
- Add integration tests
- Add option to convert on the fly / convert at the end (to be able to do ctrl-c)
- Add option for message of confirmation for all the options
- Add option to just see the difference

### Infrastructure

- Reduce `any` annotations in src (not in modules)
- Setup script to publish to npm bumping version
- Add tutorial in main Readme
- Add bigger docs
- Add dependencies (e.g. node version) in Readme
- Setup commit msg validator

### Refactors

- Change replaceWithCb to pass the index
