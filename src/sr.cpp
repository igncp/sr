#include <locale>

#include "parse_opts.h"
#include "file_item.h"
#include "opts_handlers.h"

int main(int argc, char *argv[])
{
    cli_opts::ParsedOpts * parsed_opts = cli_opts::parseOpts(argc, argv);
    int exit_code = parsed_opts->exit_code;

    if (parsed_opts->exit_code != EXIT_SUCCESS)
    {
        delete parsed_opts;
        return exit_code;
    }

    if (parsed_opts->should_print_version_and_exit)
    {
        cli_opts::printVersion();

        delete parsed_opts;
        return exit_code;
    }

    setlocale(LC_ALL, "en_US.UTF-8");

    // @CODE: Rest of original function

    delete parsed_opts;

    return 0;
}
