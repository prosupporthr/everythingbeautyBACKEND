import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BookmarksController } from './bookmarks.controller';
import { BookmarksService } from './bookmarks.service';
import { Bookmark, BookmarkSchema } from '@/schemas/Bookmark.schema';
import { User, UserSchema } from '@/schemas/User.schema';
import { JwtService } from '@nestjs/jwt';
import { UploadService } from '../upload/upload.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Bookmark.name, schema: BookmarkSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [BookmarksController],
  providers: [BookmarksService, JwtService, UploadService],
})
export class BookmarksModule {}
