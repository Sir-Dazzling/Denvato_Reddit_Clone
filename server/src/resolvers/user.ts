import { User } from "src/entities/User";
import { MyContext } from "src/types";
import { Arg, Ctx, Field, InputType, Mutation, ObjectType, Query, Resolver } from "type-graphql";
import argon2 from 'argon2';
import { EntityManager } from '@mikro-orm/postgresql';

@InputType()
class UsernamePasswordInput
{
    @Field()
    username: string

    @Field()
    password: string
}

@ObjectType()
class FieldError
{
    @Field()
    field: string;

    @Field()
    message: string
}

@ObjectType()
class UserResponse
{
    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[];

    @Field(() => User, { nullable: true })
    user?: User;
}

@Resolver()
export class UserResolver
{
    // Return current logged in user
    @Query(() => User, { nullable: true })
    async me(
        @Ctx() { req, em }: MyContext
    ): Promise<User | null>
    {
        // User not logged in
        if (!req.session.userId)
        {
            return null;
        }

        const user = await em.findOne(User, { id: req.session.userId });
        return user;
    }

    // Register a user
    @Mutation(() => UserResponse)
    async register(
        @Arg("options", () => UsernamePasswordInput) options: UsernamePasswordInput,
        @Ctx() { em, req }: MyContext,
    ): Promise<UserResponse>
    {
        if (options.username.length <= 2)
        {
            return {
                errors: [{
                    field: "username",
                    message: "username must be greater than 2"
                }]
            }
        }

        if (options.password.length <= 3)
        {
            return {
                errors: [{
                    field: "password",
                    message: "password must be greater than 3"
                }]
            }
        }
        const hashedPassword = await argon2.hash(options.password);
        let user;
        try
        {
            const result = await (em as EntityManager).createQueryBuilder(User).getKnexQuery().insert(
                {
                    username: options.username,
                    password: hashedPassword,
                    created_at: new Date(),
                    updated_at: new Date()
                }
            ).returning("*");
            user = result[0];
        } catch (error)
        {
            if (error.code === "23505")
            {
                return {
                    errors: [{
                        field: "username",
                        message: "username already taken"
                    }]
                }
            }
        }

        // Storing userid in session for auto login upon register
        // this will keep user logged in
        req.session.userId = user.id;

        return { user };
    }

    // Login a user
    @Mutation(() => UserResponse)
    async login(
        @Arg("options") options: UsernamePasswordInput,
        @Ctx() { em, req }: MyContext
    ): Promise<UserResponse>
    {
        const user = await em.findOne(User, { username: options.username })
        if (!user)
        {
            return {
                errors: [{
                    field: "username",
                    message: "Invalid credentials"
                }]
            }
        }
        const valid = await argon2.verify(user.password, options.password);

        if (!valid)
        {
            return {
                errors: [{
                    field: "password",
                    message: "Invalid credentials"
                }]
            }
        }

        // Storing userid in session
        // this will keep user logged in
        req.session.userId = user.id;

        return { user };
    }

}