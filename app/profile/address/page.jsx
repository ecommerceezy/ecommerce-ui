"use client";
import Loader from "@/components/loader";
import { envConfig } from "@/config/env-config";
import useGetSeesion from "@/hooks/useGetSession";
import Loading from "@/layout/loading";
import { popup } from "@/libs/alert-popup";
import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaCheck, FaEdit, FaPlus, FaTrash } from "react-icons/fa";

const Address = () => {
  const { user, checking } = useGetSeesion();
  const [address, setAddress] = useState(null);

  const [geting, setGeting] = useState(false);
  const getUserAddress = async () => {
    setGeting(true);
    try {
      const res = await axios.get(envConfig.apiURL + "/user/get-address", {
        withCredentials: true,
      });
      if (res.status === 200) {
        setAddress(res.data);
      }
    } catch (error) {
      console.error(error);
      popup.err();
    } finally {
      setGeting(false);
    }
  };

  const [updating, setUpdating] = useState(false);
  const handleUseAddress = async (address) => {
    const { district: amphure, sub_distric: tambon, ...rest } = address;
    if (address?.is_using) return;

    const { isConfirmed } = await popup.confirmPopUp(
      "คุณต้องการใช้ที่อยู่นี้หรือไม่?",
      "เลือกใช้ที่อยู่นี้เป็นที่อยู่จัดส่ง",
      "ยืนยัน"
    );
    if (!isConfirmed) return;

    setUpdating(true);
    try {
      const res = await axios.post(
        envConfig.apiURL + `/user/update-address/${address?.id}`,
        {
          amphure,
          tambon,
          ...rest,
          is_using: true,
        },
        {
          withCredentials: true,
        }
      );
      if (res.data.err) {
        popup.err(res.data.err);
        return;
      }
      if (res.status === 200) {
        getUserAddress();
        popup.success("เปลี่ยนที่อยู่จัดส่งเรียบร้อย");
      }
    } catch (error) {
      console.error(error);
      popup.err();
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    if (checking) return;

    getUserAddress();
  }, [user]);

  if (checking || geting) return <Loading />;

  return (
    <div className="w-full">
      {" "}
      <div className="flex items-center pb-3 border-b border-gray-300 justify-between w-full">
        <div className="flex flex-col">
          <p className=" text-gray-700">ที่อยู่</p>
          <p className="text-gray-600 text-sm">
            เพิ่มและแก้ไข ข้อมูลที่อยู่จัดส่งหรือที่อยู่ที่ติดต่อได้
          </p>
        </div>
        <Link
          href="/profile/address/0"
          className="p-2.5 px-3 text-sm text-white bg-blue-500 flex items-center gap-2 rounded-md shadow-md"
        >
          <FaPlus />
          <p>เพิ่มที่อยู่</p>
        </Link>
      </div>
      <div className="w-full mt-3 flex flex-col">
        {updating ? (
          <div className="w-full py-10 flex flex-col items-center gap-1">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-white rounded-full animate-spin" />
            <p>กำลังโหลด..</p>
          </div>
        ) : address?.length < 1 ? (
          <div className=""></div>
        ) : (
          address?.map((a) => (
            <div
              key={a?.id}
              className="relative py-10 border-b cursor-pointer border-gray-300 flex items-center gap-5"
            >
              {a?.is_using && (
                <span className="p-2 absolute top-1 left-0 text-xs text-green-600 bg-green-100 rounded-lg shadow-sm">
                  ใช้งานอยู่
                </span>
              )}
              <input
                type="radio"
                onChange={() => handleUseAddress(a)}
                checked={a?.is_using}
                name="using"
              />{" "}
              <span className="w-[80%] flex flex-col gap-0.5">
                <p className="w-full  break-words">
                  {`
                ${a?.address} ${a?.sub_district} ${a?.district} จ.${a?.province} ${a?.zipcode}
                `}
                </p>
                <p className="text-sm text-gray-500">
                  เบอร์โทรศัพท์ : {a?.phone}
                </p>
              </span>
              <div className="flex items-center gap-5">
                <Link href={`/profile/address/${a?.id}`}>
                  <FaEdit color="blue" className="" />
                </Link>

                <FaTrash color="red" className="cursor-pointer" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
export default Address;
