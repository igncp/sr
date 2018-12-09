#ifndef STR_UTILS_H
#define STR_UTILS_H

#include <string.h>

namespace str_utils
{

struct Line
{
    std::string text;
    struct Line * next;
};

struct Line * Line_splitStrInLines(std::string str, int max_lines);

// void Line_destroyList(struct Line *);
// int getDigitsForNumber(int number);
// char * createStrWithFragmentReplaced(
// char * orig_str,
// int pos_start,
// int chars,
// char * replacement
// );
// char * createStrWithTwoStrings(const char * str1, const char * str2);

}

#endif
