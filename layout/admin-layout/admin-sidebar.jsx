"use client";
import { envConfig } from "@/config/env-config";
import useGetSession from "@/hooks/useGetSession";
import { popup } from "@/libs/alert-popup";
import axios from "axios";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  FaBars,
  FaChartArea,
  FaChartPie,
  FaImages,
  FaList,
  FaReceipt,
  FaSignOutAlt,
  FaTags,
  FaTimes,
  FaTshirt,
  FaUserAlt,
  FaUserAltSlash,
  FaUserCircle,
} from "react-icons/fa";
import Loading from "../loading";

const Menu = () => {
  const path = usePathname();
  const { user } = useGetSession();

  const menus = [
    {
      id: 1,
      icon: <FaChartArea />,
      url: "/admin/dashboard",
      title: "Dashboard",
    },
    // {
    //   id: 7,
    //   icon: <FaImages />,
    //   url: "/admin/banners",
    //   title: "จัดการแบนเนอร์",
    // },
    {
      id: 3,
      icon: <FaList />,
      url: "/admin/category",
      title: "จัดการหมวดหมู่",
    },
    {
      id: 2,
      icon: <FaTshirt />,
      url: "/admin/product",
      title: "จัดการสินค้า",
    },
    {
      id: 4,
      icon: <FaReceipt />,
      url: "/admin/orders",
      title: "จัดการคำสั่งซื้อ",
    },
    {
      id: 5,
      icon: <FaUserAlt />,
      url: "/admin/members",
      title: "จัดการสมาชิก",
    },
    {
      id: 8,
      icon: <FaTags />,
      url: "/admin/promotion",
      title: "จัดการโปรโมชัน",
    },
    {
      id: 6,
      icon: <FaUserCircle />,
      url: "/admin/account",
      title: "บัญชีของฉัน",
    },
  ];

  const [showResponsive, setShowResponsive] = useState(false);

  const [loading, setLoading] = useState(false);
  const handleLogout = async () => {
    const { isConfirmed } = await popup.confirmPopUp(
      "ออกจากระบบ",
      "ต้องการออกจากระบบหรือไม่",
      "ออกจากระบบ"
    );
    if (!isConfirmed) return;

    setLoading(true);
    try {
      const res = await axios.post(
        envConfig.apiURL + "/auth/logout",
        {},
        { withCredentials: true }
      );
      if (res.status === 200) {
        popup.success("ออกจากระบบแล้ว");
        location.href = "/";
      }
    } catch (error) {
      console.error(error);
      popup.err();
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <>
      <div
        className={`p-3 lg:flex ${
          showResponsive ? "flex w-[80%] absolute top-0" : "hidden"
        } w-1/5 h-full flex-col border-r justify-between border-gray-200 bg-gray-800 shadow-md z-[100]`}
      >
        <div className="w-full flex flex-col">
          <div className="flex items-center w-full gap-4 pb-3 p-1 border-b border-gray-600">
            <span className="flex flex-col ">
              <p className="text-blue-400 text-sm">ยินดีต้อนรับ!</p>
              {user?.roleId < 5 && <p className="text-white">ผู้ดูแลระบบ</p>}
            </span>
            {showResponsive && (
              <button
                onClick={() => setShowResponsive(false)}
                className="absolute top-3 right-5"
              >
                <FaTimes size={28} color="white" />
              </button>
            )}
          </div>
          <label htmlFor="" className="my-4 text-sm text-gray-300">
            เมนู
          </label>
          {menus.map((m, index) => (
            <Link
              onClick={() => setShowResponsive(false)}
              key={index}
              className={`flex items-center gap-3  text-gray-100 transition-all duration-300 ${
                path.split("/")[2] === m.url.split("/")[2] && "bg-blue-500"
              } hover:bg-blue-600 mt-0.5 rounded-lg w-full p-3.5`}
              href={m.url}
            >
              {m.icon}
              {m.title}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3  text-gray-100 transition-all duration-300 bg-red-500 mt-1 rounded-lg w-full p-3.5"
          >
            <FaSignOutAlt size={20} color="white" />
            <p>ออกจากระบบ</p>
          </button>
        </div>

        {/* developby */}
        {/* <div className="w-full items-start flex flex-col mb-2">
          <p className="text-gray-100 text-xs">พัฒนาโดย</p>
          <p className="text-gray-100 text-xs">นายปฐมพร วงสุวรรณ 096-5850195</p>
        </div> */}
      </div>

      {/* responsive button */}
      <button
        onClick={() => setShowResponsive(!showResponsive)}
        className="lg:hidden inline fixed z-[100] bg-white top-3 right-5 p-1.5 rounded-full hover:bg-blue-200"
      >
        <FaBars size={28} />
      </button>
    </>
  );
};
export default Menu;
