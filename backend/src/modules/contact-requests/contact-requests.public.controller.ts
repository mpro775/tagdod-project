import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { ContactRequestsService } from './contact-requests.service';
import { CreateContactRequestDto } from './dto/contact-request.dto';

@ApiTags('طلبات-التواصل-العام')
@Controller('contact-requests')
export class ContactRequestsPublicController {
  constructor(private readonly contactRequestsService: ContactRequestsService) {}

  @Post()
  @ApiOperation({
    summary: 'إرسال طلب تواصل',
    description: 'إرسال طلب تواصل جديد من الزوار',
  })
  @ApiBody({ type: CreateContactRequestDto })
  @ApiResponse({ status: 201, description: 'تم إرسال طلب التواصل بنجاح' })
  async create(@Body() dto: CreateContactRequestDto) {
    return this.contactRequestsService.create(dto);
  }
}
