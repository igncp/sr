# SR

Search and replace for the command line.

## Build

Dependencies:

- [libncurses](https://en.wikipedia.org/wiki/Ncurses): terminal gui framework

```
make
# File generated in ./build/bin/sr
```

## Develop

Dependencies:

- [Node.js](https://nodejs.org/en/): for git hooks and running scripts
- [astyle](http://astyle.sourceforge.net/): formatting
- [libcheck](https://libcheck.github.io/check/web/install.html): **0.14.0** testing framework
- [valgrind](https://valgrind.org/)

```
npm test -s
```

For more information you can check the following files:

- [package.json](./package.json)
- [Makefile](./Makefile)

## License

Ignacio Carbajo - MIT
