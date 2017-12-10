#include "test_file_item.h"

#include <check.h>
#include <stdlib.h>
#include <stdio.h>

#include "../src/file_item.h"

START_TEST (test_count)
{
    FileItem f1;
    FileItem f2;
    FileItem f3;

    f1.next = &f2;
    f2.next = &f3;
    f3.next = NULL;

    int count = FileItem_countList(&f1);

    ck_assert_int_eq(count, 3);
}
END_TEST

Suite * test_FileItem_suite(void)
{
    Suite *s;
    TCase *tc_core;

    s = suite_create("FileItem");

    tc_core = tcase_create("Core");

    tcase_add_test(tc_core, test_count);
    suite_add_tcase(s, tc_core);

    return s;
}

int test_FileItem_getFailed() {
    int number_failed;
    SRunner *sr = srunner_create(test_FileItem_suite());

    srunner_run_all(sr, CK_VERBOSE);

    number_failed = srunner_ntests_failed(sr);

    puts("\n");

    srunner_free(sr);

    return number_failed;
}
