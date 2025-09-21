import { FaShoppingBag } from "react-icons/fa";

const Loading = () => {
  return (
    <div className="fixed top-0 left-0 w-screen h-screen z-[9999] flex flex-col items-center justify-center bg-black/60 overflow-hidden">
      {/* Spinner รอบไอคอน */}
      <div className="relative flex items-center justify-center">
        {/* วงกลมหมุน */}
        <div className="w-20 h-20 border-4 border-white/30 border-t-white rounded-full animate-spin absolute"></div>
        {/* ไอคอน */}
        <FaShoppingBag color="white" size={40} />
      </div>

      {/* ข้อความ */}
      <p className="text-white mt-6 text-lg animate-pulse">กำลังโหลด...</p>
    </div>
  );
};

export default Loading;
