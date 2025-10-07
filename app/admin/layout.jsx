"use client";
import useGetSeesion from "@/hooks/useGetSession";
import AdminSidebar from "@/layout/admin-layout/admin-sidebar";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const Layout = ({ children }) => {
  const { user, checking } = useGetSeesion();
  const router = useRouter();

  useEffect(() => {
    if (checking) return;

    const timeout = setTimeout(() => {
      if (user?.roleId < 2 || !user) {
        router.push("/");
      }
    }, 800);

    return () => clearTimeout(timeout);
  }, [user]);

  if (checking) return null;

  return (
    <div className="w-full h-screen flex items-center gap-2">
      <AdminSidebar />
      <div className="w-full h-full overflow-auto flex flex-col p-5 bg-gray-50">
        {children}
      </div>
    </div>
  );
};
export default Layout;
