# PHÂN ĐOẠN 1: CẤU TRÚC NỀN TẢNG & QUẢN TRỊ HỆ THỐNG (FOUNDATION & SYSTEM ADMIN)

## TỔNG QUAN
Dưới đây là thiết kế chi tiết các Endpoint cho giai đoạn khởi tạo hệ thống, tập trung vào xác thực (Authentication), phân quyền (Authorization) và quản trị người dùng.

---

### ENDPOINT 1: Đăng ký tài khoản Khách hàng
- **Tên endpoint:** Register Customer
- **HTTP Method:** POST
- **Path params / Query params:** None
- **Nghiệp vụ:** Cho phép người dùng mới tạo tài khoản với vai trò CUSTOMER.
- **Validate:** 
    - `email`: Phải đúng định dạng, không được trùng trong DB.
    - `password`: Tối thiểu 6 ký tự.
    - `phone`: Phải đúng định dạng số điện thoại Việt Nam.
- **Status code:** 201 Created
- **Message:** "Đăng ký tài khoản thành công."
- **Flow handle:** 
    1. Nhận thông tin từ request.
    2. Kiểm tra email/phone đã tồn tại chưa.
    3. Mã hóa password bằng Bcrypt.
    4. Gán Role mặc định là CUSTOMER.
    5. Lưu vào DB.
- **Database update logic:** Insert vào bảng `users`.
- **Request body:**
    ```json
    {
      "full_name": "Nguyen Van A",
      "email": "customer@example.com",
      "password": "password123",
      "phone": "0901234567"
    }
    ```
- **Response body:**
    ```json
    {
      "id": 1,
      "full_name": "Nguyen Van A",
      "email": "customer@example.com",
      "role": "CUSTOMER"
    }
    ```
- **Tiêu Chuẩn chấp nhận:** Tài khoản được tạo thành công, password trong DB phải được mã hóa.
- **Error case:** 400 Bad Request (Email đã tồn tại, dữ liệu không hợp lệ).
- **Tables cần truy vấn:** `users`, `roles`
- **Yêu cầu JWT Token:** Không

---

### ENDPOINT 2: Đăng nhập hệ thống
- **Tên endpoint:** Login
- **HTTP Method:** POST
- **Path params / Query params:** None
- **Nghiệp vụ:** Kiểm tra thông tin đăng nhập và trả về JWT Token.
- **Validate:** Email và password không được để trống.
- **Status code:** 200 OK
- **Message:** "Đăng nhập thành công."
- **Flow handle:**
    1. Tìm user theo email.
    2. So sánh password hash.
    3. Kiểm tra user có bị khóa không (`deleted_at` is null).
    4. Tạo JWT Token (chứa userId và role).
- **Database update logic:** Không (Chỉ truy vấn).
- **Request body:**
    ```json
    {
      "email": "admin@example.com",
      "password": "password123"
    }
    ```
- **Response body:**
    ```json
    {
      "access_token": "eyJhbG...",
      "token_type": "Bearer",
      "user": {
        "id": 1,
        "full_name": "Admin Manager",
        "role": "ADMIN"
      }
    }
    ```
- **Tiêu Chuẩn chấp nhận:** Trả về token hợp lệ nếu thông tin đúng.
- **Error case:** 401 Unauthorized (Sai email/password), 403 Forbidden (Tài khoản bị khóa).
- **Tables cần truy vấn:** `users`, `roles`
- **Yêu cầu JWT Token:** Không

---

### ENDPOINT 3: Lấy thông tin cá nhân (Profile)
- **Tên endpoint:** Get User Profile
- **HTTP Method:** GET
- **Path params / Query params:** None
- **Nghiệp vụ:** Trả về thông tin chi tiết của người dùng đang đăng nhập.
- **Validate:** Token hợp lệ.
- **Status code:** 200 OK
- **Message:** "Lấy thông tin thành công."
- **Flow handle:** 
    1. Trích xuất userId từ JWT.
    2. Truy vấn thông tin user và role tương ứng.
- **Database update logic:** Không.
- **Request body:** None
- **Response body:**
    ```json
    {
      "id": 1,
      "full_name": "Nguyen Van A",
      "email": "customer@example.com",
      "phone": "0901234567",
      "role": "CUSTOMER",
      "points": 150
    }
    ```
- **Tiêu Chuẩn chấp nhận:** Trả về đúng dữ liệu của user sở hữu token.
- **Error case:** 401 Unauthorized.
- **Tables cần truy vấn:** `users`, `roles`
- **Yêu cầu JWT Token:** Có (Mọi Role)

---

