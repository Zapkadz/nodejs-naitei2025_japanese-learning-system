# 🔧 Fix Lỗi 400: "Selected option does not belong to this question"

## ❌ Lỗi
```json
{
  "message": "Selected option does not belong to this question",
  "error": "Bad Request",
  "statusCode": 400
}
```

## ✅ Nguyên nhân

Lỗi này xảy ra khi bạn gửi `selected_option_id` không thuộc về `question_id` tương ứng.

**Ví dụ:**
- Question ID 1 có các options: [1, 2, 3, 4]
- Question ID 2 có các options: [5, 6, 7, 8]
- ❌ **SAI:** `question_id: 1, selected_option_id: 5` (option 5 thuộc về question 2)
- ✅ **ĐÚNG:** `question_id: 1, selected_option_id: 3` (option 3 thuộc về question 1)

## 🚀 Cách Fix

### Cách 1: Sử dụng Postman Collection (Khuyến nghị)

1. **Chạy request "2.0. Get Test Detail"** trước:
   - Request này sẽ lấy tất cả questions và options của test
   - Tự động lưu `sample_question_id` và `sample_option_id` vào environment

2. **Sử dụng variables trong requests:**
   - Các request Create/Update Answer đã được cập nhật để dùng `{{sample_question_id}}` và `{{sample_option_id}}`
   - Các giá trị này sẽ tự động được set sau khi chạy "2.0. Get Test Detail"

3. **Nếu muốn chọn question/option khác:**
   - Xem response của "2.0. Get Test Detail"
   - Tìm question_id và option_id hợp lệ từ response
   - Update body của request Create/Update Answer

### Cách 2: Lấy Question và Option ID từ API

#### Bước 1: Lấy Test Detail
```http
GET {{base_url}}/tests/{{test_id}}
```

#### Bước 2: Tìm Question và Option trong Response
Response sẽ có structure:
```json
{
  "test": {
    "sections": [
      {
        "parts": [
          {
            "questions": [
              {
                "id": 1,  // ← question_id
                "options": [
                  { "id": 1, "text": "Option A" },
                  { "id": 2, "text": "Option B" },
                  { "id": 3, "text": "Option C" },
                  { "id": 4, "text": "Option D" }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
}
```

#### Bước 3: Sử dụng Question và Option ID đúng
```json
{
  "question_id": 1,        // ← ID của question
  "selected_option_id": 3, // ← ID của option thuộc question 1
  "is_marked": false
}
```

### Cách 3: Kiểm tra trong Database

Nếu bạn có quyền truy cập database:

```sql
-- Lấy tất cả options của một question
SELECT o.id, o.text, o.question_id 
FROM options o 
WHERE o.question_id = 1;

-- Kiểm tra option có thuộc question không
SELECT o.id, o.question_id 
FROM options o 
WHERE o.id = 5 AND o.question_id = 1;
-- Nếu không có kết quả → option 5 không thuộc question 1
```

## 📋 Checklist

Trước khi gửi request Create/Update Answer:

- [ ] Đã chạy **"2.0. Get Test Detail"** để lấy questions và options
- [ ] Đã kiểm tra `question_id` tồn tại trong test
- [ ] Đã kiểm tra `selected_option_id` thuộc về `question_id` tương ứng
- [ ] Đã sử dụng `{{sample_question_id}}` và `{{sample_option_id}}` (nếu dùng Postman collection)

## 💡 Tips

1. **Luôn lấy Test Detail trước:** Chạy "2.0. Get Test Detail" để xem structure của test
2. **Sử dụng Environment Variables:** Postman collection đã tự động set `sample_question_id` và `sample_option_id`
3. **Kiểm tra Response:** Nếu lỗi, xem response để biết question_id và option_id nào hợp lệ
4. **Một Question có nhiều Options:** Mỗi question thường có 4 options (A, B, C, D)

## 🎯 Quick Fix

Nếu bạn đang test và gặp lỗi này:

1. **Stop và chạy lại flow:**
   - 2.0. Get Test Detail → Lấy questions/options
   - 4.2. Create/Update Answer → Sử dụng question_id và option_id từ step trước

2. **Hoặc update body thủ công:**
   - Mở response của "2.0. Get Test Detail"
   - Copy một question_id và option_id hợp lệ
   - Paste vào body của request Create/Update Answer

## 📚 Related APIs

- **GET /tests/:id** - Lấy test detail với questions và options
- **GET /progress/section-attempt/:id** - Lấy section attempt detail
- **GET /progress/section-attempt/:id/answers** - Lấy danh sách answers đã tạo

