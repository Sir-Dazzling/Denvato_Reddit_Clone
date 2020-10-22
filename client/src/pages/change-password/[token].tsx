import React, { useState } from 'react';
import NextLink from 'next/link';
import { NextPage } from 'next';
import { NavBar } from '../../components/NavBar';
import { Heading, Button, useToast, Box, Link, Flex } from '@chakra-ui/core';
import { Formik, Form } from 'formik';
import { InputField } from '../../components/InputField';
import { Wrapper } from '../../components/Wrapper';
import { useChangePasswordMutation } from '../../generated/graphql';
import { useRouter } from 'next/router';
import { toErrorMap } from '../../utils/toErrorMap';
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../../utils/createUrqlClient';

const ChangePassword: NextPage<{ token: string }> = () =>
{
    const router = useRouter();

    const toast = useToast();

    const showToast = ({ position, title, description, status }: any) =>
    {
        toast({
            position,
            title,
            description,
            status,
            duration: 3000,
            isClosable: true
        });
    };

    const [, changePassword] = useChangePasswordMutation();
    const [tokenError, setTokenError] = useState("");

    return <>
        <NavBar />
        <Wrapper variant="small">
            <Heading mb={5}>Reset your password</Heading>
            <Formik
                initialValues={{ newPassword: "" }}
                onSubmit={async (values, { setErrors }) =>
                {
                    const response = await changePassword({ newPassword: values.newPassword, token: typeof router.query.token === "string" ? router.query.token : "" });

                    if (values.newPassword === "")
                    {
                        showToast({ position: "top-right", title: "Change Password Failed", description: "Boss, fields can't be empty! ☹️", status: "error" });
                    } else if (response.data?.changePassword.errors)
                    {
                        const errorMap = toErrorMap(response.data.changePassword.errors);
                        if ("token" in errorMap)
                        {
                            setTokenError(errorMap.token);
                        }
                        setErrors(errorMap);
                        showToast({ position: "top-right", title: "Change Password Failed", description: "Oops!!!, Something is wrong", status: "error" });
                    } else if (response.data?.changePassword.user)
                    {
                        await router.push("/");
                        showToast({ position: "bottom", title: "Login Success", description: "Password changed successfully, thank goodness 🤗", status: "success" });
                    }

                    if (tokenError)
                    {
                        showToast({ position: "top-right", title: "Token Error", description: tokenError, status: "error" });
                    }
                }}>
                {({ isSubmitting }) => (
                    <>
                        <Form>
                            <InputField name="newPassword" type="password" placeholder="Enter a new password" label="New Password" />
                            {tokenError && (
                                <Flex>
                                    <Box mr={2} style={{ color: "red" }}>{tokenError}</Box>
                                    <NextLink href="/forgot-password">
                                        <Link>Click here to get a new token</Link>
                                    </NextLink>
                                </Flex>
                            )}
                            <Button mt={4} type="submit" isLoading={isSubmitting} variantColor="teal">Change password</Button>
                        </Form>
                    </>
                )}
            </Formik>
        </Wrapper>
    </>
}

// ChangePassword.getInitialProps = ({ query }) =>
// {
//     return {
//         token: query.token as string
//     }
// }

export default withUrqlClient(createUrqlClient)(ChangePassword);