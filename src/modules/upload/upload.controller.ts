import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
  UploadedFiles,
} from '@nestjs/common';
import { AnyFilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { UploadService } from './upload.service';
import { ReturnType } from 'src/common/classes/ReturnType';

@ApiTags('UPLOAD')
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('file')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Upload a file to S3',
    description:
      'Uploads a file to AWS S3 bucket and returns the file URL and metadata',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'File to upload',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'The file to upload',
        },
      },
      required: ['file'],
    },
  })
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ReturnType> {
    return await this.uploadService.uploadFile(file);
  }

  @Delete('file/:key')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a file from S3',
    description: 'Deletes a file from AWS S3 bucket using the file key',
  })
  @ApiParam({
    name: 'key',
    description: 'The S3 key/filename of the file to delete',
    example: 'uuid-filename.jpg',
    type: 'string',
  })
  @ApiResponse({
    status: 204,
    description: 'File deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'File not found' })
  @ApiResponse({
    status: 500,
    description: 'Internal server error - Delete failed',
  })
  async deleteFile(@Param('key') key: string): Promise<void> {
    return await this.uploadService.deleteFile(key);
  }

  @Get('signed-url/:key')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get signed URL for a file',
    description:
      'Generates a temporary signed URL for accessing a file in S3 bucket (valid for 5 minutes)',
  })
  @ApiParam({
    name: 'key',
    description: 'The S3 key/filename to generate signed URL for',
    example: 'uuid-filename.jpg',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Signed URL generated successfully',
    schema: {
      type: 'string',
      example:
        'https://bucket.s3.amazonaws.com/uuid-filename.jpg?AWSAccessKeyId=...&Expires=...&Signature=...',
    },
  })
  @ApiResponse({ status: 404, description: 'File not found' })
  @ApiResponse({
    status: 500,
    description: 'Internal server error - Failed to generate signed URL',
  })
  async getSignedUrl(@Param('key') key: string): Promise<string> {
    return (await this.uploadService.getSignedUrl(key)) as string;
  }
}
