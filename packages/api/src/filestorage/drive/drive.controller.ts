import {
  Controller,
  Query,
  Get,
  Param,
  Headers,
  UseGuards,
} from '@nestjs/common';
import { LoggerService } from '@@core/logger/logger.service';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiHeader,
} from '@nestjs/swagger';
import { ApiCustomResponse } from '@@core/utils/types';
import { DriveService } from './services/drive.service';
import { UnifiedDriveOutput } from './types/model.unified';
import { ConnectionUtils } from '@@core/connections/@utils';
import { ApiKeyAuthGuard } from '@@core/auth/guards/api-key.guard';
import { FetchObjectsQueryDto } from '@@core/utils/dtos/fetch-objects-query.dto';

@ApiTags('filestorage/drive')
@Controller('filestorage/drive')
export class DriveController {
  constructor(
    private readonly driveService: DriveService,
    private logger: LoggerService,
    private connectionUtils: ConnectionUtils,
  ) {
    this.logger.setContext(DriveController.name);
  }

  @ApiOperation({
    operationId: 'list',
    summary: 'List a batch of Drives',
  })
  @ApiHeader({
    name: 'x-connection-token',
    required: true,
    description: 'The connection token',
    example: 'b008e199-eda9-4629-bd41-a01b6195864a',
  })
  @ApiCustomResponse(UnifiedDriveOutput)
  @UseGuards(ApiKeyAuthGuard)
  @Get()
  async list(
    @Headers('x-connection-token') connection_token: string,
    @Query() query: FetchObjectsQueryDto,
  ) {
    try {
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      const { remote_data, limit, cursor } = query;

      return this.driveService.getDrives(
        remoteSource,
        linkedUserId,
        limit,
        remote_data,
        cursor,
      );
    } catch (error) {
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'retrieve',
    summary: 'Retrieve a Drive',
    description: 'Retrieve a drive from any connected Filestorage software',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    description: 'id of the drive you want to retrieve.',
  })
  @ApiCustomResponse(UnifiedDriveOutput)
  @UseGuards(ApiKeyAuthGuard)
  @Get(':id')
  retrieve(
    @Param('id') id: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    return this.driveService.getDrive(id, remote_data);
  }
}
