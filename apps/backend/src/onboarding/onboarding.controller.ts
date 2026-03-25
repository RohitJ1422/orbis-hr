import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { OnboardingService } from './onboarding.service';
import { CreateHireDto } from './dto/create-hire.dto';
import { UpdateHireDto } from './dto/update-hire.dto';
import { Hire } from './entities/hire.entity';

@Controller('onboarding')
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createHireDto: CreateHireDto): Promise<Hire> {
    return this.onboardingService.create(createHireDto);
  }

  @Get()
  findAll(): Promise<Hire[]> {
    return this.onboardingService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Hire> {
    return this.onboardingService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateHireDto: UpdateHireDto,
  ): Promise<Hire> {
    return this.onboardingService.update(id, updateHireDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Promise<void> {
    return this.onboardingService.remove(id);
  }
}
