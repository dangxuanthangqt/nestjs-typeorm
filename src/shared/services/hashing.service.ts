import { Injectable } from '@nestjs/common';
import { hashSync, compareSync } from 'bcrypt';

const saltRounds = 10;

@Injectable()
export class HashingService {
  /**
   * Hashes the provided data using bcrypt with a predefined salt rounds.
   *
   * @param data - The string data to be hashed
   * @returns The hashed string representation of the input data
   */
  hashData(data: string): string {
    return hashSync(data, saltRounds);
  }

  /**
   * Compares plain text data with hashed data to verify if they match.
   *
   * @param data - The plain text data to compare
   * @param hashedData - The hashed data to compare against
   * @returns True if the plain text data matches the hashed data, false otherwise
   *
   * @example
   * ```typescript
   * const isValid = hashingService.compareData('password123', '$2b$10$...');
   * if (isValid) {
   *   console.log('Password is correct');
   * }
   * ```
   */
  compareData(data: string, hashedData: string): boolean {
    return compareSync(data, hashedData);
  }
}
