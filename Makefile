SRC_FILES := $(shell find src -type f -name "*.c")

default:
	@mkdir -p build/bin
	@gcc \
		-g \
		-O \
		${SRC_FILES} \
		-Wall -Wextra -Wpedantic \
		-Wformat=2 -Wno-unused-parameter -Wshadow \
		-Wwrite-strings -Wstrict-prototypes -Wold-style-definition \
		-Wredundant-decls -Wnested-externs -Wmissing-include-dirs \
		-lcurses \
		-ltinfo \
		-o build/bin/sr && \
		echo "built correctly"

clean:
	@find . -type f -name "*.orig" | xargs -I{} rm {}
