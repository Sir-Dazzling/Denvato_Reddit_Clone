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
        @Arg("cursor", () => String, { nullable: true }) cursor: string | null
    ): Promise<PaginatedPosts>
    {
        const realLimit = Math.min(50, limit);
        const realLimitPlusOne = realLimit + 1;
        const qb = getConnection()
            .getRepository(Post)
            .createQueryBuilder("p")
            .orderBy('"createdAt"', "DESC")
            .take(realLimitPlusOne);

        if (cursor)
        {
            qb.where('"createdAt" < :cursor', { cursor: new Date(parseInt(cursor)) })
        }

        const posts = await qb.getMany();

        return { posts: posts.slice(0, realLimit), hasMore: posts.length === realLimitPlusOne };
    }

    // Get a single post by id
    @Query(() => Post, { nullable: true })
    post(@Arg("id") id: number): Promise<Post | undefined>
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
