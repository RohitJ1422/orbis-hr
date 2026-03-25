import { IsString, IsOptional, Matches } from 'class-validator';

export class UpdateHireDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  role?: string;

  @IsString()
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'startDate must be ISO 8601 format YYYY-MM-DD',
  })
  startDate?: string;

  @IsString()
  @IsOptional()
  department?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  onboardingPlan?: string;
}
