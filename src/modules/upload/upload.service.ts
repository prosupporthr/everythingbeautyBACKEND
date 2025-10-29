import { UPLOAD_TYPE } from '@/common/enums/uploadTypeEnum';
import { User, UserDocument } from '@/schemas/User.schema';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';
import { ReturnType } from 'src/common/classes/ReturnType';

export const FOLDERS = ['UPLOADED', 'PROFILE_PICTURE'];

@Injectable()
export class UploadService {
  private logger = new Logger(UploadService.name);
  private s3: AWS.S3;
  private bucket: string;

  constructor(private configService: ConfigService) {
    this.s3 = new AWS.S3({
      accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get<string>('AWS_SECRET_KEY'),
      region: this.configService.get<string>('AWS_REGION'),
    });

    this.bucket = this.configService.get<string>('AWS_BUCKET_NAME') as string;
  }

  async getSignedUrl(key: string | string[]): Promise<string | string[]> {
    const items = Array.isArray(key) ? key : [key];

    const signedUrls = await Promise.all(
      items.map(async (item) => {
        const params = {
          Bucket: this.bucket,
          Key: `${item}`,
          Expires: 60 * 60 * 24 * 7, // link valid for 1 week
        };
        // Get signed URL from S3 for temporary access
        const signedUrl = await this.s3.getSignedUrlPromise(
          'getObject',
          params,
        );
        return signedUrl;
        // return `https://${this.bucket}.s3.${this.configService.get<string>('AWS_REGION')}.amazonaws.com/${params.Key}`;
      }),
    );

    return Array.isArray(key) ? signedUrls : signedUrls[0];
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'uploads',
  ): Promise<ReturnType> {
    try {
      const key = `uploads/${file.originalname}`;
      this.logger.log('this is the uploaded filename', key);

      const params: AWS.S3.PutObjectRequest = {
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read',
      };

      await this.s3.putObject(params).promise();

      return new ReturnType({
        message: '',
        success: true,
        data: { url: key },
      });
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('Failed to upload file');
    }
  }

  async uploadFiles(files: Express.Multer.File[], uploadType: UPLOAD_TYPE) {
    try {
      if (files.length > 10) {
        throw new BadRequestException(`You cannot upload more than 10 images`);
      }

      let images: string[] = [];

      const uploadPromises = files.map((file) => {
        return this.uploadFile(file, uploadType);
      });

      const results: ReturnType[] = await Promise.all(uploadPromises);

      images = results.map((result) => {
        this.logger.log(result);
        const url: string = result.data?.url;
        this.logger.log(url);
        return url;
      });

      return new ReturnType({
        message: 'upload successful',
        data: images,
        success: true,
      });
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException();
    }
  }

  async checkFileExists(key: string | string[]): Promise<void> {
    try {
      const items = Array.isArray(key) ? key : [key];
      const missingFiles: string[] = [];

      const existsPromises = items.map(async (item) => {
        try {
          const params = {
            Bucket: this.bucket,
            Key: `${item}`,
          };
          await this.s3.headObject(params).promise();
          return { key: item, exists: true };
        } catch (error) {
          if (error.code === 'NotFound') {
            return { key: item, exists: false };
          }
          throw error;
        }
      });

      const results = await Promise.all(existsPromises);

      results.forEach((result) => {
        if (!result.exists) {
          missingFiles.push(result.key);
        }
      });

      if (missingFiles.length > 0) {
        const fileText = missingFiles.length === 1 ? 'File' : 'Files';
        const verbText = missingFiles.length === 1 ? 'does' : 'do';
        throw new BadRequestException(
          `${fileText} ${missingFiles.join(', ')} ${verbText} not exist in storage`,
        );
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error('Error checking file existence:', error);
      throw new InternalServerErrorException('Failed to check file existence');
    }
  }

  async deleteFile(key: string): Promise<void> {
    const params = {
      Bucket: this.bucket,
      Key: key,
    };

    await this.s3.deleteObject(params).promise();
  }

  async getUsersWithProfilePictures(users: UserDocument | UserDocument[]) {
    const userArray = Array.isArray(users) ? users : [users];

    const enriched = await Promise.all(
      userArray.map(async (user) => {
        const picture = user.profilePicture
          ? ((await this.getSignedUrl(user.profilePicture)) as string)
          : '';
        return { ...user.toJSON(), picture };
      }),
    );

    return Array.isArray(users) ? enriched : enriched[0];
  }
}
