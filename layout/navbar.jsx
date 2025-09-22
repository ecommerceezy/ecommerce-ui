"use client";
import { envConfig } from "@/config/env-config";
import useGetSeesion from "@/hooks/useGetSession";
import { popup } from "@/libs/alert-popup";
import axios from "axios";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  FaDoorOpen,
  FaHistory,
  FaQuestion,
  FaQuestionCircle,
  FaSearch,
  FaShoppingBag,
  FaShoppingCart,
  FaSignInAlt,
  FaSignOutAlt,
  FaUserCircle,
  FaUserPlus,
} from "react-icons/fa";
import { MdHistory, MdReceiptLong } from "react-icons/md";
import Loading from "./loading";
import { useAppContext } from "@/context/app-context";

const Navbar = () => {
  const pathName = usePathname();
  const { user, checking } = useGetSeesion();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [categories, setCategories] = useState([]);

  const { cart, setCart, setSearchCtgs, search, setSearch } = useAppContext();

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem("cart"));
    if (!cart) return;

    setCart(cart?.length);
  }, []);

  const fetchCTG = async () => {
    setLoading(true);
    try {
      const res = await axios.get(envConfig.apiURL + "/guest/get-ctg");
      if (res.status === 200) {
        setCategories(res.data);
      }
    } catch (error) {
      console.error(error);
      popup.err();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCTG();
  }, []);

  const pathNotShowNav = [
    "/auth/sign-up",
    "/auth/sign-in",
    "/auth/forgot-password",
  ];

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

  const handleCtgClick = (id) => {
    setSearchCtgs((prev) =>
      prev.find((p) => p === id) ? prev.filter((p) => p !== id) : [id, ...prev]
    );
    router.push("/search");
  };

  useEffect(() => {
    if (checking) return;

    console.log("🚀 ~ Navbar ~ user?.roleId:", user?.roleId)
    if (user?.roleId > 1 && pathName.split("/")[1] !== "admin" ) {
      router.push("/admin/dashboard");
    }
  }, [user]);

  useEffect(() => {
    if(pathName !== "/search"){
      setSearchCtgs([]);
    }
  },[pathName]);

  if (loading) return <Loading />;
  if (pathNotShowNav.includes(pathName) || pathName.split("/")[1] === "admin")
    return null;
  return (
    <nav
      className={`shadow-sm shadow-blue-200 z-50 w-full ${
        pathName !== "/cart" && pathName !== "/checkout" && "lg:px-5"
      } flex flex-col gap-1.5 lg:items-center justify-center fixed top-0 bg-gradient-to-b from-blue-600 to-sky-500`}
    >
      {!checking && (
        <div className="lg:w-4/5 py-3 w-full px-10 text-sm flex flex-col lg:flex-row lg:items-center gap-2 justify-between text-white">
          <Link
            href="#"
            className="flex items-center gap-1 text-white mr-3 hover:text-gray-200"
          >
            <FaQuestionCircle className="hidden lg:inline" />
            <p>ช่วยเหลือ</p>
          </Link>
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Link
                  href="/profile/user"
                  className="flex items-center gap-2 text-white pr-3 hover:text-gray-200 border-r border-gray-50"
                >
                  <FaUserCircle className="hidden lg:inline" />
                  <p>โปรไฟล์</p>
                </Link>
                <Link
                  href="/profile/order-history"
                  className="flex items-center gap-2 text-white pr-3 hover:text-gray-200 "
                >
                  <MdReceiptLong size={18} className="hidden lg:inline" />
                  <p>ประวัติการสั่งซื้อ</p>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-white pl-3 border-l border-gray-50 hover:text-red-500 hover:bg-gray-50 hover:p-1.5 hover:justify-center hover:rounded-md "
                >
                  <FaSignOutAlt className="hidden lg:inline" />
                  <p>ออกจากระบบ</p>
                </button>
              </>
            ) : (
              <>
                {" "}
                <Link
                  href="/auth/sign-up"
                  className="flex items-center gap-1 text-white pr-3 hover:text-gray-200 border-r border-gray-50"
                >
                  <FaUserPlus className="hidden lg:inline" />
                  <p>สมัครสมาชิก</p>
                </Link>
                <Link
                  href="/auth/sign-in"
                  className="flex items-center gap-1 text-white pr-3 hover:text-gray-200 "
                >
                  <FaSignInAlt className="hidden lg:inline" />
                  <p>เข้าสู่ระบบ</p>
                </Link>
              </>
            )}
          </div>
        </div>
      )}

      {pathName === "/cart" || pathName === "/checkout" ? (
        <div className="w-full mt-1.5 p-5 bg-white flex items-center justify-center  border-b-2 border-gray-200">
          <div className="lg:w-4/5 flex items-center justify-start gap-5 px-5">
            <Link href="/">
              {" "}
              <FaShoppingBag size={40} color="blue" />
            </Link>

            <p className="text-xl font-bold text-blue-500 pl-5 border-l-2 border-blue-500">
              {pathName === "/cart" ? "รถเข็น" : "ทำการสั่งซื้อ"}
            </p>
          </div>
        </div>
      ) : (
        <div className="lg:w-4/5 w-full mt-1.5 flex flex-col lg:flex-row px-10 pb-3 lg:items-center gap-5">
          {/* logo */}
          <Link href="/" className="flex items-center gap-4 text-white">
            <FaShoppingBag size={60} />
            <div className="flex flex-col">
              <p className="text-3xl font-bold">EZY</p>
              <p className="text-lg">e-commerce</p>
            </div>
          </Link>

          <div className="lg:w-[72%] flex flex-col gap-1.5">
            {" "}
            <div className="flex p-1 border rounded-md bg-white border-gray-400 shadow-sm w-full">
              <input
                type="text"
                className="w-[95%] text-sm pl-2"
                placeholder="พิมพ์ค้นหาสินค้าที่คุณต้องการ"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button
                onClick={() => {
                  if (!search) {
                    return popup.err("ไม่พบการค้นหา");
                  }
                  router.push("/search");
                }}
                className="p-2.5 px-3.5 hover:bg-blue-600 bg-blue-500 text-white rounded-sm flex items-center gap-2"
              >
                <FaSearch />
                <p>ค้นหา</p>
              </button>
            </div>
            <span className="flex items-center text-xs gap-2.5">
              <Link
                href="/search"
                className="text-gray-50 hover:text-gray-300 border-r pr-2.5 border-r-gray-50"
              >
                สินค้าแนะนำ
              </Link>
              {categories.slice(0, 8).map((c) => (
                <button
                  onClick={() => handleCtgClick(c?.id)}
                  key={c?.id}
                  className="text-gray-50 hover:text-gray-300 border-r pr-2.5 border-r-gray-50"
                >
                  {c?.name}
                </button>
              ))}
            </span>
          </div>

          <Link href="/cart" className="text-white ml- relative">
            {Number(cart) > 0 && (
              <span className="absolute top-[-0.5rem] right-[-0.8rem] bg-red-500 rounded-full p-0.5 px-1.5 text-xs text-white">
                {Number(cart).toLocaleString()}
              </span>
            )}

            <FaShoppingCart size={30} />
          </Link>
        </div>
      )}
    </nav>
  );
};
export default Navbar;
