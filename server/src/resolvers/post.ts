import { Post } from "../entities/Post";
import { Arg, Mutation, Query, Resolver } from "type-graphql";

@Resolver()
export class PostResolver
{
    // Get all posts
    @Query(() => [Post])
    async posts(): Promise<Post[]>
    {
        return Post.find();
    }

    // Get a single post by id
    @Query(() => Post, { nullable: true })
    post(@Arg("id") id: number): Promise<Post | undefined>
    {
        return Post.findOne(id);
    }

    // Create a Post
    @Mutation(() => Post)
    async createPost(
        @Arg("title") title: String
    ): Promise<Post>
    {
        //2 sql queries
        return Post.create({ title }).save();
    }

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
