import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SupportService } from './support.service';
import { CreateSupportTicketDto } from './dto/create-ticket.dto';
import { AddSupportMessageDto } from './dto/add-message.dto';

@ApiTags('support-customer')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('support/tickets')
export class CustomerSupportController {
  constructor(private readonly supportService: SupportService) {}

  @Post()
  async createTicket(
    @Req() req: Request,
    @Body() dto: CreateSupportTicketDto,
  ) {
    const userId = req.user!.sub;
    const ticket = await this.supportService.createTicket(userId, dto);
    return { data: ticket };
  }

  @Get()
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getMyTickets(
    @Req() req: Request,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    const userId = req.user!.sub;
    const result = await this.supportService.getUserTickets(userId, page, limit);
    return { data: result };
  }

  @Get(':id')
  @ApiParam({ name: 'id', description: 'Ticket ID' })
  async getTicket(
    @Req() req: Request,
    @Param('id') ticketId: string,
  ) {
    const userId = req.user!.sub;
    const ticket = await this.supportService.getTicket(ticketId, userId);
    return { data: ticket };
  }

  @Get(':id/messages')
  @ApiParam({ name: 'id', description: 'Ticket ID' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getTicketMessages(
    @Req() req: Request,
    @Param('id') ticketId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 50,
  ) {
    const userId = req.user!.sub;
    const result = await this.supportService.getTicketMessages(ticketId, userId, false, page, limit);
    return { data: result };
  }

  @Post(':id/messages')
  @ApiParam({ name: 'id', description: 'Ticket ID' })
  async addMessage(
    @Req() req: Request,
    @Param('id') ticketId: string,
    @Body() dto: AddSupportMessageDto,
  ) {
    const userId = req.user!.sub;
    const message = await this.supportService.addMessage(ticketId, userId, dto, false);
    return { data: message };
  }

  @Put(':id/archive')
  @ApiParam({ name: 'id', description: 'Ticket ID' })
  async archiveTicket(
    @Req() req: Request,
    @Param('id') ticketId: string,
  ) {
    const userId = req.user!.sub;
    await this.supportService.archiveTicket(ticketId, userId, false);
    return { message: 'Ticket archived successfully' };
  }
}
