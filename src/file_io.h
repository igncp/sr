#ifndef FILE_IO_H

#define FILE_IO_H

#define PROCESS_SUBSTITUTION_PIPE "/dev/fd/63"

#include <string>

namespace file_io
{

std::string * getFileContent(std::string * file_path);

std::string * getNamedPipeContent(std::string * named_pipe_path);

void setFileContent(char * file_path, char * file_content);

} // namespace file_io

#endif
