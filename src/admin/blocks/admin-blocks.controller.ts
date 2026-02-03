import { Body, Controller, Delete, Param, Patch, Post, Put, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../admin.guard';
import { AdminBlocksService } from './admin-blocks.service';
import { CreateBlockDto } from './dto/create-block.dto';
import { UpdateBlockDto } from './dto/update-block.dto';
import { ReorderBlocksDto } from './dto/reorder-blocks.dto';

@Controller('admin/versions/:versionId/blocks')
@UseGuards(AdminGuard)
export class AdminBlocksController {
  constructor(private readonly blocksService: AdminBlocksService) {}

  @Post()
  createBlock(
    @Param('versionId') versionId: string,
    @Body() payload: CreateBlockDto,
  ) {
    return this.blocksService.createBlock(versionId, payload);
  }

  @Patch(':blockId')
  updateBlock(
    @Param('versionId') versionId: string,
    @Param('blockId') blockId: string,
    @Body() payload: UpdateBlockDto,
  ) {
    return this.blocksService.updateBlock(versionId, blockId, payload);
  }

  @Delete(':blockId')
  deleteBlock(
    @Param('versionId') versionId: string,
    @Param('blockId') blockId: string,
  ) {
    return this.blocksService.deleteBlock(versionId, blockId);
  }

  @Put('reorder')
  reorderBlocks(
    @Param('versionId') versionId: string,
    @Body() payload: ReorderBlocksDto,
  ) {
    return this.blocksService.reorderBlocks(versionId, payload);
  }
}
