#ifndef OPTS_HANDLERS_H
#define OPTS_HANDLERS_H

#include "../utils/file_item.h"
#include "parse_opts.h"

void OptsHandlers_printVersion(void);
FileItem * OptsHandlers_getFilesLists(ParsedOpts * parsed_opts);

#endif
