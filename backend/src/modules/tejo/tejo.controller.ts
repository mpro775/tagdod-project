import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TejoQueryDto } from './dto/tejo-query.dto';
import { TejoService } from './tejo.service';

interface JwtUser {
  sub: string;
}

interface RequestWithUser {
  user: JwtUser;
}

@ApiTags('tejo')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tejo')
export class TejoController {
  constructor(private readonly tejoService: TejoService) {}

  @Post('query')
  @ApiOperation({ summary: 'Query Tejo assistant' })
  @ApiBody({ type: TejoQueryDto })
  @ApiResponse({ status: 201, description: 'Tejo response generated successfully' })
  async query(@Req() req: RequestWithUser, @Body() dto: TejoQueryDto) {
    return this.tejoService.handleQuery(req.user.sub, dto);
  }
}

