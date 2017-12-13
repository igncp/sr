#include "file_io.h"

#include <stdio.h>
#include <stdlib.h>

char * FileIO_getFileContent(char * file_path) {
    char *file_contents;
    long input_file_size;
    FILE *input_file = fopen(file_path, "rb");

    fseek(input_file, 0, SEEK_END);
    input_file_size = ftell(input_file);
    rewind(input_file);
    file_contents = malloc(input_file_size * (sizeof(char)) + 1);
    fread(file_contents, sizeof(char), input_file_size, input_file);

    fclose(input_file);

    return file_contents;
}
