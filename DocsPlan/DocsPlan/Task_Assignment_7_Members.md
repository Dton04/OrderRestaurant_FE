# KẾ HOẠCH PHÂN CÔNG CÔNG VIỆC DỰ ÁN ORDERRESTAURANT (NHÓM 7 THÀNH VIÊN)
**Môn học:** Công cụ và Môi trường phát triển phần mềm

Dựa trên yêu cầu: **Trưởng nhóm Đạt (BE chính + Review FE/BE)**, **Cường, Nam (BE)**, và **An, Hưng, Khanh, Quang (FE)**. Đây là bảng phân công cân bằng khối lượng công việc và phù hợp nhất để lấy điểm tối đa môn Công cụ & Môi trường phát triển (chú trọng Git, Jira, CI/CD, Docker, Testing).

---

## 1. TỔNG QUAN VAI TRÒ (ROLES)

| STT | Thành viên | Vai trò chính | Nhiệm vụ trọng tâm |
|:---:|:---|:---|:---|
| **1** | **Đạt (Leader)** | **Project Manager / Main BE / Reviewer** | Khởi tạo Project (NestJS), setup DB/Prisma, CI/CD (GitHub Actions), Docker Deploy. Code API Auth & Users. Trực tiếp Review/Merge code BE & FE. |
| **2** | **Cường** | **Backend Developer (Menu, Order, Kitchen)** | Chuyên Code API lõi: CRUD Category/Dish, Core Ordering (Price snapshotting, giỏ hàng), APIs Bếp (Kitchen Queue). |
| **3** | **Nam** | **Backend Developer (Staff, Payment, Loyalty)** | Chuyên Code API vận hành: Table Management, Tính tiền Checkout, Tích hợp VNPAY/MoMo, Logic Voucher & Points. |
| **4** | **Quang** | **Frontend Developer (Customer Interface)** | Phụ trách giao diện Khách hàng (Customer Web/App): Trang chủ Menu, Đăng nhập, Giỏ hàng, Đặt món, Theo dõi đơn. |
| **5** | **An** | **Frontend Developer (Staff Interface)** | Phụ trách màn hình cho Nhân viên (Staff): Sơ đồ bàn Realtime (Socket.io), Lên đơn tại bàn, Hóa đơn & Thanh toán. |
| **6** | **Hưng** | **Frontend Developer (Admin Dashboard)** | Phụ trách trang Quản trị (Admin Panel): Biểu đồ thống kê, CRUD Món/Danh mục, Quản lý User (Khóa tài khoản), Cấu hình thiết lập sơ đồ Quán. |
| **7** | **Khanh** | **Frontend Developer (Chef UI) & QA/Tester** | Phụ trách Màn hình Bếp (Kitchen Display) để nhận món Realtime. + **Đóng vai trò QA**: Chạy API test Postman, Viết Test case, Log Bug lên Jira ép Dev sửa. |

---

## 2. CHI TIẾT CÔNG VIỆC TỪNG THÀNH VIÊN

### 👑 Đạt (Leader / Main BE / DevOps & Code Reviewer)
- **Quản lý dự án & Teamwork:** Setup Jira/Trello Board, tạo luồng Git Flow (`main`, `develop`, `feature/*`). Yêu cầu team tuân thủ conventional commits.
- **Backend Architecture:** Khởi tạo base NestJS + Prisma ORM. Thiết kế cấu trúc Database (chạy file migration tạo table). Thiết lập JWT Security & Swagger.
- **Coding:** Phụ trách Module *Foundation & System Admin*: Validation, Khởi tạo roles, Đăng nhập, Cập nhật Profile.
- **CI/CD & Deploy:** Viết Docker Compose, setup Pipeline (tự động chạy test/build khi push). Đóng gói và Deploy lên VPS môn học.
- **Kiểm soát chất lượng:** Là người nắm quyền **Approve Pull Requests** (PRs). Review chéo cho Cường, Nam và cả team FE (An, Hưng, Khanh, Quang) để đảm bảo không gãy UI/UX.

### 💻 Cường (Backend Developer - Core & Kitchen)
- **Nghiệp vụ API (Endpoint 8 đến 25):**
  - **Menu & Infrastructure:** API tạo món ăn, danh mục, khu vực bàn. Tùy chỉnh ẩn/hiện món ăn (Availability).
  - **Core Ordering:** API cực khó xử lý việc đặt món: Kiểm tra bàn trống, lưu giá tại thời điểm đặt (Snapshotting), thêm/bớt món khi đang ăn.
  - **Kitchen Workflow:** API lấy danh sách việc cho Đầu bếp (trạng thái Pending -> Cooking -> Done). Phối hợp với Đạt để bắn tín hiệu Socket.io khi có order mới.

