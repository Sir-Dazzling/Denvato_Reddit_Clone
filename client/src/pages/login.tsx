import React from 'react';
import { Formik, Form } from 'formik';
import { Box, Button, Heading, useToast } from '@chakra-ui/core';
import { Wrapper } from '../components/Wrapper';
import { InputField } from '../components/InputField';
import { useLoginMutation } from '../generated/graphql';
import { useRouter } from 'next/router';
import { NavBar } from '../components/NavBar';

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
        <>
            <NavBar />
            <Wrapper variant="small">
                <Heading mb={5}>Login</Heading>
                <Formik
                    initialValues={{ username: "", password: "" }}
                    onSubmit={async (values) =>
                    {
                        const response = await login({ options: values });

                        if (values.username === "" || values.password === "")
                        {
                            showToast({ position: "top-right", title: "Login Failed", description: "Boss, fields can't be empty! ☹️", status: "error" });
                        } else if (response.data?.login.errors)
                        {
                            showToast({ position: "top-right", title: "Login Failed", description: "Oops!!!, Invalid Credentials 🕵️‍♂️", status: "error" });
                            // setErrors(toErrorMap(response.data.login.errors));
                        } else if (response.data?.login.user)
                        {
                            router.push("/");
                            showToast({ position: "bottom", title: "Login Success", description: "Welcome back, we missed you 🤗", status: "success" });
                        }
                    }}>
                    {({ isSubmitting }) => (
                        <>
                            <Form>
                                <InputField name="username" placeholder="username" label="Username" noInputError={true} />
                                <Box mt={4}>
                                    <InputField name="password" placeholder="password" label="Password" type="password" noInputError={true} />
                                </Box>
                                <Button mt={4} type="submit" isLoading={isSubmitting} variantColor="teal">Login</Button>
                            </Form>
                        </>
                    )}
                </Formik>
            </Wrapper>
        </>
    );
}

export default Login;