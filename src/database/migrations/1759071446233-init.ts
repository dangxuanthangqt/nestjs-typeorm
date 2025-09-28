import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1759071446233 implements MigrationInterface {
  name = 'Init1759071446233';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "refresh_token_entity" (
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "created_by" character varying NOT NULL,
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_by" character varying,
                "token" character varying NOT NULL,
                "user_id" uuid NOT NULL,
                "expires_at" TIMESTAMP NOT NULL,
                CONSTRAINT "PK_19145ef8b94a816631fd4206a8a" PRIMARY KEY ("token")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "post_entity" (
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "created_by" character varying NOT NULL,
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_by" character varying,
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "title" character varying(200) NOT NULL,
                "content" character varying NOT NULL,
                "author_id" uuid NOT NULL,
                CONSTRAINT "PK_58a149c4e88bf49036bc4c8c79f" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "user_entity" (
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "created_by" character varying NOT NULL,
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_by" character varying,
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying(100) NOT NULL,
                "email" character varying(100) NOT NULL,
                "password" character varying(100) NOT NULL,
                CONSTRAINT "UQ_415c35b9b3b6fe45a3b065030f5" UNIQUE ("email"),
                CONSTRAINT "PK_b54f8ea623b17094db7667d8206" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "refresh_token_entity"
            ADD CONSTRAINT "fk_refresh_token_user" FOREIGN KEY ("user_id") REFERENCES "user_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "post_entity"
            ADD CONSTRAINT "fk_post_user" FOREIGN KEY ("author_id") REFERENCES "user_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "post_entity" DROP CONSTRAINT "fk_post_user"
        `);
    await queryRunner.query(`
            ALTER TABLE "refresh_token_entity" DROP CONSTRAINT "fk_refresh_token_user"
        `);
    await queryRunner.query(`
            DROP TABLE "user_entity"
        `);
    await queryRunner.query(`
            DROP TABLE "post_entity"
        `);
    await queryRunner.query(`
            DROP TABLE "refresh_token_entity"
        `);
  }
}
