import { DataSource } from 'typeorm';
import { WeekdayDim } from '../entities/weekday-dim.entity';
import { LoginHeatmap } from '../entities/login-heatmap.entity';

/**
 * Seed data cho WeekdayDim và LoginHeatmap
 * Chạy khi app khởi động nếu bảng trống
 */
export async function seedHeatmapData(dataSource: DataSource): Promise<void> {
  const weekdayRepo = dataSource.getRepository(WeekdayDim);
  const heatmapRepo = dataSource.getRepository(LoginHeatmap);

  // Kiểm tra xem đã có data chưa
  const existingWeekdays = await weekdayRepo.count();
  if (existingWeekdays === 0) {
    // Seed WeekdayDim: 7 thứ trong tuần
    const weekdays = [
      { id: 1, name: 'Thứ 2' },
      { id: 2, name: 'Thứ 3' },
      { id: 3, name: 'Thứ 4' },
      { id: 4, name: 'Thứ 5' },
      { id: 5, name: 'Thứ 6' },
      { id: 6, name: 'Thứ 7' },
      { id: 7, name: 'Chủ nhật' },
    ];

    await weekdayRepo.save(weekdays);
    console.log('✅ Seeded WeekdayDim: 7 weekdays');
  }

  // Kiểm tra xem đã có heatmap data chưa
  const existingHeatmap = await heatmapRepo.count();
  if (existingHeatmap === 0) {
    // Seed LoginHeatmap: 7 dòng tương ứng với 7 thứ, tất cả giá trị = 0
    const heatmapRows = [1, 2, 3, 4, 5, 6, 7].map((weekdayId) =>
      heatmapRepo.create({
        weekdayId,
        h00_02: 0,
        h02_04: 0,
        h04_06: 0,
        h06_08: 0,
        h08_10: 0,
        h10_12: 0,
        h12_14: 0,
        h14_16: 0,
        h16_18: 0,
        h18_20: 0,
        h20_22: 0,
        h22_24: 0,
      }),
    );

    await heatmapRepo.save(heatmapRows);
    console.log('✅ Seeded LoginHeatmap: 7 rows initialized');
  }
}

