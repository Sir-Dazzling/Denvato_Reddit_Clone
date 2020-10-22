import "reflect-metadata";
import { COOKIE_NAME, _prod_ } from './constants';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { HelloResolver } from './resolvers/hello';
import { PostResolver } from './resolvers/post';
import { UserResolver } from "./resolvers/user";
import Redis from "ioredis";
import session from "express-session";
import connectRedis from 'connect-redis';
import cors from 'cors';
import { createConnection } from 'typeorm';
import { User } from "./entities/User";
import { Post } from "./entities/Post";
import path from "path";
import { Updoot } from "./entities/Updoot";
import { UpdootResolver } from "./resolvers/updoot";

const main = async () =>
{
    const conn = createConnection({
        type: 'postgres',
        database: 'denvato-reddit',
        username: "postgres",
        password: "Shortcuts@100",
        logging: true,
        synchronize: true,
        migrations: [path.join(__dirname, "./migrations/*")],
        entities: [Post, User, Updoot]
    });

    (await conn).runMigrations();

    // await Post.delete({});

    const app = express();

    const RedisStore = connectRedis(session);
    const redis = new Redis();

    app.use(cors({
        origin: "http://localhost:3000",
        credentials: true
    }));

    app.use(
        session({
            name: COOKIE_NAME,
            store: new RedisStore({
                client: redis,
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
            resolvers: [HelloResolver, PostResolver, UserResolver, UpdootResolver],
            validate: false
        }),
        context: ({ req, res }) => ({ req, res, redis })
    });

    apolloServer.applyMiddleware({
        app,
        cors: false
    });

    app.listen(4000, () =>
    {
        console.log("Server started on port localhost:4000");
    });
};

main().catch(err =>
{
    console.error(err);
}); 