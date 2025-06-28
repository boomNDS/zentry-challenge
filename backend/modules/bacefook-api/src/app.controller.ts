import { Controller, Get, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';
import { formatDate } from './common/utils/date.util';

@ApiTags('health')
@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({
    summary: 'Health check',
    description: 'Returns a simple health check message',
  })
  @ApiResponse({
    status: 200,
    description: 'Application is healthy',
    schema: {
      example: {
        message: 'Bacefook API is running!',
        timestamp: '2024-01-01T00:00:00.000Z',
        version: '1.0.0',
      },
    },
  })
  getHello(): object {
    this.logger.log('Health check endpoint accessed');
    return {
      message: 'Bacefook API is running!',
      timestamp: formatDate(new Date()),
      version: '1.0.0',
    };
  }

  @Get('health')
  @ApiOperation({
    summary: 'Detailed health check',
    description: 'Returns detailed health information about the application',
  })
  @ApiResponse({
    status: 200,
    description: 'Application health status',
    schema: {
      example: {
        status: 'ok',
        timestamp: '2024-01-01T00:00:00.000Z',
        uptime: 123.456,
        environment: 'development',
        version: '1.0.0',
      },
    },
  })
  getHealth(): object {
    this.logger.log('Detailed health check endpoint accessed');
    return {
      status: 'ok',
      timestamp: formatDate(new Date()),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
    };
  }
}
