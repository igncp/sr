#include <stdio.h>
#include <stdlib.h>

#include "search.h"
#include "file_io.h"

int getStrRegexMatchesNumber(char * str, regex_t * compiled_regex) {
    int reti;
    char msgbuf[100];
    char * orig_str = str;
    regmatch_t matches[2];
    int end;

    reti = regexec(compiled_regex, str, 2, matches, 0);
    if (!reti)
    {
        int count = 1;

        while(true) {
            end = matches[0].rm_eo;

            str = str + end;
            reti = regexec(compiled_regex, str, 2, matches, 0);

            if (reti) {
                break;
            } else {
                count++;
            }
        }

        free(orig_str);

        return count;
    }
    else if (reti == REG_NOMATCH)
    {
        free(orig_str);

        return 0;
    }
    else
    {
        regerror(reti, compiled_regex, msgbuf, sizeof(msgbuf));
        fprintf(stderr, "Regex match failed: %s\n", msgbuf);
        free(orig_str);

        exit(1);
    }
}

regex_t * getCompiledRegex(char * regex_str) {
    regex_t * regex = malloc(sizeof(regex_t));

    int reti = regcomp(regex, regex_str, REG_NEWLINE);
    if (reti)
    {
        fprintf(stderr, "Could not compile regex\n");

        exit(1);
    }

    return regex;
}

int getFileContentRegexMatchesNumber(char * file_path, regex_t * compiled_regex) {
    char * file_content = FileIO_getFileContent(file_path);

    return getStrRegexMatchesNumber(file_content, compiled_regex);
}
