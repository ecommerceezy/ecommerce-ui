"use client";
import MyDatePicker from "@/components/date-picker";
import Loader from "@/components/loader";
import Modal from "@/components/model";
import PromotionCard from "@/components/promotion-card";
import { envConfig } from "@/config/env-config";
import { popup } from "@/libs/alert-popup";
import axios from "axios";
import { debounce } from "lodash";
import Link from "next/link";
import { use, useEffect, useMemo, useState } from "react";
import {
  FaBox,
  FaCalendar,
  FaChevronDown,
  FaChevronLeft,
  FaChevronRight,
  FaFolder,
  FaPlus,
  FaSearch,
  FaTag,
  FaTags,
  FaTimes,
} from "react-icons/fa";
import { NO_IMG_PRODUCT } from "../product/page";

const Page = () => {
  const [showModal, setShowModal] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPage, setTotalPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState(JSON.stringify({ createdAt: "desc" }));
  const [promotionStart, setPromotionStart] = useState();
  const [promotionEnd, setPromotionEnd] = useState();
  const [promotionDetail, setPromotionDetai] = useState(null);
  const [loading, setLoading] = useState(false);
  const forwardPage = () => {
    if (page >= totalPage) return;
    setPage(page + 1);
  };

  const prevPage = () => {
    if (page <= 1) return;
    setPage(page - 1);
  };

  const [avgPromotion, setAvgPromotion] = useState();
  const getAvg = async () => {
    try {
      const res = await axios.get(envConfig.apiURL + "/admin/promotion-avg", {
        withCredentials: true,
      });
      if (res.status === 200) {
        setAvgPromotion(res.data);
        setTotal(res?.data?.total);
        setTotalPage(res?.data?.totalPage);
      }
    } catch (error) {
      console.error(error);
      popup.err();
    }
  };
  useEffect(() => {
    getAvg();
  }, []);

  const [promotions, setPromotions] = useState([]);
  const fetchPromotions = async (
    page,
    search,
    sort,
    promotionStart,
    promotionEnd
  ) => {
    setLoading(true);
    try {
      const res = await axios.get(envConfig.apiURL + "/admin/promotions", {
        withCredentials: true,
        params: {
          page,
          search,
          sort,
          promotionStart,
          promotionEnd,
          take: 20,
        },
      });
      if (res.status === 200) {
        setPromotions(res.data?.data);
        setTotal(res?.data?.total);
        setTotalPage(res?.data?.totalPage);
      }
    } catch (error) {
      console.error(error);
      popup.err();
    } finally {
      setLoading(false);
    }
  };

  const debounceSearch = useMemo(
    () => debounce(fetchPromotions, 700),
    [fetchPromotions]
  );

  useEffect(() => {
    debounceSearch(page, search, sort, promotionStart, promotionEnd);
  }, [page, search, sort, promotionStart, promotionEnd]);

  const deletePromotion = async (id) => {
    const { isConfirmed } = await popup.confirmPopUp(
      "ลบโปรโมชัน",
      "ต้องการลบโปรโมชันนี้หรือไม่?",
      "ลบ"
    );
    if (!isConfirmed) return;
    setLoading(true);
    try {
      const res = await axios.delete(
        envConfig.apiURL + `/admin/delete-promotion/${id}`,
        { withCredentials: true }
      );
      if (res.status === 200) {
        fetchPromotions(page, search, sort, promotionStart, promotionEnd);
        getAvg();
        popup.success("ลบข้อมูลแล้ว");
      }
    } catch (error) {
      console.error(error);
      popup.err();
    } finally {
      setLoading(false);
    }
  };

  const [geting, setGeting] = useState(false);
  const getPromotionDetail = async (id) => {
    setGeting(true);
    try {
      const res = await axios.get(envConfig.apiURL + `/admin/promotion/${id}`, {
        withCredentials: true,
      });
      setPromotionDetai(res.data);
      console.log("🚀 ~ getPromotionDetail ~ res.data:", res.data);
      setShowModal(true);
    } catch (error) {
      console.error(error);
      popup.err();
    } finally {
      setGeting(false);
    }
  };

  const displayStatus = (start_date, end_date) => {
    const today = new Date();
    const start = new Date(start_date);
    const end = new Date(end_date);
    if (end - today < 5) {
      return 3;
    } else if (today >= end) {
      return 2;
    } else if (today >= start) {
      return 1;
    }
  };

  return (
    <>
      <div className="w-full p-5 rounded-lg flex flex-col bg-white shadow-sm">
        <p className="text-2xl font-bold text-blue-500">จัดการโปรโมชัน</p>
        <p className="mt-1">เพิ่ม ลบ แก้ไข โปรโมชันสินค้า</p>
      </div>

      {/* stat boxes */}
      <div className="w-full mt-5 pt-5 border-t border-blue-500 flex items-center flex-col">
        <div className="grid bg-white lg:grid-cols-2 grid-cols-1 gap-3.5 w-full">
          <div className="p-5 rounded-lg border border-gray-300 shadow-md shadow-gray-300 flex flex-col gap-1.5">
            <span className="w-full flex items-center justify-between">
              <p className="text-yellow-500">โปรโมชันทั้งหมด</p>
              <div className="p-2 rounded-md bg-amber-50 border border-yellow-500">
                <FaTags color="orange" />
              </div>
            </span>
            <p className="text-xl font-bold">
              {loading
                ? ""
                : Number(avgPromotion?.allPromotion || 0).toLocaleString() || 0}
            </p>
            <p>รายการ</p>
          </div>

          <div className="p-5 rounded-lg border border-gray-300 shadow-md shadow-gray-300 flex flex-col gap-1.5">
            <span className="w-full flex items-center justify-between">
              <p className="text-purple-500">จำนวนสินค้าที่จัดโปรโมชัน</p>
              <div className="p-2 rounded-md bg-pink-50 border border-purple-500">
                <FaBox color="purple" />
              </div>
            </span>
            <p className="text-xl font-bold">
              {loading
                ? ""
                : Number(
                    avgPromotion?.allProductInPromotion || 0
                  ).toLocaleString() || 0}
            </p>
            <p>ชิ้น</p>
          </div>
        </div>
      </div>

      {/* search input */}
      <div className="mt-5 w-full flex gap-2 lg:items-center flex-col lg:flex-row justify-between">
        {/* search box */}
        <div className="w-full lg:w-1/3 p-3 rounded-md border border-gray-300 bg-white shadow-sm flex items-center gap-2">
          <FaSearch />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-[90%] text-sm"
            placeholder="พิมพ์ค้นหา"
          />
        </div>

        <Link
          href="/admin/promotion/0"
          className="p-3 w-fit shadow-md rounded-md text-sm flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white"
        >
          <FaPlus />
          <p>สร้างโปโมชันใหม่</p>
        </Link>
      </div>
      {/* search filter */}
      <div className="w-full flex  items-center justify-between mt-3">
        {/* sort */}
        <div className=" flex lg:flex-row flex-col lg:items-center gap-2">
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
                value={JSON.stringify({
                  products: {
                    _count: "desc",
                  },
                })}
                className="text-sm"
              >
                สินค้าร่วมรายการมากสุด
              </option>
              <option
                value={JSON.stringify({ updatedAt: "desc" })}
                className="text-sm"
              >
                แก้ไขล่าสุด
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

          <MyDatePicker
            setDate={setPromotionStart}
            date={promotionStart}
            placeholderText="เลือกวันที่เริ่มโปรโมชัน"
          />
          <MyDatePicker
            setDate={setPromotionEnd}
            date={promotionEnd}
            placeholderText="เลือกวันที่สิ้นสุดโปรโมชัน"
          />
        </div>
        <div className="flex items-center text-sm gap-2.5 col-span-2 lg:col-span-1">
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
      <p className="mt-3 text-sm text-gray-600">
        ผลการค้นหา {total?.toLocaleString() || 0} รายการ
      </p>

      {/* main */}
      <div className="w-full mt-5 grid lg:grid-cols-4 grid-cols-1 gap-3">
        {loading ? (
          <div className="lg:col-span-4 flex flex-col items-center gap-1 py-10">
            <Loader />
            <p>กำลังโหลด...</p>
          </div>
        ) : promotions.length > 0 ? (
          promotions.map((p) => (
            <PromotionCard
              key={p?.id}
              {...p}
              onDelete={() => deletePromotion(p?.id)}
              onView={() => getPromotionDetail(p?.id)}
            />
          ))
        ) : (
          <div className="lg:col-span-4 flex flex-col items-center text-gray-500 gap-1 py-10">
            <FaFolder size={25} />
            <p>ไม่พบข้อมูล</p>
          </div>
        )}
        <div className=""></div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <div className="w-full z-30 h-[600px] overflow-auto lg:w-2/3 p-5 bg-white rounded-lg border border-gray-300 shadow-md flex flex-col">
          <span className="w-full pb-3 border-b border-gray-300 flex items-center justify-between">
            <p className="">รายละเอียดโปรโมชัน</p>
            <button
              onClick={() => setShowModal(false)}
              className="p-2.5 rounded-md hover:bg-gray-200 "
            >
              <FaTimes size={20} />
            </button>
          </span>
          <div className="mt-5 p-5 rounded-lg shadow-md border border-gray-300 flex flex-col gap-3">
            <p className="text-2xl font-bold">{promotionDetail?.name}</p>
            {promotionDetail?.description && (
              <p className="p-2.5 shadow-sm bg-blue-50 text-gray-700 text-sm">
                หมายเหตุ : {promotionDetail?.description}
              </p>
            )}

            <span
              className={`inline-block w-fit ${
                displayStatus(
                  promotionDetail?.start_date,
                  promotionDetail?.end_date
                ) < 2
                  ? "bg-green-500"
                  : displayStatus(
                      promotionDetail?.start_date,
                      promotionDetail?.end_date
                    ) > 2
                  ? "bg-red-500"
                  : "bg-orange-500"
              } text-white font-medium p-2 px-3.5 rounded-full mb-3 `}
            >
              {displayStatus(
                promotionDetail?.start_date,
                promotionDetail?.end_date
              ) < 2
                ? "กำลังใช้งาน"
                : displayStatus(
                    promotionDetail?.start_date,
                    promotionDetail?.end_date
                  ) > 2
                ? "หมดอายุ"
                : "ใกล้หมดอายุ"}
            </span>
            <div className="w-full flex flex-col lg:flex-row lg:items-center gap-3.5">
              <span className="flex flex-1 items-center gap-2.5 p-3 px-5 rounded-md shadow-md bg-gray-100">
                <p className="p-2 shadow-sm rounded-full bg-blue-50">
                  <FaTag color="blue" />
                </p>
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm text-gray-700">ส่วนลด</p>
                  <p className="text-2xl font-bold text-blue-500">
                    {Number(promotionDetail?.discount || 0)?.toLocaleString()}%
                  </p>
                </div>
              </span>
              <span className="flex flex-1 items-center gap-2.5 p-3 px-5 rounded-md shadow-md bg-gray-100">
                <p className="p-2 shadow-sm rounded-full bg-green-50">
                  <FaCalendar color="green" />
                </p>
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm text-gray-700">วันที่เริ่มโปรโมชัน</p>
                  <p className="text-2xl font-bold text-green-500">
                    {new Date(promotionDetail?.start_date).toLocaleDateString(
                      "th-TH"
                    )}
                  </p>
                </div>
              </span>
              <span className="flex flex-1 items-center gap-2.5 p-3 px-5 rounded-md shadow-md bg-gray-100">
                <p className="p-2 shadow-sm rounded-full bg-orange-50">
                  <FaCalendar color="orange" />
                </p>
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm text-gray-700">วันที่หมดโปรโมชัน</p>
                  <p className="text-2xl font-bold text-orange-500">
                    {new Date(promotionDetail?.end_date).toLocaleDateString(
                      "th-TH"
                    )}
                  </p>
                </div>
              </span>
            </div>
          </div>
          <div className="mt-5 p-8 rounded-lg border border-gray-300 flex flex-col gap-2.5 shadow-md">
            <span className="flex items-center gap-2">
              <p className="p-2 rounded-full border border-pink-500">
                <FaBox color="purple" />
              </p>
              <p className="text-xl font-bold">สินค้าที่ร่วมรายการ</p>
            </span>

            <div className="mt-2 grid grid-cols-1 lg:grid-cols-4 gap-3 w-full">
              {promotionDetail?.products?.map((p) => (
                <div
                  key={p?.pro_id}
                  className="rounded-md border border-gray-300 shadow-md flex flex-col"
                >
                  <img
                    src={
                      p?.imgs[0]
                        ? envConfig.imgURL + p?.imgs[0]?.url
                        : NO_IMG_PRODUCT
                    }
                    className="w-full h-[150px] object-cover"
                    alt=""
                  />
                  <div className="p-2 flex flex-col gap-0.5 text-sm">
                    <p className="font-bold">{p?.pro_name}</p>
                    <p className="text-gray-800 line-through">
                      ราคาเดิม : ฿{p?.pro_price?.toLocaleString()}
                    </p>
                    <p className="text-gray-800">
                      ลดราคา : ฿
                      {Math.round(
                        (Number(promotionDetail.discount) / 100) * p?.pro_price
                      )}
                    </p>
                    <p className="text-gray-800 ">
                      คงเหลือ : ฿
                      {(
                        p?.pro_price -
                        Math.round(
                          (Number(promotionDetail.discount) / 100) *
                            p?.pro_price
                        )
                      ).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};
export default Page;
