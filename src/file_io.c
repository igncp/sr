#include "file_io.h"

#include <stdio.h>
#include <stdlib.h>

char * FileIO_getFileContent(char * file_path) {
    long input_file_size;
    FILE *input_file = fopen(file_path, "rb");

    fseek(input_file, 0, SEEK_END);
    input_file_size = ftell(input_file);
    rewind(input_file);

    char * file_contents = malloc(input_file_size * sizeof(char) + 1);

    fread(file_contents, sizeof(char), input_file_size, input_file);
    file_contents[input_file_size] = 0;

    fclose(input_file);

    return file_contents;
}

void FileIO_setFileContent(char * file_path, char * file_content) {
    FILE * fp;

    fp = fopen(file_path, "w+");

    fputs(file_content, fp);

    fclose(fp);
}
