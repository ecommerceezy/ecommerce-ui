"use client";
import Loader from "@/components/loader";
import { envConfig } from "@/config/env-config";
import { popup } from "@/libs/alert-popup";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { FaEye, FaEyeSlash, FaLock, FaSignInAlt, FaUser } from "react-icons/fa";

const SignIn = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const {
    handleSubmit,
    formState: { errors },
    control,
  } = useForm({
    defaultValues: {
      user_name: "",
      password: "",
    },
  });

  const handleSignIn = async (data) => {
    setLoading(true);
    try {
      const res = await axios.post(envConfig.apiURL + "/auth/login", data, {
        withCredentials: true,
      });
      if (res.data.err) {
        return popup.err(res.data.err);
      }
      if (res.status === 200) {
        popup.success("เข้าสู่ระบบแล้ว");
        if (res.data.roleId < 2) {
          location.href = "/";
        } else {
          location.href = "/admin/dashboard";
        }
      }
    } catch (error) {
      console.error(error);
      popup.err();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full text-black lg:w-1/3 rounded-md p-6 border border-gray-300 shadow-md bg-white flex flex-col items-start">
      <p className="pb-2 border-b border-blue-600 w-full">เข้าสู่ระบบ</p>

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
        <p className="text-gray-800">รหัสผ่าน</p>
      </span>
      <Controller
        name="password"
        control={control}
        rules={{
          required: "กรุณากรอกรหัสผ่าน",
        }}
        render={({ field }) => (
          <input
            value={field.value}
            {...field}
            type={showPass ? "text" : "password"}
            placeholder="กรอกรหัสผ่าน"
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

      <div className="w-full mt-10 flex items-center justify-between">
        <Link href="/auth/forgot-password" className="text-gray-600">
          ลืมรหัสผ่าน?
        </Link>
        <Link
          href="/auth/sign-up"
          className=" text-end flex items-center gap-1 justify-end hover:underline text-gray-700"
        >
          ยังไม่มีบัญชี? <p className="text-blue-600">สมัครสมาชิก</p>
        </Link>
      </div>
      <button
        disabled={loading}
        onClick={handleSubmit(handleSignIn)}
        className="w-full mt-2 p-3 rounded-full flex items-center justify-center gap-3 text-white bg-blue-500 hover:bg-blue-600"
      >
        {loading ? (
          <>
            {" "}
            <Loader />
            <p>กำลังตรวจสอบ...</p>
          </>
        ) : (
          <>
            <FaSignInAlt size={25} />
            <p>เข้าสู่ระบบ</p>
          </>
        )}
      </button>
    </div>
  );
};
export default SignIn;
