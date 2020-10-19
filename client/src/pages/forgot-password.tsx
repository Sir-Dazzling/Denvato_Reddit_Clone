import React, { useState } from 'react';
import { Heading, Box, Button, useToast } from '@chakra-ui/core';
import { Formik, Form } from 'formik';
import { InputField } from '../components/InputField';
import { NavBar } from '../components/NavBar';
import { Wrapper } from '../components/Wrapper';
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../utils/createUrqlClient';
import { useForgotPasswordMutation } from '../generated/graphql';

const ForgotPassword: React.FC<{}> = ({ }) =>
{
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

    const [, forgotPassword] = useForgotPasswordMutation();
    const [complete, setComplete] = useState(false);

    return <>
        <NavBar />
        <Wrapper variant="small">
            <Heading mb={5}>Forgot Password</Heading>
            <Formik
                initialValues={{ email: "" }}
                onSubmit={async (values) =>
                {
                    await forgotPassword(values);
                    setComplete(true);
                }}>
                {({ isSubmitting }) => complete ? <Box>We sent a message to the email address you provided </Box> : (
                    <>
                        <Form>
                            <InputField name="email" placeholder="Enter you email" label="Email" noInputError={true} />
                            <Button mt={4} type="submit" isLoading={isSubmitting} variantColor="teal">Reset Password</Button>
                        </Form>
                    </>
                )}
            </Formik>
        </Wrapper>
    </>;
}

export default withUrqlClient(createUrqlClient)(ForgotPassword);