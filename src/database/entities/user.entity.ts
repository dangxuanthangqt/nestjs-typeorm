import {
  Column,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from '../base-entity.entity';
import { RefreshTokenEntity } from './refresh-token.entity';
import { PostEntity } from './post.entity';

@Entity('user')
export class UserEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 100, unique: true, nullable: false })
  email: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  password: string;

  @OneToMany(() => RefreshTokenEntity, (refreshToken) => refreshToken.user)
  refreshTokens: RefreshTokenEntity[];

  @OneToMany(() => PostEntity, (post) => post.author)
  posts: PostEntity[];

  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamp',
    default: null,
  })
  deletedAt: Date | null;
}
