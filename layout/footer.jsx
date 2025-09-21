"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaCopyright,
  FaEnvelope,
  FaFacebook,
  FaFontAwesome,
  FaLine,
  FaShoppingBag,
} from "react-icons/fa";

const Footer = () => {
  const pathName = usePathname();

  if(pathName.split("/")[1] === "admin")return null;

  return (
    <div className="w-full flex flex-col items-center gap-5 bg-white mt-24 border-t-4 border-blue-500 pb-8">
      <div className="w-full lg:flex lg:flex-row-reverse grid grid-cols-2 items-start gap-y-5 justify-center lg:gap-24 p-10 pt-12">
        <div className="flex flex-col gap-1">
          <p className="font-bold text-sm">ศูนย์ช่วยเหลือ</p>

          <Link href="/" className="text-sm mt-3 hover:underline text-gray-700">
            คู่มือการใช้งาน
          </Link>
          <Link href="/" className="text-sm mt-3 hover:underline text-gray-700">
            ข่อตกลงการใช้บริการ
          </Link>
          <Link href="/" className="text-sm mt-3 hover:underline text-gray-700">
            คำถามที่พบบ่อย
          </Link>
        </div>
        <div className="flex flex-col gap-1">
          <p className="font-bold text-sm">เกี่ยวกับเรา</p>

          <Link href="/" className="text-sm mt-3 hover:underline text-gray-700">
            ติดต่อเรา
          </Link>
          <Link href="/" className="text-sm mt-3 hover:underline text-gray-700">
            ข่อตกลงการใช้บริการ
          </Link>
        </div>
        <div className="flex flex-col gap-1">
          <p className="font-bold text-sm">ติดตามเรา</p>

          <Link
            href="/"
            className="flex items-center gap-2 text-sm mt-3 hover:underline text-gray-700"
          >
            <FaFacebook color="blue" />
            <p>facebook</p>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 text-sm mt-3 hover:underline text-gray-700"
          >
            <FaLine color="green" />
            <p>Line</p>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 text-sm mt-3 hover:underline text-gray-700"
          >
            <FaEnvelope color="red" />
            <p>Email</p>
          </Link>
        </div>

        <div className="flex items-center gap-5">
          <FaShoppingBag size={80} color="blue" />
          <div className="flex flex-col gap-1">
            <p className="text-3xl font-bold">EZY</p>
            <p className="">e-commerce</p>
          </div>
        </div>
      </div>

      {/* copy rigth */}
      <div className="pt-5 w-[60%] text-gray-600 flex items-center justify-center gap-2 border-t border-gray-300">
        <FaCopyright />
        <p>2025.</p>
        <p>All Rights Reserved</p>
      </div>
    </div>
  );
};
export default Footer;
