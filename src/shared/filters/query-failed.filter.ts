/* eslint-disable @typescript-eslint/no-unused-expressions */
import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { type Response } from 'express';
import { STATUS_CODES } from 'http';
import { QueryFailedError } from 'typeorm';

@Catch(QueryFailedError)
export class QueryFailedFilter implements ExceptionFilter<QueryFailedError> {
  private readonly logger = new Logger(QueryFailedFilter.name);
  constructor(public reflector: Reflector) {}

  catch(
    exception: QueryFailedError & { constraint?: string },
    host: ArgumentsHost,
  ) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status = exception.constraint?.startsWith('UQ')
      ? HttpStatus.CONFLICT
      : HttpStatus.INTERNAL_SERVER_ERROR;
    status === HttpStatus.CONFLICT
      ? this.logger.warn(exception)
      : this.logger.error(exception);

    response.status(status).json({
      statusCode: status,
      error: STATUS_CODES[status],
      message: status === HttpStatus.CONFLICT ? exception.message : undefined,
    });
  }
}
