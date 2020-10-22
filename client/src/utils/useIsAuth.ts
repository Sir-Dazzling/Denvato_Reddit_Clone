import { useToast } from "@chakra-ui/core";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useMeQuery } from "../generated/graphql";

export const useIsAuth = () =>
{
    const router = useRouter();
    const [{ data, fetching }] = useMeQuery();

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

    useEffect(() =>
    {
        if (!fetching && !data?.me)
        {
            router.replace("/login?next=" + router.pathname);
            showToast({ position: "bottom", title: "Action denied", description: "You need to be logged in to perform such action ✋", status: "warning" });
        }
    }, [fetching, data, router])
}