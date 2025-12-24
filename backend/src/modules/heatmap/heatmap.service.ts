import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoginHeatmap } from '../../entities/login-heatmap.entity';
import { WeekdayDim } from '../../entities/weekday-dim.entity';

@Injectable()
export class HeatmapService {
  private readonly logger = new Logger(HeatmapService.name);

  constructor(
    @InjectRepository(LoginHeatmap)
    private readonly loginHeatmapRepo: Repository<LoginHeatmap>,
    @InjectRepository(WeekdayDim)
    private readonly weekdayDimRepo: Repository<WeekdayDim>,
  ) {}

  /**
   * Lấy thông tin weekday và hour theo timezone Asia/Ho_Chi_Minh
   * @param date - Date object (mặc định là thời gian hiện tại)
   * @returns { weekdayId: 1-7 (1=Thứ 2, 7=Chủ nhật), hour: 0-23 }
   */
  getVietnamTimeParts(date: Date = new Date()): {
    weekdayId: number;
    hour: number;
  } {
    // Sử dụng Intl.DateTimeFormat với timezone Asia/Ho_Chi_Minh
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Ho_Chi_Minh',
      weekday: 'short', // Mon, Tue, Wed, Thu, Fri, Sat, Sun
      hour: 'numeric',
      hour12: false,
    });

    const parts = formatter.formatToParts(date);
    const weekdayShort = parts.find((p) => p.type === 'weekday')?.value || '';
    const hourStr = parts.find((p) => p.type === 'hour')?.value || '0';

    // Map weekday short name to id (1=Mon, 7=Sun)
    const weekdayMap: Record<string, number> = {
      Mon: 1, // Thứ 2
      Tue: 2, // Thứ 3
      Wed: 3, // Thứ 4
      Thu: 4, // Thứ 5
      Fri: 5, // Thứ 6
      Sat: 6, // Thứ 7
      Sun: 7, // Chủ nhật
    };

    const weekdayId = weekdayMap[weekdayShort] || 1;
    const hour = parseInt(hourStr, 10);

    return { weekdayId, hour };
  }

  /**
   * Tính tên cột dựa trên giờ (0-23)
   * @param hour - Giờ (0-23)
   * @returns Tên cột như "h08_10" (khung giờ 8-10h)
   */
  getBinColumn(hour: number): string {
    // Làm tròn xuống để lấy khung giờ bắt đầu (mỗi khung 2h)
    const binStart = Math.floor(hour / 2) * 2;
    const binEnd = binStart + 2;

    // Format 2 chữ số: 0 -> "00", 2 -> "02", ..., 22 -> "22"
    const pad2 = (num: number): string => num.toString().padStart(2, '0');

    return `h${pad2(binStart)}_${pad2(binEnd)}`;
  }

  /**
   * Tăng counter cho khung giờ tương ứng khi có request login
   * @param date - Thời gian login (mặc định là hiện tại)
   */
  async incrementLoginHeatmap(date: Date = new Date()): Promise<void> {
    try {
      const { weekdayId, hour } = this.getVietnamTimeParts(date);
      const columnName = this.getBinColumn(hour);

      const VALID_COLUMNS = [
        'h00_02',
        'h02_04',
        'h04_06',
        'h06_08',
        'h08_10',
        'h10_12',
        'h12_14',
        'h14_16',
        'h16_18',
        'h18_20',
        'h20_22',
        'h22_24',
      ] as const;

      if (!VALID_COLUMNS.includes(columnName as any)) {
        this.logger.error(`Invalid heatmap column: ${columnName}`);
        return;
      }

      // 🔒 UPDATE atomic, không raw SQL, không template literal
      // Tạo update set object dựa trên column name đã được validate
      const createUpdateSet = (col: string): Record<string, () => string> => {
        // Map từng column name thành expression cụ thể để tránh template literal
        const updateSet: Record<string, () => string> = {};
        switch (col) {
          case 'h00_02':
            updateSet.h00_02 = () => '`h00_02` + 1';
            break;
          case 'h02_04':
            updateSet.h02_04 = () => '`h02_04` + 1';
            break;
          case 'h04_06':
            updateSet.h04_06 = () => '`h04_06` + 1';
            break;
          case 'h06_08':
            updateSet.h06_08 = () => '`h06_08` + 1';
            break;
          case 'h08_10':
            updateSet.h08_10 = () => '`h08_10` + 1';
            break;
          case 'h10_12':
            updateSet.h10_12 = () => '`h10_12` + 1';
            break;
          case 'h12_14':
            updateSet.h12_14 = () => '`h12_14` + 1';
            break;
          case 'h14_16':
            updateSet.h14_16 = () => '`h14_16` + 1';
            break;
          case 'h16_18':
            updateSet.h16_18 = () => '`h16_18` + 1';
            break;
          case 'h18_20':
            updateSet.h18_20 = () => '`h18_20` + 1';
            break;
          case 'h20_22':
            updateSet.h20_22 = () => '`h20_22` + 1';
            break;
          case 'h22_24':
            updateSet.h22_24 = () => '`h22_24` + 1';
            break;
          default:
            throw new Error(`Invalid column: ${col}`);
        }
        return updateSet;
      };

      const updateSet = createUpdateSet(columnName);
      const result = await this.loginHeatmapRepo
        .createQueryBuilder()
        .update(LoginHeatmap)
        .set(updateSet)
        .where('weekday_id = :weekdayId', { weekdayId })
        .execute();

      // Nếu chưa có row thì tạo trước
      if ((result.affected ?? 0) === 0) {
        await this.loginHeatmapRepo.save(
          this.loginHeatmapRepo.create({
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

        // increment lại sau khi insert
        const updateSetRetry = createUpdateSet(columnName);
        await this.loginHeatmapRepo
          .createQueryBuilder()
          .update(LoginHeatmap)
          .set(updateSetRetry)
          .where('weekday_id = :weekdayId', { weekdayId })
          .execute();
      }
    } catch (error) {
      this.logger.error(
        `Failed to increment login heatmap: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  /**
   * Lấy toàn bộ ma trận heatmap (7 hàng × 12 cột)
   * @returns Object chứa columns labels và rows data
   */
  async getLoginHeatmap(): Promise<{
    columns: string[];
    rows: Array<{
      weekdayId: number;
      weekdayName: string;
      values: number[];
    }>;
  }> {
    // Lấy tất cả weekday dims (đảm bảo có đủ 7 thứ)
    const weekdays = await this.weekdayDimRepo.find({
      order: { id: 'ASC' },
    });

    // Lấy tất cả heatmap rows
    const heatmapRows = await this.loginHeatmapRepo.find({
      relations: ['weekday'],
      order: { weekdayId: 'ASC' },
    });

    // Tạo map weekdayId -> heatmap row để lookup nhanh
    const heatmapMap = new Map<number, LoginHeatmap>();
    heatmapRows.forEach((row) => {
      heatmapMap.set(row.weekdayId, row);
    });

    // Định nghĩa thứ tự 12 cột
    const columnNames = [
      'h00_02',
      'h02_04',
      'h04_06',
      'h06_08',
      'h08_10',
      'h10_12',
      'h12_14',
      'h14_16',
      'h16_18',
      'h18_20',
      'h20_22',
      'h22_24',
    ];

    // Labels cho frontend (00-02, 02-04, ...)
    const columns = [
      '00-02',
      '02-04',
      '04-06',
      '06-08',
      '08-10',
      '10-12',
      '12-14',
      '14-16',
      '16-18',
      '18-20',
      '20-22',
      '22-24',
    ];

    // Map mỗi weekday thành row với values
    const rows = weekdays.map((weekday) => {
      const heatmapRow = heatmapMap.get(weekday.id);
      const values: number[] = columnNames.map((colName) => {
        if (!heatmapRow) return 0;
        // Cast rõ ràng về number vì chúng ta biết các column này là number
        const value = heatmapRow[colName as keyof LoginHeatmap];
        return typeof value === 'number' ? value : 0;
      });

      return {
        weekdayId: weekday.id,
        weekdayName: weekday.name,
        values,
      };
    });

    return { columns, rows };
  }

  /**
   * Reset tất cả giá trị heatmap về 0
   */
  async resetLoginHeatmap(): Promise<void> {
    await this.loginHeatmapRepo
      .createQueryBuilder()
      .update(LoginHeatmap)
      .set({
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
      })
      .execute();
  }
}

