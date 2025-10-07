"use client";
import Modal from "@/components/model";
import { Select } from "@/components/react-select";
import { envConfig } from "@/config/env-config";
import { popup } from "@/libs/alert-popup";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { BiFolderOpen } from "react-icons/bi";
import { v4 as uuid } from "uuid";
import {
  FaBoxes,
  FaCaretUp,
  FaCheck,
  FaChevronDown,
  FaChevronLeft,
  FaChevronRight,
  FaDollarSign,
  FaEdit,
  FaExclamationCircle,
  FaImage,
  FaPlus,
  FaRegListAlt,
  FaSearch,
  FaStoreAlt,
  FaTimes,
  FaTrash,
} from "react-icons/fa";
import Loader from "@/components/loader";
import { debounce } from "lodash";

export const NO_IMG_PRODUCT =
  "https://thumb.ac-illust.com/b1/b170870007dfa419295d949814474ab2_t.jpeg";

const Product = () => {
  const [showModal, setShowModal] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPage, setTotalPage] = useState(1);
  const [search, setSearch] = useState("");
  const [take, setTake] = useState(15);
  const [searchCtg, setSearchCtg] = useState("");
  const [sort, setSort] = useState(JSON.stringify({ pro_number: "asc" }));
  const [editProduct, setEditProduct] = useState(null);

  const [categoriesOption, setCategoriesOptions] = useState([]);
  const [selectCategories, setSelectCategories] = useState([]);
  const handleSelectCtg = (ctg) => {
    setSelectCategories((prev) => [ctg, ...prev]);
  };
  const handleDeleteSelectCtg = (value) => {
    setSelectCategories((prev) => prev.filter((p) => p?.value !== value));
  };

  const [loading, setLoading] = useState(false);
  const fetchCTG = async (search = "", page = 1) => {
    setLoading(true);
    try {
      const res = await axios.get(envConfig.apiURL + "/admin/get-ctg", {
        withCredentials: true,
        params: { search, page, forProduct: true },
      });
      if (res.status === 200) {
        const ctgList = res.data.data;
        const ctgOptions = ctgList.map((c) => ({
          label: c.name,
          value: c?.id,
        }));
        setCategoriesOptions(ctgOptions);
      }
    } catch (error) {
      console.error(error);
      popup.err();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCTG();
    fetchProductAvg();
  }, []);

  const [productAvg, setProductAvg] = useState(null);
  const fetchProductAvg = async () => {
    setLoading(true);
    try {
      const res = await axios.get(envConfig.apiURL + "/admin/product-avg", {
        withCredentials: true,
      });
      if (res.status === 200) {
        setProductAvg(res.data);
      }
    } catch (error) {
      console.error(error);
      popup.err(error);
    } finally {
      setLoading(false);
    }
  };

  const [productsList, setProcutList] = useState([]);
  const fetchProduct = async (search = "", searchCtg, sort, take, page) => {
    setLoading(true);
    try {
      const res = await axios.get(
        envConfig.apiURL + "/admin/get-product-list",
        {
          withCredentials: true,
          params: {
            search,
            searchCtg,
            sort,
            take,
            page,
          },
        }
      );
      if (res.status === 200) {
        setProcutList(res.data.products);
        setTotal(res.data.total);
        setTotalPage(res.data.totalPage);
      }
    } catch (error) {
      console.error(error);
      popup.err();
    } finally {
      setLoading(false);
    }
  };

  const debounceSearch = useMemo(
    () => debounce(fetchProduct, 700),
    [fetchProduct]
  );

  useEffect(() => {
    debounceSearch(search, searchCtg, sort, take, page);
  }, [search, searchCtg, sort, take, page]);

  const [selectImages, setSelectImages] = useState([]);
  const [deleteImgs, setDeleteImgs] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const handleSelectImage = (e) => {
    const files = Array.from(e.target.files); // แปลง FileList -> Array

    // เช็คจำนวนรูป
    if (selectImages.length + files.length > 5) {
      return popup.err("อัปโหลดไม่เกิน 5 รูปภาพ");
    }
    const id = uuid();
    const newFiles = files.map((f, index) => {
      return {
        id: id + `${index}`,
        file: f,
      };
    });

    const newPreviews = files.map((f, index) => {
      return {
        id: id + `${index}`,
        url: URL.createObjectURL(f),
      };
    });
    console.log(selectImages);
    setSelectImages((prev) => [...newFiles, ...prev]);
    setPreviewImages((prev) => [...newPreviews, ...prev]);
  };
  const handleDeleteImage = (id, url) => {
    setSelectImages((prev) => prev.filter((p) => p.id !== id));
    setPreviewImages((prev) => prev.filter((p) => p.id !== id));
    if (editProduct?.pro_id && url.startsWith("h")) {
      setDeleteImgs((prev) => [id, ...prev]);
    }
  };

  const {
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm({
    defaultValues: {
      pro_name: "",
      pro_price: "",
      freight: "",
      pro_number: "",
      pro_color: "",
      pro_size: "",
      pro_details: "",
      unit: "",
    },
  });

  const [saving, setSaving] = useState(false);
  const handleSaveProduct = async (data) => {
    if (selectCategories.length < 1) {
      return popup.err("โปรดเลือกหมวดหมู่สินค้าอย่าง 1 หมวดหมู่");
    }
    if (previewImages.length < 2) {
      return popup.err("อัปโหลดอย่างน้อย 2 รูปภาพ");
    }

    setSaving(true);
    try {
      const api = editProduct?.pro_id
        ? `/admin/update-product/${editProduct.pro_id}`
        : `/admin/create-product`;

      const formData = new FormData();
      for (const key in data) {
        formData.append(key, data[key]);
      }
      //   image
      selectImages.forEach((imgObj) => {
        formData.append("images[]", imgObj.file);
      });
      //ctgs
      formData.append(
        "categories",
        selectCategories.map((s) => s.value).join(",")
      );

      if (editProduct?.pro_id && deleteImgs.length > 0) {
        formData.append("deleteImgs", deleteImgs.join(","));
      }

      const res = await axios.post(envConfig.apiURL + api, formData, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (res.status === 200) {
        fetchProduct(search, searchCtg, sort, take, page);
        fetchProductAvg();
        popup.success();
        setShowModal(false);
        reset();
        setSelectCategories([]);
        setSelectImages([]);
        setPreviewImages([]);
        if (editProduct?.pro_id) {
          setSort(JSON.stringify({ updatedAt: "desc" }));
        } else {
          setSort(JSON.stringify({ createdAt: "desc" }));
        }
        setPage(1);
      }
    } catch (error) {
      console.error(error);
      popup.err();
    } finally {
      setSaving(false);
    }
  };

  const resetAllSearch = () => {
    setPage(1);
    setSearch("");
    setSearchCtg("");
    setSort(JSON.stringify({ createdAt: "desc" }));
    setTake(15);
  };

  const handleEdit = async (product) => {
    setEditProduct(product);
    setShowModal(true);
    reset({
      pro_name: product?.pro_name,
      pro_color: product?.pro_color,
      pro_details: product?.pro_details,
      freight: product?.freight,
      pro_number: product?.pro_number,
      pro_price: product?.pro_price,
      pro_size: product?.pro_size,
      unit: product?.unit,
    });

    setSelectCategories(
      product?.categories?.map((c) => ({ label: c?.name, value: c?.id }))
    );
    setPreviewImages(
      product?.imgs.map((img) => ({
        id: img?.id,
        url: envConfig.imgURL + img?.url,
      }))
    );
  };

  const handleDelete = async (id, name) => {
    const { isConfirmed } = await popup.confirmPopUp(
      `ลบสินค้า${name}`,
      "ต้องการลบข้อมูลของสินค้าหรือไม่?",
      "ลบ"
    );
    if (!isConfirmed) return;

    setLoading(true);
    try {
      const res = await axios.delete(
        envConfig.apiURL + `/admin/delete-product/${id}`,
        { withCredentials: true }
      );
      if (res.status === 200) {
        popup.success("ลบข้อมูลแล้ว");
        fetchProduct(search, searchCtg, sort, take, page);
        fetchProductAvg();
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

  return (
    <>
      <div className="w-full flex flex-col p-5 rounded-ld shadow-sm bg-white">
        <p className="text-2xl font-bold text-blue-500">จัดการสินค้า</p>
        <p className="mt-1">เพิ่ม ลบ แก้ไข ข้อมูลสินค้า</p>
      </div>

      <div className="mt-5 pt-5 border-t-2 border-blue-500 w-full">
        {/* statics */}
        <div className="grid bg-white lg:grid-cols-4 grid-cols-1 gap-3.5 w-full">
          <div className="p-5 rounded-lg border border-gray-300 shadow-md shadow-gray-300 flex flex-col gap-1.5">
            <span className="w-full flex items-center justify-between">
              <p className="text-yellow-600">รายการสินค้าทั้งหมด</p>
              <div className="p-2 rounded-full border border-yellow-500">
                <FaBoxes color="orange" />
              </div>
            </span>
            <p className="text-xl font-bold">
              {loading
                ? ""
                : Number(productAvg?.allList || 0).toLocaleString() || 0}
            </p>
            <p>รายการ</p>
          </div>
          <div className="p-5 rounded-lg border border-gray-300 shadow-md shadow-gray-300 flex flex-col gap-1.5">
            <span className="w-full flex items-center justify-between">
              <p className="text-purple-600">สินค้าทั้งหมดในสต็อก</p>
              <div className="p-2 rounded-full border border-purple-500">
                <FaStoreAlt color="purple" />
              </div>
            </span>
            <p className="text-xl font-bold">
              {loading
                ? ""
                : Number(productAvg?.allStock || 0).toLocaleString() || 0}
            </p>
            <p>ชิ้น</p>
          </div>
          <div className="p-5 rounded-lg border border-gray-300 shadow-md shadow-gray-300 flex flex-col gap-1.5">
            <span className="w-full flex items-center justify-between">
              <p className="text-green-500">ขายแล้ว</p>
              <div className="p-2 rounded-full border border-green-500">
                <FaDollarSign color="green" />
              </div>
            </span>
            <p className="text-xl font-bold">
              {loading
                ? ""
                : Number(productAvg?.allSell || 0).toLocaleString() || 0}
            </p>
            <p>ชิ้น</p>
          </div>
          <div
            onClick={() => {
              setSort(JSON.stringify({ pro_number: "asc" }));
              setPage(1);
            }}
            className="p-5 cursor-pointer rounded-lg border border-gray-300 shadow-md shadow-gray-300 flex flex-col gap-1.5"
          >
            <span className="w-full flex items-center justify-between">
              <p className="text-red-500">สินค้าที่ใกล้หมด</p>
              <div className="p-2 rounded-full border border-red-500">
                <FaExclamationCircle color="red" />
              </div>
            </span>
            <p className="text-xl font-bold">
              {loading
                ? ""
                : Number(productAvg?.countProductLess || 0).toLocaleString() ||
                  0}
            </p>
            <p>ชิ้น</p>
          </div>
        </div>

        <p className="mt-5">ผลการค้นหาทั้งหมด ({total} ชิ้น)</p>
        <div className="mt-3 w-full flex flex-col lg:flex-row lg:items-center justify-between">
          <div className="w-full bg-white lg:w-1/3 p-2.5 px-3 rounded-md border border-gray-300 shadow-md flex items-center gap-2.5">
            <FaSearch />
            <input
              type="text"
              name=""
              className="w-[90%]"
              placeholder="พิมพ์ค้นหา"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              id=""
            />
          </div>
          <button
            onClick={() => {
              setShowModal(true);
              setEditProduct(null);
              reset({
                pro_name: "",
                pro_price: "",
                freight: "",
                pro_number: "",
                pro_color: "",
                pro_size: "",
                pro_details: "",
              });
              setSelectCategories([]);
              setPreviewImages([]);
            }}
            className="p-2.5 text-[0.9rem] w-fit mt-3 lg:mt-0 text-white bg-blue-500 hover:bg-blue-600 flex items-center gap-2 rounded-md"
          >
            <FaPlus />
            <p>เพิ่มสินค้าใหม่</p>
          </button>
        </div>
        {/*search  */}
        <div className="w-full mt-3.5 grid lg:grid-cols-6 grid-cols-2 gap-2">
          <div className="bg-white lg:col-span-2">
            {" "}
            <Select
              options={categoriesOption}
              onChange={(option) => {
                setSearchCtg(option.value);
                setPage(1);
              }}
              value={categoriesOption.find((c) => c.value == searchCtg) || null}
              placeholder="ค้นหาหมวดหมู่"
              className="w-full bg-white"
            />
          </div>

          {/* sort */}
          <div title="เรียงตาม" className="relative inline-block bg-white">
            <select
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
              value={sort}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            >
              <option
                value={JSON.stringify({ createdAt: "desc" })}
                className="text-sm"
              >
                เพิ่มล่าสุด
              </option>
              <option
                value={JSON.stringify({ updatedAt: "desc" })}
                className="text-sm"
              >
                แก้ไขล่าสุด
              </option>
              <option
                value={JSON.stringify({ pro_number: "desc" })}
                className="text-sm"
              >
                เหลือมากที่สุด
              </option>
              <option
                value={JSON.stringify({ sell_count: "desc" })}
                className="text-sm"
              >
                ยอดขายสูงสุด
              </option>
              <option
                value={JSON.stringify({ pro_price: "desc" })}
                className="text-sm"
              >
                ราคาสูงสุด
              </option>
            </select>
            <label
              htmlFor="select-row"
              className="p-2 px-3.5 rounded-lg border border-gray-300 shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <FaChevronDown size={17} />
              <p className="text-sm hidden lg:inline-flex">เรียง</p>
            </label>
          </div>

          {/* record */}
          <div
            title="เลือกจำนวนที่แสดง"
            className="relative inline-block bg-white"
          >
            <select
              onChange={(e) => {
                setTake(e.target.value);
                setPage(1);
              }}
              value={take}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            >
              <option value={15} className="text-sm">
                15
              </option>
              <option value={25} className="text-sm">
                25
              </option>
              <option value={50} className="text-sm">
                50
              </option>

              <option value={100} className="text-sm">
                100
              </option>
            </select>
            <label
              htmlFor="select-row"
              className="p-2 px-3.5 rounded-lg border border-gray-300 shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <FaRegListAlt size={17} />
              <p className="text-sm hidden lg:inline-flex">แสดง {take} แถว</p>
            </label>
          </div>
          <button
            onClick={resetAllSearch}
            className="flex items-center bg-white p-2 border border-gray-300 rounded-md justify-center gap-2"
          >
            <FaTrash />
            <p>ล้างการค้นหา</p>
          </button>
          {/*page  */}
          <div className="w-full flex items-center text-sm gap-2.5 col-span-2 lg:col-span-1">
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
        </div>

        {/* data */}
        <div className="mt-3.5 w-full flex flex-col p-6 bg-white rounded-lg border border-gray-300 shadow-md shadow-gray-300">
          <div className="w-full mb-3 items-center hidden text-[0.9rem] lg:flex  pb-3 border-b border-blue-300">
            <p className="w-[7%] text-start">ลำดับ</p>
            <p className="w-[28%] text-start">สินค้า</p>
            <p className="w-[25%] text-start">คำอธิบาย</p>
            <span className="w-[10%] flex items-center justify-center text-center gap-2">
              <p>ราคา/หน่วย</p>
              <FaCaretUp
                className="cursor-pointer"
                onClick={() => setSort(JSON.stringify({ freight: "asc" }))}
                size={15}
              />
            </span>
            <span className="w-[10%] flex items-center justify-center text-center gap-2">
              <p>เหลือ</p>
              <FaCaretUp
                className="cursor-pointer"
                onClick={() => setSort(JSON.stringify({ pro_number: "asc" }))}
                size={15}
              />
            </span>
            <span className="w-[10%] flex items-center justify-center text-center gap-2">
              <p>ขายแล้ว</p>
              <FaCaretUp
                className="cursor-pointer"
                onClick={() => setSort(JSON.stringify({ sell_count: "asc" }))}
                size={15}
              />
            </span>
            <p className="w-[15%] text-center">แอคชัน</p>
          </div>

          <div className="w-full flex flex-col mt-1 h-[500px] overflow-auto">
            {loading ? (
              <div
                key={uuid()}
                className="flex flex-col w-full py-10 items-center gap-1"
              >
                {" "}
                <div className="w-10 h-10 border-4 border-white/10 border-t-blue-500 rounded-full animate-spin" />
                <p>กำลังโหลด...</p>
              </div>
            ) : productsList?.length > 0 ? (
              productsList?.map((p, index) => (
                <div
                  key={uuid()}
                  className={`${
                    p?.pro_number === 0 && "bg-red-100"
                  } relative cursor-pointer grid grid-cols-1 text-[0.9rem] border-b border-blue-100 hover:bg-blue-50 w-full lg:flex gap-2 lg:gap-0 items-center py-3`}
                >
                  {p?.pro_number <= 5 && (
                    <span className="absolute top-1.5 left-4 p-1 text-xs rounded-md shadow-md text-red-500 bg-red-100">
                      {p?.pro_number === 0 ? "สินค้าหมดแล้ว!" : "สินค้าใกล้หมด"}
                    </span>
                  )}
                  <p className="w-full lg:w-[7%] lg:text-start">
                    {index + (page - 1) * 10 + 1}
                  </p>
                  <div className="w-full lg:w-[28%] flex items-center gap-3.5">
                    <div className="w-[65px] h-[65px]">
                      <img
                        src={
                          p?.imgs[0]
                            ? envConfig.imgURL + p?.imgs[0]?.url
                            : NO_IMG_PRODUCT
                        }
                        className="w-full h-full object-cover rounded-md border border-gray-300 shadow-sm"
                        alt=""
                      />
                    </div>
                    <div className="flex flex-col w-[60%]">
                      <p className="w-full break-words">{p?.pro_name}</p>
                      <p className="w-full break-words text-sm text-gray-600">
                        {p?.categories?.map((c) => c.name).join(",")}
                      </p>
                      <p className="w-full break-words text-sm text-gray-600">
                        ค่าจัดส่ง {Number(p?.freight).toLocaleString()}฿
                      </p>
                      <p className="w-full break-words text-sm text-gray-600">
                        {p?.pro_color}
                      </p>
                      <p className="w-full break-words text-sm text-gray-600">
                        {p?.pro_size}
                      </p>
                    </div>
                  </div>
                  <p className="w-full lg:w-[23%] lg:text-start break-words">
                    {p?.pro_details}
                  </p>
                  <p className="w-full lg:w-[10%] lg:text-center">
                    {Number(p?.pro_price).toLocaleString()}฿/{p?.unit || "ชิ้น"}
                  </p>
                  <p className="w-full lg:w-[10%] lg:text-center">
                    {Number(p?.pro_number).toLocaleString()} {p?.unit || "ชิ้น"}
                  </p>
                  <span
                    className={`w-full lg:w-[10%] lg:flex justify-center items-center `}
                  >
                    {Number(p?.sell_count).toLocaleString()} {p?.unit || "ชิ้น"}
                  </span>
                  <span className="w-full lg:w-[15%] lg:flex justify-center items-center">
                    <div className="flex items-center gap-5">
                      <FaEdit
                        onClick={() => handleEdit(p)}
                        size={18}
                        className="cursor-pointer hover:text-blue-500"
                      />
                      <FaTrash
                        onClick={() => handleDelete(p?.pro_id, p?.pro_name)}
                        size={18}
                        className="cursor-pointer hover:text-red-500"
                      />
                    </div>
                  </span>
                </div>
              ))
            ) : (
              <div
                key={uuid()}
                className="w-full flex items-center justify-center h-full flex-col gap-2 text-gray-400"
              >
                <BiFolderOpen size={50} />
                <p>ไม่พบข้อมูล</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* add edit forms */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setDeleteImgs([]);
        }}
      >
        <div className="w-full z-50 lg:w-2/3 p-5 bg-white rounded-lg border border-gray-300 shadow-md overflow-auto lg:h-[650px] shadow-gray-400">
          <span className="w-full border-b border-blue-300 pb-3 flex items-center justify-between">
            <p className="text-lg">
              {editProduct?.pro_id ? "แก้ไขข้อมูลสินค้า" : "เพิ่มข้อมูลสินค้า"}
            </p>
            <button
              onClick={() => {
                setShowModal(false);
                reset();
                setDeleteImgs([]);
              }}
              className="p-2 hover:bg-gray-300 rounded-md"
            >
              <FaTimes size={20} />
            </button>
          </span>

          <div className="w-full flex flex-col lg:mt-5 gap-2 lg:flex-row h-[500px] overflow-auto lg:h-auto">
            {/* text */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 w-full lg:w-1/2 lg:pr-3 lg:border-r border-gray-300">
              {/* ctgs */}
              <div className="flex flex-col lg:col-span-2">
                <p>
                  เลือกหมวดหมู่ <small className="text-red-500">*</small>
                </p>
                <Select
                  options={categoriesOption.filter(
                    (c) =>
                      !selectCategories.map((s) => s?.value).includes(c?.value)
                  )}
                  onChange={(options) => handleSelectCtg(options)}
                  placeholder="เลือกหมวดหมู่"
                  className="w-full mt-1"
                />
                {selectCategories.length > 0 && (
                  <div
                    className={`mt-1.5 w-full grid grid-cols-2 lg:grid-cols-3 gap-2 ${
                      selectCategories.length > 3
                        ? "h-[80px] overflow-auto"
                        : ""
                    }`}
                  >
                    {selectCategories.map((s, index) => (
                      <span
                        key={s?.value || index}
                        className="p-1.5 shadow-sm cursor-pointer justify-between text-xs lg:text-sm bg-green-100 px-2 rounded-md flex items-center gap-2"
                      >
                        <p>{s?.label}</p>
                        <FaTimes
                          onClick={() => handleDeleteSelectCtg(s?.value)}
                          color="red"
                          className="cursor-pointer"
                        />
                      </span>
                    ))}
                  </div>
                )}
              </div>
              {/* pro_name */}
              <div className="flex flex-col w-full lg:col-span-2">
                <p className="mt-5 lg:mt-0">
                  ชื่อสินค้า <small className="text-sm text-red-500">*</small>
                </p>
                <Controller
                  name="pro_name"
                  rules={{ required: "กรุณากรอกชื่อสินค้า" }}
                  control={control}
                  render={({ field }) => (
                    <input
                      value={field.value || ""}
                      {...field}
                      className="w-full p-3 mt-1 text-[0.85rem] rounded-md border border-gray-300"
                      placeholder="ชื่อสินค้า"
                    />
                  )}
                />
                {errors.pro_name && (
                  <small className="text-sm text-red-500">
                    {errors.pro_name.message}
                  </small>
                )}
              </div>
              <div className="flex flex-col w-full ">
                <p className="mt-5 lg:mt-0">
                  หน่วย <small className="text-sm text-red-500">*</small>
                </p>
                <Controller
                  name="unit"
                  rules={{ required: "กรุณากรอกหน่วยของสินค้า" }}
                  control={control}
                  render={({ field }) => (
                    <input
                      value={field.value || ""}
                      {...field}
                      className="w-full p-3 mt-1 text-[0.85rem] rounded-md border border-gray-300"
                      placeholder="เช่น ชิ้น,กล่อง,แพ็ค,ถุง"
                    />
                  )}
                />
                {errors.unit && (
                  <small className="text-sm text-red-500">
                    {errors.unit.message}
                  </small>
                )}
              </div>
              {/* pro price */}
              <div className="flex flex-col w-full">
                <p className="">
                  ราคา <small className="text-sm text-red-500">*</small>
                </p>
                <Controller
                  name="pro_price"
                  rules={{
                    required: "กรุณากรอกราคาสินค้า",
                    validate: (value) => {
                      if (value < 0) return "ราคาไม่ถูกต้อง";
                    },
                  }}
                  control={control}
                  render={({ field }) => (
                    <input
                      value={field.value?.toString() || ""}
                      {...field}
                      type="number"
                      className="w-full p-3 mt-1 text-[0.85rem] rounded-md border border-gray-300"
                      placeholder="ราคาสินค้า"
                    />
                  )}
                />
                {errors.pro_price && (
                  <small className="text-sm text-red-500">
                    {errors.pro_price.message}
                  </small>
                )}
              </div>
              {/*freight*/}
              <div className="flex flex-col w-full">
                <p className="">
                  ค่าจัดส่ง <small className="text-sm text-red-500">*</small>
                </p>
                <Controller
                  name="freight"
                  rules={{
                    required: "กรุณากรอกค่าจัดส่ง",
                    validate: (value) => {
                      if (value < 0) return "ราคาไม่ถูกต้อง";
                    },
                  }}
                  control={control}
                  render={({ field }) => (
                    <input
                      value={field.value?.toString() || ""}
                      {...field}
                      type="number"
                      className="w-full p-3 mt-1 text-[0.85rem] rounded-md border border-gray-300"
                      placeholder="ค่าจัดสินค้า"
                    />
                  )}
                />
                {errors.freight && (
                  <small className="text-sm text-red-500">
                    {errors.freight.message}
                  </small>
                )}
              </div>
              {/* pro_number */}
              <div className="flex flex-col w-full">
                <p className="">
                  จำนวนสินค้า <small className="text-sm text-red-500">*</small>
                </p>
                <Controller
                  name="pro_number"
                  rules={{
                    required: "กรุณากรอกจำนวนที่เพิ่ม",
                    validate: (value) => {
                      if (value < 1) return "จำนวนไม่ถูกต้อง";
                    },
                  }}
                  control={control}
                  render={({ field }) => (
                    <input
                      value={field.value || ""}
                      {...field}
                      type="number"
                      className="w-full p-3 mt-1 text-[0.85rem] rounded-md border border-gray-300"
                      placeholder="จำนวนที่เพิ่มลงสต็อก"
                    />
                  )}
                />
                {errors.pro_number && (
                  <small className="text-sm text-red-500">
                    {errors.pro_number.message}
                  </small>
                )}
              </div>
              {/* pro_color */}
              <div className="flex flex-col w-full">
                <p className="">
                  สีของสินค้า{" "}
                  <small className="text-gray-500"> (, คั่นระหว่างสี)</small>{" "}
                  <small className="text-sm text-red-500">*</small>
                </p>
                <Controller
                  name="pro_color"
                  rules={{
                    required: "กรุณากรอกสี เช่น สีแดง",
                  }}
                  control={control}
                  render={({ field }) => (
                    <input
                      value={field.value || ""}
                      {...field}
                      type="text"
                      className="w-full p-3 mt-1 text-[0.85rem] rounded-md border border-gray-300"
                      placeholder="เช่น สีแดง,สีเขียว,สีฟ้า"
                    />
                  )}
                />
                {errors.pro_color && (
                  <small className="text-sm text-red-500">
                    {errors.pro_color.message}
                  </small>
                )}
              </div>
              {/* pro_size */}
              <div className="flex flex-col w-full">
                <p className="">
                  ไซส์{" "}
                  <small className="text-gray-500"> (, คั่นระหว่างไซส์)</small>{" "}
                  <small className="text-sm text-red-500">*</small>
                </p>
                <Controller
                  name="pro_size"
                  rules={{
                    required: "กรุณากรอกไซส์ เช่น S,M",
                  }}
                  control={control}
                  render={({ field }) => (
                    <input
                      value={field.value || ""}
                      {...field}
                      type="text"
                      className="w-full p-3 mt-1 text-[0.85rem] rounded-md border border-gray-300"
                      placeholder="เช่น S,M,L,XL"
                    />
                  )}
                />
                {errors.pro_size && (
                  <small className="text-sm text-red-500">
                    {errors.pro_size.message}
                  </small>
                )}
              </div>
              {/* pro details */}
              <div className="flex flex-col w-full lg:col-span-2">
                <p className="">
                  รายละเอียดสินค้า{" "}
                  <small className="text-sm text-red-500">*</small>
                </p>
                <Controller
                  name="pro_details"
                  rules={{
                    required: "กรุณาระบุรายละเอียดของสินค้า",
                    validate: (value) => {
                      if (value.length < 20) return "รายละเอียดสั้นเกินไป";
                    },
                  }}
                  control={control}
                  render={({ field }) => (
                    <textarea
                      value={field.value || ""}
                      {...field}
                      type="text"
                      className="w-full p-3 mt-1 text-[0.85rem] h-[150px] resize-none rounded-md border border-gray-300"
                      placeholder="อธิบาย รายละเอียดของสินค้า"
                    ></textarea>
                  )}
                />
                {errors.pro_details && (
                  <small className="text-sm text-red-500">
                    {errors.pro_details.message}
                  </small>
                )}
              </div>
            </div>
            {/* imgs */}
            <div className="w-full lg:w-1/2 flex flex-col pl-3">
              <span className="flex flex-col items-start gap-1">
                <p>รูปภาพสินค้า ({previewImages.length}/5)</p>
                <label
                  htmlFor="img-pickers"
                  className="p-2.5 px-3.5 cursor-pointer hover:bg-blue-400 rounded-md flex items-center gap-2 mt-2 w-fite bg-blue-500 text-white"
                >
                  <input
                    type="file"
                    id="img-pickers"
                    className="hidden"
                    multiple
                    onChange={handleSelectImage}
                  />
                  <FaImage />
                  <p>เลือกรูป</p>
                </label>
              </span>

              <div className="mt-3.5 w-full flex flex-col gap-3 h-[500px] overflow-auto pt-3">
                {previewImages?.length > 0 &&
                  previewImages.map((p) => (
                    <div
                      key={p?.id}
                      className="lg:w-[45%] w-[55%] h-[160px] relative"
                    >
                      <button
                        onClick={() => handleDeleteImage(p?.id, p?.url)}
                        className="absolute top-[-0.5rem] cursor-pointer z-10 right-[-0.5rem] p-1 rounded-full shadow-md border border-gray-200 bg-red-500 text-white"
                      >
                        <FaTrash />
                      </button>

                      <img
                        src={p?.url || NO_IMG_PRODUCT}
                        className="w-full h-full object-cover rounded-lg border border-gray-300 shadow-sm"
                        alt=""
                      />
                    </div>
                  ))}
              </div>
            </div>
          </div>

          <button
            disabled={saving}
            onClick={handleSubmit(handleSaveProduct)}
            className="p-2 px-3 flex items-center gap-2 mt-5 text-white bg-blue-500 rounded-md hover:bg-blue-600"
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
export default Product;
