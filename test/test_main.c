#include <check.h>
#include <stdlib.h>
#include <stdio.h>

#include "test_file_item.h"
#include "test_match_item.h"

int main(void)
{
    int number_failed = 0;

    number_failed += test_FileItem_getFailed();
    number_failed += test_MatchItem_getFailed();

    if (number_failed > 0) {
        puts("__FAILED__");

        return EXIT_FAILURE;
    }

    return EXIT_SUCCESS;
}
