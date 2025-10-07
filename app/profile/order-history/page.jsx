"use client";

import Loader from "@/components/loader";
import OrderCard from "@/components/order-card";
import { envConfig } from "@/config/env-config";
import { popup } from "@/libs/alert-popup";
import axios from "axios";
import { debounce } from "lodash";
import { useEffect, useMemo, useState } from "react";
import { FaFolderOpen, FaList, FaSearch } from "react-icons/fa";
import { v4 as uuid } from "uuid";

const Page = () => {
  const [orderStatus, setOrderStatus] = useState("all");
  const [sort, setSort] = useState(JSON.stringify({ createdAt: "desc" }));
  const [search, setSearch] = useState("");

  const menus = [
    {
      id: 1,
      title: "ทั้งหมด",
      status: "all",
    },
    {
      id: 2,
      title: "รอยืนยัน",
      status: "pending",
    },
    {
      id: 3,
      title: "จัดส่ง",
      status: "sending",
    },
    {
      id: 4,
      title: "ได้รับแล้ว",
      status: "recevied",
    },
    {
      id: 5,
      title: "ยกเลิก",
      status: "cancel",
    },
  ];

  const [orderHistoryList, setOrderHostoryList] = useState([]);
  const [loading, setLoading] = useState(false);
  const fetchOrderHistory = async (status, sort, search) => {
    setLoading(true);
    try {
      const res = await axios.get(
        envConfig.apiURL + "/user/get-order-history",
        {
          withCredentials: true,
          params: {
            status,
            sort,
            search,
          },
        }
      );
      if (res.status === 200) {
        setOrderHostoryList(res.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const debounceSearch = useMemo(
    () => debounce(fetchOrderHistory, 700),
    [fetchOrderHistory]
  );

  useEffect(() => {
    debounceSearch(orderStatus, sort, search);
  }, [orderStatus, sort, search]);

  const handleUpdateOrderStatus = async (status, orderId) => {
    const { isConfirmed } = await popup.confirmPopUp(
      status === "cancel"
        ? "ยกเลิกคำสั่งซื้อนี้"
        : status === "recevied"
        ? "ฉันได้รับสินค้าแล้ว"
        : status === "return_pending"
        ? "ยืนยันส่งคำขอคืนเงิน"
        : "ได้รับเงินคืนแล้ว",
      status === "cancel"
        ? "ต้องการยกเลิกคำสั่งซื้อนี้หรือไม่"
        : status === "recevied"
        ? "กดยืนยันหากคุณได้รับสินค้าแล้ว"
        : status === "return_pending"
        ? "คุณต้องการส่งคำขอคืนเงินใช่หรือไม่"
        : "ฉันได้ตรวจสอบและได้รับเงินคืนแล้ว",
      status === "cancel" ? "ยกเลิกคำสั่งซื้อ" : "ยืนยัน"
    );
    if (!isConfirmed) return;

    setLoading(true);
    try {
      const res = await axios.put(
        envConfig.apiURL + `/user/update-order-status`,
        { status, orderId },
        { withCredentials: true }
      );
      if (res.status === 200) {
        popup.success(
          status === "cancel"
            ? "ยกเลิกออเดอร์แล้ว"
            : status === "recevied"
            ? "ขอบคุณที่ไว้ใจใช้บริการของเรา"
            : status === "return_pending"
            ? "ระบบได้รับคำขอคืนเงินของคุณแล้ว จะทำการตรวจสอบและติดต่อกลับผ่านอีเมลโดยเร็วที่สุด"
            : "ขอบคุณที่ไว้ใจใช้บริการของเรา"
        );
        fetchOrderHistory(orderStatus, sort, search);
      }
    } catch (error) {
      console.error(error);
      popup.err();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-5">
      <div className="w-full flex items-center rounded-tr-lg overflow-hidden border-b border-gray-300">
        {menus.map((m, index) => (
          <button
            key={m.id}
            onClick={() => setOrderStatus(m.status)}
            className={`${
              orderStatus === m.status
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-700"
            } p-3 hover:text-blue-500 flex-1 bg-white text-xs lg:text-sm ${
              index === 0
                ? "rounded-tl-lg"
                : index === menus.length - 1
                ? "rounded-tr-lg"
                : ""
            }`}
          >
            {m.title}
          </button>
        ))}
      </div>

      {/* search */}
      <div className="w-full  justify-between flex items-center">
        <div className="w-[80%] lg:w-1/3 rounded-md border border-gray-400 p-2.5 px-3 flex items-center gap-2">
          <FaSearch />
          <input
            type="text"
            className="w-[90%] text-xs lg:text-[1rem]"
            placeholder="พิมพ์ค้นหาการสั่งซื้อของฉัน"
            name=""
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            id=""
          />
        </div>

        <div title="เรียง" className="relative inline-block">
          <select
            onChange={(e) => setSort(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          >
            <option
              value={JSON.stringify({ createdAt: "desc" })}
              className="text-sm"
            >
              คำสั่งซื้อล่าสุด
            </option>
            <option
              value={JSON.stringify({ createdAt: "asc" })}
              className="text-sm"
            >
              คำสั่งซื้อเก่าที่สุด
            </option>
          </select>
          <label
            htmlFor="select-row"
            className="p-2 px-3.5 rounded-lg border border-blue-500 text-white bg-blue-500 shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <FaList size={17} />
            <p className="text-sm hidden lg:inline-flex">เรียง</p>
          </label>
        </div>
      </div>

      <div className="w-full p-3 bg-gray-100 pt-5 mt-3 border-t border-gray-300 flex flex-col gap-3">
        {loading ? (
          <div className="w-full flex flex-col items-center justify-between py-10">
            <Loader />
            <p>กำลังโหลด...</p>
          </div>
        ) : orderHistoryList.length > 0 ? (
          orderHistoryList.map((o) => (
            <OrderCard
              updateOrderStatus={handleUpdateOrderStatus}
              key={uuid()}
              {...o}
            />
          ))
        ) : (
          <div className="w-full flex flex-col items-center gap-1.5 text-gray-600 justify-between py-10">
            <FaFolderOpen />
            <p>ไม่พบการสั่งซื้อ</p>
          </div>
        )}
      </div>
    </div>
  );
};
export default Page;
