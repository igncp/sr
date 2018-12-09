#include "test_str_utils.h"

#include <check.h>
#include <stdlib.h>
#include <string.h>

#include "test_test_helpers.h"

#include "../src/str_utils_c.h"

START_TEST (test_fragment_replaced)
{
    ck_assert_str_eq(
        StrUtils_createStrWithFragmentReplaced("0123", 1, 2, "x"),
        strdup("0x3")
    );
    ck_assert_str_eq(
        StrUtils_createStrWithFragmentReplaced("0123", 1, 3, "x"),
        strdup("0x")
    );
}
END_TEST

START_TEST (test_split_lines)
{
    struct StrUtils_Line * linesA = StrUtils_Line_splitStrInLines(strdup("0\n\n2"), 100);

    ck_assert_str_eq(linesA->text, "0");
    ck_assert_str_eq(linesA->next->text, "");
    ck_assert_str_eq(linesA->next->next->text, "2");
    ck_assert_ptr_eq(linesA->next->next->next, NULL);

    struct StrUtils_Line * linesB = StrUtils_Line_splitStrInLines(strdup("0\n\n2"), 2);

    ck_assert_str_eq(linesB->text, "0");
    ck_assert_str_eq(linesB->next->text, "");
    ck_assert_ptr_eq(linesB->next->next, NULL);
}
END_TEST

START_TEST (test_destroy_list)
{
    struct StrUtils_Line * lines = malloc(sizeof(struct StrUtils_Line));
    lines->text = strdup("foo");
    lines->next = malloc(sizeof(struct StrUtils_Line));
    lines->next->text = strdup("bar");
    lines->next->next = NULL;

    StrUtils_Line_destroyList(lines);

    ck_assert_ptr_eq(lines->next, NULL);
}
END_TEST

START_TEST (test_digits_for_number)
{
    ck_assert_int_eq(
        StrUtils_getDigitsForNumber(0),
        1
    );
    ck_assert_int_eq(
        StrUtils_getDigitsForNumber(1),
        1
    );
    ck_assert_int_eq(
        StrUtils_getDigitsForNumber(9432),
        4
    );
}
END_TEST

Suite * test_StrUtils_suite(void)
{
    Suite *s;
    TCase *tc_core;

    s = suite_create("StrUtils");

    tc_core = tcase_create("Core");

    tcase_add_test(tc_core, test_fragment_replaced);
    tcase_add_test(tc_core, test_digits_for_number);
    tcase_add_test(tc_core, test_split_lines);
    tcase_add_test(tc_core, test_destroy_list);

    suite_add_tcase(s, tc_core);

    return s;
}

int test_StrUtils_getFailed()
{
    TEST_HELPERS_GET_FAILED(test_StrUtils_suite);
}
