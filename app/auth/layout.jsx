"use client";
import useGetSeesion from "@/hooks/useGetSession";
import Loading from "@/layout/loading";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { FaShoppingBag } from "react-icons/fa";

const AuthLayout = ({ children }) => {
  const { checking, user } = useGetSeesion();
  const router = useRouter();
  const pathName = usePathname();

  useEffect(() => {
    if (checking) return;

    if (user) {
      router.push("/");
    }
  }, [checking]);

  if (checking) return <Loading />;

  return (
    <div className="w-full h-full lg:pt-22">
      {/* header */}
      <header className="w-full p-5 flex justify-center items-center bg-white border-b-2 border-blue-500 fixed top-0">
        <div className="w-[90%] lg:w-3/4 flex items-center justify-center">
          <Link
            href="/"
            className="flex items-center flex-col lg:flex-row  gap-3.5"
          >
            <FaShoppingBag size={50} color="blue" />
            <p className="lg:text-2xl text-lg font-bold text-blue-600">
              {pathName === "/auth/sign-in"
                ? "เข้าสู่ระบบเพื่อการใช้งานที่มากกว่า"
                : pathName === "/auth/forgot-password"
                ? "ลืมรหัสผ่าน"
                : "สมัครสมาชิก"}
            </p>
          </Link>
        </div>
      </header>

      <div className="w-full h-full flex items-center lg:flex-row flex-col justify-center gap-10 lg:gap-24 p-20 lg:px-28 px-10 text-white bg-blue-600">
        <div className="flex flex-col gap-3 items-center ">
          <FaShoppingBag className="text-9xl" color="white" />
          <p className="text-7xl font-bold">EZY</p>
          <p className="text-5xl">e-commerce</p>

          <p className="mt-10 lg:text-2xl">
            Development of an online product sales System
          </p>
        </div>
        {children}
      </div>
    </div>
  );
};
export default AuthLayout;
