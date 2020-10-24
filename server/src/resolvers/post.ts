import { Arg, Ctx, Field, FieldResolver, InputType, Int, Mutation, ObjectType, Query, Resolver, Root, UseMiddleware } from "type-graphql";
import { getConnection } from "typeorm";
import { Post } from "../entities/Post";
import { isAuth } from "../middleware/isAuth";
import { MyContext } from "../types";

@InputType()
class PostInput
{
    @Field()
    title: string;

    @Field()
    text: string
}

@ObjectType()
class PaginatedPosts
{
    @Field(() => [Post])
    posts: Post[];

    @Field()
    hasMore: boolean
}

@Resolver(Post)
export class PostResolver
{
    @FieldResolver(() => String)
    textSnippet(
        @Root() root: Post
    )
    {
        return root.text.slice(0, 50);
    }

    // Get all posts
    @Query(() => PaginatedPosts)
    async posts(
        @Arg("limit", () => Int) limit: number,
        @Arg("cursor", () => String, { nullable: true }) cursor: string | null,
        @Ctx() { req }: MyContext
    ): Promise<PaginatedPosts>
    {
        const realLimit = Math.min(50, limit);
        const realLimitPlusOne = realLimit + 1;

        const replacements: any[] = [realLimitPlusOne];

        if (req.session.userId)
        {
            replacements.push(req.session.userId);
        }

        let cursorIndex = 3;
        if (cursor)
        {
            replacements.push(new Date(parseInt(cursor)));
            cursorIndex = replacements.length;
        }

        const posts = await getConnection().query(`
            select p.*,
            json_build_object(
                'id', u.id,
                'username', u.username,
                'email', u.email,
                'createdAt', u."createdAt",
                'updatedAt', u."updatedAt"
            ) creator,
            ${req.session.userId ? '(select value from updoot where "userId" = $2 and "postId" = p.id) "voteStatus"' : 'null as "voteStatus"'}
            from post p
            inner join public.user u on u.id = p."creatorId"
            ${cursor ? `where p."createdAt" < $${cursorIndex}` : ""}
            order by p."createdAt" DESC
            limit $1
        `, replacements);

        // const qb = getConnection()
        //     .getRepository(Post)
        //     .createQueryBuilder("p")
        //     .innerJoinAndSelect("p.creator", 'u", "u.id = p."creatorId')
        //     .orderBy('p."createdAt"', "DESC")
        //     .take(realLimitPlusOne);

        // if (cursor)
        // {
        //     qb.where('p."createdAt" < :cursor', { cursor: new Date(parseInt(cursor)) })
        // }

        // const posts = await qb.getMany();

        return { posts: posts.slice(0, realLimit), hasMore: posts.length === realLimitPlusOne };
    }

    // Get a single post by id
    @Query(() => Post, { nullable: true })
    post(@Arg("id", () => Int) id: number): Promise<Post | undefined>
    {
        return Post.findOne(id);
    }

    // Create a Post
    @Mutation(() => Post)
    @UseMiddleware(isAuth)
    async createPost(
        @Arg("input") input: PostInput,
        @Ctx() { req }: MyContext
    ): Promise<Post>
    {
        if (!req.session.userId)
        {
            throw new Error("Not authenticated");
        }

        return Post.create({
            ...input,
            creatorId: req.session.userId
        }).save();
    };

    // Update a Post
    @Mutation(() => Post, { nullable: true })
    async updatePost(
        @Arg("id") id: number,
        @Arg("title", () => String, { nullable: true }) title: String
    ): Promise<Post | null>
    {
        const post = await Post.findOne(id);
        if (!post)
        {
            return null;
        }

        if (typeof title !== "undefined")
        {
            Post.update({ id }, { title });
        }

        return post;
    }

    // Delete a Post
    @Mutation(() => Boolean)
    async deletePost(
        @Arg("id") id: number,
    ): Promise<boolean>
    {
        await Post.delete(id);
        return true;
    }
}
