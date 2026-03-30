import React, { useState } from 'react';
import { ChevronLeft, UtensilsCrossed, AlignLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const CheckoutPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // 1. Thêm các State này ở đầu component
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [specialNote, setSpecialNote] = useState('');

    // Lấy dữ liệu từ state khi navigate, nếu không có thì lấy dữ liệu hiển thị mặc định
    const state = (location.state as any) || {
        table: '05',
        items: [
            { 
                id: '1', 
                name: 'Món 10', 
                price: 150000, 
                quantity: 2, 
                description: '"Thêm phô mai thủ công"', 
                image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3' 
            },
            { 
                id: '2', 
                name: 'Món 12', 
                price: 100000, 
                quantity: 1, 
                description: 'Chế biến tiêu chuẩn', 
                image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3' 
            }
        ],
        subtotal: 400000,
        tax: 40000,
        total: 440000
    };

    const { table, items, subtotal, tax, total } = state;
    const totalItemsCount = items.reduce((acc: number, item: any) => acc + item.quantity, 0);

    // 2. Thêm hàm xử lý
    const handlePlaceOrder = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);

        try {
            const orderPayload = {
                table_id: Number(table), // QUAN TRỌNG: Chuyển "05" thành 5
                total_amount: subtotal,
                discount_amount: 0,
                final_amount: total,
                status: "PENDING",
                items: items.map((item: any) => ({
                    dish_id: Number(item.id), 
                    quantity: item.quantity,
                    price_at_order: item.price
                }))
            };

            const response = await axios.post('http://localhost:3000/orders', orderPayload);
            
            if (response.status === 201 || response.status === 200) {
                alert("Đặt món thành công! Bếp đã nhận được tín hiệu.");
                navigate('/'); 
            }
        } catch (error: any) {
            console.error("Lỗi:", error);
            const backendMsg = error.response?.data?.message || "Không thể kết nối đến máy chủ";
            alert("Lỗi Đặt Món: " + backendMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-[100svh] bg-[#FDFCFB] text-[#555] font-sans pb-[120px] flex justify-center selection:bg-[#C2410C] selection:text-white">
            <div className="w-full max-w-md bg-[#FDFCFB] flex flex-col min-h-[100svh] relative">
                
                {/* Header */}
                <header className="flex items-center justify-between px-6 py-6 sticky top-0 bg-[#FDFCFB]/90 backdrop-blur-md z-30">
                    <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-[#C2410C] hover:bg-orange-50 rounded-full transition-colors disabled:opacity-50" disabled={isSubmitting}>
                        <ChevronLeft size={28} strokeWidth={2} />
                    </button>
                    <div className="text-[20px] font-serif tracking-wide text-[#C2410C] absolute left-1/2 -translate-x-1/2 font-bold whitespace-nowrap m-0 style-override">
                        Xác nhận đơn hàng
                    </div>
                    <div className="border border-[#fbcba6] bg-[#fff5ed] text-[#C2410C] px-3 py-1.5 rounded-full font-bold text-xs tracking-widest shadow-sm whitespace-nowrap">
                        BÀN {table}
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 px-6 flex flex-col pt-2">
                    
                    {/* Selected Items Section */}
                    <section className="mb-4">
                        <div className="flex justify-between items-end mb-4 border-b border-orange-200/60 pb-4">
                            <div className="text-[24px] font-serif italic text-[#C2410C] font-semibold tracking-wide m-0">Món đã chọn</div>
                            <span className="text-[#e27641] font-bold text-xs tracking-widest uppercase mb-1">{totalItemsCount} MÓN</span>
                        </div>
                        
                        <div className="flex flex-col gap-6 mt-6">
                            {items.map((item: any) => (
                                <div key={item.id} className="flex gap-4 items-center">
                                    <img 
                                        src={item.image} 
                                        alt={item.name} 
                                        className="w-[84px] h-[84px] rounded-[20px] object-cover shadow-sm bg-[#fff8f3]"
                                    />
                                    <div className="flex-1 flex flex-col justify-center">
                                        <div className="flex justify-between items-start mb-0.5">
                                            <div className="font-serif font-bold text-[18px] text-[#C2410C] m-0 line-clamp-1">{item.name}</div>
                                            <div className="text-[14px] font-bold text-[#C2410C] mt-1 whitespace-nowrap ml-2">
                                                {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                                            </div>
                                        </div>
                                        <div className="text-[#d88257] text-[13px] italic mb-2 line-clamp-1">
                                            {item.description || "Chế biến tiêu chuẩn"}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs text-[#e27641] uppercase tracking-wider font-bold">
                                            SỐ LƯỢNG <span className="text-[#C2410C] font-black text-sm">{item.quantity < 10 ? `0${item.quantity}` : item.quantity}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Special Notes Section */}
                    <section className="mt-8 mb-8">
                        <div className="flex items-center gap-2 mb-3">
                            <AlignLeft size={16} className="text-[#C2410C]" strokeWidth={2.5} />
                            <div className="text-[12px] font-extrabold text-[#C2410C] uppercase tracking-widest m-0">
                                GHI CHÚ ĐẶC BIỆT
                            </div>
                        </div>
                        <div className="relative">
                            <textarea 
                                value={specialNote}
                                onChange={(e) => setSpecialNote(e.target.value)}
                                disabled={isSubmitting}
                                className="w-full bg-white border border-[#f5d9c4] shadow-[0_2px_15px_rgba(194,65,12,0.06)] transition-colors rounded-[24px] p-5 min-h-[120px] text-[14px] text-[#a13203] resize-none focus:outline-none focus:ring-2 focus:ring-[#C2410C]/30 focus:border-[#C2410C]/50 placeholder-[#e2aa8f] leading-relaxed font-medium disabled:opacity-75 disabled:bg-gray-50"
                                placeholder="Không cay, ít hành hoặc yêu cầu riêng của quý khách..."
                            ></textarea>
                            <UtensilsCrossed size={18} strokeWidth={2} className="absolute bottom-5 right-5 text-[#f5d9c4]" />
                        </div>
                    </section>

                    {/* Order Summary */}
                    <section className="mt-4 mb-8">
                        <div className="bg-[#fff7f0] border border-[#fcdbc4] rounded-[36px] p-8 shadow-lg shadow-orange-900/5">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-[#C2410C] font-semibold text-[15px]">Tạm tính</span>
                                <span className="text-[#C2410C] text-[15px] font-bold">{subtotal.toLocaleString('vi-VN')}đ</span>
                            </div>
                            <div className="flex justify-between items-center mb-6">
                                <span className="text-[#C2410C] font-semibold text-[15px]">Phí phục vụ & Thuế (10%)</span>
                                <span className="text-[#C2410C] text-[15px] font-bold">{tax.toLocaleString('vi-VN')}đ</span>
                            </div>
                            
                            <div className="border-t border-[#fcdbc4] pt-6">
                                <div className="text-[11px] text-[#e27641] font-black uppercase tracking-widest mb-1.5">
                                    TỔNG CỘNG
                                </div>
                                <div className="flex justify-between items-end gap-2">
                                    <span className="text-[28px] font-serif text-[#C2410C] font-bold tracking-wide">Thanh toán</span>
                                    <span className="text-[28px] font-serif text-[#C2410C] font-black tracking-wide shrink-0">{total.toLocaleString('vi-VN')}đ</span>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>

                {/* Sticky Bottom Bar */}
                <div className="fixed bottom-0 left-0 right-0 flex justify-center z-20 pointer-events-none">
                    <div className="w-full max-w-md bg-gradient-to-t from-[#FDFCFB] via-[#FDFCFB] to-[#FDFCFB]/0 pt-16 pb-6 px-6 pointer-events-auto flex flex-col items-center">
                        <button 
                            onClick={handlePlaceOrder}
                            disabled={isSubmitting}
                            className={`w-full bg-[#C2410C] hover:bg-[#a33508] active:scale-[0.98] transition-all text-white font-bold tracking-wide text-[16px] py-4 rounded-[20px] shadow-[0_8px_30px_rgba(194,65,12,0.4)] flex items-center justify-center gap-3 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {isSubmitting ? (
                                <div className="flex items-center gap-2">
                                    <span className="animate-spin text-lg block origin-center leading-none">◌</span> ĐANG GỬI ĐƠN...
                                </div>
                            ) : (
                                <>
                                    <UtensilsCrossed size={18} /> GỬI YÊU CẦU ĐẶT MÓN
                                </>
                            )}
                        </button>
                        <div className="text-[10px] text-[#d67a4d] uppercase tracking-widest font-bold mt-4 m-0">
                            Trải nghiệm ẩm thực thượng lưu
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default CheckoutPage;
