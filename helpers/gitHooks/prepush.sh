#!/usr/bin/env bash

npm run lint && \
./node_modules/.bin/flow src && \
npm test
