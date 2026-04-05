# PHÂN ĐOẠN 3: QUY TRÌNH ĐẶT MÓN CỐT LÕI (CORE ORDERING FLOW)

## TỔNG QUAN
Giai đoạn này là xương sống của hệ thống, xử lý luồng nghiệp vụ từ khi khách hàng chọn món đến khi đơn hàng được ghi nhận vào hệ thống. Trọng tâm là việc lưu trữ chính xác thông tin đơn hàng và bảo toàn giá món ăn tại thời điểm đặt.

---

### ENDPOINT 15: Khách hàng đặt món (Customer Place Order)
- **Tên endpoint:** Customer Place Order
- **HTTP Method:** POST
- **Path params / Query params:** None
- **Nghiệp vụ:** Khách hàng (đã đăng nhập hoặc vãng lai) gửi danh sách món ăn từ giỏ hàng để tạo đơn hàng.
- **Validate:** 
    - Danh sách món ăn không được trống.
    - Số lượng mỗi món phải > 0.
    - Bàn (nếu chọn) phải đang ở trạng thái FREE.
- **Status code:** 201 Created
- **Message:** "Đặt món thành công. Đơn hàng đang chờ xác nhận."
- **Flow handle:** 
    1. Kiểm tra tình trạng món ăn (`is_available`).
    2. Tính tổng tiền tạm tính dựa trên giá hiện tại.
    3. Tạo bản ghi `Orders` với trạng thái `PENDING`.
    4. Lưu chi tiết vào `Order_Items`, **snapshot lại giá món ăn** vào cột `price_at_order`.
    5. Cập nhật trạng thái Table sang `OCCUPIED`.
- **Database update logic:** Insert `orders`, Insert `order_items`, Update `tables`.
- **Request body:**
    ```json
    {
      "table_id": 5,
      "notes": "Không cay, ít hành",
      "items": [
        { "dish_id": 10, "quantity": 2, "notes": "Thêm phô mai" },
        { "dish_id": 12, "quantity": 1 }
      ]
    }
    ```
- **Response body:** Order object (ID, status, total_amount).
- **Tiêu Chuẩn chấp nhận:** Đơn hàng được tạo với đúng số lượng và giá snapshot. Tổng tiền đơn hàng bằng tổng (số lượng * giá snapshot).
- **Error case:** 400 Bad Request (Hết món, bàn đang có khách), 404 Dish Not Found.
- **Tables cần truy vấn:** `dishes`, `tables`, `orders`, `order_items`
- **Yêu cầu JWT Token:** Có (Mọi Role) hoặc Không (Cho phép Guest đặt tại bàn qua QR).

---

### ENDPOINT 16: Nhân viên tạo đơn tại bàn (Staff Create Dine-in Order)
- **Tên endpoint:** Staff Create Order
- **HTTP Method:** POST
- **Path params / Query params:** None
- **Nghiệp vụ:** Nhân viên phục vụ mở đơn hàng cho khách tại bàn.
- **Validate:** 
    - `table_id`: Phải tồn tại và đang FREE.
    - `staff_id`: Lấy từ Token.
- **Status code:** 201 Created
- **Message:** "Mở đơn hàng tại bàn thành công."
- **Flow handle:** 
    1. Tạo đơn hàng gắn với `table_id` và `staff_id`.
    2. Cập nhật trạng thái bàn sang `OCCUPIED`.
- **Database update logic:** Insert `orders`, Update `tables`.
- **Request body:**
    ```json
    {
      "table_id": 10,
      "notes": "Khách đoàn 6 người"
    }
    ```
- **Response body:** Order object.
- **Tiêu Chuẩn chấp nhận:** Bàn chuyển màu trên sơ đồ quản lý, đơn hàng được khởi tạo.
- **Error case:** 403 Forbidden (Nếu không phải Staff), 400 Bad Request (Bàn đã có người).
- **Tables cần truy vấn:** `tables`, `orders`
- **Yêu cầu JWT Token:** Có (STAFF, ADMIN)

---

### ENDPOINT 17: Xem chi tiết đơn hàng
- **Tên endpoint:** Get Order Detail
- **HTTP Method:** GET
- **Path params / Query params:** `id` (Path param)
- **Nghiệp vụ:** Xem danh sách món ăn, tổng tiền và trạng thái hiện tại của một đơn cụ thể.
- **Validate:** User phải có quyền xem đơn này (Chủ đơn hoặc Nhân viên).
- **Status code:** 200 OK
- **Message:** "Tải thông tin đơn hàng thành công."
- **Flow handle:** Join `orders` với `order_items` và `dishes` để lấy tên món.
- **Database update logic:** Không.
- **Request body:** None
- **Response body:**
    ```json
    {
      "id": 100,
      "status": "PROCESSING",
      "total_amount": 500000,
      "items": [
        { "dish_name": "Phở Bò", "quantity": 2, "price": 50000, "item_status": "COOKING" }
      ]
    }
    ```
