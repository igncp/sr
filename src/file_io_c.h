#ifndef FILE_IO_H

#define FILE_IO_H

char * FileIO_getFileContent(char * file_path);
void FileIO_setFileContent(char * file_path, char * file_content);

#define PROCESS_SUBSTITUTION_PIPE "/dev/fd/63"

char * FileIO_getNamedPipeContent(char * named_pipe_path);

#endif