### 💻 Nam (Backend Developer - Payment & Loyalty)
- **Nghiệp vụ API (Endpoint 26 đến 35):**
  - **Staff Operations:** API tính hóa đơn tạm thời (Pre-checkout bill), API cập nhật thủ công tình trạng bàn (Dọn dẹp).
  - **Payment Integration:** Khởi tạo luồng giao dịch qua MoMo / VNPAY. Viết Webhook để lắng nghe khi khách thanh toán xong.
  - **Loyalty & Marketing:** Xử lý API cấp mã Voucher, Logic trừ tiền Voucher, Logic cộng điểm thành viên từ hóa đơn. 

### 🎨 Quang (Frontend Developer - Customer Flow)
- **Nghiệp vụ FE (Khách hàng):**
  - Code trang Public xem thực đơn đẹp mắt (giống UI shopee/foody), có filter theo category.
  - Luồng Khách hàng: Auth (Đăng nhập), Add to Cart, Áp dụng Voucher.
  - Tạo view "Trạng thái đơn hàng của tôi" bắn socket.io để thấy món đang nấu hay đà hoàn thành. Đổi điểm thưởng tích luỹ.

### 🎨 An (Frontend Developer - Staff & POS System)
- **Nghiệp vụ FE (Nhân viên phục vụ):**
  - Thiết kế sơ đồ bàn hiển thị dạng lưới (Grid/Map). Màu sắc tự đổi (Trắng=Trống, Đỏ=Đang dùng, Vàng=Chờ dọn) thông qua dữ liệu Real-time.
  - Action chọn bàn -> Mở form order lấy order cho khách vãng lai (khách không dùng app).
  - Tích hợp QR thanh toán, view in hoá đơn dạng bill máy in nhiệt.

### 🎨 Hưng (Frontend Developer - Admin Dashboard)
- **Nghiệp vụ FE (Quản trị viên):**
  - Thiết kế màn hình tổng quan (Dashboard) hiển thị: Biểu đồ doanh thu tuần/tháng, Top món bán chạy (Dùng Chart.js/Recharts).
  - Các màn hình CMS: Bảng Quản lý User/Staff, Upload ảnh tạo Món mới, Kéo thả tạo bàn/khu vực.
  - Tạo chiến dịch Voucher (Chọn ngày bắt đầu/kết thúc).

### 🚀 Khanh (Frontend Developer - Chef Screen & Lead QA)
- **Nghiệp vụ FE (Nhà bếp):**
  - Code một màn hình duy nhất nhưng tối ưu cho Tablet/SmartTV ở Bếp (Kitchen Display System). 
  - Giao diện Chia cột (Kanban board): Món mới nhận -> Đang nấu -> Xong.
- **Nghiệp vụ QA / Tester (Cực kỳ quan trọng để ăn điểm quy trình môn học):**
  - Viết Test Cases trên Excel (Hoặc plugin Zephyr của Jira). 
  - Đi test chéo cho tất cả các luồng (Vd: "Cố tình áp mã voucher hết hạn xem app có chửi không?").
  - Test hỏng -> Chụp màn hình -> Lên Jira ấn nút `Create Bug` -> Tag Nam, Cường, Quang vào sửa. 

---

## 3. LỘ TRÌNH THỰC HIỆN DỰ KIẾN (SPRINTS)
*(Giả định làm trong 6-8 tuần / 3 Sprints)*

- **Sprint 1 (Khung sườn gốc):** Mọi thứ lên server.
  - Đạt Init DB, Docker, API Base. Quang & An dựng base layout FE.
  - Mọi người nhận issue Jira liên quan tới Auth & Menu để làm quen quy trình tạo nhánh, Push code, Pull Request.
- **Sprint 2 (Luồng đặt hàng):**
  - Cường làm Backend Đặt Order + Bếp. Nam làm tính tiền.
  - Quang làm Customer UI, An làm Staff UI, Khanh làm Kitchen UI.
  - 3 nhóm FE làm việc gắn kết realtime với nhau.
- **Sprint 3 (Thanh toán & Chạy mượt mà):**
  - Nam làm VNPay/MoMo. Hưng hoàn thành Dashboard, Thống kê cho Admin.
  - Khanh đóng bộ Postman chuẩn, mang đi đập phá (Testing) app để tìm BUG. Đạt review lại code toàn diện. Mọi người sửa bug đến hạn nộp đồ án.
