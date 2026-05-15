import { HydratedDocument, Types } from 'mongoose';
import { MetaSchema } from './meta.schema';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';

export type CommentDocument = HydratedDocument<Comment>;

@Schema()
export class Comment extends MetaSchema {
    @Prop({
        required: false,
        type: String,
    })
    body: string;

    @Prop({
        required: false,
        type: [String],
    })
    images: string[];

    @Prop({
        required: false,
        type: Types.ObjectId,
        ref: 'User',
    })
    userId: Types.ObjectId;
    
    @Prop({
        required: false,
        type: Types.ObjectId,
        ref: 'Post',
    })
    postId: Types.ObjectId;
    
    @Prop({
        required: false,
        type: [Types.ObjectId],
        ref: 'User',
    })
    likes: Types.ObjectId[];
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
