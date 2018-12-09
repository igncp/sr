#ifndef FILE_ITEM_H
#define FILE_ITEM_H

#include <string>

namespace file_io
{

typedef struct FileItem
{
    std::string * path;
    struct FileItem * next;

    FileItem();
    ~FileItem();
} FileItem;

FileItem * getFilesListFromPath(std::string * name);
FileItem * getFilesListFromFile(std::string * name);

} // namespace file_io

#endif
