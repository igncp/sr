#include <stdio.h>
#include <stdlib.h>

#include "search.h"
#include "file_io.h"

int getStrRegexMatchesNumber(char * str, regex_t * compiled_regex)
{
    int reti;
    char msgbuf[100];
    char * orig_str = str;
    regmatch_t matches[2];
    int end;
    int count = 0;

    reti = regexec(compiled_regex, str, 2, matches, 0);
    if (!reti)
    {
        count = 1;

        while(true)
        {
            end = matches[0].rm_eo;

            str = str + end;
            reti = regexec(compiled_regex, str, 2, matches, 0);

            if (reti)
            {
                break;
            }
            else
            {
                count++;
            }
        }
    }
    else if (count != 0)
    {
        regerror(reti, compiled_regex, msgbuf, sizeof(msgbuf));
        fprintf(stderr, "Regex match failed: %s\n", msgbuf);
        free(orig_str);

        exit(1);
    }

    return count;
}

regex_t * getCompiledRegex(char * regex_str)
{
    regex_t * regex = malloc(sizeof(regex_t));

    int reti = regcomp(regex, regex_str, REG_NEWLINE);
    if (reti)
    {
        fprintf(stderr, "Could not compile regex\n");

        exit(1);
    }

    return regex;
}

struct Search_RegexPositions getPositionsInStrOfRegexMatchIdx(char * str, char * uncompiled_regex, int index)
{
    regex_t * compiled_regex = getCompiledRegex(uncompiled_regex);
    struct Search_RegexPositions pos;

    pos.start = 0;
    pos.end_relative = 0;

    int reti;
    char msgbuf[100];
    char * orig_str = str;
    regmatch_t matches[2];
    int end;

    reti = regexec(compiled_regex, str, 2, matches, 0);

    if (!reti)
    {
        int count = 0;

        while(true)
        {
            pos.end_relative = matches[0].rm_eo - matches[0].rm_so;

            if (count == index)
            {
                pos.start += matches[0].rm_so;

                break;
            }

            end = matches[0].rm_eo;

            str = str + end;
            pos.start += end;

            reti = regexec(compiled_regex, str, 2, matches, 0);

            if (reti)
            {
                break;
            }
            else
            {
                count++;
            }
        }

    }
    else
    {
        regerror(reti, compiled_regex, msgbuf, sizeof(msgbuf));
        fprintf(stderr, "Regex match failed: %s\n", msgbuf);
        free(orig_str);

        exit(1);
    }

    regfree(compiled_regex);
    free(compiled_regex);

    return pos;
}

int getFileContentRegexMatchesNumber(char * file_path, regex_t * compiled_regex)
{
    char * file_content = FileIO_getFileContent(file_path);
    int number = getStrRegexMatchesNumber(file_content, compiled_regex);

    free(file_content);

    return number;
}
