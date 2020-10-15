import "reflect-metadata";
import { MikroORM } from '@mikro-orm/core';
import { _prod_ } from './constants';
import config from './mikro-orm.config';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { HelloResolver } from './resolvers/hello';
import { PostResolver } from './resolvers/post';
import { UserResolver } from "./resolvers/user";
import redis from "redis";
import session from "express-session";
import connectRedis from 'connect-redis';

const main = async () =>
{
    const orm = await MikroORM.init(config);
    await orm.getMigrator().up();

    const app = express();

    const RedisStore = connectRedis(session);
    const redisClient = redis.createClient();

    app.use(
        session({
            name: "d_id",
            store: new RedisStore({
                client: redisClient,
                disableTouch: true
            }),
            cookie: {
                maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
                httpOnly: true,
                secure: _prod_,  // cookie only works in https
                sameSite: "lax"
            },
            saveUninitialized: false,
            secret: 'djfdjdfjhfdjhdf',
            resave: false,
        })
    );

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver, UserResolver],
            validate: false
        }),
        context: ({ req, res }) => ({ em: orm.em, req, res })
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