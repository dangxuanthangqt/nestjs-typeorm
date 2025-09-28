import { BadRequestException } from '@nestjs/common';
import { ErrorDetailDto } from '../dto/error-detail.dto';

export class ValidateException extends BadRequestException {
  constructor(
    error: ErrorDetailDto[] | ErrorDetailDto | string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    errorMessage?: string,
  ) {
    if (Array.isArray(error)) {
      super(error);
    } else super([error]);
  }
}
