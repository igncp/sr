#ifndef STR_UTILS_H
#define STR_UTILS_H

#include <string.h>

struct StrUtils_Line
{
    char * text;
    struct StrUtils_Line * next;
};

struct StrUtils_Line * StrUtils_Line_splitStrInLines(char * str, int max_lines);
void StrUtils_Line_destroyList(struct StrUtils_Line *);
int StrUtils_getDigitsForNumber(int number);
char * StrUtils_createStrWithFragmentReplaced(
    char * orig_str,
    int pos_start,
    int chars,
    char * replacement
);
char * StrUtils_createStrWithTwoStrings(const char * str1, const char * str2);

#endif
