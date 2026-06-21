import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  DocumentSummaryInput,
  MedicalDocumentInput,
  MedicalDocumentsService,
} from './medical-documents.service';

@Controller('api/medical-documents')
export class MedicalDocumentsController {
  constructor(private readonly service: MedicalDocumentsService) {}

  @Get()
  findAll(@Query('patientId') patientId?: string) {
    return this.service.findAll(patientId);
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() body: MedicalDocumentInput) {
    return this.service.create(body);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: Partial<MedicalDocumentInput>,
  ) {
    return this.service.update(id, body);
  }

  @Put(':id/summary')
  upsertSummary(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: DocumentSummaryInput,
  ) {
    return this.service.upsertSummary(id, body);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.service.remove(id);
  }
}
