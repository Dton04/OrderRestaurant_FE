# PHÂN ĐOẠN 7: HỆ THỐNG BÁO CÁO & PHÂN TÍCH (ANALYTICS DASHBOARD)

## TỔNG QUAN
Phân đoạn cuối cùng cung cấp các công cụ phân tích dữ liệu chuyên sâu cho Admin, giúp theo dõi tình hình kinh doanh, hiệu suất nhân viên và sở thích của khách hàng để đưa ra các quyết định vận hành chính xác.

---

### ENDPOINT 36: Tổng quan chỉ số Dashboard (General Statistics)
- **Tên endpoint:** Admin Get General Stats
- **HTTP Method:** GET
- **Path params / Query params:** None
- **Nghiệp vụ:** Trả về các chỉ số chính của ngày hôm nay so với ngày hôm qua (Doanh thu, số đơn hàng, số khách mới).
- **Validate:** Phải là Admin.
- **Status code:** 200 OK
- **Message:** "Tải chỉ số tổng quan thành công."
- **Flow handle:** 
    1. Đếm tổng số `Orders` có trạng thái COMPLETED trong ngày.
    2. Tổng `amount` từ bảng `payments` trong ngày.
    3. Đếm số `users` mới đăng ký trong ngày.
- **Database update logic:** Không.
- **Request body:** None
- **Response body:**
    ```json
    {
      "today_revenue": 15000000,
      "today_orders": 45,
      "new_customers": 12,
      "revenue_growth_percent": 5.5
    }
    ```
- **Tiêu Chuẩn chấp nhận:** Dữ liệu phản ánh đúng thực tế giao dịch tức thời trong ngày.
- **Error case:** 403 Forbidden.
- **Tables cần truy vấn:** `payments`, `orders`, `users`
- **Yêu cầu JWT Token:** Có (ADMIN)

---

### ENDPOINT 37: Báo cáo Doanh thu theo thời gian (Revenue Analytics)
- **Tên endpoint:** Admin Get Revenue Report
- **HTTP Method:** GET
- **Path params / Query params:** `start_date`, `end_date`, `type` (day/month)
- **Nghiệp vụ:** Lấy dữ liệu doanh thu biến động theo thời gian để vẽ biểu đồ đường (Line chart).
- **Validate:** `start_date` không được lớn hơn `end_date`.
- **Status code:** 200 OK
- **Message:** "Tải báo cáo doanh thu thành công."
- **Flow handle:** 
    1. Query bảng `payments` lọc theo khoảng thời gian.
    2. Group by theo ngày hoặc tháng tùy tham số `type`.
- **Database update logic:** Không.
- **Request body:** None
- **Response body:**
    ```json
    [
      { "label": "2026-03-01", "value": 12000000 },
      { "label": "2026-03-02", "value": 14500000 }
    ]
    ```
- **Tiêu Chuẩn chấp nhận:** Dữ liệu khớp với tổng tiền các hóa đơn đã thanh toán thành công trong kỳ.
- **Error case:** 400 Bad Request.
- **Tables cần truy vấn:** `payments`
- **Yêu cầu JWT Token:** Có (ADMIN)

---

### ENDPOINT 38: Thống kê Món bán chạy (Top Selling Dishes)
- **Tên endpoint:** Admin Get Top Selling
- **HTTP Method:** GET
- **Path params / Query params:** `limit` (Query), `start_date`, `end_date`
- **Nghiệp vụ:** Xác định các món ăn mang lại doanh thu cao nhất hoặc được khách gọi nhiều nhất.
- **Validate:** None.
- **Status code:** 200 OK
- **Message:** "Tải danh sách món bán chạy thành công."
- **Flow handle:** 
    1. Join `order_items` với `dishes` và `orders`.
    2. Lọc đơn hàng `COMPLETED` trong khoảng thời gian.
    3. Group by `dish_id`, Sum `quantity` và `price_at_order * quantity`.
    4. Sort Descending theo doanh thu/số lượng.
- **Database update logic:** Không.
- **Request body:** None.
- **Response body:** Danh sách món kèm số lượng và tổng doanh thu tương ứng.
- **Tiêu Chuẩn chấp nhận:** Hiển thị đúng thứ hạng các món ăn phổ biến nhất.
- **Error case:** 403 Forbidden.
- **Tables cần truy vấn:** `order_items`, `dishes`, `orders`
- **Yêu cầu JWT Token:** Có (ADMIN)

---

### ENDPOINT 39: Phân tích Doanh thu theo Khu vực (Revenue by Area)
- **Tên endpoint:** Admin Get Area Analytics
- **HTTP Method:** GET
- **Path params / Query params:** None
- **Nghiệp vụ:** So sánh hiệu suất kinh doanh giữa các tầng hoặc khu vực (VIP vs Thường).
- **Validate:** None.
- **Status code:** 200 OK
- **Message:** "Tải báo cáo khu vực thành công."
- **Flow handle:** 
    1. Join `orders`, `tables`, `areas` và `payments`.
    2. Group by `area_id`.
    3. Tính tổng doanh thu trên từng khu vực.
- **Database update logic:** Không.
- **Request body:** None.
- **Response body:**
    ```json
    [
      { "area_name": "Tầng 1", "total_revenue": 50000000, "occupancy_rate": 85 },
      { "area_name": "VIP", "total_revenue": 35000000, "occupancy_rate": 60 }
    ]
    ```
- **Tiêu Chuẩn chấp nhận:** Giúp Admin nhận diện khu vực nào hoạt động hiệu quả nhất.
- **Error case:** 403 Forbidden.
- **Tables cần truy vấn:** `areas`, `tables`, `orders`, `payments`
- **Yêu cầu JWT Token:** Có (ADMIN)

---

### ENDPOINT 40: Thống kê hiệu suất nhân viên (Staff Performance)
- **Tên endpoint:** Admin Get Staff Performance
- **HTTP Method:** GET
- **Path params / Query params:** `month`, `year`
- **Nghiệp vụ:** Đánh giá nhân viên dựa trên số lượng đơn hàng phục vụ và tổng doanh thu mang về.
- **Validate:** Month/Year phải hợp lệ.
- **Status code:** 200 OK
- **Message:** "Tải báo cáo hiệu suất nhân viên thành công."
- **Flow handle:** 
    1. Join `users` (role Staff) với `orders` và `payments`.
    2. Tính tổng số đơn `COMPLETED` mà staff đó phụ trách.
- **Database update logic:** Không.
- **Request body:** None.
- **Response body:** Danh sách nhân viên và các chỉ số KPI.
- **Tiêu Chuẩn chấp nhận:** Dữ liệu minh bạch phục vụ việc khen thưởng nhân viên.
- **Error case:** 403 Forbidden.
- **Tables cần truy vấn:** `users`, `orders`, `payments`
- **Yêu cầu JWT Token:** Có (ADMIN)