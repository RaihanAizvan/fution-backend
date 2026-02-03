import { Body, Controller, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../admin.guard';
import { AdminSubjectsService } from './admin-subjects.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';

@Controller('admin/subjects')
@UseGuards(AdminGuard)
export class AdminSubjectsController {
  constructor(private readonly subjectsService: AdminSubjectsService) {}

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
}
