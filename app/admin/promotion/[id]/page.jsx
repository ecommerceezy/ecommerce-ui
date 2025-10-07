"use client";
import MyDatePicker from "@/components/date-picker";
import Loader from "@/components/loader";
import { Select } from "@/components/react-select";
import { envConfig } from "@/config/env-config";
import Loading from "@/layout/loading";
import { popup } from "@/libs/alert-popup";
import axios from "axios";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { FaArrowLeft, FaCheck, FaTimes } from "react-icons/fa";

const Page = () => {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [selectProductId, setSelectProductId] = useState([]);
  const [productPromotionOptions, setProductPromotionOptions] = useState([]);
  const fetchProductOption = async () => {
    try {
      const res = await axios.get(
        envConfig.apiURL + "/admin/product-promotion-options",
        { withCredentials: true }
      );
      if (res.status === 200) {
        setProductPromotionOptions(res.data);
      }
    } catch (error) {
      console.error(error);
      popup.err();
    }
  };

  useEffect(() => {
    fetchProductOption();
  }, []);

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const {
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm({
    defaultValues: {
      name: "",
      description: "",
      discount: "",
    },
  });

  const getPromotionEdit = async (id) => {
    setLoading(true);
    try {
      const res = await axios.get(envConfig.apiURL + `/admin/promotion/${id}`, {
        withCredentials: true,
      });
      if (res.status === 200) {
        reset({
          name: res.data?.name || "",
          description: res.data?.description || "",
          discount: res?.data?.discount || "",
        });
        setStartDate(new Date(res?.data?.start_date));
        setEndDate(new Date(res?.data?.end_date));
        setSelectProductId(
          res?.data?.products?.map((p) => ({
            label: p?.pro_name,
            value: p?.pro_id,
          }))
        );
      }
    } catch (error) {
      console.error(error);
      popup.err();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id || id === "0") return;

    getPromotionEdit(id);
  }, []);

  const [saving, setSaving] = useState(false);
  const handleSave = async (data) => {
    if (!startDate) return popup.err("กรุณาเลือกวันที่เริ่มโปรโมชั่น");
    if (!endDate) return popup.err("กรุณาเลือกวันที่หมดโปรโมชั่น");

    const today = new Date();

    // ฟังก์ชันช่วยตัดเวลาออก (เหลือเฉพาะวันที่)
    const resetTimeToMidnight = (date) => {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      return d;
    };

    const start = resetTimeToMidnight(startDate);
    const end = resetTimeToMidnight(endDate);
    const current = resetTimeToMidnight(today);

    // ตรวจสอบวันที่
    if (start < current) {
      return popup.err("วันที่เริ่มโปรโมชั่นต้องไม่น้อยกว่าวันปัจจุบัน");
    }

    if (end < current) {
      return popup.err("วันที่หมดโปรโมชั่นต้องไม่น้อยกว่าวันปัจจุบัน");
    }

    if (end <= start) {
      return popup.err("วันที่หมดโปรโมชั่นต้องมากกว่าวันที่เริ่มโปรโมชั่น");
    }

    setSaving(true);
    try {
      const api =
        id == 0 ? "/admin/new-promotion" : `/admin/update-promotion/${id}`;

      const res = await axios.post(
        envConfig.apiURL + api,
        { ...data, startDate, endDate, selectProductId },
        { withCredentials: true }
      );
      if (res.data.err) {
        return popup.err(res.data.err);
      }

      if (res.status === 200) {
        popup.success("บันทึกข้อมูลโปรโมชั่นสำเร็จ");
        router.push("/admin/promotion");
      }
    } catch (error) {
      console.error(error);
      popup.err("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="w-full flex flex-col p-5 bg-white border border-gray-300 rounded-md shadow-md">
      <Link
        href="/admin/promotion"
        className="p-2.5 text-sm flex items-center w-fite hover:bg-blue-600 w-fit gap-2 rounded-md bg-blue-500 text-white"
      >
        <FaArrowLeft />
        <p>ย้อนกลับ</p>
      </Link>
      <p className="mt-5 text-lg font-bold w-full pb-3 border-b border-gray-300">
        {id == 0 ? "สร้างโปรโมชันใหม่" : "แก้ไขโปรโมชัน"}
      </p>
      <p className="text-red-500 mt-3 text-sm">*สืนค้า 1 ชิ้นต่อ 1 โปรโมชัน</p>
      {/* name */}
      <div className="w-full mt-8 flex lg:flex-row flex-col lg:items-center gap-2">
        <p className=" text-gray-800 w-full lg:w-[20%]">ชื่อโปรโมชัน</p>
        <div className="flex flex-col gap-1 w-full lg:w-[30%]">
          <Controller
            name="name"
            rules={{ required: "กรุณาเลือกรูปแบบโปรโมชัน" }}
            control={control}
            render={({ field }) => (
              <input
                className="w-full p-3 text-sm border border-gray-300 shadow-xs rounded-md"
                placeholder="เช่น ลดแรงต้อนรับฤดูหนาว"
                {...field}
                value={field.value || ""}
              />
            )}
          />
          {errors.name && (
            <small className="text-sm text-red-500">
              {errors.name.message}
            </small>
          )}
        </div>
      </div>

      {/* discount */}
      <div className="w-full mt-8 flex lg:flex-row flex-col lg:items-center gap-2">
        <p className=" text-gray-800 w-full lg:w-[20%]">ลดราคา(%)</p>
        <div className="flex flex-col gap-1 w-full lg:w-[30%]">
          <Controller
            name="discount"
            rules={{
              required: "กรุณาระบุจำนวนเปอร์เซ็นต์",
              validate: (value) => {
                if (!/[0-9]/.test(value) || value < 1)
                  return "เปอร์เซ็นต์ไม่ถูกต้อง";
                if (value > 100) return "ไม่สามารถลดเกิน 100%";
              },
            }}
            control={control}
            render={({ field }) => (
              <input
                type="number"
                className="w-full p-3 text-sm border border-gray-300 shadow-xs rounded-md"
                placeholder="เช่น 20"
                {...field}
                value={field.value || ""}
              />
            )}
          />
          {errors.discount && (
            <small className="text-sm text-red-500">
              {errors.discount.message}
            </small>
          )}
        </div>
      </div>

      {/* name */}
      <div className="w-full mt-8 flex lg:flex-row flex-col lg:items-start gap-2">
        <p className=" text-gray-800 w-full lg:w-[20%]">
          เลือกสินค้าเข้าร่วมรายการ
        </p>
        <div className="flex flex-col gap-1 w-full lg:w-[30%]">
          <Controller
            name="name"
            rules={{ required: "กรุณาเลือกรูปแบบโปรโมชัน" }}
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                placeholder="เลือกสินค้า"
                options={productPromotionOptions.filter(
                  (p) => !selectProductId.map((p) => p.value).includes(p.value)
                )}
                onChange={(option) => {
                  setSelectProductId((prev) =>
                    prev.find((p) => p.value === option.value)
                      ? prev
                      : [option, ...prev]
                  );
                }}
              />
            )}
          />
          {selectProductId.length > 0 && (
            <>
              <p className="text-xs mt-1 text-gray-700">
                สินค้าที่เข้าร่วมรายการ {selectProductId.length} ชิ้น
              </p>
              <div className="w-full h-[100px] mt-1 flex flex-wrap gap-2.5 overflow-auto">
                {selectProductId.map((p) => (
                  <span
                    key={p?.value}
                    className="p-2 text-sm h-[30px] shadow-sm rounded-md flex items-center gap-2 bg-blue-50"
                  >
                    <p>{p?.label}</p>
                    <FaTimes
                      color="red"
                      className="cursor-pointer"
                      onClick={() => {
                        setSelectProductId((prev) =>
                          prev.filter((i) => i?.value !== p?.value)
                        );
                      }}
                    />
                  </span>
                ))}
              </div>
            </>
          )}
          {errors.name && (
            <small className="text-sm text-red-500">
              {errors.name.message}
            </small>
          )}
        </div>
      </div>

      {/* start_date */}
      <div className="w-full mt-8 flex lg:flex-row flex-col lg:items-center gap-2">
        <p className=" text-gray-800 w-full lg:w-[20%]">วันที่เริ่มโปรโมชัน</p>
        <div className="flex flex-col gap-1 w-full lg:w-[30%]">
          <MyDatePicker date={startDate} setDate={setStartDate} />
        </div>
      </div>
      {/* end_date */}
      <div className="w-full mt-8 flex lg:flex-row flex-col lg:items-center gap-2">
        <p className=" text-gray-800 w-full lg:w-[20%]">วันที่หมดโปรโมชัน</p>
        <div className="flex flex-col gap-1 w-full lg:w-[30%]">
          <MyDatePicker date={endDate} setDate={setEndDate} />
        </div>
      </div>

      {/* description */}
      <div className="w-full mt-8 flex lg:flex-row flex-col lg:items-center gap-2">
        <p className=" text-gray-800 w-full lg:w-[20%]">หมายเหตุ</p>
        <div className="flex flex-col gap-1 w-full lg:w-[30%]">
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <input
                className="w-full p-3 text-sm border border-gray-300 shadow-xs rounded-md"
                placeholder="อธิบายเกี่ยวกับโปรโมชันนี้(ไม่จำเป็น)"
                {...field}
                value={field.value || ""}
              />
            )}
          />
          {errors.description && (
            <small className="text-sm text-red-500">
              {errors.description.message}
            </small>
          )}
        </div>
      </div>

      <button
        disabled={saving}
        onClick={handleSubmit(handleSave)}
        className="mt-8 w-fit p-3 text-sm flex items-center gap-2 text-white bg-blue-500 rounded-md shadow-md "
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
  );
};
export default Page;
