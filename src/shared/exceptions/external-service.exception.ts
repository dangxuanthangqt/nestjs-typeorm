/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { HttpException, HttpStatus } from '@nestjs/common';

export class ExternalServiceException extends HttpException {
  constructor(error: any) {
    super(
      {
        error,
      },
      error?.response?.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
