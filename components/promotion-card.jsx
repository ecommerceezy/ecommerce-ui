"use client";
import Link from "next/link";
import {
  FaCalendarAlt,
  FaTag,
  FaTrash,
  FaEdit,
  FaEye,
  FaBox,
} from "react-icons/fa";

export default function PromotionCard({
  id,
  name,
  start_date,
  end_date,
  discount,
  _count,
  description,
  onDelete,
  onView,
}) {
  const displayStatus = () => {
    const today = new Date();
    const start = new Date(start_date);
    const end = new Date(end_date);
    if (end - today < 5) {
      return 3;
    } else if (today >= end) {
      return 2;
    } else if (today >= start) {
      return 1;
    }
  };

  return (
    <div className="cursor-pointer hover:shadow-gray-400 duration-150 bg-white border border-gray-200 rounded-xl shadow-sm p-4 transition hover:shadow-md">
      {/* ส่วนหัว */}
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="text-base font-semibold text-gray-800">{name}</h3>
        </div>

        <div className="flex gap-2 text-gray-500">
          <button onClick={onView} className="hover:text-yellow-500">
            <FaEye size={15} />
          </button>
          <Link href={`/admin/promotion/${id}`} className="hover:text-blue-500">
            <FaEdit size={15} />
          </Link>
          <button onClick={onDelete} className="hover:text-red-500">
            <FaTrash size={15} />
          </button>
        </div>
      </div>

      {/* สถานะ */}
      <span
        className={`inline-block ${
          displayStatus() < 2
            ? "bg-green-500"
            : displayStatus() > 2
            ? "bg-red-500"
            : "bg-orange-500"
        } text-white font-medium px-2.5 py-0.5 rounded-full mb-3 `}
      >
        {displayStatus() < 2
          ? "กำลังใช้งาน"
          : displayStatus() > 2
          ? "หมดอายุ"
          : "ใกล้หมดอายุ"}
      </span>

      {/* ส่วนลด */}
      <div className="flex items-center text-green-600 text-sm font-medium mb-2">
        <FaTag className="mr-1" />
        ลด {discount} %
      </div>

      {/* วันที่ */}
      <div className="flex items-center text-orange-500 text-sm mb-1">
        <FaCalendarAlt className="mr-2" />
        {new Date(start_date).toLocaleDateString("th-TH")} -{" "}
        {new Date(end_date).toLocaleDateString("th-TH")}
      </div>

      {/* จำนวนสินค้า */}
      <div className="flex items-center text-blue-600 text-sm">
        <FaBox className="mr-2" color="blue" />
        {_count?.products} สินค้า
      </div>

      {description && (
        <p className="p-2 text-sm bg-blue-50 shadow-sm mt-1.5">
          หมายเหตุ : {description}
        </p>
      )}
    </div>
  );
}
