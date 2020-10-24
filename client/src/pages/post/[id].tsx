import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import { Layout } from '../../components/Layout';
import { usePostQuery } from '../../generated/graphql';
import { createUrqlClient } from '../../utils/createUrqlClient';

const Post = ({ }) =>
{
    const router = useRouter();
    const intId = typeof router.query.id === "string" ? parseInt(router.query.id) : -1;
    const [{ data, fetching }] = usePostQuery({
        pause: intId === -1,
        variables: {
            id: intId
        }
    });
    router.query.id;

    if (fetching)
    {
        return (
            <Layout>
                <div>...lodaing</div>
            </Layout>
        );
    }

    return (
        <Layout>
            {data?.post?.text}
        </Layout>
    );
}

export default withUrqlClient(createUrqlClient, { ssr: true })(Post);