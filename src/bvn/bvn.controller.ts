import {
  Controller,
  Get,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { BvnService } from './bvn.service';
import {
  ApiBearerAuth,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/middlewares/jwt-auth.guard';

@ApiTags('bvn')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@UsePipes(new ValidationPipe())
@Controller('bvn')
export class BvnController {
  constructor(private readonly bvnService: BvnService) {}
  @ApiUnauthorizedResponse()
  @Get('verify')
  async verifyBvn(@Query('bvn') bvn: string): Promise<any> {
    const result = await this.bvnService.verifyBvn(bvn);
    return result;
  }
}
