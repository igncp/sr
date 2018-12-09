#include "file_item_c.h"

#include <dirent.h>
#include <unistd.h>
#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include "file_io_c.h"
#include "str_utils_c.h"

FileItem * FileItem_getLast(FileItem * initial_node)
{
    FileItem * node = initial_node;

    while (true)
    {
        if (node->next == NULL)
        {
            return node;
        }

        node = node->next;
    }

    return node;
}

FileItem * FileItem_getFilesListFromPath(char *name)
{
    DIR *dir;
    struct dirent *entry;
    char used_name[1024];
    FileItem * f = NULL;

    strcpy(used_name, name);

    if (used_name[strlen(used_name) - 1] == '/')
    {
        used_name[strlen(used_name) - 1] = 0;
    }

    if (!(dir = opendir(name)))
    {
        // if it is a file
        if (access(name, F_OK ) != -1)
        {
            char * path = malloc(sizeof(char) * strlen(used_name));

            strcpy(path, used_name);

            f = malloc(sizeof(FileItem));

            f->path = path;
            f->next = NULL;

            return f;
        }
        else
        {
            return NULL;
        }
    }

    while ((entry = readdir(dir)) != NULL)
    {
        if (entry->d_type == DT_DIR)
        {
            char path[1024];
            if (strcmp(entry->d_name, ".") == 0 || strcmp(entry->d_name, "..") == 0)
                continue;

            snprintf(path, sizeof(path), "%s/%s", used_name, entry->d_name);

            FileItem * r = FileItem_getFilesListFromPath(path);

            if (r != NULL)
            {
                if (f == NULL)
                {
                    f = r;
                }
                else
                {
                    FileItem * l = FileItem_getLast(r);

                    l->next = f->next;
                    f->next = r;
                }
            }
        }
        else
        {
            int str_size = sizeof(used_name) + sizeof(entry->d_name) + 1;
            char * path = malloc(str_size);

            strcpy(path, used_name);
            strcat(path, "/");
            strcat(path, entry->d_name);

            if (f == NULL)
            {
                f = malloc(sizeof(FileItem));

                f->path = path;
                f->next = NULL;
            }
            else
            {
                FileItem * r = malloc(sizeof(FileItem));

                r->next = f->next;
                r->path = path;
                f->next = r;
            }
        }
    }

    closedir(dir);

    return f;
}

void FileItem_printList(FileItem * file_item)
{
    FileItem * node = file_item;

    while (true)
    {
        if (node == NULL)
        {
            return;
        }

        printf("%s\n", node->path);

        node = node->next;
    }
}

void FileItem_deleteList(FileItem * file_item)
{
    FileItem * node = file_item;

    while (true)
    {
        if (node == NULL)
        {
            return;
        }

        FileItem * old_node = node;

        node = node->next;

        free(old_node->path);
        free(old_node);
    }
}

int FileItem_countList(FileItem * item)
{
    int count = 0;
    FileItem * node = item;

    while (true)
    {
        if (node == NULL)
        {
            break;
        }

        count++;

        node = node->next;
    }

    return count;
}

FileItem * FileItem_getItemN(FileItem * item, int n)
{
    int count = 0;
    FileItem * node = item;

    while (true)
    {
        if (node == NULL)
        {
            return NULL;
        }

        if (count == n)
        {
            return node;
        }

        count++;
        node = node->next;
    }
}

FileItem * FileItem_getFilesListFromFile(char *name)
{
    char * file_content = NULL;

    if (strcmp(name, PROCESS_SUBSTITUTION_PIPE) == 0)
    {
        file_content = FileIO_getNamedPipeContent(name);
    }
    else
    {
        file_content = FileIO_getFileContent(name);
    }

    FileItem * files_list = NULL;
    FileItem * files_list_last = NULL;

    struct StrUtils_Line * lines = StrUtils_Line_splitStrInLines(file_content, 10 * 1000 * 1000);
    struct StrUtils_Line * line = lines;

    while (true)
    {
        if (line == NULL)
        {
            break;
        }

        if (strcmp(line->text, "") != 0)
        {
            FileItem * r = malloc(sizeof(FileItem));
            r->path = strdup(line->text);
            r->next = NULL;

            if (files_list == NULL)
            {
                files_list = r;
            }
            else
            {
                files_list_last->next = r;
            }

            files_list_last = r;
        }

        line = line->next;
    }

    StrUtils_Line_destroyList(lines);

    free(file_content);

    return files_list;
}
