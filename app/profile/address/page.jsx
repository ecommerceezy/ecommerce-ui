"use client";
import Loader from "@/components/loader";
import { Select } from "@/components/react-select";
import { envConfig } from "@/config/env-config";
import useGetSeesion from "@/hooks/useGetSession";
import useProvince from "@/hooks/useProvince";
import Loading from "@/layout/loading";
import { popup } from "@/libs/alert-popup";
import axios from "axios";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { FaCheck } from "react-icons/fa";

const Address = () => {
  const { loading, provinceOptions, provinces } = useProvince();
  const { user, checking } = useGetSeesion();
  const [amphures, setAmphures] = useState();
  const [tambons, setTambons] = useState();
  const [zipcode, setZipcode] = useState();

  const {
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
    control,
  } = useForm({
    defaultValues: {
      address: "",
      tambon: "",
      amphure: "",
      province: "",
    },
  });

  const [geting, setGeting] = useState(false);
  const getUserAddress = async () => {
    setGeting(true);
    try {
      const res = await axios.get(envConfig.apiURL + "/user/get-address", {
        withCredentials: true,
      });
      if (res.status === 200) {
        reset({
          address: res.data?.address || "",
          province: res.data?.province || "",
          amphure: res?.data?.amphure || "",
          tambon: res.data?.tambon || "",
        });
        setZipcode(res.data?.zipcode);

        setAmphures(
          provinces.filter((p) => p.name_th === res.data?.province)[0]
            ?.districts
        );
        setTambons(
          provinces
            .filter((p) => p.name_th === res.data?.province)[0]
            ?.districts.filter(
              (p) => `อ.${p.name_th}` === res?.data?.amphure
            )[0]?.sub_districts
        );

      }
    } catch (error) {
      console.error(error);
      popup.err();
    } finally {
      setGeting(false);
    }
  };

  const [saving, setSaving] = useState(false);
  const handleSaveData = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append(
        "address",
        `${watch("address")}/=/${watch("province")}/=/${watch(
          "amphure"
        )}/=/${watch("tambon")}/=/${zipcode}`
      );
      const res = await axios.post(
        envConfig.apiURL + "/user/update-info",
        formData,
        { withCredentials: true }
      );
      if (res.status === 200) {
        getUserAddress();
        popup.success();
      }
    } catch (error) {
      console.error(error);
      popup.err();
    } finally {
      setSaving(false);
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
      <div className="flex flex-col pb-3 w-full border-b border-gray-300">
        <p className=" text-gray-700">ที่อยู่</p>
        <p className="text-gray-600 text-sm">
          เพิ่มและแก้ไข ข้อมูลที่อยู่จัดส่งหรือที่อยู่ที่ติดต่อได้
        </p>
      </div>
      {/* address */}
      <div className="mt-8 w-full flex flex-col items-start">
        <span className="flex items-center gap-3.5 lg:w-[60%] w-full pl-3">
          <p className="text-sm text-gray-600 w-[20%]">ที่อยู่</p>
          <div className="flex flex-col w-[75%]">
            <Controller
              name="address"
              rules={{
                required: "กรุณากรอกที่อยู่",
                validate: (value) => {
                  if (value.length < 30) return "ที่อยู่สั้นเกินไป";
                  if (value.length > 50) return "ที่อยู่ยาวเกินไป";
                },
              }}
              control={control}
              render={({ field }) => (
                <input
                  value={field || ""}
                  {...field}
                  type="text"
                  className="w-full text-[0.9rem] p-2 px-3 text-gray-800 border border-gray-400 rounded-md"
                  placeholder="กรอกที่อยู่"
                />
              )}
            />
            {errors.address && (
              <small className="mt-1 text-sm text-red-500">
                {errors.address.message}
              </small>
            )}
          </div>
        </span>
      </div>
      {/* province */}
      <div className="mt-8 w-full flex flex-col items-start">
        <span className="flex items-center gap-3.5 lg:w-[60%] w-full pl-3">
          <p className="text-sm text-gray-600 w-[20%]">จังหวัด</p>
          <div className="flex flex-col w-[75%]">
            <Controller
              name="province"
              rules={{
                required: "โปรดระบุจังหวัด",
              }}
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  isDisabled={loading}
                  options={provinceOptions}
                  placeholder={"เลือกจังหวัด"}
                  value={
                    provinces
                      ?.map((a) => ({
                        label: a.name_th,
                        value: a.name_th,
                      }))
                      .find((t) => t.value === watch("province")) || null
                  }
                  isSearchable
                  onChange={(option) => {
                    setValue("amphure", "");
                    setValue("tambon", "");
                    setValue("province", option.value);
                    setAmphures(
                      provinces.filter(
                        (p) => p.name_th === watch("province")
                      )[0]?.districts
                    );
                  }}
                  className="mt-1 w-full"
                />
              )}
            />
            {errors.province && (
              <small className="text-sm text-red-500 mt-1 ml-1">
                {errors.province.message}
              </small>
            )}
          </div>
        </span>
      </div>
      {/* amphure */}
      <div className="mt-8 w-full flex flex-col items-start">
        <span className="flex items-center gap-3.5 lg:w-[60%] w-full pl-3">
          <p className="text-sm text-gray-600 w-[20%]">อำเภอ/เขต</p>
          <div className="flex flex-col w-[75%]">
            <Controller
              name="amphure"
              rules={{
                required: "โปรดเลือกอำเภอ",
              }}
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  isDisabled={loading || !watch("province")}
                  options={amphures?.map((a) => ({
                    label: a.name_th,
                    value: a.name_th,
                  }))}
                  value={
                    amphures
                      ?.map((a) => ({
                        label: a.name_th,
                        value: a.name_th,
                      }))
                      .find((t) => `อ.${t.value}` === watch("amphure")) || null
                  }
                  placeholder={"เลือกอำเภอ"}
                  onChange={(option) => {
                    setValue("tambon", "");
                    setValue("amphure", `อ.${option.value}`);
                    setTambons(
                      amphures?.filter(
                        (p) => `อ.${p.name_th}` === watch("amphure")
                      )[0]?.sub_districts
                    );
                  }}
                  isSearchable
                  className="mt-1 w-full"
                />
              )}
            />
            {errors.amphure && (
              <small className="text-sm text-red-500 mt-1 ml-1">
                {errors.amphure.message}
              </small>
            )}
          </div>
        </span>
      </div>
      {/* tambon */}
      <div className="mt-8 w-full flex flex-col items-start">
        <span className="flex items-center gap-3.5 lg:w-[60%] w-full pl-3">
          <p className="text-sm text-gray-600 w-[20%]">ตำบล/แขวง</p>
          <div className="flex flex-col w-[75%]">
            <Controller
              name="tambon"
              rules={{
                required: "โปรดเลือกตำบล",
              }}
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  isDisabled={
                    loading || !watch("province") || !watch("amphure")
                  }
                  options={tambons?.map((a) => ({
                    label: a.name_th,
                    value: a.name_th,
                  }))}
                  value={
                    tambons
                      ?.map((a) => ({
                        label: a.name_th,
                        value: a.name_th,
                      }))
                      .find((t) => `ต.${t.value}` === watch("tambon")) || null
                  }
                  placeholder={"เลือกตำบล"}
                  onChange={(option) => {
                    setValue("tambon", `ต.${option.value}`);
                    setZipcode(
                      tambons?.filter(
                        (p) => `ต.${p.name_th}` === watch("tambon")
                      )[0]?.zip_code
                    );
                  }}
                  isSearchable
                  className="mt-1 w-full"
                />
              )}
            />
            {errors.tambon && (
              <small className="text-sm text-red-500 mt-1 ml-1">
                {errors.tambon.message}
              </small>
            )}
          </div>
        </span>
      </div>
      {/* zipcode */}
      <div className="mt-8 w-full flex flex-col items-start">
        <span className="flex items-center gap-3.5 lg:w-[60%] w-full pl-3">
          <p className="text-sm text-gray-600 w-[20%]">รหัสไปรษณีย์</p>
          <div className="flex flex-col w-[75%]">
            {watch("tambon") ? (
              <p>{zipcode}</p>
            ) : (
              <p className="text-red-500 text-sm">โปรดเลือกตำบล</p>
            )}
          </div>
        </span>
      </div>
      <div className="lg:w-[90%] w-full pl-3 mt-8">
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
  );
};
export default Address;
