import React from 'react';
import NextLink from 'next/link';
import { Formik, Form } from 'formik';
import { Box, Button, Flex, Heading, Link, useToast } from '@chakra-ui/core';
import { InputField } from '../components/InputField';
import { useLoginMutation } from '../generated/graphql';
import { useRouter } from 'next/router';
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../utils/createUrqlClient';
import { Layout } from '../components/Layout';

const Login: React.FC<{}> = ({ }) =>
{
    const router = useRouter();
    const [, login] = useLoginMutation();

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

    return (

        <Layout variant="small">
            <Heading mb={5}>Login</Heading>
            <Formik
                initialValues={{ usernameOrEmail: "", password: "" }}
                onSubmit={async (values) =>
                {
                    const response = await login(values);

                    if (values.usernameOrEmail === "" || values.password === "")
                    {
                        showToast({ position: "top-right", title: "Login Failed", description: "Boss, fields can't be empty! ☹️", status: "error" });
                    } else if (response.data?.login.errors)
                    {
                        showToast({ position: "top-right", title: "Login Failed", description: "Oops!!!, Invalid Credentials 🕵️‍♂️", status: "error" });
                    } else if (response.data?.login.user)
                    {
                        if (typeof router.query.next === "string")
                        {
                            router.push(router.query.next);
                        } else
                        {
                            await router.push("/");
                            showToast({ position: "bottom", title: "Login Success", description: "Welcome back, we missed you 🤗", status: "success" });
                        }

                    }
                }}>
                {({ isSubmitting }) => (
                    <>
                        <Form>
                            <InputField name="usernameOrEmail" placeholder="username or email" label="Username or Email" noInputError={true} />
                            <Box mt={4}>
                                <InputField name="password" placeholder="password" label="Password" type="password" noInputError={true} />
                            </Box>
                            <Flex mt={2}>
                                <NextLink href="/forgot-password">
                                    <Link ml="auto">Forgot password?</Link>
                                </NextLink>
                            </Flex>
                            <Button mt={4} type="submit" isLoading={isSubmitting} variantColor="teal">Login</Button>
                        </Form>
                    </>
                )}
            </Formik>
        </Layout>
    );
}

export default withUrqlClient(createUrqlClient)(Login);