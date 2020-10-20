import { Entity, PrimaryGeneratedColumn, CreateDateColumn, Column, UpdateDateColumn, BaseEntity } from 'typeorm';
import { Field, Int, ObjectType } from "type-graphql";


@ObjectType()
@Entity()
export class Post extends BaseEntity
{
    @Field(() => Int)
    @PrimaryGeneratedColumn()
    id!: number;

    @Field(() => String)
    @CreateDateColumn()
    createdAt = Date;

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt = Date;

    @Field()
    @Column({ unique: true })
    title!: String;
}