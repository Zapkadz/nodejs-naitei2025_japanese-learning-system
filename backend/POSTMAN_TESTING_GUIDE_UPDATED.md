# Hướng Dẫn Test API Progress Module - Updated Version

## 📋 Tổng Quan

File này hướng dẫn test các API đã được cập nhật cho Progress Module với flow mới.

## 🚀 Cài Đặt

### 1. Import Collection vào Postman

1. Mở Postman
2. Click **Import** (góc trên bên trái)
3. Chọn file `JLPT_Progress_API_Updated.postman_collection.json`
4. Click **Import**

### 2. Tạo Environment (Tùy chọn nhưng khuyến nghị)

1. Click **Environments** (bên trái)
2. Click **+** để tạo environment mới
3. Đặt tên: `JLPT Progress API - Local`
4. Thêm các variables:
   - `base_url`: `http://localhost:3000/api`
   - `token`: (để trống, sẽ tự động set sau khi login)
   - `user_email`: (để trống)
   - `test_attempt_id`: (để trống)
   - `section_attempt_id`: (để trống)
   - `section_id`: (để trống)
5. Click **Save**
6. Chọn environment này để sử dụng

## 📝 Flow Test Đầy Đủ

### Bước 1: Authentication

#### 1.1. Register User
- **Request**: `1. Authentication > 1.1. Register User`
- **Mục đích**: Đăng ký user mới
- **Lưu ý**: Email sẽ tự động được lưu vào environment variable

#### 1.2. Login
- **Request**: `1. Authentication > 1.2. Login`
- **Mục đích**: Đăng nhập để lấy JWT token
- **Lưu ý**: Token sẽ tự động được lưu vào environment variable `token`

### Bước 2: Bắt Đầu Test Attempt

#### 2.1. Start Test Attempt
- **Request**: `2. Test Attempt > 2.1. Start Test Attempt`
- **Mục đích**: Bắt đầu làm bài test
- **Thay đổi**: Sửa `testId` (số 1) trong URL theo test bạn muốn làm
- **Lưu ý**: 
  - `test_attempt_id` và `section_attempt_id` sẽ tự động được lưu
  - `section_id` cũng sẽ được lưu để dùng cho bước tiếp theo

### Bước 3: Lấy Đề Bài (MỚI)

#### 3.1. Get Section
- **Request**: `3. Section (NEW) > 3.1. Get Section (Get Đề Bài)`
- **Mục đích**: Lấy đề bài của section (parts, questions, options, passages)
- **Khi nào dùng**: Khi user bấm "Start Section" để hiển thị đề bài
- **Response**: Trả về toàn bộ cấu trúc đề bài

### Bước 4: Bắt Đầu Làm Section

#### 4.1. Update Section Attempt to IN_PROGRESS
- **Request**: `4. Section Attempt > 4.2. Update Section Attempt to IN_PROGRESS`
- **Mục đích**: Chuyển status từ `NOT_STARTED` hoặc `PAUSED` sang `IN_PROGRESS`
- **Khi nào dùng**: 
  - Sau khi lấy đề bài (Bước 3)
  - Khi resume từ trạng thái PAUSED
- **Lưu ý**: Không cần body, chỉ cần gọi PATCH

### Bước 5: Làm Bài và Lưu Tiến Độ

#### 4.3. Submit Section Attempt - PAUSED
- **Request**: `4. Section Attempt > 4.3. Submit Section Attempt - PAUSED`
- **Mục đích**: Lưu tiến độ và tạm dừng
- **Body**: 
  ```json
  {
    "status": "PAUSED",
    "time_remaining": 3000,
    "answers": [
      {
        "question_id": 1,
        "selected_option_id": 3,
        "is_marked": false
      },
      {
        "question_id": 2,
        "selected_option_id": null,
        "is_marked": true
      }
    ]
  }
  ```
- **Lưu ý**: 
  - `answers[]` là danh sách tất cả câu trả lời cần lưu
  - Có thể gửi nhiều lần để cập nhật tiến độ

### Bước 6: Kiểm Tra Tiến Độ

#### 4.1. Get Section Attempt
- **Request**: `4. Section Attempt > 4.1. Get Section Attempt`
- **Mục đích**: Lấy thông tin section attempt và user_answers
- **Response khi PAUSED**:
  ```json
  {
    "sectionAttempt": {
      "id": 1,
      "status": "PAUSED",
      "user_answers": [
        {
          "id": 1,
          "question_id": 1,
          "selected_option_id": 3,
          "option_correct_id": null,  // Chưa có vì chưa COMPLETED
          "is_marked": false
        }
      ]
    }
  }
  ```
