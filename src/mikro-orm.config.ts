import { _prod_ } from "./constants";
import { Post } from "./entities/Post";
import { MikroORM } from '@mikro-orm/core';
import path from 'path';
import { User } from "./entities/User";

export default {
    migrations: {
        path: path.join(__dirname, "./migrations"),
        pattern: /^[\w-]+\d+\.[tj]s$/
    },
    entities: [Post, User],
    dbName: "denvato-reddit-clone",
    type: "postgresql",
    username: "postgres",
    password: "Shortcuts@100",
    debug: !_prod_,
} as Parameters<typeof MikroORM.init>[0];