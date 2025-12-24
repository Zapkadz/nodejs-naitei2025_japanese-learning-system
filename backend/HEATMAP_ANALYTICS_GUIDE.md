# Hướng dẫn Heatmap Analytics - Phân tích hành vi đăng nhập

## Tổng quan

Tính năng **Login Heatmap** theo dõi thời gian đăng nhập của người dùng để tạo biểu đồ nhiệt (heatmap) hiển thị khung giờ vàng người dùng truy cập nhiều nhất.

## Kiến trúc

### 1. Database Schema

#### Bảng `weekday_dim`
- `id` (PK): 1-7 (1=Thứ 2, 7=Chủ nhật)
- `name`: Tên thứ ("Thứ 2", "Thứ 3", ..., "Chủ nhật")

#### Bảng `login_heatmap`
- `weekday_id` (PK, FK → weekday_dim.id): 1-7
- 12 cột int (default 0) tương ứng 12 khung giờ 2h:
  - `h00_02`: 0h-2h
  - `h02_04`: 2h-4h
  - `h04_06`: 4h-6h
  - `h06_08`: 6h-8h
  - `h08_10`: 8h-10h
  - `h10_12`: 10h-12h
  - `h12_14`: 12h-14h
  - `h14_16`: 14h-16h
  - `h16_18`: 16h-18h
  - `h18_20`: 18h-20h
  - `h20_22`: 20h-22h
  - `h22_24`: 22h-24h

### 2. Flow xử lý

#### Khi có request login (POST /auth/login):
1. **Middleware** `LoginHeatmapMiddleware` chặn request **TRƯỚC** guard
2. Lấy thời gian hiện tại theo timezone **Asia/Ho_Chi_Minh**
3. Tính:
   - `weekdayId`: 1-7 (Thứ 2 → Chủ nhật)
   - `hour`: 0-23
   - `binColumn`: Khung giờ 2h tương ứng (ví dụ: 9h → `h08_10`)
4. **Atomic increment** counter trong database: `UPDATE login_heatmap SET h08_10 = h08_10 + 1 WHERE weekday_id = ?`
5. Tiếp tục flow login bình thường (kể cả login fail vẫn ghi nhận)

#### Khi gọi API heatmap:
- Trả về ma trận 7×12 với format chuẩn cho frontend render heatmap

## API Endpoints

### 1. GET `/api/admin/analytics/heatmap/login`

**Mô tả**: Lấy ma trận heatmap login (7 hàng × 12 cột)

**Authentication**: JWT (Admin only)

**Response**:
```json
{
  "columns": [
    "00-02", "02-04", "04-06", "06-08", "08-10", "10-12",
    "12-14", "14-16", "16-18", "18-20", "20-22", "22-24"
  ],
  "rows": [
    {
      "weekdayId": 1,
      "weekdayName": "Thứ 2",
      "values": [10, 5, 1, 0, 7, 15, 20, 25, 30, 35, 40, 12]
    },
    {
      "weekdayId": 2,
      "weekdayName": "Thứ 3",
      "values": [8, 4, 2, 1, 9, 18, 22, 28, 32, 38, 42, 15]
    },
    // ... Thứ 4, 5, 6, 7, Chủ nhật
    {
      "weekdayId": 7,
      "weekdayName": "Chủ nhật",
      "values": [5, 3, 0, 0, 3, 8, 12, 15, 18, 25, 30, 10]
    }
  ]
}
```

**Ví dụ sử dụng**:
```bash
curl -X GET "http://localhost:3000/api/admin/analytics/heatmap/login" \
  -H "Authorization: Bearer <admin_jwt_token>"
```

### 2. POST `/api/admin/analytics/heatmap/login/reset`

**Mô tả**: Reset tất cả giá trị heatmap về 0

**Authentication**: JWT (Admin only)

**Response**:
```json
{
  "message": "Login heatmap has been reset successfully"
}
```

## Logic tính toán

### Timezone
- Tất cả thời gian được tính theo **Asia/Ho_Chi_Minh**
- Sử dụng `Intl.DateTimeFormat` với `timeZone: 'Asia/Ho_Chi_Minh'`
- Server chạy ở đâu cũng đảm bảo đúng giờ VN

