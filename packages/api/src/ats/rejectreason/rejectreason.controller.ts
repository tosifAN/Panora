import {
  Controller,
  Post,
  Body,
  Query,
  Get,
  Patch,
  Param,
  Headers,
  UseGuards,
} from '@nestjs/common';
import { LoggerService } from '@@core/logger/logger.service';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiHeader,
} from '@nestjs/swagger';
import { ApiCustomResponse } from '@@core/utils/types';
import { RejectReasonService } from './services/rejectreason.service';
import {
  UnifiedRejectReasonInput,
  UnifiedRejectReasonOutput,
} from './types/model.unified';
import { ConnectionUtils } from '@@core/connections/@utils';
import { ApiKeyAuthGuard } from '@@core/auth/guards/api-key.guard';
import { FetchObjectsQueryDto } from '@@core/utils/dtos/fetch-objects-query.dto';

@ApiTags('ats/rejectreason')
@Controller('ats/rejectreason')
export class RejectReasonController {
  constructor(
    private readonly rejectreasonService: RejectReasonService,
    private logger: LoggerService,
    private connectionUtils: ConnectionUtils,
  ) {
    this.logger.setContext(RejectReasonController.name);
  }

  @ApiOperation({
    operationId: 'list',
    summary: 'List a batch of RejectReasons',
  })
  @ApiHeader({
    name: 'x-connection-token',
    required: true,
    description: 'The connection token',
    example: 'b008e199-eda9-4629-bd41-a01b6195864a',
  })
  @ApiCustomResponse(UnifiedRejectReasonOutput)
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
      return this.rejectreasonService.getRejectReasons(
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
    summary: 'Retrieve a RejectReason',
    description: 'Retrieve a rejectreason from any connected Ats software',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    description: 'id of the rejectreason you want to retrieve.',
  })
  @ApiQuery({
    name: 'remote_data',
    required: false,
    type: Boolean,
    description: 'Set to true to include data from the original Ats software.',
  })
  @ApiCustomResponse(UnifiedRejectReasonOutput)
  @UseGuards(ApiKeyAuthGuard)
  @Get(':id')
  retrieve(
    @Param('id') id: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    return this.rejectreasonService.getRejectReason(id, remote_data);
  }
}
