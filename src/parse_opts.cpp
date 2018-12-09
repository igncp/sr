#include "parse_opts.h"

#include <string>
#include <argp.h>

#define ARGS_HELP_BEFORE "Search and replace for the command line."
#define ARGS_HELP_AFTER \
    "Available keys in the replacements list:\n"\
    "  q or Control+c: Exit list\n"\
    "  Enter: Replace entry in file\n"\
    "  Up, Down, PageUp, PageDown: Move around the list\n"\
    "  r: Refresh matches of selected file\n"\
    "\n"\
    "Examples:\n"\
    "  # Show a list with replacements from Foo to Bar in the current dir\n"\
    "  sr . Foo Bar\n\n"\
    "  # Show a list with replacements from \\bFoo\\b to Bar in the markdown files\n"\
    "  sr <(find . -name \"*.md\") Foo Bar -fd"
#define ARGS_HELP_FULL ARGS_HELP_BEFORE "\v" ARGS_HELP_AFTER

namespace cli_opts
{

ParsedOpts::ParsedOpts()
{
    this->searchPath = 0;
    this->searchPattern = 0;
    this->searchReplacement = 0;

    this->exit_code = EXIT_SUCCESS;

    this->should_add_delimiters = false;
    this->should_print_version_and_exit = false;
    this->should_read_files_from_file = false;
    this->should_be_case_insensitive = false;
}

ParsedOpts::~ParsedOpts()
{
    delete this->searchPath;
    this->searchPath = 0;

    delete this->searchPattern;
    this->searchPattern = 0;

    delete this->searchReplacement;
    this->searchReplacement = 0;
}

static char args_doc[] = "PATH SEARCH_PATTERN REPLACEMENT";
static struct argp_option options[] =
{
    { "version", 'v', 0, 0, "Print the version", 0},
    { "delimeter", 'd', 0, 0, "Add word delimeters to the search pattern", 0},
    { "file", 'f', 0, 0, "Get the files from a list inside of PATH (has to be a file)", 0},
    { "insensitive", 'i', 0, 0, "Use case insensitive search", 0},
    { 0 }
};

static error_t parseOpt(int key, char *arg, struct argp_state *state)
{
    ParsedOpts * opts = (ParsedOpts *)state->input;

    switch (key)
    {
    case 'v':
        opts->should_print_version_and_exit = true;
        break;
    case 'd':
        opts->should_add_delimiters = true;
        break;
    case 'f':
        opts->should_read_files_from_file = true;
        break;
    case 'i':
        opts->should_be_case_insensitive = true;
        break;
    case ARGP_KEY_ARG:
        if (state->arg_num > 3)
        {
            argp_usage(state);
        }

        if (state->arg_num == 0)
        {
            opts->searchPath = new std::string(arg);
        }
        else if (state->arg_num == 1)
        {
            opts->searchPattern = new std::string(arg);
        }
        else
        {
            opts->searchReplacement = new std::string(arg);
        }

        break;
    default:
        return ARGP_ERR_UNKNOWN;
    }

    return 0;
}

static struct argp argp =
{
    options,
    parseOpt,
    args_doc,
    ARGS_HELP_FULL,
    0,
    0,
    0
};

ParsedOpts * parseOpts(int argc, char *argv[])
{
    ParsedOpts * opts = new ParsedOpts();

    argp_parse(&argp, argc, argv, 0, 0, opts);

    if (opts->should_print_version_and_exit)
    {
        return opts;
    }

    if (opts->searchReplacement == NULL)
    {
        fprintf(stderr, "Not enough arguments\n");
        char command_name[] = "sr";
        argp_help(&argp, stderr, ARGP_HELP_USAGE, command_name);
        fprintf(stderr, "For more info, run: sr --help\n");
        opts->exit_code = EXIT_FAILURE;

        return opts;
    }

    if (opts->should_add_delimiters)
    {
        opts->searchPattern->insert(0, "\\b");
        opts->searchPattern->append("\\b");
    }

    return opts;
}

} // namespace cli_opts
