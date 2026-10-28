import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('sports')
export class Sport {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 80, unique: true })
  name!: string;

  @Column({ name: 'icon_url', type: 'varchar', length: 255, nullable: true })
  iconUrl!: string | null;
}
