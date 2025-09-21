"use client";
import Loader from "@/components/loader";
import { envConfig } from "@/config/env-config";
import { popup } from "@/libs/alert-popup";
import { days } from "@/libs/bithdate-options";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  FaEnvelope,
  FaEye,
  FaEyeSlash,
  FaKey,
  FaLock,
  FaSearch,
  FaUser,
} from "react-icons/fa";

const Page = () => {
  const [loading, setLoading] = useState(false);
  const [authPass, setAuthPass] = useState("");
  const [isAuthPassCorrect, setIsAuthPassCorrect] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();
  const {
    handleSubmit,
    formState: { errors },
    control,
    watch,
  } = useForm({
    defaultValues: {
      user_name: "",
      email: "",
      password: "",
      confirm_pass: "",
      otp: "",
    },
  });

  const checkUserAndSendEmail = async (data) => {
    setLoading(true);
    try {
      const res = await axios.post(
        envConfig.apiURL + "/auth/forgot-pass/checkuser",
        data
      );
      if (res.data.err) {
        return popup.err(res.data.err);
      }
      if (res.status === 200) {
        popup.success("ระบบได้ส่งรหัสยืนยันไปยังอีเมลแล้ว");
        setAuthPass(res.data.authPass);
      }
    } catch (error) {
      console.error(error);
      popup.err();
    } finally {
      setLoading(false);
    }
  };

  const checkAuthPass = (data) => {
    if (data.otp !== authPass) {
      return popup.err("รหัสยืนยันไม่ถูกต้อง");
    }
    setIsAuthPassCorrect(true);
    popup.success("รหัสยืนยันถูกต้อง");
  };

  const saveNewPass = async (data) => {
    setLoading(true);
    try {
      const res = await axios.put(
        envConfig.apiURL + "/auth/forgot-pass/update-pass",
        data
      );
      if (res.status === 200) {
        popup.success("บันทึกรหัสผ่านใหม่แล้ว");
        router.push("/");
      }
    } catch (error) {
      console.error(error);
      popup.err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full text-black lg:w-1/3 rounded-md p-6 border border-gray-300 shadow-md bg-white flex flex-col items-start">
      <p className="pb-2 border-b border-blue-600 w-full">ลืมรหัสผ่าน</p>
      {authPass && !isAuthPassCorrect ? (
        <>
          <span className="flex items-center gap-2 mt-8">
            <FaLock color="" />
            <p className="text-gray-800">กรอกรหัสยืนยันตัวตน</p>
          </span>
          <Controller
            name="otp"
            control={control}
            rules={{
              required: "กรุณากรอกรหัสยืนยันตัวตนที่ได้รับทางอีเมล",
            }}
            render={({ field }) => (
              <input
                value={field.value}
                {...field}
                type="text"
                placeholder="กรอกรหัสยืนยันตัวตน"
                className=" w-full p-2 px-3 rounded-md border border-gray-500 shadow-sm mt-1.5"
                name=""
                id=""
              />
            )}
          />
          {errors.otp && (
            <small className="text-sm text-red-500 mt-1">
              {errors.otp.message}
            </small>
          )}
        </>
      ) : isAuthPassCorrect ? (
        <>
          <span className="w-full flex items-center gap-2 relative mt-5">
            {showPass ? (
              <FaEye
                color="blue"
                onClick={() => setShowPass(!showPass)}
                size={18}
                className="absolute top-1 right-1 cursor-pointer"
              />
            ) : (
              <FaEyeSlash
                onClick={() => setShowPass(!showPass)}
                size={18}
                className="absolute top-1 right-1 cursor-pointer"
              />
            )}
            <FaLock color="" />
            <p className="text-gray-800">สร้างรหัสผ่าน</p>
          </span>
          <Controller
            name="password"
            control={control}
            rules={{
              required: "กรุณาสร้างรหัสผ่าน",
              validate: (value) => {
                if (value.length < 8) return "ความยาวต้องมากกว่า 8 ตัวอักษร";
                if (!/[a-zA-Z]/.test(value)) return "ต้องมีตัวอักษรภาษาอังกฤษ";
                if (!/[0-9]/.test(value)) return "ต้องมีตัวเลข";
                if (!/[^a-zA-Z0-9]/.test(value)) return "ต้องมีอักขระพิเสษ";
                if (
                  watch("confirm_pass").length > 0 &&
                  value !== watch("confirm_pass")
                )
                  return "รหัสผ่านไม่ตรงกัน";
                if (watch("user_name") === value)
                  return "รหัสผ่านห้ามตรงกับรหัสผู้ใช้งานหรืออีเมล";
              },
            }}
            render={({ field }) => (
              <input
                value={field.value}
                {...field}
                type={showPass ? "text" : "password"}
                placeholder="สร้างรหัสผ่านเพื่อใช้ยืนยันตัวตน"
                className=" w-full p-2 px-3 rounded-md border border-gray-500 shadow-sm mt-1.5"
                name=""
                id=""
              />
            )}
          />
          {errors.password && (
            <small className="text-sm text-red-500 mt-1">
              {errors.password.message}
            </small>
          )}

          <span className="w-full flex relative items-center gap-2 mt-5">
            {showConfirm ? (
              <FaEye
                color="blue"
                onClick={() => setShowConfirm(!showConfirm)}
                size={18}
                className="absolute top-1 right-1 cursor-pointer"
              />
            ) : (
              <FaEyeSlash
                onClick={() => setShowConfirm(!showConfirm)}
                size={18}
                className="absolute top-1 right-1 cursor-pointer"
              />
            )}
            <FaKey color="" />
            <p className="text-gray-800">ยืนยันรหัสผ่าน</p>
          </span>
          <Controller
            name="confirm_pass"
            control={control}
            rules={{
              required: "กรุณากรอกรหัสผ่านอีกครั้ง",
              validate: (value) => {
                if (value !== watch("password")) return "รหัสผ่านไม่ตรงกัน";
              },
            }}
            render={({ field }) => (
              <input
                value={field.value}
                {...field}
                type={showConfirm ? "text" : "password"}
                placeholder="กรอกรหัสผ่านอีกครั้ง"
                className=" w-full p-2 px-3 rounded-md border border-gray-500 shadow-sm mt-1.5"
                name=""
                id=""
              />
            )}
          />
          {errors.confirm_pass && (
            <small className="text-sm text-red-500 mt-1">
              {errors.confirm_pass.message}
            </small>
          )}
        </>
      ) : (
        <>
          {" "}
          <span className="flex items-center gap-2 mt-8">
            <FaUser color="" />
            <p className="text-gray-800">รหัสผู้ใช้งาน/อีเมล</p>
          </span>
          <Controller
            name="user_name"
            control={control}
            rules={{
              required: "กรุณากรอกรหัสผู้ใช้งานหรืออีเมล",
            }}
            render={({ field }) => (
              <input
                value={field.value}
                {...field}
                type="text"
                placeholder="กรอกรหัสผู้ใช้งานหรืออีเมล"
                className=" w-full p-2 px-3 rounded-md border border-gray-500 shadow-sm mt-1.5"
                name=""
                id=""
              />
            )}
          />
          {errors.user_name && (
            <small className="text-sm text-red-500 mt-1">
              {errors.user_name.message}
            </small>
          )}
          <span className="w-full flex items-center gap-2 relative mt-5">
            <FaEnvelope color="" />
            <p className="text-gray-800">อีเมล</p>
          </span>
          <Controller
            name="email"
            control={control}
            rules={{
              required: "กรุณากรอกอีเมลเพื่อรับรหัสยืนยันตัวตน",
            }}
            render={({ field }) => (
              <input
                value={field.value}
                {...field}
                type={"email"}
                placeholder="กรอกอีเมล"
                className=" w-full p-2 px-3 rounded-md border border-gray-500 shadow-sm mt-1.5"
                name=""
                id=""
              />
            )}
          />
          {errors.email && (
            <small className="text-sm text-red-500 mt-1">
              {errors.email.message}
            </small>
          )}
        </>
      )}

      <button
        disabled={loading}
        onClick={handleSubmit((data) =>
          authPass && !isAuthPassCorrect
            ? checkAuthPass(data)
            : isAuthPassCorrect
            ? saveNewPass(data)
            : checkUserAndSendEmail(data)
        )}
        className="w-full mt-5 p-3 rounded-full flex items-center justify-center gap-3 text-white bg-blue-500 hover:bg-blue-600"
      >
        {loading ? (
          <>
            {" "}
            <Loader />
            <p>กำลังตรวจสอบ...</p>
          </>
        ) : authPass && !isAuthPassCorrect ? (
          <>
            <FaSearch size={25} />
            <p>ตรวจสอบรหัสยืนยัน</p>
          </>
        ) : isAuthPassCorrect ? (
          <>
            <FaKey size={25} />
            <p>บันทึกรหัสผ่านใหม่</p>
          </>
        ) : (
          <>
            <FaEnvelope size={25} />
            <p>รับรหัสยืนยันตัวตน</p>
          </>
        )}
      </button>
    </div>
  );
};
export default Page;
