"use client";
import Loader from "@/components/loader";
import { envConfig } from "@/config/env-config";
import { popup } from "@/libs/alert-popup";
import axios from "axios";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { FaCheck, FaEye, FaEyeSlash, FaKey, FaTimes } from "react-icons/fa";

export function generateSecurePassword() {
  const length = 12;

  const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";
  const specials = "!@#$%^&*()_+[]{}|;:,.<>?";

  const allChars = letters + numbers + specials;

  let password = "";

  // ใส่อักขระบังคับอย่างน้อย 1 ตัว
  password += letters[Math.floor(Math.random() * letters.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += specials[Math.floor(Math.random() * specials.length)];

  // เติมส่วนที่เหลือด้วยอักขระผสม
  for (let i = 3; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // สลับตำแหน่งอักขระแบบสุ่มเพื่อความปลอดภัย
  password = password
    .split("")
    .sort(() => 0.5 - Math.random())
    .join("");

  return password;
}

const Page = () => {
  const [showCurrentPass, setShowCurrentPass] = useState();
  const [showNewPass, setShowNewPass] = useState();
  const [showConfirmNew, setShowConfirmNew] = useState();

  const {
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    control,
    reset,
  } = useForm({
    defaultValues: {
      current_pass: "",
      new_pass: "",
      confirm_pass: "",
    },
  });

  const [saving, setSaving] = useState();
  const handleSaveData = async (data) => {
    setSaving(true);
    try {
      const res = await axios.put(
        envConfig.apiURL + "/user/change-pass",
        data,
        { withCredentials: true }
      );
      if (res.data.err) {
        return popup.err(res.data.err);
      }
      if (res.status === 200) {
        await popup.success("บันทึกรหัสผ่านใหม่แล้ว");
        location.href = "/";
      }
    } catch (error) {
      console.error(error);
      popup.err();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-col pb-3 w-full border-b border-gray-300">
        <p className=" text-gray-700">บัญชีของฉัน</p>
        <p className="text-gray-600 text-sm">เปลี่ยนรหัสผ่าน</p>
      </div>
      <div className="mt-5 w-full flex flex-col gap-5 items-start pl-5">
        <span className="flex lg:items-center flex-col lg:flex-row gap-3.5 lg:w-[60%] w-full">
          <p className="text-sm text-gray-600 w-[30%]">รหัสผ่านปัจจุบัน</p>
          <div className="relative flex flex-col w-full lg:w-[75%]">
            {showCurrentPass ? (
              <FaEye
                color="blue"
                onClick={() => setShowCurrentPass(!showCurrentPass)}
                size={18}
                className="absolute top-2 right-2.5 cursor-pointer"
              />
            ) : (
              <FaEyeSlash
                onClick={() => setShowCurrentPass(!showCurrentPass)}
                size={18}
                className="absolute top-2.5 right-2.5 cursor-pointer"
              />
            )}
            <Controller
              name="current_pass"
              rules={{ required: "กรอกรหัสผ่านปัจจุบัน" }}
              control={control}
              render={({ field }) => (
                <input
                  value={field || ""}
                  {...field}
                  type={showCurrentPass ? "text" : "password"}
                  className="w-full text-[0.9rem] p-2 px-3 text-gray-800 border border-gray-400 rounded-md"
                  placeholder="กรอกรหัสผ่านปัจจุบัน"
                />
              )}
            />
            {errors.current_pass && (
              <small className="mt-1 text-sm text-red-500">
                {errors.current_pass.message}
              </small>
            )}
          </div>
        </span>
        <span className="flex lg:items-center flex-col lg:flex-row gap-3.5 lg:w-[60%] w-full">
          <p className="text-sm text-gray-600 w-[30%]">ตั้งรหัสผ่านใหม่</p>
          <div className="relative flex flex-col w-full lg:w-[75%]">
            {showNewPass ? (
              <FaEye
                color="blue"
                onClick={() => setShowNewPass(!showNewPass)}
                size={18}
                className="absolute top-2 right-2.5 cursor-pointer"
              />
            ) : (
              <FaEyeSlash
                onClick={() => setShowNewPass(!showNewPass)}
                size={18}
                className="absolute top-2.5 right-2.5 cursor-pointer"
              />
            )}
            <Controller
              name="new_pass"
              rules={{
                required: "ตั้งรหัสผ่านใหม่",
                validate: (value) => {
                  if (value.length < 8) return "ความยาวต้องมากกว่า 8 ตัวอักษร";
                  if (!/[a-zA-Z]/.test(value))
                    return "ต้องมีตัวอักษรภาษาอังกฤษ";
                  if (!/[0-9]/.test(value)) return "ต้องมีตัวเลข";
                  if (!/[^a-zA-Z0-9]/.test(value)) return "ต้องมีอักขระพิเสษ";
                  if (
                    watch("confirm_pass").length > 0 &&
                    value !== watch("confirm_pass")
                  )
                    return "รหัสผ่านไม่ตรงกัน";
                },
              }}
              control={control}
              render={({ field }) => (
                <input
                  value={field || ""}
                  {...field}
                  type={showNewPass ? "text" : "password"}
                  className="w-full text-[0.9rem] p-2 px-3 text-gray-800 border border-gray-400 rounded-md"
                  placeholder="ตั้งรหัสผ่านใหม่"
                />
              )}
            />
            {errors.new_pass && (
              <small className="mt-1 text-sm text-red-500">
                {errors.new_pass.message}
              </small>
            )}
          </div>
        </span>

        <span className="flex lg:items-center flex-col lg:flex-row gap-3.5 lg:w-[60%] w-full">
          <p className="text-sm text-gray-600 w-[30%]">เงื่อนไข</p>
          <div className="relative flex flex-col gap-1.5  w-full lg:w-[75%]">
            <div className="flex flex-col gap-1.5 p-5 border border-gray-300 rounded-md bg-blue-100 w-full">
              <span className="flex items-center gap-2">
                {watch("new_pass").length > 8 ? (
                  <FaCheck size={13} color="green" />
                ) : (
                  <FaTimes size={13} color="red" />
                )}
                <p
                  className={`text-sm ${
                    watch("new_pass").length > 8
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  รหัสผ่านต้องมากกว่า 8 ตัวอักษร
                </p>
              </span>
              <span className="flex items-center gap-2">
                {/[A-Za-z]/.test(watch("new_pass")) ? (
                  <FaCheck size={13} color="green" />
                ) : (
                  <FaTimes size={13} color="red" />
                )}
                <p
                  className={`text-sm ${
                    /[A-Za-z]/.test(watch("new_pass"))
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  รหัสผ่านพยัญชนะต้องเป็นตัวอักษรภาษาอังกฤษเท่านั้น
                </p>
              </span>
              <span className="flex items-center gap-2">
                {/[^A-Za-z0-9]/.test(watch("new_pass")) ? (
                  <FaCheck size={13} color="green" />
                ) : (
                  <FaTimes size={13} color="red" />
                )}
                <p
                  className={`text-sm ${
                    /[^A-Za-z0-9]/.test(watch("new_pass"))
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  รหัสผ่านต้องประกอบด้วยอักขระพิเศษอย่างน้อย 1 ตัว
                </p>
              </span>
              <span className="flex items-center gap-2">
                {/\d/.test(watch("new_pass")) ? (
                  <FaCheck size={13} color="green" />
                ) : (
                  <FaTimes size={13} color="red" />
                )}
                <p
                  className={`text-sm ${
                    /\d/.test(watch("new_pass"))
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  รหัสผ่านต้องประกอบด้วยตัวเลขอย่างน้อย 1 ตัว
                </p>
              </span>
            </div>

            <button
              onClick={() => setValue("new_pass", generateSecurePassword())}
              className="w-full mt-2 p-2.5 justify-center bg-blue-500 text-white rounded-md flex items-center gap-2"
            >
              <FaKey />
              <p>สร้างอัตโนมัติ</p>
            </button>
          </div>
        </span>
        <span className="flex lg:items-center flex-col lg:flex-row gap-3.5 lg:w-[60%] w-full">
          <p className="w-full text-sm text-gray-600 lg:w-[30%]">
            ยืนยันรหัสผ่านใหม่
          </p>
          <div className="relative flex flex-col w-full lg:w-[75%]">
            {showConfirmNew ? (
              <FaEye
                color="blue"
                onClick={() => setShowConfirmNew(!showConfirmNew)}
                size={18}
                className="absolute top-2 right-2.5 cursor-pointer"
              />
            ) : (
              <FaEyeSlash
                onClick={() => setShowConfirmNew(!showConfirmNew)}
                size={18}
                className="absolute top-2.5 right-2.5 cursor-pointer"
              />
            )}
            <Controller
              name="confirm_pass"
              rules={{
                required: "ยืนยีนรหัสผ่านใหม่อีกครั้ง",
                validate: (value) => {
                  if (value !== watch("new_pass")) return "รหัสผ่านไม่ตรงกัน";
                },
              }}
              control={control}
              render={({ field }) => (
                <input
                  value={field || ""}
                  {...field}
                  type={showConfirmNew ? "text" : "password"}
                  className="w-full text-[0.9rem] p-2 px-3 text-gray-800 border border-gray-400 rounded-md"
                  placeholder="ยืนยีนรหัสผ่านใหม่อีกครั้ง"
                />
              )}
            />
            {errors.confirm_pass && (
              <small className="mt-1 text-sm text-red-500">
                {errors.confirm_pass.message}
              </small>
            )}
          </div>
        </span>
      </div>

      <p className="text-sm text-red-500 mt-5 ml-5">
        *หลังจากเปลี่ยนรหัสผ่านแล้ว จะออกจากระบบอัตโนมัติ
      </p>

      <div className="lg:w-[90%] w-full pl-3.5 mt-8">
        <button
          disabled={saving}
          onClick={handleSubmit(handleSaveData)}
          className="p-2 text-sm hover:bg-blue-600 px-3 text-white rounded-md flex items-center gap-2 bg-blue-500"
        >
          {saving ? (
            <>
              <Loader />
              <p>กำลังบันทึก...</p>
            </>
          ) : (
            <>
              {" "}
              <FaCheck />
              <p>บันทึก</p>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
export default Page;
