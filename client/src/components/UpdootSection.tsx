import { Flex, IconButton, useToast } from '@chakra-ui/core';
import React, { useState } from 'react';
import { PostSnippetFragment, useVoteMutation } from '../generated/graphql';

interface UpdootSectionProps
{
    post: PostSnippetFragment;
};

export const UpdootSection: React.FC<UpdootSectionProps> = ({ post }) =>
{
    const [loadingState, setLoadingState] = useState<"updoot-loading" | "downdoot-loading" | "not-loading">("not-loading");
    const [, vote] = useVoteMutation();

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
        <Flex direction="column" justifyContent="center" alignItems="center" mr={4}>
            <IconButton icon="chevron-up" fontSize="24px" aria-label="upvote" variant="outline" variantColor="green" size="sm"
                isLoading={loadingState === "updoot-loading"}
                onClick={async () =>
                {
                    if (post.voteStatus === 1)
                    {
                        showToast({ position: "bottom", title: "Vote Failed", description: "Boss, you have already upvoted on this post! ☹️", status: "error" });
                        return;
                    }
                    setLoadingState("updoot-loading");
                    await vote({ postId: post.id, value: 1 });
                    setLoadingState("not-loading");
                }} />
            {post.points}
            <IconButton icon="chevron-down" fontSize="24px" aria-label="downvote" variant="outline" variantColor="red" size="sm"
                isLoading={loadingState === "downdoot-loading"}
                onClick={async () =>
                {
                    if (post.voteStatus === -1)
                    {
                        showToast({ position: "bottom", title: "Vote Failed", description: "Boss, you have already downvoted on this post! ☹️", status: "error" });
                        return;
                    }
                    setLoadingState("downdoot-loading");
                    await vote({ postId: post.id, value: -1 });
                    setLoadingState("not-loading");
                }} />
        </Flex>
    );
}