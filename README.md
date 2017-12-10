# SR

Search and replace for the command line

**This project is in active development**

The initial project was written in JS, but it was not very performant for many files

[You can find the JS in another branch](https://github.com/igncp/sr/tree/js)

## Install

As it is still in an early stage, there is not much functionality available

If you want to try it, you will need to install ncurses. Currently it is only tested under Arch Linux.

To run the binary:

```
make
./build/bin/sr
```

To run the tests:
```
cd tests
make && ../build/test/test_result`
```

## License

Ignacio Carbajo - MIT
