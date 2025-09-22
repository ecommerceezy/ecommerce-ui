"use client";
import Loader from "@/components/loader";
import { Select } from "@/components/react-select";
import { envConfig } from "@/config/env-config";
import Loading from "@/layout/loading";
import { popup } from "@/libs/alert-popup";
import { validatePassword, validateUsername } from "@/libs/validate-input";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  FaAddressCard,
  FaCheck,
  FaEye,
  FaEyeSlash,
  FaIdBadge,
  FaIdCard,
  FaKey,
  FaLock,
  FaTimes,
  FaUser,
} from "react-icons/fa";

const SignUp = () => {
  const {
    handleSubmit,
    formState: { errors },
    watch,
    control,
  } = useForm({
    defaultValues: {
      user_name: "",
      password: "",
      confirm_pass: "",
      first_name: "",
      last_name: "",
    },
  });

  const router = useRouter();

  const [prefix, setPrefix] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSignUp = async (data) => {
    if (prefix < 1) {
      return popup.err("โปรดระบุคำนำหน้า");
    }

    setLoading(true);
    try {
      const payload = {
        ...data,
        title_type: prefix === 1 ? "นาย" : prefix === 2 ? "นาง" : "นางสาว",
      };

      const res = await axios.post(
        envConfig.apiURL + "/auth/create-user",
        payload
      );
      if (res.data.err) {
        return popup.err(res.data.err);
      }
      if (res.status === 201) {
        popup.success("ลงทะเบียนสำเร็จ!");
        router.replace("/auth/sign-in");
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
      <p className="pb-2 border-b border-blue-600 w-full">ลงทะเบียนสมาชิก</p>

      <p className="mt-5 text-gray-600">ข้อมูลทั่วไป</p>

      <p className="text-gray-800 mt-3">คำนำหน้า</p>
      <span className="mt-1.5 flex items-center w-full gap-2">
        <Select
          options={[
            { label: "นาย", value: 1 },
            { label: "นาง", value: 2 },
            { label: "นางสาว", value: 3 },
          ]}
          value={[
            { label: "นาย", value: 1 },
            { label: "นาง", value: 2 },
            { label: "นางสาว", value: 3 },
          ].find((p) => p.value === prefix)}
          onChange={(option) => {
            setPrefix(option.value);
          }}
          className="w-full"
          placeholder="เลือกคำนำหน้า"
        />
      </span>

      <span className="w-full grid grid-cols-1 lg:grid-cols-2 gap-3.5 mt-3">
        <div className="flex flex-col">
          <span className="flex items-center gap-2">
            <p className="text-gray-800">ชื่อ</p>
          </span>
          <Controller
            name="first_name"
            control={control}
            rules={{ required: "กรุณากรอกชื่อ" }}
            render={({ field }) => (
              <input
                value={field.value}
                {...field}
                type="text"
                placeholder="ชื่อของคุณ"
                className=" w-full p-2 px-3 rounded-md border border-gray-500 shadow-sm mt-1.5"
                name=""
                id=""
              />
            )}
          />
          {errors.first_name && (
            <small className="text-sm text-red-500 mt-1">
              {errors.first_name.message}
            </small>
          )}
        </div>
        <div className="flex flex-col">
          <span className="flex items-center gap-2">
            <p className="text-gray-800">นามสกุล</p>
          </span>
          <Controller
            name="last_name"
            control={control}
            rules={{ required: "กรุณากรอกนามสกุล" }}
            render={({ field }) => (
              <input
                value={field.value}
                {...field}
                type="text"
                placeholder="นามสกุล"
                className=" w-full p-2 px-3 rounded-md border border-gray-500 shadow-sm mt-1.5"
                name=""
                id=""
              />
            )}
          />
          {errors.last_name && (
            <small className="text-sm text-red-500 mt-1">
              {errors.last_name.message}
            </small>
          )}
        </div>
      </span>

      <p className="mt-7 text-gray-600">สร้างบัญชี</p>
      <span className="flex items-center gap-2 mt-3">
        <FaUser color="" />
        <p className="text-gray-800">สร้างรหัสผู้ใช้งาน/อีเมล</p>
      </span>
      <Controller
        name="user_name"
        control={control}
        rules={{
          required: "กรุณาตั้งรหัสผู้ใช้งานหรืออีเมล",
          validate: (value) => {
            if (value.length < 6) return "ความยาวต้องมากกว่า 6 ตัวอักษร";
            if (!validateUsername(value)) return "ต้องมีตัวอักษรภาษาอังกฤษ";
          },
        }}
        render={({ field }) => (
          <input
            value={field.value}
            {...field}
            type="text"
            placeholder="ตั้งรหัสผู้ใช้งานหรืออีเมล"
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

      <div className="flex flex-col gap-1.5 mt-3.5 p-5 border border-gray-300 rounded-md bg-blue-100 w-full">
        <span className="flex items-center gap-2">
          {watch("password").length > 8 ? (
            <FaCheck size={13} color="green" />
          ) : (
            <FaTimes size={13} color="red" />
          )}
          <p
            className={`text-sm ${
              watch("password").length > 8 ? "text-green-600" : "text-red-600"
            }`}
          >
            รหัสผ่านต้องมากกว่า 8 ตัวอักษร
          </p>
        </span>
        <span className="flex items-center gap-2">
          {/[A-Za-z]/.test(watch("password")) ? (
            <FaCheck size={13} color="green" />
          ) : (
            <FaTimes size={13} color="red" />
          )}
          <p
            className={`text-sm ${
              /[A-Za-z]/.test(watch("password"))
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            รหัสผ่านพยัญชนะต้องเป็นตัวอักษรภาษาอังกฤษเท่านั้น
          </p>
        </span>
        <span className="flex items-center gap-2">
          {/[^A-Za-z0-9]/.test(watch("password")) ? (
            <FaCheck size={13} color="green" />
          ) : (
            <FaTimes size={13} color="red" />
          )}
          <p
            className={`text-sm ${
              /[^A-Za-z0-9]/.test(watch("password"))
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            รหัสผ่านต้องประกอบด้วยอักขระพิเศษอย่างน้อย 1 ตัว
          </p>
        </span>
        <span className="flex items-center gap-2">
          {/\d/.test(watch("password")) ? (
            <FaCheck size={13} color="green" />
          ) : (
            <FaTimes size={13} color="red" />
          )}
          <p
            className={`text-sm ${
              /\d/.test(watch("password")) ? "text-green-600" : "text-red-600"
            }`}
          >
            รหัสผ่านต้องประกอบด้วยตัวเลขอย่างน้อย 1 ตัว
          </p>
        </span>
      </div>

      <Link
        href="/auth/sign-in"
        className="w-full text-end flex items-center gap-1 justify-end hover:underline text-gray-700 mt-7"
      >
        มีบัญชีอยู่แล้ว? <p className="text-blue-600">เข้าสู่ระบบ</p>
      </Link>
      <button
        disabled={loading}
        onClick={handleSubmit(handleSignUp)}
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
            <FaIdCard size={25} />
            <p>ลงทะเบียน</p>
          </>
        )}
      </button>
    </div>
  );
};
export default SignUp;
