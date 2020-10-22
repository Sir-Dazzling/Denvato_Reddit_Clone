import { BaseEntity, Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { Post } from './Post';
import { User } from './User';

// many to many relationship
// users <-> posts
// user -> join table <- posts
// user -> updoot <- posts

@Entity()
export class Updoot extends BaseEntity
{
    @Column({ type: "int" })
    value: number;

    @PrimaryColumn()
    userId: number;

    @ManyToOne(() => User)
    user: User;

    @PrimaryColumn()
    postId: number;

    @ManyToOne(() => Post)
    post: Post;
}