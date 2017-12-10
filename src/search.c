#include <stdio.h>
#include <stdlib.h>

#include "search.h"

int getStrRegexMatchesNumber(char * str, regex_t * compiled_regex) {
    int reti;
    char msgbuf[100];
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

        return count;
    }
    else if (reti == REG_NOMATCH)
    {
        return 0;
    }
    else
    {
        regerror(reti, compiled_regex, msgbuf, sizeof(msgbuf));
        fprintf(stderr, "Regex match failed: %s\n", msgbuf);

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
    char *file_contents;
    long input_file_size;
    FILE *input_file = fopen(file_path, "rb");

    fseek(input_file, 0, SEEK_END);
    input_file_size = ftell(input_file);
    rewind(input_file);
    file_contents = malloc(input_file_size * (sizeof(char)));
    fread(file_contents, sizeof(char), input_file_size, input_file);

    fclose(input_file);

    return getStrRegexMatchesNumber(file_contents, compiled_regex);
}
