import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity({ name: 'weekday_dim' })
export class WeekdayDim {
  @PrimaryColumn({ type: 'int' })
  id: number; // 1=Thứ 2, 2=Thứ 3, ..., 7=Chủ nhật

  @Column({ type: 'varchar', length: 20 })
  name: string; // "Thứ 2", "Thứ 3", ..., "Chủ nhật"
}