- **Response khi COMPLETED**:
  ```json
  {
    "sectionAttempt": {
      "id": 1,
      "status": "COMPLETED",
      "score": 85,
      "correct_count": 17,
      "user_answers": [
        {
          "id": 1,
          "question_id": 1,
          "selected_option_id": 3,
          "option_correct_id": 3,  // Có correct answer
          "is_marked": false
        }
      ]
    }
  }
  ```

### Bước 7: Nộp Bài

#### 4.4. Submit Section Attempt - COMPLETED
- **Request**: `4. Section Attempt > 4.4. Submit Section Attempt - COMPLETED`
- **Mục đích**: Nộp bài và hoàn thành
- **Body**: 
  ```json
  {
    "status": "COMPLETED",
    "time_remaining": 0,
    "answers": [
      {
        "question_id": 1,
        "selected_option_id": 3,
        "is_marked": false
      },
      {
        "question_id": 2,
        "selected_option_id": 5,
        "is_marked": false
      }
    ]
  }
  ```
- **Lưu ý**: 
  - Sau khi submit, `correct_count` và `score` sẽ tự động được tính
  - Nếu tất cả section attempts đã COMPLETED, test attempt cũng sẽ tự động COMPLETED

## 🔄 Flow Test Nhanh

1. **Login** → Lấy token
2. **Start Test Attempt** → Lấy section_attempt_id
3. **Get Section** → Lấy đề bài
4. **Update to IN_PROGRESS** → Bắt đầu làm bài
5. **Submit PAUSED** → Lưu tiến độ (có thể lặp lại)
6. **Get Section Attempt** → Kiểm tra user_answers
7. **Submit COMPLETED** → Nộp bài
8. **Get Section Attempt** → Kiểm tra score và option_correct_id

## 📌 Lưu Ý Quan Trọng

### 1. GET /progress/section-attempt/:id
- ✅ Chỉ trả về `user_answers` khi status là `PAUSED` hoặc `COMPLETED`
- ✅ Nếu `COMPLETED`, sẽ có thêm `option_correct_id` cho mỗi answer
- ❌ Nếu status là `NOT_STARTED` hoặc `IN_PROGRESS`, không có `user_answers`

### 2. POST /progress/section-attempt/:id
- ✅ `status` phải là `"PAUSED"` hoặc `"COMPLETED"` (bắt buộc)
- ✅ `answers[]` là danh sách tất cả câu trả lời cần lưu
- ✅ Nếu `COMPLETED`, sẽ tự động tính `correct_count` và `score`
- ❌ Không thể dùng status khác

### 3. PATCH /progress/section-attempt/:id
- ✅ Chỉ dùng để chuyển status sang `IN_PROGRESS`
- ✅ Chỉ có thể chuyển từ `NOT_STARTED` hoặc `PAUSED`
- ❌ Không thể chuyển từ `COMPLETED` hoặc `IN_PROGRESS`

### 4. option_correct_id
- ✅ Chỉ có trong response khi status = `COMPLETED`
- ✅ Là ID của option đúng cho câu hỏi đó
- ✅ Dùng để hiển thị đáp án đúng cho user
- ❌ Không có khi status = `PAUSED` hoặc `IN_PROGRESS`

## 🐛 Xử Lý Lỗi

### 401 Unauthorized
- **Nguyên nhân**: Token không hợp lệ hoặc đã hết hạn
- **Giải pháp**: Login lại để lấy token mới

### 403 Forbidden
- **Nguyên nhân**: Không có quyền truy cập section attempt của user khác
- **Giải pháp**: Đảm bảo đang dùng đúng token của user sở hữu section attempt

### 404 Not Found
- **Nguyên nhân**: Section/Section Attempt không tồn tại
- **Giải pháp**: Kiểm tra lại ID trong URL

### 400 Bad Request
- **Nguyên nhân**: Validation error (status không đúng, thiếu field bắt buộc, etc.)
- **Giải pháp**: Kiểm tra lại body request theo format đúng

## 💡 Tips

1. **Sử dụng Environment Variables**: Tự động lưu token và IDs để không phải copy/paste nhiều lần
2. **Test Scripts**: Collection đã có sẵn test scripts để tự động lưu variables
3. **Pre-request Scripts**: Có thể thêm để tự động set headers hoặc variables
4. **Save Responses**: Lưu responses để so sánh và debug

## 📚 Tài Liệu Tham Khảo

- File HTTP requests: `test-progress-api-updated.http`
- Postman Collection: `JLPT_Progress_API_Updated.postman_collection.json`
- Environment file: `JLPT_Progress_API.postman_environment.json` (nếu có)

