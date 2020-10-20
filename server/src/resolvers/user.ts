import { User } from "../entities/User";
import { MyContext } from "src/types";
import { Arg, Ctx, Field, Mutation, ObjectType, Query, Resolver } from "type-graphql";
import argon2 from 'argon2';
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from "../constants";
import { validateRegister } from "../utils/validateRegister";
import { sendEMail } from "../utils/sendEmail";
import { v4 } from "uuid";
import { getConnection } from 'typeorm';
import { UsernamePasswordInput } from "./UsernamePasswordInput";

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
        @Ctx() { req }: MyContext
    )
    {
        // User not logged in
        if (!req.session.userId)
        {
            return null;
        }

        return User.findOne(req.session.userId);
    }

    // Register a user
    @Mutation(() => UserResponse)
    async register(
        @Arg("options", () => UsernamePasswordInput) options: UsernamePasswordInput,
        @Ctx() { req }: MyContext,
    ): Promise<UserResponse>
    {
        const errors = validateRegister(options);
        if (errors)
        {
            return { errors };
        }

        const hashedPassword = await argon2.hash(options.password);
        let user;

        try
        {
            const result = await getConnection().createQueryBuilder().insert().into(User).values(
                {
                    username: options.username,
                    password: hashedPassword,
                    email: options.email,
                }
            ).returning("*").execute();

            user = result.raw[0];

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
        @Arg("usernameOrEmail") usernameOrEmail: string,
        @Arg("password") password: string,
        @Ctx() { req }: MyContext
    ): Promise<UserResponse>
    {
        const user = await User.findOne(
            usernameOrEmail.includes("@")
                ? { where: { email: usernameOrEmail } } : { where: { username: usernameOrEmail } }
        );

        if (!user)
        {
            return {
                errors: [{
                    field: "usernameOrEmail",
                    message: "Invalid credentials"
                }]
            }
        }
        const valid = await argon2.verify(user.password, password);

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

    // To logout a user
    @Mutation(() => Boolean)
    logout(@Ctx() { req, res }: MyContext)
    {
        return new Promise(resolve => req.session.destroy(error =>
        {
            res.clearCookie(COOKIE_NAME);
            if (error)
            {
                console.error(error);
                resolve(false);
            }
            resolve(true);
        }));
    }

    // Forgot password functionality
    @Mutation(() => Boolean)
    async forgotPassword(
        @Arg("email") email: string,
        @Ctx() { redis }: MyContext
    ): Promise<boolean>
    {
        const user = await User.findOne({ where: { email } });

        // checking if user is in database
        if (!user)
        {
            return true;
        }

        const token = v4();
        await redis.set(FORGET_PASSWORD_PREFIX + token, user.id, "ex", 1000 * 60 * 60 * 24 * 3);

        await sendEMail(email, `<a href='http://localhost:3000/change-password/${token}'>Reset Password</a>`);

        return true;
    }

    // Changing user password logic
    @Mutation(() => UserResponse)
    async changePassword(
        @Arg("token") token: string,
        @Arg("newPassword") newPassword: string,
        @Ctx() { redis, req }: MyContext
    ): Promise<UserResponse>
    {
        if (newPassword.length <= 3)
        {
            return {
                errors: [
                    {
                        field: "newPassword",
                        message: "Length must be greater than 3"
                    }
                ]
            };
        }

        const key = FORGET_PASSWORD_PREFIX + token;
        const userId = await redis.get(key);
        if (!userId)
        {
            return {
                errors: [
                    {
                        field: "token",
                        message: "token expired"
                    }
                ]
            };
        }

        const userIdNum = parseInt(userId);
        const user = await User.findOne(userIdNum);

        if (!user)
        {
            return {
                errors: [
                    {
                        field: "token",
                        message: "user no longer exists"
                    }
                ]
            };
        }

        await User.update(
            {
                id: userIdNum
            },
            {
                password: await argon2.hash(newPassword)
            }
        );

        redis.del(key);

        // Login user after change password
        req.session.userId = user.id;

        return { user };
    }
}