## Database

### Start Postgres Server on local

```bash
# start the database server and init database
$ docker compose up db -d
```

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ pnpm install
```

## Compile and run the project

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Run tests

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

## Database

### Start Postgres Server on local

```bash
# start the database server and init database
$ docker compose up db -d
```

### Migration

```bash
# create file migration empty
$ migration_file_name=example pnpm migration:create

# create file migration follow entities
$ NODE_ENV=development migration_file_name=example pnpm migration:generate

# build
$ pnpm build

# migration to database
$ NODE_ENV=development pnpm migration:up

# revert migration
$ NODE_ENV=development pnpm migration:down
```
