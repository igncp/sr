#ifndef FILE_ITEM_H
#define FILE_ITEM_H

typedef struct FileItem
{
    char * path;
    struct FileItem * next;
} FileItem;

void FileItem_printList(FileItem * file_item);
void FileItem_deleteList(FileItem * file_item);

int FileItem_countList(FileItem * initial_node);

FileItem * FileItem_getItemN(FileItem * initial_node, int n);
FileItem * FileItem_getLast(FileItem * initial_node);
FileItem * FileItem_getFilesListFromPath(char *name);
FileItem * FileItem_getFilesListFromFile(char *name);

#endif
