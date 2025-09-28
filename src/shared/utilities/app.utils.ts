import { ValidationError } from '@nestjs/common';
import { ErrorDetailDto } from '../dto/error-detail.dto';

// https://github.com/typestack/class-validator?tab=readme-ov-file#validating-nested-objects

/**
* ValidationError[] được bắn ra từ class-validator khi có lỗi xác thực xảy ra.
* Cấu trúc của ValidationError như sau:
* Ở đây minh họa một mảng ValidationError giả định:
* [
    {
        target: /* post object * /,
        property: "title",
        value: "Hello",
        constraints: {
            length: "$property must be longer than or equal to 10 characters"
        }
    },
    {
        target: /* post object * /,
        property: "text",
        value: "this is a great post about hell world",
        constraints: {
            contains: "text must contain a hello string"
        }
    },
    // and other errors
]
/** Chuyển đổi mảng ValidationError thành mảng ErrorDetailDto */

export const transformValidateObject = (
  errors: ValidationError[],
): ErrorDetailDto[] => {
  const details: ErrorDetailDto[] = extractErrorDetails(errors);
  return details;
};

function extractErrorDetails(errors: ValidationError[]): ErrorDetailDto[] {
  const errorDetails: ErrorDetailDto[] = [];

  function recursiveExtract(
    error: ValidationError,
    property: string | null = null,
  ) {
    if (error.constraints) {
      for (const constraint in error.constraints) {
        errorDetails.push({
          property: property ? `${property}.${error.property}` : error.property,
          errorCode: constraint,
          errorMessage: error.constraints[constraint],
        });
      }
    }

    if (error.children) {
      for (const childError of error.children) {
        recursiveExtract(
          childError,
          property ? `${property}.${error.property}` : error.property,
        );
      }
    }
  }

  for (const error of errors) {
    recursiveExtract(error);
  }

  return errorDetails;
}
