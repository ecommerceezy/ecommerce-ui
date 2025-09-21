"use client";
import { envConfig } from "@/config/env-config";
import Loading from "@/layout/loading";
import { popup } from "@/libs/alert-popup";
import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  FaBox,
  FaBoxes,
  FaCheck,
  FaClock,
  FaDollarSign,
  FaDownload,
  FaExclamation,
  FaShoppingCart,
  FaTimes,
  FaTruck,
  FaUserAlt,
  FaUsers,
} from "react-icons/fa";
import { v4 as uuid } from "uuid";
import { NO_IMG_PRODUCT } from "../product/page";
import ExportBtn from "@/components/export-btn";
import { NO_PROFILE } from "@/app/profile/layout";

const Dashboard = () => {
  const [loading, setLoading] = useState(false);
  const [dashboardAvg, setDashboardAvg] = useState(null);
  const fetchDashboardAvg = async () => {
    setLoading(true);

    try {
      const res = await axios.get(envConfig.apiURL + "/admin/dashboard-avg", {
        withCredentials: true,
      });
      if (res.status === 200) {
        setDashboardAvg(res.data);
      }
    } catch (error) {
      console.error(error);
      popup.err();
    } finally {
      setLoading(false);
    }
  };

  const [lastestOrders, setLastestOrder] = useState([]);
  const getLastestOrder = async () => {
    try {
      const res = await axios.get(
        envConfig.apiURL + "/admin/dashboard-lastest-order",
        { withCredentials: true }
      );
      if (res.status === 200) {
        setLastestOrder(res.data);
      }
    } catch (error) {
      console.error(error);
      popup.err();
    }
  };

  const [products, setProduct] = useState([]);
  const getProduct = async () => {
    try {
      const res = await axios.get(
        envConfig.apiURL + "/admin/dashbaord-product",
        { withCredentials: true }
      );
      if (res.status === 200) {
        setProduct(res.data);
      }
    } catch (error) {
      console.error(error);
      popup.err();
    }
  };

  const [members, setMembers] = useState([]);
  const getMembers = async () => {
    try {
      const res = await axios.get(
        envConfig.apiURL + "/admin/dashbaord-members",
        { withCredentials: true }
      );
      if (res.status === 200) {
        setMembers(res.data);
      }
    } catch (error) {
      console.error(error);
      popup.err();
    }
  };

  useEffect(() => {
    fetchDashboardAvg();
    getLastestOrder();
    getProduct();
    getMembers();
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="w-[80%] h-full  overflow-auto p-5 bg-white border border-gray-300">
      <p className="text-2xl font-bold text-blue-500">Dashboard</p>
      <p>ภาพรวมระบบซื้อขายออนไลน์</p>
      <div className=" w-full mt-5 pt-3 border-t border-blue-500 flex flex-col items-start">
        <ExportBtn data={[]} exportname={"รายงานยอดขาย"} />
        <div className="grid lg:grid-cols-4 grid-cols-1 gap-3.5 mt-3 w-full">
          <div className="p-5 rounded-lg border border-gray-300 shadow-md shadow-gray-300 flex flex-col gap-1.5">
            <span className="w-full flex items-center justify-between">
              <p className="text-green-600">ยอดขายปัจจุบัน</p>
              <div className="p-2 rounded-full border border-green-500">
                <FaDollarSign color="green" />
              </div>
            </span>
            <p className="text-xl font-bold">
              ฿{Number(dashboardAvg?.sellPrice).toLocaleString()}
            </p>
            <p>บาท</p>
          </div>
          <div className="p-5 rounded-lg border border-gray-300 shadow-md shadow-gray-300 flex flex-col gap-1.5">
            <span className="w-full flex items-center justify-between">
              <p className="text-orange-600">คำสั่งซื้อใหม่</p>
              <div className="p-2 rounded-full border border-orange-500">
                <FaShoppingCart color="orange" />
              </div>
            </span>
            <p className="text-xl font-bold">
              {Number(dashboardAvg?.allPending).toLocaleString()}
            </p>
            <p>ออเดอร์</p>
          </div>
          <div className="p-5 rounded-lg border border-gray-300 shadow-md shadow-gray-300 flex flex-col gap-1.5">
            <span className="w-full flex items-center justify-between">
              <p className="text-blue-600">สินค้าในสต็อก</p>
              <div className="p-2 rounded-full border border-blue-500">
                <FaBox color="blue" />
              </div>
            </span>
            <p className="text-xl font-bold">
              {Number(dashboardAvg?.allStock).toLocaleString()}
            </p>
            <p>ชิ้น</p>
          </div>
          <div className="p-5 rounded-lg border border-gray-300 shadow-md shadow-gray-300 flex flex-col gap-1.5">
            <span className="w-full flex items-center justify-between">
              <p className="text-purple-600">สมาชิก</p>
              <div className="p-2 rounded-full border border-purple-500">
                <FaUsers color="purple" />
              </div>
            </span>
            <p className="text-xl font-bold">
              {Number(dashboardAvg?.allMembers).toLocaleString()}
            </p>
            <p>คน</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-5 mb-10">
        {/* order */}
        <div className="shadow-lg shadow-gray-300 flex flex-col gap-4 rounded-md border border-gray-300 p-5 h-[500px]">
          <span className="w-full justify-between flex items-center gap-2 pb-3 border-b border-blue-300">
            <div className="flex items-center gap-2">
              <FaShoppingCart color="orange" />
              <p>คำสั่งซื้อล่าสุด</p>
            </div>
            <Link
              href="/admin/orders"
              className="p-2 text-blue-500 hover:underline"
            >
              จัดการ
            </Link>
          </span>

          <div className="w-full flex items-center justify-between text-gray-700">
            <p>เลขที่ออเดอร์</p>
            <p>สถานะ</p>
          </div>

          {lastestOrders.map((o) => (
            <div
              key={uuid()}
              className="flex flex-col gap-2.5 overflow-auto py-2 border-b border-gray-300"
            >
              <div className="hover:bg-blue-50 cursor-pointer p-1.5 w-full flex items-center justify-between">
                <span className="flex flex-col">
                  <p className="text-xs text-orange-500">
                    {o?.bill_id?.slice(0, 30) + "..."}
                  </p>
                  <p className="text-sm">
                    {o?.bill_productList?.toLocaleString()} รายการ{" "}
                    {o?.bill_productPeace?.toLocaleString()} ชิ้น
                  </p>
                </span>
                <span className="flex flex-col items-end">
                  <p className="font-bold ">
                    ฿{o?.bill_price?.toLocaleString()}
                  </p>
                  <span
                    className={`flex flex-col p-1.5 px-2 rounded-md shadow-md lg:flex-row items-center gap-2 text-xs ${
                      o?.status_pm === "pending"
                        ? "text-orange-400 bg-orange-100"
                        : o?.status_pm === "sending"
                        ? "text-purple-500 bg-purple-100"
                        : o?.status_pm === "recevied"
                        ? "text-green-500 bg-green-100"
                        : "text-red-500 bg-red-100"
                    }`}
                  >
                    {o?.status_pm === "pending" ? (
                      <>
                        <FaClock />
                        <p>รอยืนยัน</p>
                      </>
                    ) : o?.status_pm === "sending" ? (
                      <>
                        <FaTruck />
                        <p>กำลังจัดส่ง</p>
                      </>
                    ) : o?.status_pm === "recevied" ? (
                      <>
                        {" "}
                        <FaCheck />
                        <p>ได้รับแล้ว</p>
                      </>
                    ) : (
                      <>
                        <FaTimes />
                        <p>ยกเลิก</p>
                      </>
                    )}
                  </span>
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* product */}
        <div className="shadow-lg shadow-gray-300 flex flex-col gap-4 rounded-md border border-gray-300 p-5 h-[500px] overflow-auto">
          <span className="w-full justify-between flex items-center gap-2 pb-3 border-b border-blue-300">
            <div className="flex items-center gap-2">
              <FaBox color="blue" />
              <p>สินค้า</p>
            </div>
            <Link
              href="/admin/product"
              className="p-2 text-blue-500 hover:underline"
            >
              จัดการ
            </Link>
          </span>
          <div className="w-full flex items-center justify-between text-gray-700">
            <p>สินค้า</p>
            <p>ขายแล้ว</p>
          </div>

          <div key={uuid()} className="flex flex-col gap-2.5 overflow-auto">
            {products.map((p) => (
              <div
                key={uuid()}
                className="w-full flex items-center justify-between p-3 cursor-pointer border-b hover:bg-blue-50 border-gray-200"
              >
                <div className="flex lg:items-center flex-col lg:flex-row gap-2 w-full lg:w-[85%]">
                  <div className="w-[75px] h-[70px] overflow-hidden border border-gray-200">
                    <img
                      src={
                        envConfig?.imgURL + p?.imgs[0]?.url || NO_IMG_PRODUCT
                      }
                      className="w-full h-full object-cover"
                      alt=""
                    />
                  </div>
                  <div className="flex flex-col gap-0.5 w-[85%]">
                    <p className="text-sm">{p?.pro_name}</p>
                    <p className="text-sm text-gray-600">
                      คงเหลือ {p?.pro_number?.toLocaleString()} ชิ้น
                    </p>
                  </div>
                </div>
                <p className="text-blue-600">
                  {p?.sell_count?.toLocaleString()} ชิ้น
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* user */}
        <div className="shadow-lg shadow-gray-300 flex flex-col gap-4 rounded-md border border-gray-300 p-5 h-[500px]">
          <span className="w-full justify-between flex items-center gap-2 pb-3 border-b border-blue-300">
            <div className="flex items-center gap-2">
              <FaUserAlt color="purple" />
              <p>สมาชิกที่สั่งซื้อมากที่สุด</p>
            </div>
            <Link
              href="/admin/memders"
              className="p-2 text-blue-500 hover:underline"
            >
              จัดการ
            </Link>
          </span>
          <div className="w-full flex items-center justify-between text-gray-700">
            <p>ลูกค้า</p>
            <p>ครั้ง</p>
          </div>

          <div className="flex flex-col gap-2.5 overflow-auto">
            {members.map((m) => (
              <div
                key={uuid()}
                className="w-full flex items-center justify-between p-3 cursor-pointer border-b hover:bg-blue-50 border-gray-200"
              >
                <div className="flex lg:items-center flex-col lg:flex-row gap-2 w-full lg:w-[85%]">
                  <div className="w-[55px] h-[50px] rounded-full overflow-hidden border border-gray-200">
                    <img
                      src={
                        m?.profile ? envConfig.imgURL + m?.profile : NO_PROFILE
                      }
                      className="w-full h-full object-cover"
                      alt=""
                    />
                  </div>
                  <div className="flex flex-col gap-0.5 w-[85%]">
                    <p className="text-sm">
                      {m?.title_type}
                      {m?.first_name} {m?.last_name}
                    </p>
                  </div>
                </div>
                <p className="text-purple-600">{m?._count?.bill_orders}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* <div className="w-full transition-all duration-300 hover:bg-gray-100 cursor-pointer border border-gray-300 shadow-sm mt-3 flex flex-col gap-2 rounded-lg border-l-4 border-l-red-500 p-6">
        <span className="flex items-center gap-2">
          <p className="p-1.5 rounded-full border border-red-400">
            <FaExclamation color="red" />
          </p>

          <p>แจ้งเตือน</p>
        </span>
        <p className="text-red-500">มีสินค้า 5 รายการเหลือน้อยกว่า 10 ชิ้น</p>
      </div> */}
    </div>
  );
};
export default Dashboard;
