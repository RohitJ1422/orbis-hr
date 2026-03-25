import { OnboardingService } from './onboarding.service';
import { CreateHireDto } from './dto/create-hire.dto';
import { UpdateHireDto } from './dto/update-hire.dto';
import { Hire } from './entities/hire.entity';
export declare class OnboardingController {
    private readonly onboardingService;
    constructor(onboardingService: OnboardingService);
    create(createHireDto: CreateHireDto): Promise<Hire>;
    findAll(): Promise<Hire[]>;
    findOne(id: string): Promise<Hire>;
    update(id: string, updateHireDto: UpdateHireDto): Promise<Hire>;
    remove(id: string): Promise<void>;
}
