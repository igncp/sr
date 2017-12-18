#ifndef SEARCH_H
#define SEARCH_H

#include <stdbool.h>
#include <regex.h>

regex_t * getCompiledRegex(char * regex_str);

struct Search_RegexPositions
{
    int start;
    int end_relative;
};

int getFileContentRegexMatchesNumber(char * file_path, regex_t * compiled_regex);
struct Search_RegexPositions getPositionsInStrOfRegexMatchIdx(char * str, char * uncompiled_regex, int idx);

#endif
