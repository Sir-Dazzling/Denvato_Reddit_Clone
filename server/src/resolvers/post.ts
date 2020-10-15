import { Post } from "src/entities/Post";
import { MyContext } from "src/types";
import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";

@Resolver()
export class PostResolver
{
    // Get all posts
    @Query(() => [Post])
    posts(@Ctx() { em }: MyContext): Promise<Post[]>
    {
        return em.find(Post, {});
    }

    // Get a single post by id
    @Query(() => Post, { nullable: true })
    post(@Arg("id") id: number, @Ctx() { em }: MyContext): Promise<Post | null>
    {
        return em.findOne(Post, { id });
    }

    // Create a Post
    @Mutation(() => Post)
    async createPost(
        @Arg("title") title: String,
        @Ctx() { em }: MyContext
    ): Promise<Post>
    {
        const post = em.create(Post, { title });
        await em.persistAndFlush(post);
        return post;
    }

    // Update a Post
    @Mutation(() => Post, { nullable: true })
    async updatePost(
        @Arg("id") id: number,
        @Arg("title", () => String, { nullable: true }) title: String,
        @Ctx() { em }: MyContext
    ): Promise<Post | null>
    {
        const post = await em.findOne(Post, { id });
        if (!post)
        {
            return null;
        }

        if (typeof title !== "undefined")
        {
            post.title = title;
            await em.persistAndFlush(post);
        }

        return post;
    }

    // Delete a Post
    @Mutation(() => Boolean)
    async deletePost(
        @Arg("id") id: number,
        @Ctx() { em }: MyContext
    ): Promise<boolean>
    {
        await em.nativeDelete(Post, { id });
        return true;
    }
}
