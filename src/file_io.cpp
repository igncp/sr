#include "file_io.h"

#include <string>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <stdbool.h>
#include <fcntl.h>

namespace file_io
{

std::string * getFileContent(std::string * file_path)
{
    FILE* f = fopen(file_path->c_str(), "r");

    fseek(f, 0, SEEK_END);
    size_t size = ftell(f);

    char* where = new char[size];

    rewind(f);
    fread(where, sizeof(char), size, f);

    delete[] where;

    return new std::string(where);
}

#define MAX_NAMED_PIPE_BUFF_SIZE 1024

std::string * getNamedPipeContent(std::string * named_pipe_path)
{
    int bytes_read;

    char * total_buffer = (char *)malloc(sizeof(char) * MAX_NAMED_PIPE_BUFF_SIZE * 100000);

    int fd = open(named_pipe_path->c_str(), O_RDONLY);

    strcpy(total_buffer, "");

    while(true)
    {
        char named_pipe_buffer[MAX_NAMED_PIPE_BUFF_SIZE];

        bytes_read = read(fd, named_pipe_buffer, MAX_NAMED_PIPE_BUFF_SIZE - 1);

        if(bytes_read == 0)
        {
            break;
        }

        named_pipe_buffer[bytes_read] = '\0';

        strcat(total_buffer, named_pipe_buffer);
    }

    close(fd);

    int buffer_length = strlen(total_buffer);
    char * file_contents = (char *)malloc(sizeof(char) * buffer_length + 1);
    snprintf(file_contents, buffer_length, "%s", total_buffer);

    file_contents[buffer_length] = 0;

    free(total_buffer);

    return new std::string(file_contents);
}

void setFileContent(char * file_path, char * file_content)
{
    FILE * fp;

    fp = fopen(file_path, "w+");

    fputs(file_content, fp);

    fclose(fp);
}

} // namespace file_io
