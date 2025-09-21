"use client";
import { NO_IMG_PRODUCT } from "@/app/admin/product/page";
import { envConfig } from "@/config/env-config";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaCarAlt, FaCheck, FaClock, FaTimes, FaTruck } from "react-icons/fa";

const OrderCard = ({
  status_pm,
  bill_id,
  bill_productList,
  bill_productPeace,
  order_details,
  bill_totalamount,
  pm_method,
  updateOrderStatus,
  bill_date,
}) => {
  const router = useRouter();

  const handleDetail = () => {
    router.push(`/profile/order-history/detail/${bill_id}`);
  };

  return (
    <div
      onClick={handleDetail}
      className="cursor-pointer transition-all duration-300 hover:shadow-md hover:shadow-gray-400 w-full flex flex-col bg-white px-5 rounded-md border border-gray-100"
    >
      <span className="w-full flex p-2 lg:items-center flex-col lg:flex-row gap-2 justify-between">
        <p className="text-sm mt-2 text-blue-600">รหัส : {bill_id}</p>
        <p className="text-sm text-gray-600">
          วันที่สั่งซื้อ : {new Date(bill_date).toLocaleDateString("th-TH")}
        </p>
      </span>
      <div className="w-full flex justify-between p-3 border-b border-gray-300">
        <span className="flex items-center gap-2">
          <p className="text-sm">
            สินค้าทั้งหมด {Number(bill_productList).toLocaleString()} รายการ{" "}
            {Number(bill_productPeace).toLocaleString()} ชิ้น :
          </p>
          <p className="text-xs p-1 rounded-md shadow-md bg-blue-100 text-blue-600">
            {pm_method}
          </p>
        </span>

        <span
          className={`flex flex-col lg:flex-row items-center gap-2 text-sm ${
            status_pm === "pending"
              ? "text-orange-400"
              : status_pm === "sending"
              ? "text-purple-500"
              : status_pm === "recevied"
              ? "text-green-500"
              : "text-red-500"
          }`}
        >
          {status_pm === "pending" ? (
            <>
              <FaClock />
              <p>รอยืนยัน</p>
            </>
          ) : status_pm === "sending" ? (
            <>
              <FaTruck />
              <p>กำลังจัดส่ง</p>
            </>
          ) : status_pm === "recevied" ? (
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
      </div>
      <span className="flex flex-col lg:flex-row items-center justify-between p-3 border-b border-gray-300">
        <div className="lg:w-[80px] w-full h-[80px] border border-gray-100">
          <img
            src={
              envConfig.imgURL + order_details[0]?.product?.imgs[0]?.url ||
              NO_IMG_PRODUCT
            }
            className="w-full h-full object-cover"
            alt=""
          />
        </div>
        <div className="lg:w-[78%] w-full mt-2 lg:mt-0 flex flex-col h-[80px] gap-1">
          <p className="font-bold">{order_details[0]?.product?.pro_name}</p>
          <p className="text-gray-700">
            {order_details[0]?.product?.categories
              ?.map((c) => c?.name)
              ?.join(",")}
          </p>
          <p>x{Number(order_details[0]?.quantity).toLocaleString()}</p>
        </div>

        <span className="flex items-center justify-end gap-2 w-full lg:w-[10%]">
          <p className="font-bold text-orange-500">
            ฿{Number(order_details[0]?.total_amount).toLocaleString()}
          </p>
        </span>
      </span>

      <div className="p-5 w-full flex flex-col items-end bg-gradient-to-r from-teal-50 to-cyan-50">
        <span className="flex items-center gap-1">
          <p className="text-gray-600 text-sm">รวมการสังซื้อ : </p>
          <p className="text-xl font-bold text-orange-600">
            ฿{Number(bill_totalamount).toLocaleString()}
          </p>
        </span>
        <span className="flex flex-col lg:flex-row lg:items-center justify-between w-full mt-2.5">
          <p className="text-gray-700">ดำเนินการ :</p>
          <div className="flex items-center gap-2.5 text-sm lg:text-[1rem]">
            {status_pm === "pending" ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  updateOrderStatus("cancel", bill_id);
                }}
                className="p-3 hover:bg-red-600 px-5 bg-red-500 text-white border border-gray-200"
              >
                ยกเลิกคำสั่งซื้อ
              </button>
            ) : status_pm === "sending" ? (
              <>
                {" "}
                <button className="p-3  px-5 bg-gray-200 border border-gray-200">
                  ออเดอร์อยู่ระหว่างการจัดส่งไม่สามารถยกเลิกได้
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    updateOrderStatus("recevied", bill_id);
                  }}
                  className="p-3 hover:bg-green-600 px-5 bg-green-500 text-white border border-gray-200"
                >
                  ได้รับสินค้าแล้ว
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/search"
                  className="p-3 hover:bg-blue-600 px-5 bg-blue-500 text-white border border-gray-200"
                >
                  ซื้ออีกครั้ง
                </Link>
              </>
            )}
          </div>
        </span>
      </div>
    </div>
  );
};
export default OrderCard;
