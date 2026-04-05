# TÀI LIỆU ĐẶC TẢ YÊU CẦU CHỨC NĂNG (FDS) - ORDERRESTAURANT

## 1. TỔNG QUAN DỰ ÁN
Dự án OrderRestaurant là hệ thống quản lý đặt món trực tuyến và tại nhà hàng, giúp tối ưu quy trình từ khi khách hàng đặt món đến khi món ăn được phục vụ và thanh toán.

---

## 2. ĐẶC TẢ CHI TIẾT CÁC CHỨC NĂNG (20 CHỨC NĂNG)

### A. VAI TRÒ: CUSTOMER (KHÁCH HÀNG)

#### 1. Đăng ký và Đăng nhập
- **Mô tả**: Cho phép người dùng tạo tài khoản và truy cập hệ thống để lưu trữ thông tin cá nhân và lịch sử đặt hàng.
- **Nghiệp vụ**:
    - Kiểm tra email/số điện thoại duy nhất.
    - Mật khẩu phải được mã hóa trước khi lưu.
    - Hỗ trợ đăng nhập qua mạng xã hội (tùy chọn).
- **Tiêu chuẩn chấp nhận**:
    - Người dùng có thể tạo tài khoản thành công với email hợp lệ.
    - Hệ thống gửi email xác nhận hoặc hiển thị thông báo thành công.
    - Người dùng không thể đăng nhập với thông tin sai.

#### 2. Xem Danh mục và Thực đơn (Menu)
- **Mô tả**: Khách hàng xem danh sách món ăn được phân loại theo từng nhóm.
- **Nghiệp vụ**:
    - Hiển thị danh sách món ăn theo Category (Khai vị, Món chính, Đồ uống...).
    - Hỗ trợ tìm kiếm món ăn theo tên.
- **Tiêu chuẩn chấp nhận**:
    - Menu hiển thị đầy đủ tên, giá và hình ảnh món ăn.
    - Phân loại món ăn rõ ràng, dễ điều hướng.

#### 3. Xem Chi tiết Món ăn
- **Mô tả**: Hiển thị thông tin chi tiết về một món ăn cụ thể.
- **Nghiệp vụ**:
    - Hiển thị mô tả thành phần, mức độ cay, calo (nếu có).
    - Hiển thị các đánh giá từ khách hàng khác.
- **Tiêu chuẩn chấp nhận**:
    - Người dùng thấy được thông tin chi tiết khi nhấn vào món ăn.
    - Hình ảnh sắc nét, giá hiển thị đúng với cơ sở dữ liệu.

#### 4. Đặt món (Ordering)
- **Mô tả**: Khách hàng chọn món, số lượng và gửi yêu cầu đặt món.
- **Nghiệp vụ**:
    - Cho phép thêm/bớt món vào giỏ hàng.
    - Ghi chú món ăn (ví dụ: ít cay, không hành).
    - Tự động tính tổng tiền.
- **Tiêu chuẩn chấp nhận**:
    - Giỏ hàng cập nhật số lượng và tổng tiền chính xác.
    - Sau khi xác nhận, yêu cầu được gửi đến bộ phận Staff/Chef.

#### 5. Theo dõi Trạng thái Đơn hàng
- **Mô tả**: Khách hàng biết được món ăn của mình đang ở giai đoạn nào.
- **Nghiệp vụ**:
    - Các trạng thái: Chờ xác nhận -> Đang chế biến -> Chờ phục vụ -> Đã hoàn thành.
- **Tiêu chuẩn chấp nhận**:
    - Trạng thái cập nhật thời gian thực khi Chef/Staff thay đổi.
    - Người dùng có thể xem lịch sử các đơn hàng cũ.

#### 6. Hệ thống Tích điểm và Ưu đãi
- **Mô tả**: Tích điểm dựa trên giá trị đơn hàng để đổi voucher.
- **Nghiệp vụ**:
    - Tỷ lệ quy đổi điểm (ví dụ: 100,000đ = 10 điểm).
    - Áp dụng mã giảm giá tại bước thanh toán.
- **Tiêu chuẩn chấp nhận**:
    - Điểm được cộng ngay sau khi đơn hàng thanh toán thành công.
    - Mã giảm giá hợp lệ phải trừ đúng số tiền/phần trăm vào tổng đơn.

---

### B. VAI TRÒ: STAFF (NHÂN VIÊN PHỤC VỤ)

#### 7. Quản lý Trạng thái Bàn
- **Mô tả**: Theo dõi và cập nhật tình trạng bàn thực tế tại nhà hàng.
- **Nghiệp vụ**:
    - Trạng thái: Trống, Có khách, Đã đặt trước, Chờ dọn dẹp.
- **Tiêu chuẩn chấp nhận**:
    - Nhân viên có thể thay đổi trạng thái bàn qua giao diện sơ đồ.
    - Sơ đồ bàn hiển thị màu sắc khác nhau cho từng trạng thái.

#### 8. Tiếp nhận và Tạo đơn trực tiếp
- **Mô tả**: Staff tạo đơn cho khách hàng vãng lai không dùng ứng dụng.
- **Nghiệp vụ**:
    - Chọn bàn -> Chọn món -> Xác nhận.
    - Hỗ trợ gộp bàn hoặc chuyển bàn.
- **Tiêu chuẩn chấp nhận**:
    - Đơn hàng được tạo thành công và in được order-slip cho bếp.

#### 9. Xác nhận Thanh toán
- **Mô tả**: Xử lý thanh toán cho khách và in hóa đơn.
- **Nghiệp vụ**:
    - Hỗ trợ nhiều hình thức: Tiền mặt, Thẻ, Chuyển khoản, Ví điện tử (MoMo, VnPay).
    - Xuất hóa đơn VAT nếu khách yêu cầu.
