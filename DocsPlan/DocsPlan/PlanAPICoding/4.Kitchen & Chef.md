# PHÂN ĐOẠN 4: QUẢN LÝ CHẾ BIẾN TẠI BẾP (KITCHEN & CHEF WORKFLOW)

## TỔNG QUAN
Giai đoạn này tập trung vào hiệu suất làm việc của bộ phận bếp, kết nối trực tiếp các món ăn từ đơn đặt hàng của khách đến quy trình chế biến thực tế.

---

### ENDPOINT 21: Lấy danh sách hàng đợi chế biến (Kitchen Queue)
- **Tên endpoint:** Get Kitchen Queue
- **HTTP Method:** GET
- **Path params / Query params:** None
- **Nghiệp vụ:** Hiển thị tất cả các món ăn đang chờ nấu hoặc đang nấu, sắp xếp theo thời gian đặt (FIFO).
- **Validate:** Token của Chef hoặc Admin.
- **Status code:** 200 OK
- **Message:** "Tải hàng đợi chế biến thành công."
- **Flow handle:** 
    1. Truy vấn `order_items` có trạng thái `PENDING` hoặc `COOKING`.
    2. Join với `dishes` để lấy tên món và `orders` để lấy thông tin bàn/số thứ tự.
    3. Sắp xếp `created_at` tăng dần.
- **Database update logic:** Không.
- **Request body:** None
- **Response body:**
    ```json
    [
      {
        "item_id": 50,
        "dish_name": "Phở Bò",
        "quantity": 2,
        "table_number": "T1.01",
        "notes": "Không hành",
        "status": "PENDING",
        "created_at": "2026-03-16T13:40:00Z"
      }
    ]
    ```
- **Tiêu Chuẩn chấp nhận:** Danh sách hiển thị đúng các món chưa hoàn thành, thông tin ghi chú hiển thị rõ ràng.
- **Error case:** 403 Forbidden.
- **Tables cần truy vấn:** `order_items`, `dishes`, `orders`, `tables`
- **Yêu cầu JWT Token:** Có (CHEF, ADMIN)

---

### ENDPOINT 22: Xác nhận bắt đầu chế biến (Start Cooking)
- **Tên endpoint:** Kitchen Start Cooking
- **HTTP Method:** PATCH
- **Path params / Query params:** `item_id` (Path param)
- **Nghiệp vụ:** Đầu bếp xác nhận bắt đầu nấu một món cụ thể.
- **Validate:** `item_id` phải ở trạng thái `PENDING`.
- **Status code:** 200 OK
- **Message:** "Món ăn đã bắt đầu được chế biến."
- **Flow handle:** 
    1. Cập nhật trạng thái `order_items` sang `COOKING`.
    2. Nếu đây là món đầu tiên của đơn hàng, cập nhật trạng thái `orders` sang `PROCESSING`.
- **Database update logic:** Update `order_items`. Update `orders` (nếu cần).
- **Request body:** None
- **Response body:** Status success.
- **Tiêu Chuẩn chấp nhận:** Trạng thái món ăn trong DB chuyển thành `COOKING`.
- **Error case:** 400 Bad Request (Món ăn đã nấu xong hoặc bị hủy).
- **Tables cần truy vấn:** `order_items`, `orders`
- **Yêu cầu JWT Token:** Có (CHEF, ADMIN)

---

### ENDPOINT 23: Xác nhận hoàn thành món ăn (Ready to Serve)
- **Tên endpoint:** Kitchen Finish Item
- **HTTP Method:** PATCH
- **Path params / Query params:** `item_id` (Path param)
- **Nghiệp vụ:** Đầu bếp xác nhận món đã nấu xong, sẵn sàng để nhân viên phục vụ bê lên bàn.
- **Validate:** `item_id` phải ở trạng thái `COOKING`.
- **Status code:** 200 OK
- **Message:** "Món ăn đã hoàn thành, sẵn sàng phục vụ."
- **Flow handle:** 
    1. Cập nhật trạng thái `order_items` sang `DONE`.
    2. Gửi thông báo (Notification/Socket) đến nhân viên phục vụ (Staff) quản lý bàn đó.
    3. Kiểm tra nếu tất cả items trong đơn đã `DONE`, cập nhật `orders.status` sang `READY`.
- **Database update logic:** Update `order_items`. Update `orders` (nếu cần).
- **Request body:** None
- **Response body:** Status success.
- **Tiêu Chuẩn chấp nhận:** Trạng thái trong DB cập nhật, Staff nhận được tín hiệu phục vụ.
- **Error case:** 400 Bad Request.
- **Tables cần truy vấn:** `order_items`, `orders`
- **Yêu cầu JWT Token:** Có (CHEF, ADMIN)

---

### ENDPOINT 24: Thống kê hiệu suất bếp trong ngày
- **Tên endpoint:** Chef Daily Summary
- **HTTP Method:** GET
- **Path params / Query params:** None
- **Nghiệp vụ:** Đầu bếp xem nhanh tổng số lượng từng loại món đã nấu xong trong ngày hôm nay.
- **Validate:** Token của Chef.
- **Status code:** 200 OK
- **Message:** "Tải báo cáo chế biến thành công."
- **Flow handle:** 
    1. Query `order_items` có trạng thái `DONE` và `updated_at` là ngày hiện tại.
    2. Group by `dish_id` và Count số lượng.
- **Database update logic:** Không.
- **Request body:** None
- **Response body:**
    ```json
    [
      { "dish_name": "Phở Bò", "total_cooked": 45 },
      { "dish_name": "Gỏi Cuốn", "total_cooked": 30 }
    ]
    ```
- **Tiêu Chuẩn chấp nhận:** Dữ liệu khớp với lịch sử chế biến thực tế trong ngày.
- **Error case:** 403 Forbidden.
- **Tables cần truy vấn:** `order_items`, `dishes`
- **Yêu cầu JWT Token:** Có (CHEF, ADMIN)

---

### ENDPOINT 25: Xem lịch sử ghi chú bếp
- **Tên endpoint:** Get Item Preparation Notes
- **HTTP Method:** GET
- **Path params / Query params:** `item_id` (Path param)
- **Nghiệp vụ:** Chef truy cập lại thông tin chi tiết và ghi chú chế biến của một item cụ thể nếu cần kiểm tra lại.
- **Validate:** ID hợp lệ.
- **Status code:** 200 OK
- **Message:** "Lấy ghi chú thành công."
- **Flow handle:** Truy vấn chi tiết từ `order_items` kèm thông tin đơn hàng gốc.
- **Database update logic:** Không.
- **Request body:** None.
- **Response body:** Item detail with notes.
- **Tiêu Chuẩn chấp nhận:** Hiển thị đúng các ghi chú đặc biệt từ khách.
- **Error case:** 404 Not Found.
- **Tables cần truy vấn:** `order_items`
- **Yêu cầu JWT Token:** Có (CHEF, ADMIN, STAFF)