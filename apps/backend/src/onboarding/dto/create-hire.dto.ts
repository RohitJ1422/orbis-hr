import { IsString, IsNotEmpty, IsOptional, Matches } from 'class-validator';

export class CreateHireDto {
  @IsString()
  @IsNotEmpty({ message: 'name is required' })
  name!: string;

  @IsString()
  @IsNotEmpty({ message: 'role is required' })
  role!: string;

  @IsString()
  @IsNotEmpty({ message: 'startDate is required' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'startDate must be ISO 8601 format YYYY-MM-DD',
  })
  startDate!: string;

  @IsString()
  @IsOptional()
  department?: string;
}
