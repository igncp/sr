#ifndef TEST_TEST_HELPERS_H
#define TEST_TEST_HELPERS_H

#include <stdio.h>
#include <check.h>

#define TEST_HELPERS_GET_FAILED(SuiteName) \
  do { \
    int number_failed; \
    SRunner *sr = srunner_create(SuiteName()); \
    srunner_run_all(sr, CK_VERBOSE); \
    number_failed = srunner_ntests_failed(sr); \
    puts(""); \
    srunner_free(sr); \
    return number_failed; \
  } while (0);

#endif
