"use client";
import Modal from "@/components/model";
import { envConfig } from "@/config/env-config";
import { popup } from "@/libs/alert-popup";
import { debounce, set } from "lodash";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  FaCamera,
  FaCheck,
  FaChevronLeft,
  FaChevronRight,
  FaEdit,
  FaFolder,
  FaPlus,
  FaSearch,
  FaTimes,
  FaTrash,
} from "react-icons/fa";
import Loader from "@/components/loader";
import { NO_IMG_PRODUCT } from "../product/page";

const Category = () => {
  const [showModal, setShowModal] = useState(false);
  const [editCtg, setEditCtg] = useState(null);
  const [search, setSearch] = useState("");

  const [imgPreview, setImgPreview] = useState(null);
  const [oldImg, setOldImg] = useState(null);
  const [imgFile, setImgFile] = useState(null);

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPage, setTotalPage] = useState(1);

  const [ctgList, setCtgList] = useState([]);
  const [loading, setLoading] = useState(false);
  const fetchCTG = async (search = "", page = 1) => {
    setLoading(true);
    try {
      const res = await axios.get(envConfig.apiURL + "/admin/get-ctg", {
        withCredentials: true,
        params: { search, page },
      });
      if (res.status === 200) {
        setCtgList(res.data.data);
        setTotalPage(res.data.totalPage);
        setTotal(res.data.total);
      }
    } catch (error) {
      console.error(error);
      popup.err();
    } finally {
      setLoading(false);
    }
  };

  const debounceSearch = useMemo(() => debounce(fetchCTG, 700), [fetchCTG]);

  useEffect(() => {
    debounceSearch(search, page);
  }, [search, page]);

  const imagePicker = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImgFile(file);
    setImgPreview(URL.createObjectURL(file));
  };

  const [status, setStatus] = useState(0);

  const [saving, setSaving] = useState(false);
  const saveCtg = async (data) => {
    if (status === 0) {
      return popup.err("กรุณาเลือกสถานะ");
    }
    if (!imgPreview || (!editCtg && !imgFile)) {
      return popup.err("กรุณาเลือกรูปภาพ");
    }

    setSaving(true);
    try {
      const api = editCtg
        ? `/admin/update-ctg/${editCtg?.id}`
        : "/admin/create-ctg";

      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("remark", data.remark);
      formData.append("img", imgFile);
      if (editCtg && imgFile) {
        formData.append("changeImage", true);
      }
      formData.append("status", `${status}`);
      const res = await axios.post(envConfig.apiURL + api, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.status === 200) {
        popup.success();
        reset();
        setStatus(0);
        setShowModal(false);
        setImgFile(null);
        setImgPreview(null);
        fetchCTG(search);
      }
    } catch (error) {
      console.error(error);
      popup.err();
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (ctg) => {
    setEditCtg(ctg);
    setStatus(Number(ctg?.status));
    setOldImg(ctg?.img ? envConfig.imgURL + ctg?.img : null);
    setImgPreview(ctg?.img ? envConfig.imgURL + ctg?.img : null);
    reset({
      name: ctg?.name,
      remark: ctg.remark,
    });
    setShowModal(true);
  };

  const handleDelete = async (ctg) => {
    const { isConfirmed } = await popup.confirmPopUp(
      `ลบหมวดหมู่${ctg?.name}`,
      "ต้องการลบหมวดหมู่นี้หรือไม่",
      "ลบ"
    );
    if (!isConfirmed) return;

    setLoading(true);
    try {
      const res = await axios.delete(
        envConfig.apiURL + `/admin/delete-ctg/${ctg?.id}`,
        { withCredentials: true }
      );
      if (res.status === 200) {
        fetchCTG(search);
        popup.success("ลบข้อมูลแล้ว");
      }
    } catch (error) {
      console.error(error);
      popup.err();
    } finally {
      setLoading(false);
    }
  };

  const forwardPage = () => {
    if (page >= totalPage) return;
    setPage(page + 1);
  };

  const prevPage = () => {
    if (page <= 1) return;
    setPage(page - 1);
  };

  const {
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm({
    defaultValues: {
      name: "",
      remark: "",
    },
  });

  return (
    <>
      {" "}
      <div className="w-full p-5 rounded-lg flex flex-col bg-white shadow-sm">
        <p className="text-2xl font-bold text-blue-500">จัดการหมวดหมู่</p>
        <p className="mt-1">เพิ่ม ลบ แก้ไข หมวดหมู่สินค้า</p>
      </div>
      <div className="w-full mt-5 pt-5 border-t border-blue-500 flex items-center flex-col">
        <p className="w-full text-lg">หมวดหมู่ทั้งหมด ({total} หมวดหมู่)</p>

        <div className="mt-5 w-full flex flex-col lg:flex-row lg:items-center justify-between">
          <div className="w-full bg-white lg:w-1/3 p-2.5 px-3 rounded-md border border-gray-300 shadow-md flex items-center gap-2.5">
            <FaSearch />
            <input
              type="text"
              name=""
              className="w-[90%] "
              placeholder="พิมพ์ค้นหา"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              id=""
            />
          </div>
          <button
            onClick={() => {
              setShowModal(true);
              setEditCtg(null);
              reset({
                name: "",
                remark: "",
              });
              setImgFile(null);
              setImgPreview("");
            }}
            className="p-2.5 text-[0.9rem] w-fit mt-3 lg:mt-0 text-white bg-blue-500 hover:bg-blue-600 flex items-center gap-2 rounded-md"
          >
            <FaPlus />
            <p>เพิ่มหมวดหมู่</p>
          </button>
        </div>

        <div className="w-full flex items-center text-sm mt-5 gap-2.5">
          <button
            onClick={prevPage}
            className="p-2 text-white bg-blue-500 rounded-md shadow-sm"
          >
            <FaChevronLeft />
          </button>
          <p>
            หน้า {page} จาก {totalPage}
          </p>
          <button
            onClick={forwardPage}
            className="p-2 text-white bg-blue-500 rounded-md shadow-sm"
          >
            <FaChevronRight />
          </button>
        </div>

        <div className="mt-3 w-full flex flex-col p-6 bg-white rounded-lg border border-gray-300 shadow-md shadow-gray-300">
          <div className="w-full mb-3 items-center hidden lg:flex  pb-3 border-b border-blue-300">
            <p className="w-[10%] text-start">ลำดับ</p>
            <p className="w-[15%] text-start">รูปภาพ</p>
            <p className="w-[20%] text-start">ชื่อหมวดหมู่</p>
            <p className="w-[20%] text-start">คำอธิบาย</p>
            <p className="w-[10%] text-center">จำนวนสินค้า</p>
            <p className="w-[10%] text-center">สถานะ</p>
            <p className="w-[15%] text-center">แอคชัน</p>
          </div>

          {loading ? (
            <div className="flex flex-col w-full py-10 items-center gap-1">
              {" "}
              <div className="w-10 h-10 border-4 border-white/10 border-t-blue-500 rounded-full animate-spin" />
              <p>กำลังโหลด...</p>
            </div>
          ) : ctgList.length > 0 ? (
            ctgList.map((c, index) => (
              <div
                key={c?.id}
                className="cursor-pointer grid grid-cols-1 text-[0.9rem] border-b border-blue-100 hover:bg-blue-50 w-full lg:flex gap-2 lg:gap-0 items-center py-3"
              >
                <p className="w-full lg:w-[10%] lg:text-start">
                  {index + (page - 1) * 10 + 1}
                </p>
                <div className="w-[15%] h-[53px] flex justify-start overflow-hidden ">
                  <img
                    src={c?.img ? envConfig.imgURL + c?.img : NO_IMG_PRODUCT}
                    className="w-[30%] h-full object-cover rounded-full shadow-md border border-gray-200"
                    alt=""
                  />
                </div>
                <p className="w-full lg:w-[20%] lg:text-start break-words">
                  {c?.name}
                </p>
                <p className="w-full lg:w-[20%] lg:text-start break-words">
                  {c?.remark}
                </p>
                <p className="w-full lg:w-[10%] lg:text-center">
                  {Number(c?._count?.products)} ชิ้น
                </p>
                <span
                  className={`w-full lg:w-[10%] lg:flex justify-center items-center `}
                >
                  <p
                    className={`p-1 text-xs px-3 ${
                      c?.status == 1
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                    } rounded-full w-fit`}
                  >
                    {c?.status == 1 ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                  </p>
                </span>
                <span className="w-full lg:w-[15%] lg:flex justify-center items-center">
                  <div className="flex items-center gap-5">
                    <FaEdit
                      onClick={() => handleEdit(c)}
                      size={18}
                      className="cursor-pointer hover:text-blue-500"
                    />
                    <FaTrash
                      onClick={() => handleDelete(c)}
                      size={18}
                      className="cursor-pointer hover:text-red-500"
                    />
                  </div>
                </span>
              </div>
            ))
          ) : (
            <div className="w-full flex flex-col items-center py-10 gap-2">
              {" "}
              <FaFolder size={50} className="text-gray-300" />
              <p className="text-sm text-gray-500">ไม่พบข้อมูล</p>
            </div>
          )}
        </div>
      </div>
      {/* add edit */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          reset();
          setStatus(0);
        }}
      >
        <div className="p-5 flex flex-col bg-white border border-gray-300 z-50 w-full lg:w-1/3 rounded-lg shadow-md">
          <span className="w-full border-b border-blue-300 pb-3 flex items-center justify-between">
            <p className="text-lg">
              {editCtg?.id ? "แก้ไขหมวดหมู่" : "เพิ่มหมวดหมู่"}
            </p>
            <button
              onClick={() => {
                setShowModal(false);
                reset();
                setStatus(0);
              }}
              className="p-2 hover:bg-gray-300 rounded-md"
            >
              <FaTimes size={20} />
            </button>
          </span>
          <p className="mt-5">รูปภาพ</p>
          <label
            htmlFor="img-picker"
            className="w-[20%] h-[90px] rounded-full shadow-md border text-sm overflow-hidden border-gray-300 bg-gray-50 text-gray-700 hover:bg-gray-200 mt-1 cursor-pointer flex flex-col items-center justify-center gap-1.5"
          >
            <input
              onChange={imagePicker}
              type="file"
              className="hidden"
              id="img-picker"
            />
            {imgPreview ? (
              <img src={imgPreview} className="w-full h-full object-cover" />
            ) : (
              <>
                {" "}
                <FaCamera />
                <p>อัปโหลดรูป</p>
              </>
            )}
          </label>

          <p className="mt-5">ชื่อหมวดหมู่</p>
          <Controller
            name="name"
            rules={{ required: "กรุณากรอกชื่อหมวดหมู่" }}
            control={control}
            render={({ field }) => (
              <input
                value={field.value || ""}
                {...field}
                type="text"
                className="w-full p-2.5 rounded-lg border border-gray-300 mt-1"
                placeholder="กรอกชื่อหมวดหมู่"
              />
            )}
          />
          {errors.name && (
            <small className="text-sm text-red-500">
              {errors.name.message}
            </small>
          )}

          <p className="mt-5">คำอธิบาย</p>
          <Controller
            name="remark"
            rules={{ required: "กรุณาอธิบายหมวดหมู่" }}
            control={control}
            render={({ field }) => (
              <input
                value={field.value || ""}
                {...field}
                type="text"
                className="w-full p-2.5 rounded-lg border border-gray-300 mt-1"
                placeholder="เช่น เสื้อผ้าแฟชั่น"
              />
            )}
          />
          {errors.remark && (
            <small className="text-sm text-red-500">
              {errors.remark.message}
            </small>
          )}

          <p className="mt-5">สถานะ</p>
          <div className="flex items-center mt-1.5 gap-2">
            <button
              onClick={() => setStatus(1)}
              className={`${
                status === 1 && "bg-green-500 text-white"
              } p-2 rounded-md border border-gray-300`}
            >
              เปิดใช้งาน
            </button>
            <button
              onClick={() => setStatus(2)}
              className={`${
                status === 2 && "bg-gray-500 text-white"
              } p-2 rounded-md border border-gray-300`}
            >
              ฉบับร่าง
            </button>
          </div>

          <button
            disabled={saving || loading}
            onClick={handleSubmit(saveCtg)}
            className="w-fit mt-7 p-3 px-4 hover:bg-blue-600 flex items-center gap-2 text-white rounded-md bg-blue-500"
          >
            {saving ? (
              <>
                <Loader /> <p>กำลังบันทึก...</p>
              </>
            ) : (
              <>
                <FaCheck />
                <p>บันทึก</p>
              </>
            )}
          </button>
        </div>
      </Modal>
    </>
  );
};
export default Category;
