import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { WeekdayDim } from './weekday-dim.entity';

@Entity({ name: 'login_heatmap' })
export class LoginHeatmap {
  @PrimaryColumn({ name: 'weekday_id', type: 'int' })
  weekdayId: number;

  @OneToOne(() => WeekdayDim)
  @JoinColumn({ name: 'weekday_id' })
  weekday: WeekdayDim;

  // 12 cột tương ứng với 12 khung giờ 2h: 0-2, 2-4, ..., 22-24
  @Column({ name: 'h00_02', type: 'int', default: 0 })
  h00_02: number;

  @Column({ name: 'h02_04', type: 'int', default: 0 })
  h02_04: number;

  @Column({ name: 'h04_06', type: 'int', default: 0 })
  h04_06: number;

  @Column({ name: 'h06_08', type: 'int', default: 0 })
  h06_08: number;

  @Column({ name: 'h08_10', type: 'int', default: 0 })
  h08_10: number;

  @Column({ name: 'h10_12', type: 'int', default: 0 })
  h10_12: number;

  @Column({ name: 'h12_14', type: 'int', default: 0 })
  h12_14: number;

  @Column({ name: 'h14_16', type: 'int', default: 0 })
  h14_16: number;

  @Column({ name: 'h16_18', type: 'int', default: 0 })
  h16_18: number;

  @Column({ name: 'h18_20', type: 'int', default: 0 })
  h18_20: number;

  @Column({ name: 'h20_22', type: 'int', default: 0 })
  h20_22: number;

  @Column({ name: 'h22_24', type: 'int', default: 0 })
  h22_24: number;
}

