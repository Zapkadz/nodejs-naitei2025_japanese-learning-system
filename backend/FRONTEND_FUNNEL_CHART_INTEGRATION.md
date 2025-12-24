# Hướng dẫn Tích hợp Funnel Chart Analytics cho Frontend

## Tổng quan

API Funnel Chart trả về dữ liệu phân tích "rơi rụng" (funnel) của người dùng khi làm bài test: **STARTED → COMPLETED → PASSED**. Dữ liệu được nhóm theo từng đề test để hiển thị biểu đồ phễu (funnel chart).

**Mục đích:**
- Xem người dùng rơi rụng ở đâu trong quá trình làm bài
- So sánh hiệu suất giữa các đề test
- Phân tích tỷ lệ hoàn thành và tỷ lệ đỗ

---

## 1. API Endpoint

### GET `/api/admin/analytics/funnel/tests`

**Authentication**: Required (JWT Bearer Token - Admin only)

**Query Parameters:**
- `from` (optional): Ngày bắt đầu (YYYY-MM-DD). Default: 30 ngày trước
- `to` (optional): Ngày kết thúc (YYYY-MM-DD). Default: Hôm nay
- `level` (optional): Level của test (N1, N2, N3, N4, N5). Filter theo level
- `limit` (optional): Số lượng test tối đa trả về. Default: 20

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Response Status**: 
- `200 OK` - Thành công
- `400 Bad Request` - Invalid limit parameter hoặc không phải admin
- `401 Unauthorized` - Chưa đăng nhập hoặc token không hợp lệ
- `403 Forbidden` - Không phải admin

---

## 2. Response Format

### Success Response (200 OK)

```json
{
  "from": "2024-11-24",
  "to": "2024-12-24",
  "items": [
    {
      "testId": 1,
      "title": "Đề tháng 7 2025",
      "started": 100,
      "completed": 80,
      "passed": 60,
      "attemptCount": 80,
      "passRate": 75.0,
      "completionRate": 80.0
    },
    {
      "testId": 2,
      "title": "Đề tháng 8 2025",
      "started": 50,
      "completed": 40,
      "passed": 30,
      "attemptCount": 40,
      "passRate": 75.0,
      "completionRate": 80.0
    }
  ]
}
```

### Response Structure

- **from**: Ngày bắt đầu của khoảng thời gian (YYYY-MM-DD)
- **to**: Ngày kết thúc của khoảng thời gian (YYYY-MM-DD)
- **items**: Array các test với metrics:
  - `testId`: ID của test
  - `title`: Tiêu đề test (hiển thị bên trái trong funnel)
  - `started`: Số lượt bắt đầu làm bài (tổng số attempts)
  - `completed`: Số lượt hoàn thành bài test (`is_completed = true`)
  - `passed`: Số lượt đỗ bài test (`is_passed = true`)
  - `attemptCount`: = `completed` (số lượt làm bài, hiển thị bên phải)
  - `passRate`: Tỷ lệ đỗ (%) = `passed / completed * 100` (làm tròn 2 chữ số)
  - `completionRate`: Tỷ lệ hoàn thành (%) = `completed / started * 100` (làm tròn 2 chữ số)

### Error Response (400/401/403)

```json
{
  "statusCode": 400,
  "message": "Only admin can access this resource"
}
```

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

---

## 3. Ví dụ Code

### 3.1. Fetch API (Vanilla JavaScript)

```javascript
async function fetchTestFunnel(token, params = {}) {
  try {
    // Build query string
    const queryParams = new URLSearchParams();
    if (params.from) queryParams.append('from', params.from);
    if (params.to) queryParams.append('to', params.to);
    if (params.level) queryParams.append('level', params.level);
    if (params.limit) queryParams.append('limit', params.limit);

    const queryString = queryParams.toString();
    const url = `http://localhost:3000/api/admin/analytics/funnel/tests${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized - Please login again');
      }
      if (response.status === 403) {
        throw new Error('Forbidden - Admin access required');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching funnel data:', error);
    throw error;
  }
}

// Usage
const token = localStorage.getItem('token');
const funnelData = await fetchTestFunnel(token, {
  from: '2024-11-01',
  to: '2024-12-24',
  level: 'N3',
  limit: 20
});
console.log(funnelData);
```

### 3.2. React Hook (useState + useEffect)

```typescript
import { useState, useEffect } from 'react';