- **Tiêu Chuẩn chấp nhận:** Hiển thị đúng các món đã đặt và trạng thái từng món.
- **Error case:** 404 Order Not Found, 403 Access Denied.
- **Tables cần truy vấn:** `orders`, `order_items`, `dishes`
- **Yêu cầu JWT Token:** Có (Mọi Role)

---

### ENDPOINT 18: Lịch sử đặt món của Khách hàng
- **Tên endpoint:** My Order History
- **HTTP Method:** GET
- **Path params / Query params:** `status` (Query), `page`, `size`
- **Nghiệp vụ:** Khách hàng xem lại các đơn hàng đã đặt trong quá khứ hoặc đang xử lý.
- **Validate:** Token hợp lệ của CUSTOMER.
- **Status code:** 200 OK
- **Message:** "Tải lịch sử đơn hàng thành công."
- **Flow handle:** Query bảng `orders` lọc theo `customer_id`.
- **Database update logic:** Không.
- **Request body:** None.
- **Response body:** Danh sách đơn hàng (Phân trang).
- **Tiêu Chuẩn chấp nhận:** Hiển thị đúng các đơn của chính người dùng đó.
- **Error case:** 401 Unauthorized.
- **Tables cần truy vấn:** `orders`
- **Yêu cầu JWT Token:** Có (CUSTOMER)

---

### ENDPOINT 19: Thêm món vào đơn đang hoạt động (Add Items to Order)
- **Tên endpoint:** Add More Items
- **HTTP Method:** POST
- **Path params / Query params:** `id` (Path param - Order ID)
- **Nghiệp vụ:** Khách hoặc Nhân viên gọi thêm món cho bàn đang ăn.
- **Validate:** Đơn hàng phải đang ở trạng thái `PENDING` hoặc `PROCESSING`.
- **Status code:** 200 OK
- **Message:** "Đã thêm món vào đơn hàng."
- **Flow handle:** 
    1. Kiểm tra trạng thái đơn hàng hiện tại.
    2. Insert các món mới vào `order_items` với giá snapshot hiện tại.
    3. Cập nhật lại `total_amount` của bảng `orders`.
- **Database update logic:** Insert `order_items`, Update `orders`.
- **Request body:**
    ```json
    {
      "items": [
        { "dish_id": 5, "quantity": 1 }
      ]
    }
    ```
- **Response body:** Updated Order info.
- **Tiêu Chuẩn chấp nhận:** Tổng tiền đơn hàng tăng lên chính xác.
- **Error case:** 400 Bad Request (Đơn hàng đã hoàn thành hoặc đã hủy).
- **Tables cần truy vấn:** `orders`, `order_items`, `dishes`
- **Yêu cầu JWT Token:** Có (Mọi Role)

---

### ENDPOINT 20: Hủy đơn hàng hoặc Món ăn
- **Tên endpoint:** Cancel Order/Item
- **HTTP Method:** PATCH
- **Path params / Query params:** `id` (Order ID), `item_id` (Optional)
- **Nghiệp vụ:** Hủy toàn bộ đơn hoặc một món cụ thể do khách đổi ý.
- **Validate:** Chỉ được hủy nếu món/đơn chưa ở trạng thái `COOKING` hoặc `DONE`.
- **Status code:** 200 OK
- **Message:** "Đã hủy đơn hàng/món ăn."
- **Flow handle:** 
    1. Kiểm tra trạng thái từ bộ phận Bếp.
    2. Nếu hợp lệ, cập nhật trạng thái đơn sang `CANCELLED`.
    3. Nếu đơn bị hủy toàn bộ, chuyển Table sang `FREE`.
- **Database update logic:** Update `orders` hoặc `order_items`, Update `tables`.
- **Request body:**
    ```json
    { "reason": "Khách bận việc đột xuất" }
    ```
- **Response body:** Success message.
- **Tiêu Chuẩn chấp nhận:** Trạng thái chuyển sang CANCELLED, đơn không được đưa vào hàng đợi của Chef.
- **Error case:** 400 Bad Request (Món ăn đang được nấu, không thể hủy).
- **Tables cần truy vấn:** `orders`, `order_items`, `tables`
- **Yêu cầu JWT Token:** Có (CUSTOMER, STAFF, ADMIN)