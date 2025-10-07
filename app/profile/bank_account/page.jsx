"use client";

import { Select } from "@/components/react-select";
import { envConfig } from "@/config/env-config";
import { popup } from "@/libs/alert-popup";
import { isValidThaiBankAccount } from "@/libs/validate-input";
import axios from "axios";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { FaCheck } from "react-icons/fa";

const bankOptions = [
  { value: "ธนาคารกรุงไทย", label: "ธนาคารกรุงไทย" },
  { value: "ธนาคารกรุงเทพ", label: "ธนาคารกรุงเทพ" },
  { value: "ธนาคารกสิกรไทย", label: "ธนาคารกสิกรไทย" },
  { value: "ธนาคารไทยพาณิชย์", label: "ธนาคารไทยพาณิชย์" },
  { value: "ธนาคารทหารไทยธนชาต", label: "ธนาคารทหารไทยธนชาต" },
  { value: "ธนาคารกรุงศรีอยุธยา", label: "ธนาคารกรุงศรีอยุธยา" },
  { value: "ธนาคารออมสิน", label: "ธนาคารออมสิน" },
  {
    value: "ธนาคารเพื่อการเกษตรและสหกรณ์การเกษตร",
    label: "ธนาคารเพื่อการเกษตรและสหกรณ์การเกษตร",
  },
  { value: "ธนาคารซีไอเอ็มบีไทย", label: "ธนาคารซีไอเอ็มบีไทย" },
  { value: "ธนาคารยูโอบี", label: "ธนาคารยูโอบี" },
  { value: "ธนาคารทิสโก้", label: "ธนาคารทิสโก้" },
  { value: "ธนาคารเกียรตินาคินภัทร", label: "ธนาคารเกียรตินาคินภัทร" },
  { value: "ธนาคารแลนด์แอนด์เฮ้าส์", label: "ธนาคารแลนด์แอนด์เฮ้าส์" },
  { value: "ธนาคารอิสลามแห่งประเทศไทย", label: "ธนาคารอิสลามแห่งประเทศไทย" },
  {
    value: "ธนาคารพัฒนาวิสาหกิจขนาดกลางและขนาดย่อม",
    label: "ธนาคารพัฒนาวิสาหกิจขนาดกลางและขนาดย่อม",
  },
  {
    value: "ธนาคารเพื่อการส่งออกและนำเข้าแห่งประเทศไทย",
    label: "ธนาคารเพื่อการส่งออกและนำเข้าแห่งประเทศไทย",
  },
];

