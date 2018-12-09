C_SRC_FILES := $(shell find src -type f -name "*.c")
SRC_FILES := $(shell find src -type f -name "*.cpp")

default:
	@mkdir -p build/bin
	@g++ \
		-g \
		-O \
		${SRC_FILES} \
		-Wall -Wextra -Wpedantic \
		-Wformat=2 -Wno-unused-parameter -Wshadow \
		-Wwrite-strings -Wno-missing-field-initializers \
		-Wredundant-decls -Wmissing-include-dirs \
		-lcurses \
		-ltinfo \
		-o build/bin/sr && \
		echo "built correctly"

compile-c:
	@mkdir -p build/bin
	@gcc \
		-g \
		-O \
		${C_SRC_FILES} \
		-Wall -Wextra -Wpedantic \
		-Wformat=2 -Wno-unused-parameter -Wshadow \
		-Wwrite-strings -Wstrict-prototypes -Wold-style-definition \
		-Wredundant-decls -Wnested-externs -Wmissing-include-dirs \
		-lcurses \
		-ltinfo \
		-o build/bin/sr_c && \
		echo "built correctly"

clean:
	@rm -f test/test_main
	@find . -type f -name "*.orig" | xargs -I{} rm {}
	@find . -type f -name "*.gcda" | xargs -I{} rm {}
	@find . -type f -name "*.gcno" | xargs -I{} rm {}
