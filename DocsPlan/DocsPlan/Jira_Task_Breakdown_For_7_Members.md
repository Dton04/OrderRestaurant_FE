# HƯỚNG DẪN TẠO VÀ PHÂN CHIA TASKS TRÊN JIRA (NHÓM ĐẠT - 7 THÀNH VIÊN)
**Dự án:** OrderRestaurant
**Môn học:** Công cụ và Môi trường phát triển phần mềm

Dưới đây là sơ đồ tạo Epics, Stories và sub-tasks, có gắn sẵn tên của **Đạt (Leader), Cường, Nam (BE)** và **Quang, An, Hưng, Khanh (FE)** để bạn nhập thẳng vào Jira.

---

## 1. EPIC 1: PROJECT SETUP, INFRASTRUCTURE & CI/CD
*(Khởi tạo khung sườn và môi trường làm việc - Dành cho Leader)*

- **Task: Khởi tạo Base Source Code Frontend và Backend**
  - **Trạng thái / Assignee**: `Đạt (Leader)`
  - **Nhiệm vụ (Sub-tasks)**:
    - [Sub-task] Khởi tạo NestJS base, Prisma ORM setup.
    - [Sub-task] Khởi tạo React/Vue base cho Team FE.
    - [Sub-task] Thiết lập file config biến môi trường, JWT Security chuẩn.
- **Task: Xây dựng Database Schema & Migration**
  - **Trạng thái / Assignee**: `Đạt (Leader)`
  - **Nhiệm vụ (Sub-tasks)**:
    - [Sub-task] Viết Prisma schema models (ERD) cho toàn bộ Entities.
- **Task: Thiết lập CI/CD & Docker**
  - **Trạng thái / Assignee**: `Đạt (Leader)`
  - **Nhiệm vụ (Sub-tasks)**:
    - [Sub-task] Cấu hình GitHub Actions auto test/build.
    - [Sub-task] Viết `Dockerfile` và đẩy app lên VPS.

---

## 2. EPIC 2: AUTHENTICATION & SYSTEM ADMIN
*(Phân đoạn đầu tiên: Tài khoản và thiết lập cơ bản)*

- **Story: [Customer] Customer Register & Login**
  - **Nhiệm vụ (Sub-tasks)**:
    - [Sub-task] (BE) API Register & Login -> **Assign: `Đạt`**
    - [Sub-task] (FE) Thiết kế màn hình Login/Đăng ký trên Customer Web -> **Assign: `Quang`**
- **Story: [Admin] User Management**
  - **Nhiệm vụ (Sub-tasks)**:
    - [Sub-task] (BE) API Get/Update Profile, Quản trị Roles/Soft Delete -> **Assign: `Đạt`**
    - [Sub-task] (FE) Web CRM Bảng danh sách tài khoản, khóa tài khoản -> **Assign: `Hưng`**

---

## 3. EPIC 3: MENU & INFRASTRUCTURE (TABLES)
*(Phân đoạn thiết kế bảng giá, sơ đồ bàn quán)*

- **Story: [Admin] Manage Menu (Categories & Dishes)**
  - **Nhiệm vụ (Sub-tasks)**:
    - [Sub-task] (BE) API CRUD danh sách món ăn, ẩn/hiện kho hàng -> **Assign: `Cường`**
    - [Sub-task] (FE) Màn hình danh sách món ăn Admin, Upload Ảnh -> **Assign: `Hưng`**
    - [Sub-task] (FE) Trang chủ Public hiển thị lưới Menu cho User -> **Assign: `Quang`**
- **Story: [Staff/Admin] Restaurant Table Mapping**
  - **Nhiệm vụ (Sub-tasks)**:
    - [Sub-task] (BE) API cấu hình Khu vực (Areas) và định danh Bàn (Tables) -> **Assign: `Cường`**
    - [Sub-task] (FE) Hiển thị sơ đồ lưới các Bàn thời gian thực cho Nhân viên -> **Assign: `An`**

---

## 4. EPIC 4: CORE ORDERING 
*(Luồng sống còn: Giỏ hàng, Đặt món, Chốt giá)*

- **Story: [Customer/Staff] Create New Booking/Order**
  - **Nhiệm vụ (Sub-tasks)**:
    - [Sub-task] (BE) API tạo Order (Price snapshotting, Validation bàn) -> **Assign: `Cường`**
    - [Sub-task] (FE) Nút Chọn món, Giỏ hàng, Chốt Order ở phía Customer -> **Assign: `Quang`**
    - [Sub-task] (FE) Tính năng Nhân viên đứng tại bàn tạo đơn vãng lai -> **Assign: `An`**
