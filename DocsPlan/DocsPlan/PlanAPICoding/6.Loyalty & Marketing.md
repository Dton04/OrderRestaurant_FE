# PHÂN ĐOẠN 6: HỆ THỐNG ƯU ĐÃI & KHÁCH HÀNG THÂN THIẾT (LOYALTY & MARKETING)

## TỔNG QUAN
Phân đoạn này tập trung vào việc gia tăng lòng trung thành của khách hàng thông qua các chương trình khuyến mãi, voucher giảm giá và hệ thống tích điểm thưởng.

---

### ENDPOINT 31: Quản lý Voucher (CRUD Voucher)
- **Tên endpoint:** Admin Manage Voucher
- **HTTP Method:** POST / PUT / DELETE
- **Path params / Query params:** `id` (nếu PUT/DELETE)
- **Nghiệp vụ:** Admin tạo mới, cập nhật hoặc xóa các mã giảm giá cho nhà hàng.
- **Validate:** 
    - `code`: Không được trùng, không chứa khoảng trắng.
    - `start_date` phải trước `end_date`.
- **Status code:** 201 Created / 200 OK
- **Message:** "Cấu hình voucher thành công."
- **Flow handle:** 
    1. Kiểm tra quyền ADMIN.
    2. Lưu thông tin vào bảng `vouchers`.
- **Database update logic:** Insert/Update/Soft Delete bảng `vouchers`.
- **Request body:**
    ```json
    {
      "code": "KM_HE_2026",
      "discount_type": "PERCENT",
      "value": 15,
      "min_order_value": 300000,
      "start_date": "2026-06-01T00:00:00Z",
      "end_date": "2026-08-31T23:59:59Z"
    }
    ```
- **Response body:** Voucher object.
- **Tiêu Chuẩn chấp nhận:** Voucher được lưu đúng định dạng, không thể tạo mã đã tồn tại.
- **Error case:** 400 Bad Request (Mã trùng hoặc ngày không hợp lệ).
- **Tables cần truy vấn:** `vouchers`
- **Yêu cầu JWT Token:** Có (ADMIN)

---

### ENDPOINT 32: Kiểm tra và Áp dụng Voucher (Validate & Apply Voucher)
- **Tên endpoint:** Apply Voucher to Order
- **HTTP Method:** POST
- **Path params / Query params:** None
- **Nghiệp vụ:** Khách hàng hoặc Nhân viên nhập mã để kiểm tra điều kiện và áp mã giảm giá vào đơn hàng hiện tại.
- **Validate:** 
    - Mã phải còn hạn sử dụng.
    - Giá trị đơn hàng hiện tại phải >= `min_order_value`.
- **Status code:** 200 OK
- **Message:** "Áp dụng mã giảm giá thành công."
- **Flow handle:** 
    1. Tìm voucher theo `code` và kiểm tra `deleted_at`, `end_date`.
    2. Kiểm tra `total_amount` của đơn hàng so với `min_order_value`.
    3. Tính toán `discount_amount` dựa trên loại giảm giá (FIXED/PERCENT).
    4. Cập nhật `voucher_id` và các cột tiền vào đơn hàng.
- **Database update logic:** Update bảng `orders` (cột `voucher_id`, `discount_amount`, `final_amount`).
- **Request body:**
    ```json
    {
      "order_id": 105,
      "voucher_code": "HOTDEAL"
    }
    ```
- **Response body:**
    ```json
    {
      "order_id": 105,
      "original_amount": 500000,
      "discount_amount": 50000,
      "final_amount": 450000
    }
    ```
- **Tiêu Chuẩn chấp nhận:** Tổng tiền đơn hàng được trừ đúng số tiền theo logic của mã.
- **Error case:** 400 Bad Request (Mã hết hạn, không đủ điều kiện đơn hàng).
- **Tables cần truy vấn:** `vouchers`, `orders`
- **Yêu cầu JWT Token:** Có (Mọi Role)

---

### ENDPOINT 33: Xem danh sách Voucher khả dụng (Available Vouchers)
- **Tên endpoint:** Get Available Vouchers
- **HTTP Method:** GET
- **Path params / Query params:** None
- **Nghiệp vụ:** Hiển thị danh sách các mã giảm giá đang trong thời gian hiệu lực cho khách hàng chọn.
- **Validate:** None.
- **Status code:** 200 OK
- **Message:** "Tải danh sách voucher thành công."
- **Flow handle:** Truy vấn bảng `vouchers` với điều kiện `start_date <= now <= end_date` và `deleted_at` is null.
- **Database update logic:** Không.
- **Request body:** None.
- **Response body:** List of Voucher objects.
- **Tiêu Chuẩn chấp nhận:** Chỉ hiển thị các mã khách hàng có thể sử dụng ngay.
- **Error case:** None.
- **Tables cần truy vấn:** `vouchers`
- **Yêu cầu JWT Token:** Không (Công khai hoặc CUSTOMER)

---

### ENDPOINT 34: Tra cứu lịch sử tích điểm (Loyalty Points History)
- **Tên endpoint:** Get Loyalty History
- **HTTP Method:** GET
- **Path params / Query params:** `page`, `size`
- **Nghiệp vụ:** Khách hàng xem lịch sử các lần được cộng điểm hoặc dùng điểm để đổi ưu đãi.
- **Validate:** Token của chính khách hàng đó.
- **Status code:** 200 OK
- **Message:** "Tải lịch sử điểm thưởng thành công."
- **Flow handle:** Truy vấn bảng `loyalty_points` lọc theo `user_id`.
- **Database update logic:** Không.
- **Request body:** None.
- **Response body:** Danh sách lịch sử thay đổi điểm.
- **Tiêu Chuẩn chấp nhận:** Hiển thị đúng số điểm biến động và lý do (Ví dụ: "Thanh toán đơn #100").
- **Error case:** 401 Unauthorized.
- **Tables cần truy vấn:** `loyalty_points`
- **Yêu cầu JWT Token:** Có (CUSTOMER)

---

### ENDPOINT 35: Đổi điểm lấy Voucher (Redeem Points for Voucher)
- **Tên endpoint:** Redeem Points
- **HTTP Method:** POST
- **Path params / Query params:** None
- **Nghiệp vụ:** Khách hàng dùng số điểm tích lũy của mình để sở hữu một mã giảm giá đặc biệt.
- **Validate:** Số điểm hiện tại của user phải >= số điểm yêu cầu để đổi.
- **Status code:** 200 OK
- **Message:** "Đổi điểm thành công. Voucher đã được gửi vào kho của bạn."
- **Flow handle:** 
    1. Kiểm tra số dư điểm trong bảng `users`.
    2. Trừ điểm của user.
    3. Ghi log vào `loyalty_points` với `points_changed` là số âm.
    4. (Tùy chọn) Lưu liên kết Voucher vào kho quà của User.
- **Database update logic:** Update bảng `users`, Insert bảng `loyalty_points`.
- **Request body:**
    ```json
    {
      "voucher_config_id": 1
    }
    ```
- **Response body:** Success status và số điểm còn lại.
- **Tiêu Chuẩn chấp nhận:** Điểm của user bị trừ đúng và có bản ghi lịch sử tương ứng.
- **Error case:** 400 Bad Request (Không đủ điểm).
- **Tables cần truy vấn:** `users`, `vouchers`, `loyalty_points`
- **Yêu cầu JWT Token:** Có (CUSTOMER)