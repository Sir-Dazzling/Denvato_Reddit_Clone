import React, { useState } from 'react';
import { Box, Button, Flex, Heading, Icon, Input, InputGroup, InputLeftElement } from '@chakra-ui/core';
import NextLink from 'next/link';
import { useLogoutMutation, useMeQuery } from '../generated/graphql';
import { isServer } from '../utils/isServer';

interface NavBarProps { }

export const NavBar: React.FC<NavBarProps> = ({ }) =>
{
    const [show, setShow] = useState(false);
    const handleToggle = () => setShow(!show);
    const [{ data, fetching }] = useMeQuery({
        pause: isServer()
    });
    const [{ fetching: logoutFetching }, logout] = useLogoutMutation();

    let body = null;

    // data is loading
    if (fetching)
    {
        // user is not logged in
        <Box>Loading</Box>
    } else if (!data?.me)
    {
        body = (
            <Box ml={"auto"}>
                <NextLink href="/login">
                    <Button bg="transparent" mr={2} border="1px">
                        Login
                    </Button>
                </NextLink>
                <NextLink href="/register">
                    <Button bg="white" color="black">
                        Create account
                    </Button>
                </NextLink>
            </Box>
        );
    } else
    {
        // user is logged in
        body = (
            <Flex ml={"auto"}>
                <NextLink href="/create-post">
                    Create Post
                </NextLink>
                <Box ml={"2"}>{data.me.username}</Box>
                <Button
                    variant="link"
                    color="white"
                    ml={"2"}
                    onClick={() =>
                    {
                        logout();
                    }}
                    isLoading={logoutFetching}>
                    Logout
                </Button>
            </Flex>
        )
    }

    return (
        <Flex
            as="nav"
            align="center"
            justify="space-between"
            wrap="wrap"
            padding="1.5rem"
            bg="cyan.800"
            color="white"
            position="sticky"
            top={0}
            zIndex={2}>
            <Flex align="center" mr={5}>
                <Heading as="h1" size="lg" letterSpacing={"-.1rem"}>
                    Denvato Reddit
                </Heading>
            </Flex>
            <Flex ml="auto">
                <InputGroup w="35vw">
                    <InputLeftElement children={<Icon name="search" color="gray.500" />} />
                    <Input isFullWidth={true} type="search" placeholder="Search here..." color="black" />
                </InputGroup>

            </Flex>
            {body}
        </Flex>
    );
}