- **Story: [Customer] Order Processing Tracking**
  - **Nhiệm vụ (Sub-tasks)**:
    - [Sub-task] (BE) API lấy danh sách Item và trạng thái đang nấu -> **Assign: `Cường`**
    - [Sub-task] (FE) Giao diện "Đơn hàng của tôi" thay đổi trạng thái tự động -> **Assign: `Quang`**

---

## 5. EPIC 5: KITCHEN WORKFLOW
*(Luồng Nhà Bếp: KanBan board hiển thị món)*

- **Story: [Chef] View & Manage Kitchen Queue**
  - **Nhiệm vụ (Sub-tasks)**:
    - [Sub-task] (BE) API Queue món chờ nấu (Sort by First-In-First-Out) -> **Assign: `Cường`**
    - [Sub-task] (BE) Bắn Socket.io cập nhật món -> **Assign: `Đạt` (hoặc `Cường`)**
    - [Sub-task] (FE) Màn hình to cho Bảng điều khiển nhà bếp, Nút "Nấu xong" -> **Assign: `Khanh`**

---

## 6. EPIC 6: PAYMENT, CHECKOUT & LOYALTY
*(Thu tiền, Ví điện tử, Khuyến mãi)*

- **Story: [Staff] Checkout & Finalize Payment**
  - **Nhiệm vụ (Sub-tasks)**:
    - [Sub-task] (BE) API Hóa đơn tạm tính và Đóng order bàn (`Table -> Cleaning`) -> **Assign: `Nam`**
    - [Sub-task] (FE) Màn hình quét QR, Chọn phương thức lúc tính tiền cho Nhân viên -> **Assign: `An`**
- **Story: [Customer] Payment Gateway Integration**
  - **Nhiệm vụ (Sub-tasks)**:
    - [Sub-task] (BE) Tích hợp VNPAY/MoMo + Webhook hứng trạng thái Callback thanh toán -> **Assign: `Nam`**
- **Story: [Customer/Admin] Voucher & Loyalty Points**
  - **Nhiệm vụ (Sub-tasks)**:
    - [Sub-task] (BE) API CRUD Voucher, Check Logic hợp lệ, Cập nhật Point -> **Assign: `Nam`**
    - [Sub-task] (FE) Màn hình "Phần thưởng" (Đổi điểm) ở Web khách hàng -> **Assign: `Quang`**
    - [Sub-task] (FE) Màn hình tạo Voucher KM ở Admin -> **Assign: `Hưng`**

---

## 7. EPIC 7: TESTING, FIX BUG & REVIEW
*(Khâu QA rất quan trọng của môn Công cụ MT)*

- **Task: Write Backend Unit Tests**
  - **Trạng thái / Assignee**: `Đạt`, `Cường`, `Nam` (Tuỳ API của ai người đó viết)
  - **Nhiệm vụ (Sub-tasks)**:
    - [Sub-task] Test case cho Order Price Calculation.
    - [Sub-task] Test case cho JWT Access.
- **Task: System QA & E2E Testing**
  - **Trạng thái / Assignee**: `Khanh (QA)`
  - **Nhiệm vụ (Sub-tasks)**:
    - [Sub-task] Soạn bộ API Tester qua Postman / Swagger UI chia sẻ cho FE.
    - [Sub-task] Test hỏng Logic / UI thì tạo `Bug Tickets` đẩy lại lên Jira bắt FE/BE fix.
- **Task: Code Review & Documentation**
  - **Trạng thái / Assignee**: `Đạt (Leader)`
  - **Nhiệm vụ (Sub-tasks)**:
    - [Sub-task] Approve Pull Requests từ nhánh Dev của Cường, Nam, An, Hưng, Khanh, Quang lên Main nhánh chính.
    - [Sub-task] Viết File README chuẩn bị nộp cuối kỳ.

---

### TÓM TẮT GIAO VIỆC TRÊN JIRA ĐỂ LEADER (@Đạt) DỄ NHỚ
1. **Đạt**: Nắm Epic 1 & 2. Duyệt Pull Request của cả team (Epic 7).
2. **Cường**: Nắm Epic 3, 4, 5 (Menu, Order, Bếp). Liên tục chọc API cho Quang & Khanh xài.
3. **Nam**: Nắm Epic 6 (Làm tiền, điểm, thanh toán). Liên tục cung cấp API cho An, Hưng xài.
4. **Quang**: Làm tất cả Story dán nhãn `[Customer]`.
5. **An**: Làm tất cả Story dán nhãn `[Staff]`.
6. **Hưng**: Làm tất cả Story dán nhãn `[Admin]`.
7. **Khanh**: Làm Story `[Chef]`. Phần thời gian còn lại đi "Bắt Bug" (Tạo ticket Bug) gửi ngược lại cho 6 người kia. 

*Chia thế này cực kỳ rõ ràng, FE nào chỉ ôm web của Role nấy không dẫm chân lên code của nhau. BE cũng chia cắt từng miền logic rất gọn gàng!*
