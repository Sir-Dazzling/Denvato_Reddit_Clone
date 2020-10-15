import "reflect-metadata";
import { MikroORM } from '@mikro-orm/core';
import { _prod_ } from './constants';
import config from './mikro-orm.config';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { HelloResolver } from './resolvers/hello';
import { PostResolver } from './resolvers/post';

const main = async () =>
{
    const orm = await MikroORM.init(config);
    await orm.getMigrator().up();

    const app = express();

    app.get("/", (_req, res) => res.send("Hello"));

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver],
            validate: false
        }),
        context: () => ({ em: orm.em })
    });

    apolloServer.applyMiddleware({ app });

    app.listen(4000, () =>
    {
        console.log("Server started on port localhost:4000");
    });
};

main().catch(err =>
{
    console.error(err);
}); 