#include "file_io.h"

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <stdbool.h>
#include <fcntl.h>

char * FileIO_getFileContent(char * file_path)
{
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

#define MAX_NAMED_PIPE_BUFF_SIZE 102400

char * FileIO_getNamedPipeContent(char * named_pipe_path)
{
    int bytes_read;
    char named_pipe_buffer[MAX_NAMED_PIPE_BUFF_SIZE];

    int fd = open(named_pipe_path, O_RDONLY);

    while(true)
    {
        bytes_read = read(fd, named_pipe_buffer, MAX_NAMED_PIPE_BUFF_SIZE - 1);

        if(bytes_read == 0)
        {
            break;
        }

        named_pipe_buffer[bytes_read] = '\0';
    }

    close(fd);

    int buffer_length = strlen(named_pipe_buffer);
    char * file_contents = malloc(sizeof(char) * buffer_length + 1);
    snprintf(file_contents, buffer_length, "%s", named_pipe_buffer);

    file_contents[buffer_length] = 0;

    return file_contents;
}

void FileIO_setFileContent(char * file_path, char * file_content)
{
    FILE * fp;

    fp = fopen(file_path, "w+");

    fputs(file_content, fp);

    fclose(fp);
}
