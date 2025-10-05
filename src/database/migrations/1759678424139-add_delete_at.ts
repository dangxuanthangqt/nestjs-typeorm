import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDeleteAt1759678424139 implements MigrationInterface {
  name = 'AddDeleteAt1759678424139';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "refresh_token"
            ADD "deleted_at" TIMESTAMP
        `);
    await queryRunner.query(`
            ALTER TABLE "post"
            ADD "deleted_at" TIMESTAMP
        `);
    await queryRunner.query(`
            ALTER TABLE "user"
            ADD "deleted_at" TIMESTAMP
        `);
    await queryRunner.query(`
            ALTER TABLE "user"
            ALTER COLUMN "created_by"
            SET NOT NULL
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "user"
            ALTER COLUMN "created_by" DROP NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "user" DROP COLUMN "deleted_at"
        `);
    await queryRunner.query(`
            ALTER TABLE "post" DROP COLUMN "deleted_at"
        `);
    await queryRunner.query(`
            ALTER TABLE "refresh_token" DROP COLUMN "deleted_at"
        `);
  }
}
