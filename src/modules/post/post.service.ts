import { PaginatedReturnType } from '@/common/classes/PaginatedReturnType';
import { ReturnType } from '@/common/classes/ReturnType';
import { Business, type BusinessDocument } from '@/schemas/Business.schema';
import { Comment, type CommentDocument } from '@/schemas/Comments.schema';
import { Post, type PostDocument } from '@/schemas/Post.schema';
import { Product, type ProductDocument } from '@/schemas/Product.schema';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types, type Model } from 'mongoose';
import { UploadService } from '../upload/upload.service';
import { CreatePostDto } from './dto/create-post.dto';
import { EditPostDto } from './dto/edit-post.dto';
import { PaginationQueryDto } from '../business/dto/pagination-query.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UserService } from '../user/user.service';

@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post.name) private readonly postModel: Model<PostDocument>,
    @InjectModel(Comment.name)
    private readonly commentModel: Model<CommentDocument>,
    @InjectModel(Business.name)
    private readonly businessModel: Model<BusinessDocument>,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    private readonly uploadService: UploadService,
    private userService: UserService,
  ) {}

  async createPost(userId: string, dto: CreatePostDto): Promise<ReturnType> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid userId');
    }

    const created = await this.postModel.create({
      body: dto.body ?? '',
      images: dto.images ?? [],
      userId: new Types.ObjectId(userId),
      productId: dto.productId ? new Types.ObjectId(dto.productId) : undefined,
      likes: [],
    });

    return new ReturnType({
      success: true,
      message: 'Post created',
      data: await this.enrichPost(created, userId),
    });
  }

  async editPost(
    userId: string,
    postId: string,
    dto: EditPostDto,
  ): Promise<ReturnType> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid userId');
    }
    if (!Types.ObjectId.isValid(postId)) {
      throw new BadRequestException('Invalid postId');
    }

    const post = await this.postModel.findOne({
      _id: postId,
      isDeleted: false,
    });
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.userId?.toString() !== userId) {
      throw new ForbiddenException('You do not have access to edit this post');
    }

    if (dto.body !== undefined) post.body = dto.body ?? '';
    if (dto.images !== undefined) post.images = dto.images ?? [];
    if (dto.productId !== undefined) {
      post.productId =
        dto.productId === null || dto.productId === ''
          ? undefined
          : new Types.ObjectId(dto.productId);
    }
    post.updatedAt = new Date().toISOString();

    await post.save();

    return new ReturnType({
      success: true,
      message: 'Post updated',
      data: await this.enrichPost(post, userId),
    });
  }

  async deletePost(userId: string, postId: string): Promise<ReturnType> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid userId');
    }
    if (!Types.ObjectId.isValid(postId)) {
      throw new BadRequestException('Invalid postId');
    }

    const post = await this.postModel.findOne({
      _id: postId,
      isDeleted: false,
    });
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.userId?.toString() !== userId) {
      throw new ForbiddenException(
        'You do not have access to delete this post',
      );
    }

    post.isDeleted = true;
    post.deletedAt = new Date().toISOString();
    post.updatedAt = new Date().toISOString();
    await post.save();

    return new ReturnType({
      success: true,
      message: 'Post deleted',
      data: { id: postId },
    });
  }

  async getPosts(
    query: PaginationQueryDto,
    currentUserId?: string,
  ): Promise<PaginatedReturnType> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const [total, posts] = await Promise.all([
      this.postModel.countDocuments({ isDeleted: false }),
      this.postModel
        .find({ isDeleted: false })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
    ]);

    const enriched = await Promise.all(
      posts.map((p) => this.enrichPost(p, currentUserId)),
    );

    return new PaginatedReturnType({
      success: true,
      message: 'Posts',
      data: enriched,
      total,
      page,
    });
  }

  async getPostsByUserId(
    userId: string,
    query: PaginationQueryDto,
    currentUserId?: string,
  ): Promise<PaginatedReturnType> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid userId');
    }
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const [total, posts] = await Promise.all([
      this.postModel.countDocuments({
        isDeleted: false,
        userId: new Types.ObjectId(userId),
      }),
      this.postModel
        .find({ isDeleted: false, userId: new Types.ObjectId(userId) })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
    ]);

    const enriched = await Promise.all(
      posts.map((p) => this.enrichPost(p, currentUserId)),
    );

    return new PaginatedReturnType({
      success: true,
      message: 'Posts',
      data: enriched,
      total,
      page,
    });
  }

  async getPostById(
    postId: string,
    currentUserId?: string,
  ): Promise<ReturnType> {
    if (!Types.ObjectId.isValid(postId)) {
      throw new BadRequestException('Invalid postId');
    }

    const post = await this.postModel.findOne({
      _id: postId,
      isDeleted: false,
    });
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return new ReturnType({
      success: true,
      message: 'Post',
      data: await this.enrichPost(post, currentUserId),
    });
  }

  async commentOnPost(
    userId: string,
    postId: string,
    dto: CreateCommentDto,
  ): Promise<ReturnType> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid userId');
    }
    if (!Types.ObjectId.isValid(postId)) {
      throw new BadRequestException('Invalid postId');
    }

    const post = await this.postModel.findOne({
      _id: postId,
      isDeleted: false,
    });
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const created = await this.commentModel.create({
      body: dto.body ?? '',
      images: dto.images ?? [],
      userId: new Types.ObjectId(userId),
      postId: new Types.ObjectId(postId),
      likes: [],
      isReply: dto?.isReply ?? false,
      commentId: dto?.commentId ?? null,
    });

    await created.save();

    return new ReturnType({
      success: true,
      message: 'Comment created',
      data: await this.enrichComment(created),
    });
  }

  async replyComment(
    commentId: string,
    userId: string,
    payload: CreateCommentDto,
  ) {
    try {
      const comment = await this.commentModel.findById(new Types.ObjectId(commentId));

      if (!comment) {
        throw new NotFoundException('Comment not found');
      }

      const newReply = await this.commentModel.create({
        commentId: payload.commentId,
        isReply: true,
        body: payload.body,
        images: payload.images ?? [],
        userId: userId,
      });
      const savedReply = await newReply.save();
      const enrichedReply: Comment = await this.enrichComment(savedReply);
      return new ReturnType({
        data: enrichedReply,
        success: true,
        message: 'Reply created',
      });
    } catch (error: unknown) {
      throw new InternalServerErrorException('Failed to create reply', error as any);
    }
  }

  async getRepliesByCommentId(
    commentId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedReturnType> {
    if (!Types.ObjectId.isValid(commentId)) {
      throw new BadRequestException('Invalid commentId');
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const [total, replies] = await Promise.all([
      this.commentModel.countDocuments({ commentId, isDeleted: false }),
      this.commentModel
        .find({ commentId, isDeleted: false })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
    ]);

    const enriched = await Promise.all(
      replies.map((c) => this.enrichComment(c)),
    );

    return new PaginatedReturnType({
      success: true,
      message: 'Replies',
      data: enriched,
      total,
      page,
    });
  }

  async getPostComments(
    postId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedReturnType> {
    if (!Types.ObjectId.isValid(postId)) {
      throw new BadRequestException('Invalid postId');
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const [total, comments] = await Promise.all([
      this.commentModel.countDocuments({ postId: new Types.ObjectId(postId), isDeleted: false }),
      this.commentModel
        .find({ postId: new Types.ObjectId(postId), isDeleted: false })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
    ]);

    const enriched = await Promise.all(
      comments.map((c) => this.enrichComment(c)),
    );

    return new PaginatedReturnType({
      success: true,
      message: 'Comments',
      data: enriched,
      total,
      page,
    });
  }

  async toggleCommentLike(CommentId: string, userId: string) {
    if (!Types.ObjectId.isValid(CommentId)) {
      throw new BadRequestException('Invalid CommentId');
    }
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid userId');
    }

    const exists = await this.commentModel.exists({
      _id: CommentId,
      isDeleted: false,
      likes: new Types.ObjectId(userId),
    });

    const update = exists
      ? { $pull: { likes: new Types.ObjectId(userId) } }
      : { $addToSet: { likes: new Types.ObjectId(userId) } };

    const updated = await this.commentModel
      .findOneAndUpdate(
        { _id: CommentId, isDeleted: false },
        { ...update, $set: { updatedAt: new Date().toISOString() } },
        { new: true },
      )
      .select('likes');

    if (!updated) {
      throw new NotFoundException('Comment not found');
    }

    const hasLiked = updated.likes?.includes(new Types.ObjectId(userId));

    return Array.isArray(updated.likes)
      ? { hasLiked, likes: updated.likes.length }
      : { hasLiked, likes: 0 };
  }

  async toggleLike(postId: string, userId: string) {
    if (!Types.ObjectId.isValid(postId)) {
      throw new BadRequestException('Invalid postId');
    }
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid userId');
    }

    const exists = await this.postModel.exists({
      _id: postId,
      isDeleted: false,
      likes: new Types.ObjectId(userId),
    });

    const update = exists
      ? { $pull: { likes: new Types.ObjectId(userId) } }
      : { $addToSet: { likes: new Types.ObjectId(userId) } };

    const updated = await this.postModel
      .findOneAndUpdate(
        { _id: postId, isDeleted: false },
        { ...update, $set: { updatedAt: new Date().toISOString() } },
        { new: true },
      )
      .select('likes');

    if (!updated) {
      throw new NotFoundException('Post not found');
    }

    const hasLiked = updated.likes?.includes(new Types.ObjectId(userId));

    return Array.isArray(updated.likes)
      ? { hasLiked, likes: updated.likes.length }
      : { hasLiked, likes: 0 };
  }

  public async getLikedUsers(
    postId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedReturnType> {
    if (!Types.ObjectId.isValid(postId)) {
      throw new BadRequestException('Invalid postId');
    }

    const skip = (page - 1) * limit;
    const post = await this.postModel.findOne({
      _id: postId,
      isDeleted: false,
    });
    const total = post?.likes?.length ?? 0;

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (!post?.likes || post?.likes.length < 1) {
      return new PaginatedReturnType({
        success: true,
        message: 'Liked users',
        data: [],
        total,
        page,
      });
    }

    const users = post?.likes;
    const pagUsers = users?.slice(skip, skip + limit);
    const enriched = await Promise.all(
      pagUsers.map(async (u) => {
        const user = await this.userService.getUserById(u.toString());
        return user?.data;
      }),
    );

    return new PaginatedReturnType({
      success: true,
      message: 'Liked users',
      data: enriched,
      total,
      page,
    });
  }

  public async deleteComment(id: string, userId: string) {
    try {
      const comment = await this.commentModel.findOne({
        _id: id,
        isDeleted: false,
        userId: new Types.ObjectId(userId),
      });

      if (!comment) {
        throw new NotFoundException('Comment not found');
      }

      // delete all comments and replies
      await this.commentModel.deleteMany({
        _id: id,
        isDeleted: false,
      });

      // delete replies
      await this.commentModel.deleteMany({
        commentId: id,
        isDeleted: false,
      });

      return new ReturnType({
        success: true,
        message: 'Comment deleted',
      });
    } catch (error) {
      throw new BadRequestException('Failed to delete comment');
    }
  }

  private async enrichPost(
    post: PostDocument | Record<string, any>,
    currentUserId?: string,
  ) {
    try {
      const obj =
        typeof (post as any).toObject === 'function'
          ? (post as any).toObject()
          : post;

      const [business, product] = await Promise.all([
        this.businessModel
          .findOne({ userId: obj.userId, isDeleted: false })
          .select('name location pictures rating approved enabled')
          .lean(),
        obj.productId ? this.productModel.findById(obj.productId).lean() : null,
      ]);

      const postImages = Array.isArray(obj.images)
        ? ((await this.uploadService.getSignedUrl(obj.images)) as string[])
        : [];

      const businessPictures = business?.pictures
        ? ((await this.uploadService.getSignedUrl(
            business.pictures,
          )) as string[])
        : [];

      const productPictures =
        product && Array.isArray((product as any).pictures)
          ? ((await this.uploadService.getSignedUrl(
              (product as any).pictures,
            )) as string[])
          : [];

      const likeCount = Array.isArray(obj.likes) ? obj.likes.length : 0;
      const hasLiked =
        typeof currentUserId === 'string' && currentUserId.length > 0
          ? Array.isArray(obj.likes) &&
            obj.likes.some((l: any) => l?.toString?.() === currentUserId)
          : false;
      const rest = { ...obj } as Record<string, any>;
      delete rest.likes;

      return {
        ...rest,
        images: postImages,
        business: business
          ? {
              ...business,
              pictures: businessPictures,
            }
          : null,
        product: product
          ? {
              ...product,
              pictures: productPictures,
            }
          : null,
        likeCount,
        hasLiked,
      };
    } catch (error) {
      throw new BadRequestException('Failed to enrich post');
    }
  }

  private async enrichComment(comment: CommentDocument | Record<string, any>) {
    try {
      const obj =
        typeof (comment as any).toObject === 'function'
          ? (comment as any).toObject()
          : comment;

      const business = await this.businessModel
        .findOne({ userId: obj.userId, isDeleted: false })
        .select('name location pictures rating approved enabled')
        .lean();

      const commentImages = Array.isArray(obj.images)
        ? ((await this.uploadService.getSignedUrl(obj.images)) as string[])
        : [];

      const businessPictures = business?.pictures
        ? ((await this.uploadService.getSignedUrl(
            business.pictures,
          )) as string[])
        : [];

        const user = await this.userService.getUserById(comment?.userId?.toString());

        // get replies count
        const replies = await this.commentModel.countDocuments({
          commentId: obj._id,
          isDeleted: false,
          isReply: true,
        });

      return {
        ...obj,
        images: commentImages,
        business: business
          ? {
              ...business,
              pictures: businessPictures,
            }
          : null,
        user: user?.data,
        replies: replies || 0,
      };
    } catch (error) {
      throw new BadRequestException('Failed to enrich comment');
    }
  }
}
