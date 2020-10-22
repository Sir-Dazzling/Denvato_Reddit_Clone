import React, { useState } from 'react';
import { withUrqlClient } from 'next-urql';
import { Layout } from '../components/Layout';
import { usePostsQuery } from '../generated/graphql';
import { createUrqlClient } from '../utils/createUrqlClient';
import { Box, Button, Flex, Heading, Stack, Text } from '@chakra-ui/core';

const Index = () =>
{
  const [variables, setVariables] = useState({ limit: 33, cursor: null as string | null });
  const [{ data, fetching }] = usePostsQuery({ variables });

  if (!fetching && !data)
  {
    return <div>You have no posts for some reason</div>
  }

  return (
    <Layout>
      {!data && fetching ? (
        <div>Loading...</div>
      ) : (
          <Stack spacing={8}>
            {data!.posts.posts.map(p => (
              <Box key={p.id} p={5} shadow="md" borderWidth="1px">
                <Heading fontSize="xl">{p.title}</Heading>
                <Text mt={4}>{p.textSnippet}</Text>
              </Box>
            ))}
          </Stack>
        )}
      { data && data.posts.hasMore && <Flex my={4}>
        <Button onClick={() =>
        {
          setVariables({ limit: variables.limit, cursor: data.posts.posts[data.posts.posts.length - 1].createdAt })
        }} m="auto" isLoading={fetching}>Load more</Button>
      </Flex>}

    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
