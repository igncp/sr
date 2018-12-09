#ifndef OPTS_HANDLERS_H
#define OPTS_HANDLERS_H

#include "file_item_c.h"
#include "parse_opts_c.h"

void OptsHandlers_printVersion(void);
FileItem * OptsHandlers_getFilesLists(ParsedOpts * parsed_opts);

#endif
