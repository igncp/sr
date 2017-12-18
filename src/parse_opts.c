#include "parse_opts.h"

#include <argp.h>
#include <stdlib.h>
#include <string.h>

static char doc[] = "Search and replace for the command line.";
static char args_doc[] = "PATH SEARCH_PATTERN REPLACEMENT";
static struct argp_option options[] = {
    { "version", 'v', 0, 0, "Print the version", 0},
    { "delimeter", 'd', 0, 0, "Add word delimeters to the search pattern", 0},
    { 0 }
};

static error_t parseOpt(int key, char *arg, struct argp_state *state) {
    ParsedOpts * opts = state->input;

    switch (key) {
        case 'v': opts->should_print_version_and_exit = true; break;
        case 'd': opts->should_add_delimiters = true; break;
        case ARGP_KEY_ARG:
            if (state->arg_num > 3) {
                argp_usage(state);
            }

            if (state->arg_num == 0) {
                opts->searchPath = strdup(arg);
            } else if (state->arg_num == 1) {
                opts->searchPattern = strdup(arg);
            } else {
                opts->searchReplacement = strdup(arg);
            }

            break;
        default: return ARGP_ERR_UNKNOWN;
    }

    return 0;
}

static struct argp argp = {
    options,
    parseOpt,
    args_doc,
    doc,
    0,
    0,
    0
};

ParsedOpts * parseOpts(int argc, char *argv[])
{
    ParsedOpts * opts = malloc(sizeof(ParsedOpts));

    opts->should_print_version_and_exit = false;
    opts->should_add_delimiters = false;
    opts->exit_code = EXIT_SUCCESS;
    opts->searchReplacement = NULL;

    argp_parse(&argp, argc, argv, 0, 0, opts);

    if (opts->should_print_version_and_exit) {
        return opts;
    }

    if (opts->searchReplacement == NULL) {
        fprintf(stderr, "Not enough arguments");
        opts->exit_code = EXIT_FAILURE;

        return opts;
    }

    if (opts->should_add_delimiters) {
        char * origSearchPattern = opts->searchPattern;
        int len = strlen(origSearchPattern) + 2 + 1;

        opts->searchPattern = malloc(sizeof(char) * len);
        strcpy(opts->searchPattern, "\\b");
        opts->searchPattern[2] = 0;
        strcat(opts->searchPattern, origSearchPattern);
        strcat(opts->searchPattern, "\\b");

        free(origSearchPattern);
    }

    return opts;
}
