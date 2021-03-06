import React, { useState } from 'react';
import { Formik, Form } from 'formik';
import { Alert, AlertIcon, Box, Button, Heading, Stack, useToast } from '@chakra-ui/core';
import { InputField } from '../components/InputField';
import { useRegisterMutation } from '../generated/graphql';
import { toErrorMap } from '../utils/toErrorMap';
import { useRouter } from 'next/router';
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../utils/createUrqlClient';
import { Layout } from '../components/Layout';

interface registerProps { }

const Register: React.FC<registerProps> = ({ }) =>
{
    const router = useRouter();
    const [, register] = useRegisterMutation();

    const [errorMessage, setErrorMessage] = useState("");

    const toast = useToast();

    const showToast = () =>
    {
        toast({
            title: "Account created",
            description: "We have created your account successfully 🤩",
            status: "success",
            duration: 9000,
            isClosable: true
        });
    };

    return (
        <Layout variant="small">
            <Heading mb={5}>Register</Heading>
            <Formik
                initialValues={{ email: "", username: "", password: "" }}
                onSubmit={async (values, { setErrors }) =>
                {
                    const response = await register({ options: values });
                    console.log(response.data?.register.errors);

                    if (values.username === "" || values.password === "")
                    {
                        setErrorMessage("Boss, fields can't be empty! ☹️");
                    } else if (response.data?.register.errors)
                    {
                        setErrors(toErrorMap(response.data.register.errors));
                        setErrorMessage("Oh dear, Something is wrong with your form 😩");
                    } else if (response.data?.register.user)
                    {
                        await router.push("/");
                        showToast();
                    }
                }}>
                {({ isSubmitting }) => (
                    <>
                        {errorMessage && <Stack spacing={3}>
                            <Alert status="error">
                                <AlertIcon />
                                {errorMessage}
                            </Alert>
                        </Stack>}
                        <Form>
                            <InputField name="username" placeholder="username" label="Username" />
                            <Box mt={4}>
                                <InputField name="email" placeholder="Email" label="Email" />
                            </Box>
                            <Box mt={4}>
                                <InputField name="password" placeholder="password" label="Password" type="password" />
                            </Box>
                            <Button mt={4} type="submit" isLoading={isSubmitting} variantColor="teal">Register</Button>
                        </Form>
                    </>
                )}
            </Formik>
        </Layout>
    );
}

export default withUrqlClient(createUrqlClient)(Register);