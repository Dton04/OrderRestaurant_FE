# PHÂN ĐOẠN 2: QUẢN LÝ THỰC ĐƠN & KHÔNG GIAN (MENU & INFRASTRUCTURE MANAGEMENT)

## TỔNG QUAN
Giai đoạn này tập trung vào việc thiết lập dữ liệu nền tảng cho nhà hàng bao gồm thực đơn (Menu) và sơ đồ mặt bằng (Tables/Areas).

---

### ENDPOINT 8: Quản lý Danh mục (CRUD Category)
- **Tên endpoint:** Admin Manage Category
- **HTTP Method:** POST / PUT / DELETE
- **Path params / Query params:** `id` (nếu PUT/DELETE)
- **Nghiệp vụ:** Admin tạo mới, cập nhật thông tin hoặc xóa mềm danh mục món ăn (Khai vị, Món chính, Đồ uống...).
- **Validate:** Tên danh mục không được để trống và không trùng lặp.
- **Status code:** 201 Created / 200 OK
- **Message:** "Cập nhật danh mục thành công."
- **Flow handle:** 
    1. Kiểm tra quyền ADMIN.
    2. Nếu DELETE: Cập nhật `deleted_at`.
    3. Nếu POST/PUT: Kiểm tra tính duy nhất của tên và lưu vào DB.
- **Database update logic:** Insert/Update bảng `categories`.
- **Request body:**
    ```json
    {
      "name": "Món Chính",
      "description": "Các món ăn no phục vụ tại bàn",
      "image_url": "link_image.png"
    }
    ```
- **Response body:** Category object.
- **Tiêu Chuẩn chấp nhận:** Danh mục hiển thị đúng trên Menu của khách hàng sau khi cập nhật.
- **Error case:** 400 Bad Request (Tên trùng), 403 Forbidden.
- **Tables cần truy vấn:** `categories`
- **Yêu cầu JWT Token:** Có (ADMIN)

---

### ENDPOINT 9: Quản lý Món ăn (CRUD Dish)
- **Tên endpoint:** Admin Manage Dish
- **HTTP Method:** POST / PUT / DELETE
- **Path params / Query params:** `id` (nếu PUT/DELETE)
- **Nghiệp vụ:** Admin quản lý thông tin các món ăn trong thực đơn.
- **Validate:** 
    - `price`: Phải là số dương.
    - `category_id`: Phải tồn tại trong DB.
- **Status code:** 201 Created / 200 OK
- **Message:** "Cập nhật món ăn thành công."
- **Flow handle:**
    1. Kiểm tra quyền ADMIN.
    2. Liên kết `category_id` hợp lệ.
    3. Lưu thông tin món ăn kèm hình ảnh và giá.
- **Database update logic:** Insert/Update bảng `dishes`.
- **Request body:**
    ```json
    {
      "name": "Bò sốt vang",
      "description": "Bò hầm mềm với vang đỏ",
      "price": 150000,
      "category_id": 1,
      "image_url": "dish_image.png"
    }
    ```
- **Response body:** Dish object.
- **Tiêu Chuẩn chấp nhận:** Món ăn được hiển thị đúng giá và danh mục trên app.
- **Error case:** 400 Bad Request (Thiếu dữ liệu), 404 Category Not Found.
- **Tables cần truy vấn:** `dishes`, `categories`
- **Yêu cầu JWT Token:** Có (ADMIN)

---

### ENDPOINT 10: Cập nhật tình trạng món ăn (Availability)
- **Tên endpoint:** Toggle Dish Availability
- **HTTP Method:** PATCH
- **Path params / Query params:** `id` (Path param)
- **Nghiệp vụ:** Chef hoặc Admin nhanh chóng bật/tắt trạng thái còn hàng của món ăn khi hết nguyên liệu.
- **Validate:** ID món ăn phải tồn tại.
- **Status code:** 200 OK
- **Message:** "Đã cập nhật tình trạng món ăn."
- **Flow handle:**
    1. Kiểm tra quyền CHEF hoặc ADMIN.
    2. Đảo ngược giá trị cột `is_available`.
- **Database update logic:** Update cột `is_available` trong bảng `dishes`.
- **Request body:** None
- **Response body:**
    ```json
    { "id": 1, "is_available": false }
    ```
- **Tiêu Chuẩn chấp nhận:** Món ăn bị ẩn hoặc gắn nhãn "Hết hàng" trên Menu khách hàng ngay lập tức.
- **Error case:** 403 Forbidden.
- **Tables cần truy vấn:** `dishes`
- **Yêu cầu JWT Token:** Có (ADMIN, CHEF)

---

