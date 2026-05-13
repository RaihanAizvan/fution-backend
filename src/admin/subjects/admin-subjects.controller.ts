import { Body, Controller, Delete, Get, Param, Patch, Post, Put } from '@nestjs/common';
import { AdminSubjectsService } from './admin-subjects.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { ReorderSubjectsDto } from './dto/reorder-subjects.dto';
import { BulkImportSubjectDto } from './dto/bulk-import-subject.dto';

@Controller('admin/subjects')
export class AdminSubjectsController {
  constructor(private readonly subjectsService: AdminSubjectsService) { }

  @Get()
  listSubjects() {
    return this.subjectsService.listSubjects();
  }

  @Post()
  createSubject(@Body() payload: CreateSubjectDto) {
    return this.subjectsService.createSubject(payload);
  }

  @Patch(':subjectId')
  updateSubject(
    @Param('subjectId') subjectId: string,
    @Body() payload: UpdateSubjectDto,
  ) {
    return this.subjectsService.updateSubject(subjectId, payload);
  }

  @Delete(':subjectId')
  deleteSubject(@Param('subjectId') subjectId: string) {
    return this.subjectsService.deleteSubject(subjectId);
  }

  @Put('reorder')
  reorderSubjects(@Body() payload: ReorderSubjectsDto) {
    return this.subjectsService.reorderSubjects(payload.subjects);
  }

  @Post('import')
  importSubjectTree(@Body() payload: BulkImportSubjectDto) {
    return this.subjectsService.importSubjectTree(payload);
  }
}
