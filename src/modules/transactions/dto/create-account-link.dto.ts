import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUrl } from 'class-validator';

export class CreateAccountLinkDto {
  @ApiProperty({
    example: 'https://example.com/reauth',
    description: 'URL to redirect to if the user fails or cancels',
  })
  @IsString()
  @IsUrl()
  refreshUrl: string;

  @ApiProperty({
    example: 'https://example.com/success',
    description: 'URL to redirect to after successful onboarding',
  })
  @IsString()
  @IsUrl()
  returnUrl: string;
}
