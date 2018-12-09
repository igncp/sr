#include "file_item.h"

#include <dirent.h>
#include <unistd.h>
#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include "file_io.h"
#include "str_utils.h"

namespace file_io
{

FileItem::FileItem()
{
    this->path = NULL;
    this->next = NULL;
}

FileItem::~FileItem()
{
    delete this->path;
}

FileItem * getLast(FileItem * initial_node)
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

FileItem * getFilesListFromPath(std::string * name)
{
    DIR *dir;
    struct dirent *entry;
    FileItem * f = NULL;
    std::string used_name = *name;
    const char * name_char = (* name).c_str();

    if (used_name.back() == '/')
    {
        used_name = used_name.substr(0, used_name.size() - 1);
    }

    if (!(dir = opendir(name_char)))
    {
        // if it is a file
        if (access(name_char, F_OK ) != -1)
        {
            f = new FileItem;

            f->path = new std::string(used_name);
        }

        return f;
    }

    while ((entry = readdir(dir)) != NULL)
    {
        if (entry->d_type == DT_DIR)
        {
            if (strcmp(entry->d_name, ".") == 0 || strcmp(entry->d_name, "..") == 0)
                continue;

            std::string * path = new std::string(used_name);

            path->append("/");
            path->append(entry->d_name);

            FileItem * r = getFilesListFromPath(path);

            if (r != NULL)
            {
                if (f == NULL)
                {
                    f = r;
                }
                else
                {
                    FileItem * l = getLast(r);

                    l->next = f->next;
                    f->next = r;
                }
            }
        }
        else
        {
            std::string * path = new std::string(used_name);

            used_name.append("/");
            used_name.append(entry->d_name);

            if (f == NULL)
            {
                f = new FileItem;

                f->path = path;
            }
            else
            {
                FileItem * r = new FileItem;

                r->next = f->next;
                r->path = path;
                f->next = r;
            }
        }
    }

    closedir(dir);

    return f;
}

FileItem * getFilesListFromFile(std::string *name)
{
    std::string * file_content = NULL;

    if (strcmp(name->c_str(), PROCESS_SUBSTITUTION_PIPE) == 0)
    {
        file_content = file_io::getNamedPipeContent(name);
    }
    else
    {
        file_content = file_io::getFileContent(name);
    }

    FileItem * files_list = NULL;
    FileItem * files_list_last = NULL;

    struct str_utils::Line * lines = str_utils::Line_splitStrInLines(file_content, 10 * 1000 * 1000);
    // struct StrUtils_Line * line = lines;

    // while (true)
    // {
    // if (line == NULL)
    // {
    // break;
    // }

    // if (strcmp(line->text, "") != 0)
    // {
    // FileItem * r = malloc(sizeof(FileItem));
    // r->path = strdup(line->text);
    // r->next = NULL;

    // if (files_list == NULL)
    // {
    // files_list = r;
    // }
    // else
    // {
    // files_list_last->next = r;
    // }

    // files_list_last = r;
    // }

    // line = line->next;
    // }

    // StrUtils_Line_destroyList(lines);

    // free(file_content);

    return files_list;
}

} // namespace file_io