- **Tiêu chuẩn chấp nhận**:
    - Hóa đơn in ra có đầy đủ thông tin: Danh sách món, Tổng tiền, Giảm giá, VAT.
    - Sau khi thanh toán, bàn tự động chuyển về trạng thái "Chờ dọn dẹp".

#### 10. Chỉnh sửa hoặc Hủy đơn hàng
- **Mô tả**: Thay đổi thông tin đơn hàng khi khách có yêu cầu đột xuất.
- **Nghiệp vụ**:
    - Chỉ cho phép hủy món nếu Chef chưa bắt đầu chế biến.
    - Ghi lại lý do hủy đơn (Vd: Khách đổi ý, Hết nguyên liệu).
- **Tiêu chuẩn chấp nhận**:
    - Hệ thống cập nhật lại tổng tiền ngay sau khi chỉnh sửa.
    - Gửi thông báo đến bếp nếu món bị hủy.

#### 11. Báo cáo Doanh thu Ca trực
- **Mô tả**: Staff xem tổng kết tiền mặt và doanh thu trong ca của mình.
- **Nghiệp vụ**:
    - Thống kê tổng tiền theo phương thức thanh toán.
    - Đối soát cuối ca trước khi bàn giao.
- **Tiêu chuẩn chấp nhận**:
    - Hiển thị bảng tổng kết chính xác số tiền đã thu trong ca.

---

### C. VAI TRÒ: CHEF (ĐẦU BẾP)

#### 12. Xem Danh sách Chế biến (Kitchen Queue)
- **Mô tả**: Hiển thị các món ăn cần thực hiện theo thứ tự ưu tiên.
- **Nghiệp vụ**:
    - Sắp xếp theo thời gian đặt (First In First Out).
    - Hiển thị ghi chú đặc biệt từ khách.
- **Tiêu chuẩn chấp nhận**:
    - Danh sách cập nhật ngay khi có đơn mới.
    - Phân biệt rõ các món cùng một bàn để nấu cùng lúc.

#### 13. Cập nhật Trạng thái Chế biến
- **Mô tả**: Chef thông báo tiến độ nấu nướng cho Staff và Customer.
- **Nghiệp vụ**:
    - Chuyển từ "Chờ" sang "Đang nấu".
    - Khi xong, chuyển sang "Chờ phục vụ".
- **Tiêu chuẩn chấp nhận**:
    - Hệ thống gửi thông báo đến máy cầm tay của Staff khi món hoàn thành.

#### 14. Quản lý Tình trạng Món (Hết món)
- **Mô tả**: Cập nhật nhanh các món không còn đủ nguyên liệu.
- **Nghiệp vụ**:
    - Tạm thời gỡ bỏ món khỏi Menu hiển thị của Customer.
- **Tiêu chuẩn chấp nhận**:
    - Món ăn được đánh dấu "Hết hàng" và không thể thêm vào giỏ hàng.

#### 15. Thống kê Lượng món đã chế biến
- **Mô tả**: Xem tổng số lượng từng loại món đã nấu trong ngày.
- **Nghiệp vụ**:
    - Giúp Chef dự báo lượng nguyên liệu cần cho ngày tiếp theo.
- **Tiêu chuẩn chấp nhận**:
    - Hiển thị danh sách món và số lượng tương ứng chính xác.

---

### D. VAI TRÒ: ADMIN (QUẢN TRỊ VIÊN)

#### 16. Dashboard và Báo cáo Tổng thể
- **Mô tả**: Xem tình hình kinh doanh qua các chỉ số biểu đồ.
- **Nghiệp vụ**:
    - Doanh thu theo ngày/tháng/vùng.
    - Tỷ lệ món bán chạy (Top Selling).
- **Tiêu chuẩn chấp nhận**:
    - Biểu đồ hiển thị trực quan, dữ liệu chính xác.

#### 17. Quản lý Menu và Danh mục (CRUD)
- **Mô tả**: Quản lý toàn bộ danh sách món ăn của nhà hàng.
- **Nghiệp vụ**:
    - Thêm món mới, cập nhật giá, thay đổi hình ảnh.
    - Quản lý các nhóm danh mục.
- **Tiêu chuẩn chấp nhận**:
    - Các thay đổi từ Admin được cập nhật tức thì lên giao diện Customer và Staff.

#### 18. Quản lý Người dùng và Phân quyền
- **Mô tả**: Tạo tài khoản cho nhân viên và phân quyền truy cập.
- **Nghiệp vụ**:
    - Gán Role: ADMIN, STAFF, CHEF.
    - Quản lý trạng thái tài khoản (Kích hoạt/Khóa).
- **Tiêu chuẩn chấp nhận**:
    - Chef không thể truy cập vào mục Thanh toán của Staff.
    - Staff không thể xem báo cáo lợi nhuận của Admin.

#### 19. Cấu hình Sơ đồ Nhà hàng (Table Setup)
- **Mô tả**: Thiết lập vị trí và số lượng bàn cho từng khu vực (Trong nhà, Ngoài trời, VIP).
- **Nghiệp vụ**:
    - Định nghĩa ID bàn, số chỗ ngồi tối đa.
- **Tiêu chuẩn chấp nhận**:
    - Staff thấy được sơ đồ đã cấu hình để phục vụ khách.

#### 20. Quản lý Chương trình Khuyến mãi
- **Mô tả**: Tạo các chiến dịch giảm giá để thu hút khách hàng.
- **Nghiệp vụ**:
    - Thiết lập thời gian bắt đầu/kết thúc.
    - Điều kiện áp dụng (Vd: Cho đơn hàng trên 500k).
- **Tiêu chuẩn chấp nhận**:
    - Khuyến mãi tự động hết hạn khi quá thời gian cấu hình.
