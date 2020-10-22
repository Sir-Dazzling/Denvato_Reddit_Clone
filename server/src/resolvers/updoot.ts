import { Arg, Ctx, Int, Mutation, Resolver, UseMiddleware } from "type-graphql";
import { getConnection } from "typeorm";
import { Updoot } from "../entities/Updoot";
import { isAuth } from "../middleware/isAuth";
import { MyContext } from "../types";

@Resolver(Updoot)
export class UpdootResolver
{
    @Mutation(() => Boolean)
    @UseMiddleware(isAuth)
    async vote(
        @Arg("postId", () => Int) postId: number,
        @Arg("value", () => Int) value: number,
        @Ctx() { req }: MyContext
    ): Promise<Boolean>
    {
        const isUpdoot = value !== -1;
        const realValue = isUpdoot ? 1 : -1;
        const { userId } = req.session;
        const updoot = await Updoot.findOne({ where: { postId, userId } });

        // the user has voted on the post before
        // and they are changing their vote
        if (updoot && updoot.value !== realValue)
        {
            await getConnection().transaction(async (tm) =>
            {
                await tm.query(
                    `
                        update updoot
                        set value = $1
                        where "postId" = $2 and "userId" = $3
                    `,
                    [realValue, postId, userId]
                );

                await tm.query(
                    `
                        update post
                        set points = points + $1
                        where id = $2
                    `,
                    [2 * realValue, postId]
                );
            });
        } else if (!updoot)
        {
            // has never voted before
            await getConnection().transaction(async (tm) =>
            {
                await tm.query(
                    `
                        insert into updoot ("userId", "postId", value)
                        values ($1, $2, $3)
                    `,
                    [userId, postId, realValue]
                );

                await tm.query(
                    `
                        update post
                        set points = points + $1
                        where id = $2
                    `,
                    [realValue, postId]
                );
            });
        }
        return true;
    }
};