### ENDPOINT 11: Lấy danh sách Thực đơn (Public Menu)
- **Tên endpoint:** Get Public Menu
- **HTTP Method:** GET
- **Path params / Query params:** `search` (Query), `category_id` (Query)
- **Nghiệp vụ:** Khách hàng hoặc Nhân viên xem toàn bộ danh mục và các món ăn còn hàng.
- **Validate:** None.
- **Status code:** 200 OK
- **Message:** "Tải thực đơn thành công."
- **Flow handle:**
    1. Truy vấn toàn bộ `categories` (không bị xóa).
    2. Truy vấn `dishes` theo từng category (chỉ lấy `is_available = true` và `deleted_at` is null).
- **Database update logic:** Không.
- **Request body:** None.
- **Response body:** Cấu trúc lồng nhau (Categories -> Dishes).
- **Tiêu Chuẩn chấp nhận:** Danh sách món ăn hiển thị đầy đủ, đúng nhóm.
- **Error case:** None.
- **Tables cần truy vấn:** `categories`, `dishes`
- **Yêu cầu JWT Token:** Không (Công khai)

---

### ENDPOINT 12: Thiết lập Sơ đồ Nhà hàng (Area & Table Setup)
- **Tên endpoint:** Admin Setup Infrastructure
- **HTTP Method:** POST / PUT
- **Path params / Query params:** None
- **Nghiệp vụ:** Admin định nghĩa các khu vực và số lượng bàn tương ứng.
- **Validate:** Tên bàn/vị trí không trùng lặp trong cùng một khu vực.
- **Status code:** 201 Created.
- **Message:** "Thiết lập sơ đồ nhà hàng thành công."
- **Flow handle:** Tạo Area trước, sau đó tạo các Table liên kết với Area ID đó.
- **Database update logic:** Insert bảng `areas` và `tables`.
- **Request body:**
    ```json
    {
      "area_name": "Tầng 1",
      "tables": [
        { "table_number": "T1.01", "capacity": 4 },
        { "table_number": "T1.02", "capacity": 2 }
      ]
    }
    ```
- **Response body:** Success object.
- **Tiêu Chuẩn chấp nhận:** Sơ đồ bàn hiển thị đúng trên giao diện quản lý của Staff.
- **Error case:** 400 Bad Request.
- **Tables cần truy vấn:** `areas`, `tables`
- **Yêu cầu JWT Token:** Có (ADMIN)

---

### ENDPOINT 13: Xem trạng thái bàn thời gian thực
- **Tên endpoint:** Get Table Status Map
- **HTTP Method:** GET
- **Path params / Query params:** None
- **Nghiệp vụ:** Nhân viên xem sơ đồ tất cả các bàn và trạng thái hiện tại (Trống, Đang dùng, Chờ dọn...).
- **Validate:** Token hợp lệ (Staff/Admin).
- **Status code:** 200 OK
- **Message:** "Tải sơ đồ bàn thành công."
- **Flow handle:** Truy vấn tất cả `areas` và các `tables` liên kết kèm trạng thái hiện tại (`status`).
- **Database update logic:** Không.
- **Request body:** None.
- **Response body:** List Area chứa List Tables.
- **Tiêu Chuẩn chấp nhận:** Hiển thị đúng màu sắc theo trạng thái của từng bàn.
- **Error case:** 401 Unauthorized.
- **Tables cần truy vấn:** `areas`, `tables`
- **Yêu cầu JWT Token:** Có (ADMIN, STAFF)

---

### ENDPOINT 14: Xóa mềm Bàn/Khu vực
- **Tên endpoint:** Admin Delete Infrastructure
- **HTTP Method:** DELETE
- **Path params / Query params:** `type` (area/table), `id`
- **Nghiệp vụ:** Gỡ bỏ một bàn hoặc một khu vực khỏi hệ thống.
- **Validate:** Không thể xóa nếu bàn đang có đơn hàng chưa hoàn thành (PENDING/PROCESSING).
- **Status code:** 200 OK.
- **Message:** "Đã xóa thực thể."
- **Flow handle:** Kiểm tra trạng thái bàn hiện tại trước khi set `deleted_at`.
- **Database update logic:** Update `deleted_at` bảng `areas` hoặc `tables`.
- **Request body:** None.
- **Response body:** Status object.
- **Tiêu Chuẩn chấp nhận:** Bàn/Khu vực không còn xuất hiện trong sơ đồ phục vụ.
- **Error case:** 400 Bad Request (Bàn đang có khách).
- **Tables cần truy vấn:** `tables`, `orders`
- **Yêu cầu JWT Token:** Có (ADMIN)