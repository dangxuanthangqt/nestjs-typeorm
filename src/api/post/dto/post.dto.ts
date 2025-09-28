import { Expose } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class PostRequestDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}

export class AuthorInPostResponseDto {
  @Expose()
  name: string;

  @Expose()
  email: string;

  constructor(partial: Partial<AuthorInPostResponseDto>) {
    Object.assign(this, partial);
  }
}

export class PostResponseDto {
  @Expose()
  id: number;

  @Expose()
  title: string;

  @Expose()
  content: string;

  @Expose()
  author: AuthorInPostResponseDto;

  constructor(partial: Partial<PostResponseDto>) {
    Object.assign(this, partial);
  }
}

export class PostsResponseDto {
  @Expose()
  posts: PostResponseDto[];

  constructor(partial: Partial<PostsResponseDto>) {
    Object.assign(this, partial);
  }
}

export class UpdatePostRequestDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  content: string;
}

export class UpdatePostResponseDto extends PostResponseDto {}