### Weekday mapping
- `Mon` → 1 (Thứ 2)
- `Tue` → 2 (Thứ 3)
- `Wed` → 3 (Thứ 4)
- `Thu` → 4 (Thứ 5)
- `Fri` → 5 (Thứ 6)
- `Sat` → 6 (Thứ 7)
- `Sun` → 7 (Chủ nhật)

### Hour binning
- Mỗi giờ (0-23) được map vào khung 2h:
  - 0h, 1h → `h00_02`
  - 2h, 3h → `h02_04`
  - 4h, 5h → `h04_06`
  - ...
  - 22h, 23h → `h22_24`

**Ví dụ**:
- 9h → `h08_10` (khung 8h-10h)
- 15h → `h14_16` (khung 14h-16h)
- 23h → `h22_24` (khung 22h-24h)

## Seed Data

Khi app khởi động, `SeedService` tự động:
1. Kiểm tra bảng `weekday_dim` có data chưa
2. Nếu trống → Insert 7 dòng (Thứ 2 → Chủ nhật)
3. Kiểm tra bảng `login_heatmap` có data chưa
4. Nếu trống → Insert 7 dòng với tất cả giá trị = 0

## Đặc điểm kỹ thuật

### Atomic Increment
- Sử dụng raw SQL query: `UPDATE ... SET col = col + 1 WHERE ...`
- Đảm bảo thread-safe, tránh race condition khi nhiều request đồng thời

### Error Handling
- Middleware **không throw error** nếu increment fail
- Chỉ log lỗi, không làm hỏng flow login
- Đảm bảo login vẫn hoạt động bình thường dù heatmap có lỗi

### Performance
- Increment là **non-blocking** (async, không await trong middleware)
- Query heatmap sử dụng index trên `weekday_id` (PK)
- Response format tối ưu cho frontend render

## Frontend Integration

### Ví dụ render heatmap với React:

```tsx
interface HeatmapData {
  columns: string[];
  rows: Array<{
    weekdayId: number;
    weekdayName: string;
    values: number[];
  }>;
}

function LoginHeatmap() {
  const [data, setData] = useState<HeatmapData | null>(null);

  useEffect(() => {
    fetch('/api/admin/analytics/heatmap/login', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setData);
  }, []);

  if (!data) return <div>Loading...</div>;

  // Tìm max value để normalize màu
  const maxValue = Math.max(
    ...data.rows.flatMap(row => row.values)
  );

  return (
    <table>
      <thead>
        <tr>
          <th></th>
          {data.columns.map(col => (
            <th key={col}>{col}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.rows.map(row => (
          <tr key={row.weekdayId}>
            <td>{row.weekdayName}</td>
            {row.values.map((value, idx) => {
              const intensity = maxValue > 0 ? value / maxValue : 0;
              return (
                <td
                  key={idx}
                  style={{
                    backgroundColor: `rgba(59, 130, 246, ${intensity})`,
                    color: intensity > 0.5 ? 'white' : 'black'
                  }}
                >
                  {value}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

## Testing

### Test increment heatmap:
```bash
# Đăng nhập nhiều lần ở các khung giờ khác nhau
curl -X POST "http://localhost:3000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'
```

### Test get heatmap:
```bash
# Lấy heatmap (cần admin token)
curl -X GET "http://localhost:3000/api/admin/analytics/heatmap/login" \
  -H "Authorization: Bearer <admin_jwt_token>"
```

### Test reset:
```bash
# Reset heatmap
curl -X POST "http://localhost:3000/api/admin/analytics/heatmap/login/reset" \
  -H "Authorization: Bearer <admin_jwt_token>"
```

## Lưu ý

1. **Timezone**: Luôn dùng timezone VN, không phụ thuộc server timezone
2. **Global data**: Heatmap là **toàn bộ users**, không phải theo từng user
3. **Login fail cũng ghi nhận**: Mọi request POST /auth/login đều được ghi nhận
4. **Atomic operation**: Increment là atomic, an toàn với concurrent requests
5. **Seed tự động**: Không cần chạy migration thủ công, seed tự động khi app start

## Mở rộng tương lai

- [ ] Filter heatmap theo date range (tuần này, tháng này, ...)
- [ ] Export CSV/Excel
- [ ] Real-time updates với WebSocket
- [ ] Heatmap cho các action khác (test attempts, section attempts, ...)
- [ ] So sánh heatmap giữa các tuần/tháng

