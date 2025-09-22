"use client";
import { Select } from "@/components/react-select";
import { FaCheck } from "react-icons/fa";
import { NO_PROFILE } from "../layout";
import useGetSeesion from "@/hooks/useGetSession";
import { useEffect, useState } from "react";
import { popup } from "@/libs/alert-popup";
import axios from "axios";
import { envConfig } from "@/config/env-config";
import Loading from "@/layout/loading";
import { Controller, useForm } from "react-hook-form";
import { days, months, years } from "@/libs/bithdate-options";
import { isValidEmail, isValidThaiPhone } from "@/libs/validate-input";
import Loader from "@/components/loader";

const Profile = () => {
  const { user, checking } = useGetSeesion();
  const [loading, setLoading] = useState(false);

  const {
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    control,
  } = useForm({
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      tel: "",
    },
  });

  const [dateBirth, setDateBirth] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [prefix, setPrefix] = useState("");
  const [gender, setGender] = useState("");
  const getUserData = async (id) => {
    setLoading(true);
    try {
      const res = await axios.get(envConfig.apiURL + "/user/get-info", {
        withCredentials: true,
      });
      if (res.status === 200) {
        setPrefix(res.data.title_type);
        setGender(res.data.gender);
        setDateBirth(Number(res.data?.birth_date?.split("/")[0]) || "");
        setBirthMonth(res.data?.birth_date?.split("/")[1] || "");
        setBirthYear(Number(res.data?.birth_date?.split("/")[2]) || "");
        setProfile(
          res.data?.profile ? envConfig.imgURL + res.data?.profile : NO_PROFILE
        );
        setOldImg(
          res.data?.profile ? envConfig.imgURL + res.data?.profile : NO_PROFILE
        );
        // set form
        reset({
          first_name: res.data.first_name || "",
          last_name: res.data.last_name || "",
          email: res.data.email || "",
          tel: res.data.tel || "",
        });
      }
    } catch (error) {
      console.error(error);
      popup.err();
    } finally {
      setLoading(false);
    }
  };

  const [profile, setProfile] = useState(NO_PROFILE);
  const [imgFile, setImgFile] = useState();
  const [oldImg, setOldImg] = useState();
  const handlePickImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImgFile(file);
      setProfile(URL.createObjectURL(file));
    }
  };

  const [saving, setSaving] = useState(false);
  const handleSaveData = async (data) => {
    if (!dateBirth || !birthMonth || !birthYear) {
      return popup.err("วัน/เดือน/ปี เกิดไม่ถูกต้อง");
    }
    if (!isValidEmail(watch("email")) && watch("email")) {
      return popup.err("รูปแบบอีเมลไม่ถูกต้อง");
    }
    if (!isValidThaiPhone(watch("tel")) && watch("tel")) {
      return popup.err("รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง");
    }

    setSaving(true);
    try {
      const finalForm = {
        ...data,
        title_type: prefix,
        gender,
        birth_date: `${dateBirth}/${birthMonth}/${birthYear}`,
      };

      const formData = new FormData();
      for (const key in finalForm) {
        formData.append(key, finalForm[key]);
      }

      if (imgFile) {
        formData.append("profile", imgFile);
      }
      if (oldImg !== profile) {
        formData.append("changeprofile", true);
      }

      const res = await axios.post(
        envConfig.apiURL + "/user/update-info",
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (res.status === 200) {
        popup.success();
        getUserData();
      }
    } catch (error) {
      console.error(error);
      popup.err(error);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (checking) return;

    if (user) {
      getUserData(user.id);
    }
  }, [user]);

  if (loading) return <Loading />;

  return (
    <div className="w-full">
      <div className="flex flex-col pb-3 w-full border-b border-gray-300">
        <p className=" text-gray-700">ข้อมูลของฉัน</p>
        <p className="text-gray-600 text-sm">จัดการข้อมูลส่วนตัวคุณ</p>
      </div>
      <div className="w-full flex items-center flex-col-reverse lg:flex-row p-5 gap-8 mt-3">
        {/* text */}
        <div className="lg:w-[60%] w-full flex flex-col items-center gap-6 pr-4 lg:border-r border-gray-300">
          {/* prefix */}
          <span className="flex items-center gap-3.5 lg:w-[90%] w-full">
            <p className="text-sm text-gray-600 w-[35%]">คำนำหน้า</p>
            <span className="mt-1.5 flex items-center w-[75%] gap-2">
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
                ].find((p) => p.label == prefix)}
                onChange={(option) => {
                  setPrefix(option.value);
                }}
                className="w-full"
                placeholder="เลือกคำนำหน้า"
              />
            </span>
          </span>
          {/* fname */}
          <span className="flex items-center gap-3.5 lg:w-[90%] w-full">
            <p className="text-sm text-gray-600 w-[35%]">ชื่อ</p>
            <div className="flex flex-col w-[75%]">
              <Controller
                name="first_name"
                rules={{ required: "กรุณากรอกชื่อ" }}
                control={control}
                render={({ field }) => (
                  <input
                    value={field || ""}
                    {...field}
                    type="text"
                    className="w-full text-[0.9rem] p-2 px-3 text-gray-800 border border-gray-400 rounded-md"
                    placeholder="ชื่อ"
                  />
                )}
              />
              {errors.first_name && (
                <small className="mt-1 text-sm text-red-500">
                  {errors.first_name.message}
                </small>
              )}
            </div>
          </span>

          {/* lname */}
          <span className="flex items-center gap-3.5 lg:w-[90%] w-full">
            <p className="text-sm text-gray-600 w-[35%]">นามสกุล</p>
            <div className="flex flex-col w-[75%]">
              <Controller
                name="last_name"
                rules={{ required: "กรุณากรอกนามสกุล" }}
                control={control}
                render={({ field }) => (
                  <input
                    value={field || ""}
                    {...field}
                    type="text"
                    className="w-full text-[0.9rem] p-2 px-3 text-gray-800 border border-gray-400 rounded-md"
                    placeholder="นามสกุล"
                  />
                )}
              />
              {errors.last_name && (
                <small className="mt-1 text-sm text-red-500">
                  {errors.last_name.message}
                </small>
              )}
            </div>
          </span>

          {/* gender */}
          <span className="flex items-center gap-3.5 lg:w-[90%] w-full">
            <p className="text-sm text-gray-600 w-[35%]">เพศ</p>
            <span className="mt-1.5 flex items-center w-[75%] gap-2">
              <Select
                options={[
                  { label: "ชาย", value: 1 },
                  { label: "หญิง", value: 2 },
                ]}
                value={[
                  { label: "ชาย", value: 1 },
                  { label: "หญิง", value: 2 },
                ].find((p) => p.label == gender)}
                onChange={(option) => {
                  setGender(option.label);
                }}
                className="w-full"
                placeholder="เลือกคำนำหน้า"
              />
            </span>
          </span>

          {/* email */}
          <span className="flex items-center gap-3.5 lg:w-[90%] w-full">
            <p className="text-sm text-gray-600 w-[35%]">อีเมล</p>
            <div className="flex flex-col w-[75%]">
              <Controller
                name="email"
                rules={{ required: "กรุณากรอกอีเมล" }}
                control={control}
                render={({ field }) => (
                  <input
                    value={field || ""}
                    {...field}
                    type="email"
                    className="w-full text-[0.9rem] p-2 px-3 text-gray-800 border border-gray-400 rounded-md"
                    placeholder="อีเมล"
                  />
                )}
              />
              {errors.email && (
                <small className="mt-1 text-sm text-red-500">
                  {errors.email.message}
                </small>
              )}
            </div>
          </span>

          {/* phone */}
          <span className="flex items-center gap-3.5 lg:w-[90%] w-full">
            <p className="text-sm text-gray-600 w-[35%]">หมายเลขโทรศัพท์</p>
            <div className="flex flex-col w-[75%]">
              <Controller
                name="tel"
                rules={{ required: "กรุณากรอกเบอร์โทรศัพท์" }}
                control={control}
                render={({ field }) => (
                  <input
                    value={field || ""}
                    {...field}
                    type="tel"
                    className="w-full text-[0.9rem] p-2 px-3 text-gray-800 border border-gray-400 rounded-md"
                    placeholder="เบอร์โทรศัพท์"
                  />
                )}
              />
              {errors.tel && (
                <small className="mt-1 text-sm text-red-500">
                  {errors.tel.message}
                </small>
              )}
            </div>
          </span>

          {/* birthdate*/}
          <span className="flex flex-col lg:flex-row items-center gap-3.5 lg:w-[90%] w-full">
            <p className="text-sm text-gray-600 w-full lg:w-[31%]">
              วัน/เดือน/ปี เกิด
            </p>
            <div className="flex items-center gap-1 w-full lg:w-[65%]">
              {" "}
              <Select
                options={days}
                value={days.find((d) => d.value === dateBirth) || null}
                onChange={(optoin) => {
                  setDateBirth(optoin.value);
                }}
                className="text-sm w-1/3"
                placeholder="วัน"
              />
              <Select
                options={months}
                value={months.find((d) => d.label === birthMonth) || null}
                onChange={(optoin) => {
                  setBirthMonth(optoin.label);
                }}
                className="text-sm w-1/3"
                placeholder="เดือน"
              />
              <Select
                options={years}
                value={years.find((d) => d.value === birthYear) || null}
                onChange={(optoin) => {
                  setBirthYear(optoin.value);
                }}
                className="text-sm w-1/3"
                placeholder="ปี"
              />
            </div>
          </span>

          <div className="lg:w-[90%] w-full">
            <button
              disabled={checking || saving}
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

        {/* img profile */}
        <div className="w-[40%] flex flex-col items-center gap-3">
          <label
            htmlFor="img-pick"
            className="lg:w-[120px] w-full h-[120px] cursor-pointer rounded-full border border-gray-300 overflow-hidden"
          >
            <input
              onChange={handlePickImage}
              type="file"
              id="img-pick"
              className="hidden"
            />
            <img src={profile} className="w-full h-full object-cover" alt="" />
          </label>

          <label
            htmlFor="img-pick"
            className="mt-5 p-3 px-5 border border-gray-300 text-sm cursor-pointer hover:bg-gray-100"
          >
            เลือกรูปภาพ
          </label>
        </div>
      </div>
    </div>
  );
};
export default Profile;
