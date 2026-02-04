import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../admin.guard';
import { AdminSubjectsService } from './admin-subjects.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';

@Controller('admin/subjects')
@UseGuards(AdminGuard)
export class AdminSubjectsController {
  constructor(private readonly subjectsService: AdminSubjectsService) {}

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
}
