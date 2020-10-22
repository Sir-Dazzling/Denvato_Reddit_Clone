import React from 'react';
import { Box, Button, Heading, useToast } from '@chakra-ui/core';
import { Form, Formik } from 'formik';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import { InputField } from '../components/InputField';
import { Layout } from '../components/Layout';
import { useCreatePostMutation } from '../generated/graphql';
import { createUrqlClient } from '../utils/createUrqlClient';
import { useIsAuth } from '../utils/useIsAuth';

const CreatePost: React.FC<{}> = ({ }) =>
{
    useIsAuth();

    const router = useRouter();
    const [, createPost] = useCreatePostMutation();

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
            <Layout variant="small">
                <Heading mb={5}>Create Post</Heading>
                <Formik
                    initialValues={{ title: "", text: "" }}
                    onSubmit={async (values) =>
                    {
                        const { error } = await createPost({ input: values });
                        console.error("error: ", error);

                        if (error)
                        {
                            toast({ position: "bottom", title: "Post upload denied", description: "You need to be logged in to perform such action ✋", status: "warning" });
                        } else
                        {
                            await router.push("/");
                            showToast({ position: "bottom", title: "Post upload Success", description: "Yipeee!!!, Post uploaded successfully 📃✏️", status: "success" });
                        }
                    }}>
                    {({ isSubmitting }) => (
                        <>
                            <Form>
                                <InputField name="title" placeholder="Enter the title of your post" label="Post Title" />
                                <Box mt={4}>
                                    <InputField name="text" placeholder="Enter post content here..." label="Text" type="text" textarea={true} />
                                </Box>
                                <Button mt={4} type="submit" isLoading={isSubmitting} variantColor="teal">Create Post</Button>
                            </Form>
                        </>
                    )}
                </Formik>
            </Layout>
        </>
    );
}

export default withUrqlClient(createUrqlClient)(CreatePost);