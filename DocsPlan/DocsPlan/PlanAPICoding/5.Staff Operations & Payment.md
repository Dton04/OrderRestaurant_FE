# PHÂN ĐOẠN 5: VẬN HÀNH PHỤC VỤ & THANH TOÁN (STAFF OPERATIONS & PAYMENT)

## TỔNG QUAN
Giai đoạn này tập trung vào các nghiệp vụ cuối cùng của luồng dịch vụ tại bàn, xử lý tiền tệ, xuất hóa đơn và giải phóng mặt bằng để đón khách mới.

---

### ENDPOINT 26: Cập nhật thủ công trạng thái bàn
- **Tên endpoint:** Update Table Status Manual
- **HTTP Method:** PATCH
- **Path params / Query params:** `id` (Path param)
- **Nghiệp vụ:** Nhân viên cập nhật trạng thái bàn sau khi dọn dẹp xong hoặc khi có khách đặt trước.
- **Validate:** Trạng thái gửi lên phải thuộc danh sách: `FREE`, `RESERVED`, `CLEANING`.
- **Status code:** 200 OK
- **Message:** "Cập nhật trạng thái bàn thành công."
- **Flow handle:** 
    1. Kiểm tra quyền STAFF hoặc ADMIN.
    2. Cập nhật cột `status` trong bảng `tables`.
- **Database update logic:** Update bảng `tables`.
- **Request body:**
    ```json
    { "status": "FREE" }
    ```
- **Response body:** Success object.
- **Tiêu Chuẩn chấp nhận:** Sơ đồ bàn cập nhật màu sắc tương ứng ngay lập tức.
- **Error case:** 400 Bad Request (Trạng thái không hợp lệ).
- **Tables cần truy vấn:** `tables`
- **Yêu cầu JWT Token:** Có (STAFF, ADMIN)

---

### ENDPOINT 27: Truy xuất thông tin hóa đơn tạm tính (Pre-checkout Bill)
- **Tên endpoint:** Get Checkout Bill
- **HTTP Method:** GET
- **Path params / Query params:** `order_id` (Path param)
- **Nghiệp vụ:** Nhân viên xem tổng tiền, danh sách món và các khoản giảm giá trước khi thực hiện thanh toán cho khách.
- **Validate:** Đơn hàng phải đang ở trạng thái `READY` hoặc `PROCESSING`.
- **Status code:** 200 OK
- **Message:** "Tải hóa đơn thành công."
- **Flow handle:** 
    1. Lấy thông tin đơn hàng và bảng giá snapshot từ `order_items`.
    2. Tính toán tạm thời các khoản giảm giá (nếu có Voucher).
- **Database update logic:** Không.
- **Request body:** None
- **Response body:**
    ```json
    {
      "order_id": 100,
      "table_number": "T1.01",
      "items": [...],
      "total_amount": 550000,
      "discount": 50000,
      "final_amount": 500000
    }
    ```
- **Tiêu Chuẩn chấp nhận:** Hiển thị chính xác số tiền khách phải trả.
- **Error case:** 404 Order Not Found.
- **Tables cần truy vấn:** `orders`, `order_items`, `vouchers`
- **Yêu cầu JWT Token:** Có (STAFF, ADMIN)

---

### ENDPOINT 28: Xác nhận thanh toán (Process Payment)
- **Tên endpoint:** Finalize Payment
- **HTTP Method:** POST
- **Path params / Query params:** None
- **Nghiệp vụ:** Ghi nhận thanh toán thực tế, xuất hóa đơn và hoàn tất đơn hàng.
- **Validate:** `method` phải là: `CASH`, `CARD`, `MOMO`, `VNPAY`.
- **Status code:** 200 OK
- **Message:** "Thanh toán thành công. Đã in hóa đơn."
- **Flow handle:** 
    1. Tạo bản ghi trong bảng `payments`.
    2. Cập nhật `orders.status = COMPLETED`.
    3. Cập nhật `tables.status = CLEANING`.
    4. Kích hoạt logic cộng điểm thưởng cho khách hàng (nếu có `customer_id`).
- **Database update logic:** Insert `payments`, Update `orders`, Update `tables`, Update `users.points`.
- **Request body:**
    ```json
    {
      "order_id": 100,
      "amount": 500000,
      "method": "MOMO",
      "transaction_id": "TRANS123456"
    }
    ```
- **Response body:** Payment confirmation object.
- **Tiêu Chuẩn chấp nhận:** Trạng thái bàn chuyển sang "CLEANING", điểm thưởng được cộng vào tài khoản khách.
- **Error case:** 400 Bad Request (Số tiền không khớp).
- **Tables cần truy vấn:** `payments`, `orders`, `tables`, `users`
- **Yêu cầu JWT Token:** Có (STAFF, ADMIN)

---

### ENDPOINT 29: In lại hóa đơn (Print Invoice PDF/HTML)
- **Tên endpoint:** Print Invoice
- **HTTP Method:** GET
- **Path params / Query params:** `payment_id` (Path param)
- **Nghiệp vụ:** Xuất dữ liệu hóa đơn định dạng chuẩn để in ra máy in nhiệt.
- **Validate:** Payment ID phải tồn tại.
- **Status code:** 200 OK
- **Message:** "Tải dữ liệu in thành công."
- **Flow handle:** Kết hợp thông tin từ `payments`, `orders` và `order_items` để tạo cấu trúc in.
- **Database update logic:** Không.
- **Request body:** None
- **Response body:** Data format cho template in.
- **Tiêu Chuẩn chấp nhận:** Dữ liệu đầy đủ tên nhà hàng, danh sách món, tổng tiền, thuế và lời cảm ơn.
- **Error case:** 404 Payment Not Found.
- **Tables cần truy vấn:** `payments`, `orders`, `order_items`, `dishes`
- **Yêu cầu JWT Token:** Có (STAFF, ADMIN)

---

### ENDPOINT 30: Báo cáo doanh thu ca trực (Shift Report)
- **Tên endpoint:** Staff Shift Summary
- **HTTP Method:** GET
- **Path params / Query params:** None
- **Nghiệp vụ:** Nhân viên phục vụ xem tổng kết số tiền đã thu trong ca làm việc của mình để đối soát.
- **Validate:** Phân quyền Staff/Admin.
- **Status code:** 200 OK
- **Message:** "Tải báo cáo ca trực thành công."
- **Flow handle:** 
    1. Lấy `staff_id` từ Token.
    2. Query bảng `payments` join `orders` lọc theo `staff_id` và ngày hiện tại.
    3. Group by `method` để phân loại tiền mặt/chuyển khoản.
- **Database update logic:** Không.
- **Request body:** None
- **Response body:**
    ```json
    {
      "staff_name": "Nguyen Van B",
      "total_collected": 5000000,
      "by_method": [
        { "method": "CASH", "amount": 2000000 },
        { "method": "MOMO", "amount": 3000000 }
      ]
    }
    ```
- **Tiêu Chuẩn chấp nhận:** Số liệu phản ánh đúng các giao dịch mà nhân viên đó đã xác nhận.
- **Error case:** 403 Forbidden.
- **Tables cần truy vấn:** `payments`, `orders`
- **Yêu cầu JWT Token:** Có (STAFF, ADMIN)