const Page = () => {
  const {
    handleSubmit,
    formState: { errors },
    control,
    reset,
  } = useForm({
    defaultValues: {
      bank_number: "",
      bank_name: "",
      bank_owner: "",
    },
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  // ดึงข้อมูลบัญชีธนาคารของผู้ใช้มาแสดง

  const fetchBankData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(envConfig.apiURL + "/user/get-bank", {
        withCredentials: true,
      });
      if (res.status === 200) {
        reset({
          bank_name: res.data?.bank_name || "",
          bank_number: res.data?.bank_number || "",
          bank_owner: res.data?.bank_owner || "",
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const res = await axios.put(
        envConfig.apiURL + "/user/update-bank",
        data,
        { withCredentials: true }
      );
      if (res.status === 200) {
        fetchBankData();
        popup.success("บันทึกข้อมูลบัญชีธนาคารสำเร็จ");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchBankData();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-[50vh] flex justify-center items-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col ">
      <p className="">ข้อมูลบัญชีธนาคารของคุณ</p>
      <p className="text-gray-600 text-sm mt-0.5 pb-3 border-b border-gray-300 w-full">
        จัดการข้อมูลบัญชีธนาคารของคุณ
        ในกรณีที่ต้องการขอคืนเงินหากคำสั่งซื้อถูกยกเลิก
        <small className="text-red-500 ml-2">
          *ข้อมูลบัญชีของคุณจะไม่ถูกเผยแพร่สู่บุคคลที่สามเป็นอันขาด
        </small>
      </p>
      {/* bank_name */}
      <div className="mt-8 lg:ml-5 w-full flex lg:flex-row flex-col gap-1 lg:items-center">
        <p className="text-sm text-gray-800 w-[25%]">ธนาคาร</p>
        <div className="flex flex-col gap-1 w-full] lg:w-[40%]">
          <Controller
            name="bank_name"
            rules={{ required: "กรุณาระบุธนาคารของคุณ" }}
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                value={bankOptions.find((c) => c.value === field.value)}
                onChange={(val) => field.onChange(val.value)}
                options={bankOptions}
                placeholder="เลือกธนาคารของคุณ"
                className="text-[0.9rem]"
              />
            )}
          />
          {errors.bank_name && (
            <small className="mt-1 text-sm text-red-500">
              {errors.bank_name.message}
            </small>
          )}
        </div>
      </div>
      {/* bank_name */}
      <div className="mt-8 lg:ml-5 w-full flex lg:flex-row flex-col gap-1 lg:items-center">
        <p className="text-sm text-gray-800 w-[25%]">เลขที่บัญชี</p>
        <div className="flex flex-col gap-1 w-full] lg:w-[40%]">
          <Controller
            name="bank_number"
            rules={{
              required: "กรุณาระบุเลขที่บัญชีธนาคารของคุณ",
              validate: (value) => {
                if (!isValidThaiBankAccount(value))
                  return "เลขที่บัญชีธนาคารไม่ถูกต้อง";

                if (!/[0-9]/.test(value))
                  return "เลขที่บัญชีต้องมีความยาวอย่างน้อย 10 ตัว";
              },
            }}
            control={control}
            render={({ field }) => (
              <input
                value={field || ""}
                {...field}
                type="text"
                className="text-[0.9rem] p-2 px-3 text-gray-800 border border-gray-400 rounded-md"
                placeholder="เลขที่บัญชีธนาคารของคุณ"
              />
            )}
          />
          {errors.bank_number && (
            <small className="mt-1 text-sm text-red-500">
              {errors.bank_number.message}
            </small>
          )}
        </div>
      </div>
      {/* bank_owner */}
      <div className="mt-8 lg:ml-5 w-full flex lg:flex-row flex-col gap-1 lg:items-center">
        <p className="text-sm text-gray-800 lg:w-[25%]">
          ชื่อผู้ถือบัญชีธนาคารของคุณ
        </p>
        <div className="flex flex-col gap-1 w-full] lg:w-[40%]">
          <Controller
            name="bank_owner"
            rules={{
              required: "กรุณาระบุชื่อผู้ถือบัญชีธนาคารของคุณ",
            }}
            control={control}
            render={({ field }) => (
              <input
                value={field || ""}
                {...field}
                type="text"
                className=" text-[0.9rem] p-2 px-3 text-gray-800 border border-gray-400 rounded-md"
                placeholder="ชื่อผู้ถือบัญชีธนาคารของคุณ"
              />
            )}
          />
          {errors.bank_owner && (
            <small className="mt-1 text-sm text-red-500">
              {errors.bank_owner.message}
            </small>
          )}
        </div>
      </div>
      <p className="mt-10 lg:ml-5 text-red-500 text-sm">
        *โปรดตรวจสอบความถูกต้องของข้อมูลก่อนบันทึก
      </p>
      <button
        onClick={handleSubmit(onSubmit)}
        disabled={saving}
        className="mt-3 w-fit lg:ml-5 p-2.5 rounded-md hover:bg-blue-600 text-white bg-blue-500 flex gap-2 items-center shadow-md"
      >
        {saving ? (
          <div className="w-5 h-5 border-4  border-white border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <>
            <FaCheck />
            <p>บันทึก</p>
          </>
        )}
      </button>
    </div>
  );
};
export default Page;
