import React from 'react';
import { Utensils } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  isRegister?: boolean;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ 
  children, 
  title, 
  subtitle,
  isRegister = false 
}) => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        {/* Left Side - Image/Branding */}
        <div className={`w-full md:w-1/2 relative flex flex-col justify-end p-8 md:p-12 text-white ${isRegister ? 'bg-[#ef5b1b]' : ''}`}>
          {!isRegister && (
            <div className="absolute inset-0 z-0">
              <img 
                src="/src/assets/auth-bg.png" 
                alt="Restaurant Background" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 bg-gradient-to-t from-black/80 to-transparent" />
            </div>
          )}
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-8">
              <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                <Utensils size={28} className="text-white" />
              </div>
              <span className="text-2xl font-bold tracking-tight uppercase">
                {isRegister ? 'RestoHub' : 'Resto Pro'}
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
              {title}
            </h1>
            <p className="text-lg text-white/90 max-w-md">
              {subtitle}
            </p>
          </div>
          
          {isRegister && (
            <div className="mt-12 flex -space-x-2 relative z-10">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-300" />
              ))}
              <div className="ml-4 pt-2 text-sm text-white/80">
                Hơn 5,000 nhân sự đang sử dụng hệ thống mỗi ngày.
              </div>
            </div>
          )}
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center">
          {children}
          
          <div className="mt-12 flex items-center justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-1.5 grayscale opacity-70">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z"/></svg>
              BẢO MẬT SSL
            </div>
            <div className="flex items-center gap-1.5 grayscale opacity-70">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z"/></svg>
              HỖ TRỢ 24/7
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
