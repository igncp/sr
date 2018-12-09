#include <string>

namespace str_utils
{

struct Line * Line_splitStrInLines(char * str, int max_lines)
{
    struct Line * lines = NULL;
    struct Line * last = NULL;

    char * pch;
    int counter = 0;
    pch = strtoke(str, "\n");
    while (true)
    {
        if (pch == NULL)
        {
            break;
        }

        if (counter == max_lines)
        {
            break;
        }

        struct Line * r = malloc(sizeof(struct Line));

        r->text = malloc(sizeof(char) * strlen(pch) + 1);
        sprintf(r->text, "%s", pch);
        r->next = NULL;

        if (lines == NULL)
        {
            lines = r;
            last = r;
        }
        else
        {
            last->next = r;
            last = r;
        }

        pch = strtoke(NULL, "\n");
        counter++;
    }

    return lines;
}

} // namespace str_utils
