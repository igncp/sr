#include <stdbool.h>
#include <regex.h>

regex_t * getCompiledRegex(char * regex_str);

int getFileContentRegexMatchesNumber(char * file_path, regex_t * compiled_regex);