interface FunnelItem {
  testId: number;
  title: string;
  started: number;
  completed: number;
  passed: number;
  attemptCount: number;
  passRate: number;
  completionRate: number;
}

interface FunnelData {
  from: string;
  to: string;
  items: FunnelItem[];
}

interface UseTestFunnelParams {
  from?: string;
  to?: string;
  level?: string;
  limit?: number;
}

function useTestFunnel(token: string | null, params?: UseTestFunnelParams) {
  const [data, setData] = useState<FunnelData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError('No token provided');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const queryParams = new URLSearchParams();
        if (params?.from) queryParams.append('from', params.from);
        if (params?.to) queryParams.append('to', params.to);
        if (params?.level) queryParams.append('level', params.level);
        if (params?.limit) queryParams.append('limit', params.limit.toString());

        const queryString = queryParams.toString();
        const url = `http://localhost:3000/api/admin/analytics/funnel/tests${queryString ? `?${queryString}` : ''}`;

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Unauthorized - Please login again');
          }
          if (response.status === 403) {
            throw new Error('Forbidden - Admin access required');
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result: FunnelData = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, params?.from, params?.to, params?.level, params?.limit]);

  return { data, loading, error };
}

// Usage in component
function FunnelChartComponent() {
  const token = localStorage.getItem('token');
  const { data, loading, error } = useTestFunnel(token, {
    from: '2024-11-01',
    to: '2024-12-24',
    level: 'N3',
    limit: 20
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return null;

  return <FunnelChart data={data} />;
}
```

### 3.3. React với Axios

```typescript
import axios from 'axios';
import { useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:3000/api';

interface FunnelData {
  from: string;
  to: string;
  items: Array<{
    testId: number;
    title: string;
    started: number;
    completed: number;
    passed: number;
    attemptCount: number;
    passRate: number;
    completionRate: number;
  }>;
}

interface UseTestFunnelParams {
  from?: string;
  to?: string;
  level?: string;
  limit?: number;
}

function useTestFunnel(token: string | null, params?: UseTestFunnelParams) {
  const [data, setData] = useState<FunnelData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await axios.get<FunnelData>(
          `${API_BASE_URL}/admin/analytics/funnel/tests`,
          {
            params: {
              from: params?.from,
              to: params?.to,
              level: params?.level,
              limit: params?.limit,
            },
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setData(response.data);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          if (err.response?.status === 401) {
            setError('Unauthorized - Please login again');
          } else if (err.response?.status === 403) {
            setError('Forbidden - Admin access required');
          } else {
            setError(err.message);
          }
        } else {
          setError('Unknown error');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, params?.from, params?.to, params?.level, params?.limit]);

  return { data, loading, error };
}
```

### 3.4. Vue 3 Composition API

```typescript
import { ref, onMounted, watch } from 'vue';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

interface FunnelData {
  from: string;
  to: string;
  items: Array<{
    testId: number;
    title: string;
    started: number;
    completed: number;
    passed: number;
    attemptCount: number;
    passRate: number;
    completionRate: number;
  }>;
}

interface FunnelParams {
  from?: string;
  to?: string;
  level?: string;
  limit?: number;
}

export function useTestFunnel(token: string | null, params?: FunnelParams) {
  const data = ref<FunnelData | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchFunnel = async () => {
    if (!token) {
      error.value = 'No token provided';
      return;
    }

    loading.value = true;
    error.value = null;

    try {
      const response = await axios.get<FunnelData>(
        `${API_BASE_URL}/admin/analytics/funnel/tests`,
        {
          params: {
            from: params?.from,
            to: params?.to,
            level: params?.level,
            limit: params?.limit,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      data.value = response.data;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          error.value = 'Unauthorized - Please login again';
        } else if (err.response?.status === 403) {
          error.value = 'Forbidden - Admin access required';
        } else {
          error.value = err.message;
        }
      } else {
        error.value = 'Unknown error';
      }
    } finally {
      loading.value = false;
    }
  };

  onMounted(() => {
    fetchFunnel();
  });

  watch([() => params?.from, () => params?.to, () => params?.level, () => params?.limit], () => {
    fetchFunnel();
  });

  return { data, loading, error, fetchFunnel };
}
```

---

## 4. Hiển thị Funnel Chart

### 4.1. React Component - Funnel Chart

```tsx
import React from 'react';

interface FunnelData {
  from: string;
  to: string;
  items: Array<{
    testId: number;
    title: string;
    started: number;
    completed: number;
    passed: number;
    attemptCount: number;
    passRate: number;
    completionRate: number;
  }>;
}

interface FunnelChartProps {
  data: FunnelData;
}

function FunnelChart({ data }: FunnelChartProps) {
  // Tính max value để normalize width
  const maxStarted = Math.max(...data.items.map(item => item.started), 1);

  return (
    <div className="funnel-chart-container" style={{ padding: '20px' }}>
      <h2>Test Funnel Analytics</h2>
      <p className="date-range">
        {new Date(data.from).toLocaleDateString('vi-VN')} - {new Date(data.to).toLocaleDateString('vi-VN')}
      </p>

      <div className="funnel-list">
        {data.items.map((item) => {
          const startedWidth = (item.started / maxStarted) * 100;
          const completedWidth = (item.completed / maxStarted) * 100;
          const passedWidth = (item.passed / maxStarted) * 100;

          return (
            <div key={item.testId} className="funnel-item">
              <div className="funnel-header">
                <span className="test-title">{item.title}</span>
                <span className="attempt-count">{item.attemptCount} lượt làm</span>
              </div>

              <div className="funnel-bars">
                {/* Started Bar */}
                <div className="funnel-bar-container">
                  <div className="funnel-label">Started</div>
                  <div className="funnel-bar-wrapper">
                    <div
                      className="funnel-bar started"
                      style={{ width: `${startedWidth}%` }}
                    >
                      <span className="bar-value">{item.started}</span>
                    </div>
                  </div>
                </div>

                {/* Completed Bar */}
                <div className="funnel-bar-container">
                  <div className="funnel-label">Completed</div>
                  <div className="funnel-bar-wrapper">
                    <div
                      className="funnel-bar completed"
                      style={{ width: `${completedWidth}%` }}
                    >
                      <span className="bar-value">{item.completed}</span>
                    </div>
                  </div>
                  <span className="funnel-rate">{item.completionRate.toFixed(1)}%</span>
                </div>

                {/* Passed Bar */}
                <div className="funnel-bar-container">
                  <div className="funnel-label">Passed</div>
                  <div className="funnel-bar-wrapper">
                    <div
                      className="funnel-bar passed"
                      style={{ width: `${passedWidth}%` }}
                    >
                      <span className="bar-value">{item.passed}</span>
                    </div>
                  </div>
                  <span className="funnel-rate">{item.passRate.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default FunnelChart;
```

### 4.2. CSS Styling

```css
.funnel-chart-container {
  padding: 20px;
  background-color: #f9fafb;
}

.date-range {
  color: #6b7280;
  font-size: 14px;
  margin-bottom: 20px;
}

.funnel-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.funnel-item {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.funnel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid #e5e7eb;
}

.test-title {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.attempt-count {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

.funnel-bars {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.funnel-bar-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.funnel-label {
  min-width: 80px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.funnel-bar-wrapper {
  flex: 1;
  height: 32px;
  background-color: #f3f4f6;
  border-radius: 4px;
  position: relative;
  overflow: hidden;
}

.funnel-bar {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 8px;
  border-radius: 4px;
  transition: width 0.3s ease;
  min-width: 40px;
}

.funnel-bar.started {
  background: linear-gradient(90deg, #3b82f6 0%, #2563eb 100%);
  color: white;
}

.funnel-bar.completed {
  background: linear-gradient(90deg, #10b981 0%, #059669 100%);
  color: white;
}

.funnel-bar.passed {
  background: linear-gradient(90deg, #f59e0b 0%, #d97706 100%);
  color: white;
}

.bar-value {
  font-size: 12px;
  font-weight: 600;
}

.funnel-rate {
  min-width: 60px;
  text-align: right;
  font-size: 14px;
  font-weight: 600;
  color: #6b7280;
}
```

### 4.3. React Component - Compact Funnel (List View)

```tsx
function CompactFunnelChart({ data }: FunnelChartProps) {
  return (
    <div className="compact-funnel-container">
      <h2>Test Funnel Analytics</h2>
      <table className="funnel-table">
        <thead>
          <tr>
            <th>Đề Test</th>
            <th>Started</th>
            <th>Completed</th>
            <th>Passed</th>
            <th>Số lượt làm</th>
            <th>% Pass</th>
            <th>% Complete</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((item) => (
            <tr key={item.testId}>
              <td className="test-title-cell">{item.title}</td>
              <td>{item.started}</td>
              <td>{item.completed}</td>
              <td>{item.passed}</td>
              <td className="attempt-count-cell">{item.attemptCount}</td>
              <td className="rate-cell">{item.passRate.toFixed(1)}%</td>
              <td className="rate-cell">{item.completionRate.toFixed(1)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

## 5. Libraries hỗ trợ

### 5.1. Recharts (React)

```bash
npm install recharts
```

```tsx
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function RechartsFunnel({ data }: FunnelChartProps) {
  const chartData = data.items.map(item => ({
    title: item.title,
    Started: item.started,
    Completed: item.completed,
    Passed: item.passed,
  }));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={chartData}>
        <XAxis dataKey="title" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="Started" fill="#3b82f6" />
        <Bar dataKey="Completed" fill="#10b981" />
        <Bar dataKey="Passed" fill="#f59e0b" />
      </BarChart>
    </ResponsiveContainer>
  );
}
```

### 5.2. Chart.js

```bash
npm install chart.js react-chartjs-2
```

### 5.3. D3.js (Custom Funnel)

```bash
npm install d3
```

---

## 6. Best Practices

### 6.1. Error Handling

```typescript
try {
  const data = await fetchTestFunnel(token, params);
  // Render funnel chart
} catch (error) {
  if (error.message.includes('401')) {
    // Redirect to login
    router.push('/login');
  } else if (error.message.includes('403')) {
    // Show "Admin only" message
    showError('Chỉ admin mới có quyền xem funnel chart');
  } else {
    // Show generic error
    showError('Không thể tải dữ liệu funnel chart');
  }
}
```

### 6.2. Loading States

```tsx
{loading && <Spinner />}
{error && <ErrorMessage message={error} />}
{data && !loading && <FunnelChart data={data} />}
```

### 6.3. Date Range Picker

```tsx
import { DatePicker } from 'antd'; // hoặc library khác

function FunnelChartWithFilters() {
  const [dateRange, setDateRange] = useState({
    from: '2024-11-01',
    to: '2024-12-24',
  });
  const [level, setLevel] = useState<string | undefined>('N3');

  const { data, loading, error } = useTestFunnel(token, {
    from: dateRange.from,
    to: dateRange.to,
    level: level,
  });

  return (
    <div>
      <div className="filters">
        <DatePicker.RangePicker
          onChange={(dates) => {
            if (dates) {
              setDateRange({
                from: dates[0].format('YYYY-MM-DD'),
                to: dates[1].format('YYYY-MM-DD'),
              });
            }
          }}
        />
        <Select
          value={level}
          onChange={setLevel}
          options={[
            { value: undefined, label: 'All Levels' },
            { value: 'N1', label: 'N1' },
            { value: 'N2', label: 'N2' },
            { value: 'N3', label: 'N3' },
            { value: 'N4', label: 'N4' },
            { value: 'N5', label: 'N5' },
          ]}
        />
      </div>
      <FunnelChart data={data} />
    </div>
  );
}
```

### 6.4. Auto Refresh (Optional)

```typescript
// Refresh mỗi 5 phút
useEffect(() => {
  const interval = setInterval(() => {
    fetchFunnel();
  }, 5 * 60 * 1000); // 5 minutes

  return () => clearInterval(interval);
}, []);
```

### 6.5. Memoization (Performance)

```tsx
const maxStarted = useMemo(
  () => Math.max(...data.items.map(item => item.started), 1),
  [data]
);
```

---

## 7. Data Structure Summary

```
FunnelData
├── from: string              // "2024-11-24"
├── to: string                // "2024-12-24"
└── items: FunnelItem[]
    └── FunnelItem
        ├── testId: number     // 1
        ├── title: string      // "Đề tháng 7 2025" (hiển thị bên trái)
        ├── started: number    // 100 (tổng số attempts)
        ├── completed: number  // 80 (số lượt hoàn thành)
        ├── passed: number     // 60 (số lượt đỗ)
        ├── attemptCount: number // 80 (= completed, hiển thị bên phải)
        ├── passRate: number   // 75.0 (passed/completed*100)
        └── completionRate: number // 80.0 (completed/started*100)
```

---

## 8. Example: Complete React Component

```tsx
import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:3000/api';

interface FunnelData {
  from: string;
  to: string;
  items: Array<{
    testId: number;
    title: string;
    started: number;
    completed: number;
    passed: number;
    attemptCount: number;
    passRate: number;
    completionRate: number;
  }>;
}

function TestFunnelAnalytics() {
  const [data, setData] = useState<FunnelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    from: '',
    to: '',
    level: '',
    limit: 20,
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      setError('No token found');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const queryParams = new URLSearchParams();
        if (filters.from) queryParams.append('from', filters.from);
        if (filters.to) queryParams.append('to', filters.to);
        if (filters.level) queryParams.append('level', filters.level);
        if (filters.limit) queryParams.append('limit', filters.limit.toString());

        const queryString = queryParams.toString();
        const url = `${API_BASE_URL}/admin/analytics/funnel/tests${queryString ? `?${queryString}` : ''}`;

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Unauthorized');
          }
          if (response.status === 403) {
            throw new Error('Forbidden - Admin only');
          }
          throw new Error(`HTTP ${response.status}`);
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters]);

  if (loading) {
    return <div>Loading funnel data...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!data) {
    return <div>No data available</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>Test Funnel Analytics</h2>
      <p>
        {new Date(data.from).toLocaleDateString()} - {new Date(data.to).toLocaleDateString()}
      </p>
      
      {/* Filters */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <input
          type="date"
          value={filters.from}
          onChange={(e) => setFilters({ ...filters, from: e.target.value })}
          placeholder="From"
        />
        <input
          type="date"
          value={filters.to}
          onChange={(e) => setFilters({ ...filters, to: e.target.value })}
          placeholder="To"
        />
        <select
          value={filters.level}
          onChange={(e) => setFilters({ ...filters, level: e.target.value })}
        >
          <option value="">All Levels</option>
          <option value="N1">N1</option>
          <option value="N2">N2</option>
          <option value="N3">N3</option>
          <option value="N4">N4</option>
          <option value="N5">N5</option>
        </select>
      </div>

      {/* Funnel Chart */}
      <FunnelChart data={data} />
    </div>
  );
}

export default TestFunnelAnalytics;
```

---

## 9. Notes cho Frontend Developer

1. **Base URL**: Thay `http://localhost:3000/api` bằng base URL thực tế của backend
2. **Token Storage**: Token có thể lưu trong `localStorage`, `sessionStorage`, hoặc state management (Redux, Zustand, etc.)
3. **CORS**: Đảm bảo backend đã config CORS cho frontend domain
4. **Error Handling**: Luôn handle 401 (unauthorized) để redirect về login
5. **Performance**: Với nhiều items, có thể cần pagination hoặc virtualize
6. **Accessibility**: Thêm `aria-label` và keyboard navigation nếu cần
7. **Responsive**: Funnel chart có thể cần scroll horizontal trên mobile
8. **Date Format**: Query params dùng format `YYYY-MM-DD` (ISO 8601)
9. **Default Values**: Nếu không truyền `from`/`to`, API sẽ dùng 30 ngày gần nhất
10. **Sorting**: Results được sort theo `completed` DESC (số lượt làm bài giảm dần)

---

## 10. Testing

### Test với mock data:

```typescript
const mockFunnelData: FunnelData = {
  from: '2024-11-01',
  to: '2024-12-24',
  items: [
    {
      testId: 1,
      title: 'Đề tháng 7 2025',
      started: 100,
      completed: 80,
      passed: 60,
      attemptCount: 80,
      passRate: 75.0,
      completionRate: 80.0,
    },
    {
      testId: 2,
      title: 'Đề tháng 8 2025',
      started: 50,
      completed: 40,
      passed: 30,
      attemptCount: 40,
      passRate: 75.0,
      completionRate: 80.0,
    },
  ],
};
```

---

## 11. Contact & Support

Nếu có vấn đề khi tích hợp, liên hệ backend team với:
- API endpoint: `GET /api/admin/analytics/funnel/tests`
- Expected response format (xem section 2)
- Error messages gặp phải
- Query parameters đang sử dụng

