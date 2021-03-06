#include "str_utils.h"

#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

char* strtoke(char *str, const char *delim)
{
    static char *start = NULL;
    char *token = 0;

    if (str)
        start = str;
    if (!start)
        return NULL;

    token = start;
    start = strpbrk(start, delim);

    if (start)
        *start++ = '\0';

    return token;
}

struct StrUtils_Line * StrUtils_Line_splitStrInLines(char * str, int max_lines)
{
    struct StrUtils_Line * lines = NULL;
    struct StrUtils_Line * last = NULL;

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

        struct StrUtils_Line * r = malloc(sizeof(struct StrUtils_Line));

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

int StrUtils_getDigitsForNumber(int number)
{
    int digits = 1;
    double count_for_digits = number;

    while (true)
    {
        count_for_digits = count_for_digits / 10;

        if (count_for_digits < 1)
        {
            break;
        };

        digits++;
    }

    return digits;
}

void StrUtils_Line_destroyList(struct StrUtils_Line * line)
{
    struct StrUtils_Line * node = line;

    while (true)
    {
        if (node == NULL)
        {
            break;
        }

        struct StrUtils_Line * node_to_free = node;

        node = node->next;

        node_to_free->next = NULL;

        free(node_to_free->text);
        free(node_to_free);
    }
}

char * StrUtils_createStrWithFragmentReplaced(char * orig_str, int pos_start, int chars, char * replacement)
{
    int final_str_len = sizeof(char) * (strlen(orig_str) - chars + strlen(replacement)) + 1;
    int suffix_len = strlen(orig_str) - chars - pos_start;

    char * final_str = malloc(final_str_len);

    strncpy(final_str, orig_str, pos_start);
    final_str[pos_start] = 0;
    strcat(final_str, replacement);

    if (suffix_len > 0)
    {
        char suffix[suffix_len];
        strncpy(
            suffix,
            orig_str + pos_start + chars,
            strlen(orig_str) - chars - pos_start
        );
        suffix[suffix_len] = 0;
        strcat(final_str, suffix);
    }

    final_str[final_str_len - 1] = 0;

    return final_str;
}

char * StrUtils_createStrWithTwoStrings(const char * str1, const char * str2)
{
    int final_str_len = strlen(str1) + strlen(str2) + 1;

    char * final_str = malloc(
            sizeof(char) * (final_str_len + 1)
        );

    snprintf(
        final_str,
        final_str_len,
        "%s%s",
        str1,
        str2
    );

    final_str[final_str_len] = 0;

    return final_str;
}