### ENDPOINT 4: Cập nhật thông tin cá nhân
- **Tên endpoint:** Update Profile
- **HTTP Method:** PUT
- **Path params / Query params:** None
- **Nghiệp vụ:** Cho phép người dùng thay đổi tên, số điện thoại.
- **Validate:** Phone phải đúng định dạng, FullName không để trống.
- **Status code:** 200 OK
- **Message:** "Cập nhật thông tin thành công."
- **Flow handle:**
    1. Trích xuất userId từ JWT.
    2. Cập nhật các trường cho phép vào DB.
- **Database update logic:** Update bảng `users` tại `id` tương ứng.
- **Request body:**
    ```json
    {
      "full_name": "Nguyen Van A Edit",
      "phone": "0988776655"
    }
    ```
- **Response body:** Success object.
- **Tiêu Chuẩn chấp nhận:** Dữ liệu trong DB thay đổi sau khi gọi API.
- **Error case:** 401 Unauthorized, 400 Bad Request.
- **Tables cần truy vấn:** `users`
- **Yêu cầu JWT Token:** Có (Mọi Role)

---

### ENDPOINT 5: Quản lý danh sách người dùng (Admin chỉ định)
- **Tên endpoint:** Admin Get Users
- **HTTP Method:** GET
- **Path params / Query params:** `page`, `size`, `search` (Query params)
- **Nghiệp vụ:** Admin xem danh sách tất cả người dùng, hỗ trợ phân trang và tìm kiếm.
- **Validate:** Phải là Admin.
- **Status code:** 200 OK
- **Message:** "Tải danh sách người dùng thành công."
- **Flow handle:**
    1. Kiểm tra Role từ JWT (phải là ADMIN).
    2. Thực hiện query với phân trang và search theo name/email.
- **Database update logic:** Không.
- **Request body:** None
- **Response body:**
    ```json
    {
      "content": [...],
      "totalElements": 100,
      "totalPages": 10
    }
    ```
- **Tiêu Chuẩn chấp nhận:** Hiển thị đúng danh sách và số lượng bản ghi.
- **Error case:** 403 Forbidden (Nếu không phải Admin).
- **Tables cần truy vấn:** `users`, `roles`
- **Yêu cầu JWT Token:** Có (Chỉ ADMIN)

---

### ENDPOINT 6: Tạo tài khoản nhân viên (Staff/Chef)
- **Tên endpoint:** Admin Create Staff
- **HTTP Method:** POST
- **Path params / Query params:** None
- **Nghiệp vụ:** Admin tạo tài khoản cho nhân viên phục vụ hoặc đầu bếp.
- **Validate:** 
    - `role_id`: Phải là ID của STAFF hoặc CHEF.
    - `email`: Không lỗi, không trùng.
- **Status code:** 201 Created
- **Message:** "Tạo tài khoản nhân viên thành công."
- **Flow handle:** Tương tự Register nhưng được chỉ định Role bởi Admin.
- **Database update logic:** Insert bảng `users`.
- **Request body:**
    ```json
    {
      "full_name": "Staff B",
      "email": "staff_b@restaurant.com",
      "password": "default_password",
      "role_id": 2
    }
    ```
- **Response body:** User object.
- **Tiêu Chuẩn chấp nhận:** Tài khoản mới có Role chuẩn STAFF/CHEF.
- **Error case:** 403 Forbidden, 400 Bad Request.
- **Tables cần truy vấn:** `users`, `roles`
- **Yêu cầu JWT Token:** Có (Chỉ ADMIN)

---

### ENDPOINT 7: Khóa/Mở khóa tài khoản (Soft Delete)
- **Tên endpoint:** Admin Toggle User Status
- **HTTP Method:** PUT
- **Path params / Query params:** `id` (Path param)
- **Nghiệp vụ:** Thay đổi trạng thái hoạt động của người dùng (Soft Delete).
- **Validate:** User ID phải tồn tại.
- **Status code:** 200 OK
- **Message:** "Đã cập nhật trạng thái người dùng."
- **Flow handle:**
    1. Kiểm tra user ID.
    2. Nếu đang active (`deleted_at` null) -> Set `deleted_at = now()`.
    3. Nếu đang bị khóa -> Set `deleted_at = null`.
- **Database update logic:** Update cột `deleted_at` bảng `users`.
- **Request body:** None
- **Response body:** Status message.
- **Tiêu Chuẩn chấp nhận:** Cột `deleted_at` được cập nhật đúng.
- **Error case:** 404 Not Found, 403 Forbidden.
- **Tables cần truy vấn:** `users`
- **Yêu cầu JWT Token:** Có (Chỉ ADMIN)