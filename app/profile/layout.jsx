"use client";
import { envConfig } from "@/config/env-config";
import useGetSeesion from "@/hooks/useGetSession";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  FaAddressBook,
  FaCity,
  FaIdCard,
  FaReceipt,
  FaUser,
} from "react-icons/fa";

export const NO_PROFILE =
  "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png";

const Layout = ({ children }) => {
  const { user, checking } = useGetSeesion();
  const router = useRouter();
  const pathName = usePathname();
  const menus = [
    {
      id: 1,
      icon: <FaUser color="blue" />,
      url: "/profile/user",
      title: "ข้อมูลส่วนตัว",
    },
    {
      id: 3,
      icon: <FaCity color="orange" />,
      url: "/profile/address",
      title: "ที่อยู่",
    },
    {
      id: 2,
      icon: <FaReceipt color="green" />,
      url: "/profile/order-history",
      title: "การซื้อของฉัน",
    },
    {
      id: 4,
      icon: <FaIdCard color="purple" />,
      url: "/profile/account",
      title: "บัญชีของฉัน",
    },
  ];

  useEffect(() => {
    if (checking) return;

    const timeout = setTimeout(() => {
      if (!user?.user_id) {
        router.push("/");
      }
    }, 1100);

    return () => clearTimeout(timeout);
  }, [user]);

  return (
    <div className="w-full mt-[19rem]  lg:w-[72%] flex flex-col lg:flex-row lg:mt-40">
      <div className="flex flex-col w-full lg:w-[22%] pr-3 border-r border-gray-300">
        {/* profile */}
        <div className="flex justify-center lg:justify-start items-center w-full gap-3.5 pb-3 mb-3 border-b border-gray-300">
          <div className="w-[58px] h-14  rounded-full border border-gray-300 overflow-hidden">
            <img
              src={
                user?.profile ? envConfig.imgURL + user?.profile : NO_PROFILE
              }
              className="w-full h-full object-cover"
              alt=""
            />
          </div>
          <div className="flex flex-col gap-0.5">
            <p className=" text-blue-500">ยินดีต้อนรับ</p>
            <p className="font-bold">ปฐมพร</p>
          </div>
        </div>

        {/* menu */}
        {menus.map((m) => (
          <button
            onClick={() => router.push(m.url)}
            key={m.id}
            className={`${
              pathName.split("/")[2] === m.url.split("/")[2]
                ? "text-blue-500"
                : "text-gray-700"
            } text-[0.9rem]  p-3 flex items-center gap-3 hover:text-blue-500`}
          >
            {m.icon}
            <p>{m.title}</p>
          </button>
        ))}
      </div>
      <div className="lg:w-[78%] w-full h-auto bg-white p-5">{children}</div>
    </div>
  );
};
export default Layout;
