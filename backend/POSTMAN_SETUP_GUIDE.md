# Hướng dẫn Import và Sử dụng Postman Collection

## 📦 Files cần import

1. **JLPT_Progress_API.postman_collection.json** - Collection chứa tất cả các API endpoints
2. **JLPT_Progress_API.postman_environment.json** - Environment variables template

## 🚀 Cách Import vào Postman

### Bước 1: Import Collection
1. Mở Postman
2. Click **Import** (góc trên bên trái)
3. Chọn tab **File** hoặc **Upload Files**
4. Chọn file `JLPT_Progress_API.postman_collection.json`
5. Click **Import**

### Bước 2: Import Environment
1. Click vào **Environments** ở sidebar bên trái
2. Click **Import**
3. Chọn file `JLPT_Progress_API.postman_environment.json`
4. Click **Import**
5. Chọn environment **"JLPT Progress API - Environment"** ở dropdown góc trên bên phải

### Bước 3: Cấu hình Environment Variables
1. Click vào icon **👁️** (eye icon) bên cạnh environment dropdown
2. Kiểm tra các variables:
   - `base_url`: `http://localhost:3000/api` (mặc định)
   - `test_id`: `1` (mặc định)
   - Các variables khác sẽ được tự động set khi chạy requests

## 📋 Quy trình Test theo Flow

### Flow 1: Authentication
1. **1.1. Register User** - Đăng ký user mới (nếu chưa có)
2. **1.2. Login** - Đăng nhập để lấy token
   - ✅ Token sẽ tự động lưu vào `auth_token`
   - ✅ User ID sẽ tự động lưu vào `user_id`

### Flow 2: Bắt đầu Test
3. **2.1. Start Test Attempt** - Bắt đầu làm bài test
   - ✅ `test_attempt_id` sẽ tự động lưu
   - ✅ `section_attempt_id_1`, `section_attempt_id_2` sẽ tự động lưu

### Flow 3: Làm bài và quản lý Section
4. **3.1. Get Section Attempt Detail** - Xem thông tin section
5. **3.2. Update Section Attempt - Start** - Bắt đầu làm section (IN_PROGRESS)
6. **4.2. Create/Update Answer** - Tạo answers cho các câu hỏi
7. **4.1. List Answers** - Kiểm tra danh sách answers đã tạo
8. **3.6. Submit Section Attempt** - Submit section (tự động tính score)
   - Hoặc **3.4. Update Section Attempt - Complete** - Hoàn thành section

### Flow 4: Kiểm tra kết quả
9. **2.2. Get All Test Attempts** - Xem tất cả test attempts
10. **2.3. Get Test Attempt Detail** - Xem chi tiết test attempt

## 🎯 Các API chính

### 1. LIST ANSWERS theo section_attempt_id
- **Endpoint**: `GET /progress/section-attempt/:id/answers`
- **Request**: Chỉ cần section_attempt_id trong URL
- **Response**: Danh sách answers của section attempt

### 2. UPDATE SECTION ATTEMPT
- **Endpoint**: `PATCH /progress/section-attempt/:id`
- **Request Body**:
  ```json
  {
    "status"?: "NOT_STARTED" | "IN_PROGRESS" | "PAUSED" | "COMPLETED",
    "score"?: number,        // min: 0, chỉ set được khi status KHÔNG phải "COMPLETED"
    "time_remaining"?: number // min: 0
  }
  ```
- **Lưu ý quan trọng**:
  - ✅ Tất cả các trường đều **optional**
  - ❌ `correct_count` **KHÔNG được** update thủ công
  - ⚠️ Khi `status = "COMPLETED"`, hệ thống **TỰ ĐỘNG** tính `correct_count` và `score`

## 🔧 Tính năng tự động

Collection này có các **Test Scripts** tự động:

1. **Login Script**: Tự động lưu token vào `auth_token`
2. **Start Test Attempt Script**: Tự động lưu:
   - `test_attempt_id`
   - `section_attempt_id_1`
   - `section_attempt_id_2`

## 📝 Cách sử dụng

### Option 1: Chạy từng request
1. Chọn request trong collection
2. Click **Send**
3. Xem response

### Option 2: Chạy Collection Runner
1. Click vào collection **"JLPT Progress API - Complete Flow"**
2. Click **Run** (góc trên bên phải)
3. Chọn các requests muốn chạy
4. Click **Run JLPT Progress API - Complete Flow**
5. Xem kết quả trong tab **Run Results**

### Option 3: Sử dụng Collection Variables
- Tất cả các IDs sẽ tự động được lưu sau mỗi request
- Không cần copy/paste IDs thủ công

## ⚙️ Tùy chỉnh

### Thay đổi Base URL
1. Chọn environment **"JLPT Progress API - Environment"**
2. Sửa giá trị `base_url`:
   - Development: `http://localhost:3000/api`
   - Production: `https://your-api-domain.com/api`

### Thay đổi Test ID
1. Sửa giá trị `test_id` trong environment
2. Hoặc thay trực tiếp trong URL của request

## 🐛 Troubleshooting

### Lỗi 401 Unauthorized

**Nguyên nhân:** Request thiếu token hoặc token không hợp lệ

**Cách fix:**

1. **Kiểm tra đã Login chưa:**
   - ✅ Phải chạy **1.2. Login** TRƯỚC khi chạy các API khác
   - ✅ Xem tab **Test Results** của request Login để kiểm tra token có được lưu không

2. **Kiểm tra Environment Variable:**
   - Click vào icon **👁️** (eye icon) bên cạnh environment dropdown
   - Kiểm tra `auth_token` có giá trị không
   - Nếu `auth_token` rỗng → Chạy lại **1.2. Login**

3. **Kiểm tra Environment đã chọn:**
   - Đảm bảo đã chọn **"JLPT Progress API - Environment"** ở dropdown góc trên bên phải
   - Nếu chưa chọn → Token sẽ không được lưu

4. **Kiểm tra Console Logs:**
   - Mở **Console** trong Postman (View → Show Postman Console)
   - Chạy lại **1.2. Login**
   - Xem có log "✅ Token saved successfully" không
   - Nếu có lỗi → Xem log để biết nguyên nhân

5. **Kiểm tra Authorization Header:**
   - Mở request bị lỗi
   - Vào tab **Authorization**
   - Kiểm tra Type = **Bearer Token**
   - Kiểm tra Token = `{{auth_token}}`
   - Nếu không đúng → Sửa lại

6. **Test thủ công:**
   - Copy token từ environment variable
   - Vào tab **Headers** của request
   - Thêm header: `Authorization: Bearer <paste_token_here>`
   - Nếu vẫn lỗi → Token có thể đã hết hạn, cần login lại

### Lỗi 404 Not Found
- Kiểm tra `section_attempt_id_1` hoặc `test_attempt_id` có giá trị không
- Đảm bảo đã chạy **2.1. Start Test Attempt** trước

### Variables không tự động set
- Kiểm tra Test Scripts có chạy không (xem tab **Test Results**)
- Đảm bảo response code là 200/201

## 📚 Thêm thông tin

Xem thêm:
- `API_FORMAT_SUMMARY.md` - Tóm tắt format request/response
- `test-progress-api.http` - File test cho VS Code REST Client

