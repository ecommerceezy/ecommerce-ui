"use client";
import { use, useEffect, useMemo, useState } from "react";
import { FiFolderMinus } from "react-icons/fi";
import {
  FaBox,
  FaCalendar,
  FaCaretUp,
  FaCheck,
  FaCheckCircle,
  FaChevronDown,
  FaChevronLeft,
  FaChevronRight,
  FaCity,
  FaClock,
  FaCreditCard,
  FaEdit,
  FaEnvelope,
  FaHourglassHalf,
  FaPhone,
  FaReceipt,
  FaRegListAlt,
  FaSearch,
  FaTimes,
  FaTrash,
  FaTruck,
  FaTruckMoving,
  FaUser,
} from "react-icons/fa";
import { MdInfoOutline } from "react-icons/md";
import { v4 as uuid } from "uuid";
import axios from "axios";
import { envConfig } from "@/config/env-config";
import { popup } from "@/libs/alert-popup";
import Loading from "@/layout/loading";
import { debounce } from "lodash";
import Modal from "@/components/model";
import Loader from "@/components/loader";

const Orders = () => {
  const [showModal, setShowModal] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [totalPage, setTotalPage] = useState(1);
  const [take, setTake] = useState(15);
  const [searchStatus, setSearchStatus] = useState("all");
  const [sort, setSort] = useState(JSON.stringify({ createdAt: "desc" }));
  const [loading, setLoading] = useState(false);
  const [orderList, setOrderList] = useState([]);
  const [orderAvg, setOrderAvg] = useState(null);
  const [order, setOrder] = useState(null);

  const [geting, setGeting] = useState(false);
  const getOrderAvg = async () => {
    setGeting(true);
    try {
      const res = await axios.get(envConfig.apiURL + "/admin/orders-avg", {
        withCredentials: true,
      });
      if (res.status === 200) {
        setOrderAvg(res.data);
      }
    } catch (error) {
      console.error(error);
      popup.err();
    } finally {
      setGeting(false);
    }
  };
  useEffect(() => {
    getOrderAvg();
  }, []);

  const resetAllSearch = () => {
    setPage(1);
    setSort(JSON.stringify({ createdAt: "desc" }));
    setTake(15);
    setSearchStatus("all");
  };

  const fetchOrderHistory = async (status, sort, page, take, search) => {
    setLoading(true);
    try {
      const res = await axios.get(envConfig.apiURL + "/admin/get-orders", {
        withCredentials: true,
        params: {
          status,
          sort,
          page,
          take,
          search,
        },
      });
      if (res.status === 200) {
        setOrderList(res.data.data);
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

  const [getingOrder, setGetingOder] = useState(false);
  const fetchOrder = async (id) => {
    setGetingOder(true);
    try {
      const res = await axios.get(
        envConfig.apiURL + `/admin/order-detail/${id}`,
        { withCredentials: true }
      );
      if (res.status === 200) {
        setOrder(res.data);
      }
    } catch (error) {
      console.error(error);
      popup.err();
    } finally {
      setGetingOder(false);
    }
  };

  const handleLookOrder = (id) => {
    fetchOrder(id);
    setShowModal(true);
  };

  const debounceSearch = useMemo(
    () => debounce(fetchOrderHistory, 700),
    [fetchOrderHistory]
  );

  useEffect(() => {
    debounceSearch(searchStatus, sort, page, take, search);
  }, [searchStatus, sort, page, take, search]);

  const forwardPage = () => {
    if (page >= totalPage) return;
    setPage(page + 1);
  };

  const prevPage = () => {
    if (page <= 1) return;
    setPage(page - 1);
  };

  const handleUpdateOrderStatus = async (status, orderId) => {
    const { isConfirmed } = await popup.confirmPopUp(
      status === "cancel"
        ? "ยกเลิกคำสั่งซื้อนี้"
        : "ฉันได้ตรวจสอบความถูกต้องของคำสั่งซื้อนี้แล้ว",
      status === "cancel"
        ? "ต้องการยกเลิกคำสั่งซื้อนี้หรือไม่"
        : "กด ยืนยัน เพื่อยืนยันคำสั่งซื้อนี้ จากนั้นคำสั่งซื้อนี้จะเข้าสู่สถานะ กำลังจัดส่ง",
      status === "cancel" ? "ยกเลิกคำสั่งซื้อ" : "ยืนยัน"
    );
    if (!isConfirmed) return;

    setGetingOder(true);
    try {
      const res = await axios.put(
        envConfig.apiURL + `/admin/update-order-status`,
        { status, orderId },
        { withCredentials: true }
      );
      if (res.status === 200) {
        popup.success(
          status === "cancel" ? "ยกเลิกคำสั่งซื้อแล้ว" : "ยืนยันคำสั่งซื้อแล้ว"
        );
        fetchOrderHistory(searchStatus, sort, page, take, search);
        getOrderAvg();
        setShowModal(false);
      }
    } catch (error) {
      console.error(error);
      popup.err();
    } finally {
      setGetingOder(false);
    }
  };

  if (geting) return <Loading />;

  return (
    <>
      {" "}
      <div className="w-full p-5 bg-white h-full overflow-auto border border-gray-300">
        <p className="text-2xl font-bold text-blue-500">จัดการคำสั่งซื้อ</p>
        <p className="mt-1">ดูรายละเอียดคำสั่งซื้อและอัปเดตสถานะคำสั่งซื้อ</p>
        <div className="mt-5 pt-5 border-t-2 border-blue-500 w-full">
          <div className="grid lg:grid-cols-5 grid-cols-1 gap-3.5 w-full">
            <div className="p-5 rounded-lg border border-gray-300 shadow-md flex flex-col gap-2">
              <p className="text-blue-500 font-bold">คำสั่งซื้อทั้งหมด</p>
              <span className="w-full flex items-center justify-between">
                <p className="font-bold text-xl">
                  {Number(orderAvg?.allOrders || 0).toLocaleString()}
                </p>
                <div className="p-2 rounded-full border border-blue-600">
                  <FaReceipt color="blue" />
                </div>
              </span>
            </div>
            <div className="p-5 rounded-lg border border-gray-300 shadow-md flex flex-col gap-2">
              <p className="text-orange-500 font-bold">รอยืนยัน</p>
              <span className="w-full flex items-center justify-between">
                <p className="font-bold text-xl">
                  {Number(orderAvg?.allPending || 0).toLocaleString()}
                </p>
                <div className="p-2 rounded-full border border-orange-600">
                  <FaHourglassHalf color="orange" />
                </div>
              </span>
            </div>
            <div className="p-5 rounded-lg border border-gray-300 shadow-md flex flex-col gap-2">
              <p className="text-purple-500 font-bold">อยู่ระหว่างจัดส่ง</p>
              <span className="w-full flex items-center justify-between">
                <p className="font-bold text-xl">
                  {" "}
                  {Number(orderAvg?.allSending || 0).toLocaleString()}
                </p>
                <div className="p-2 rounded-full border border-purple-600">
                  <FaTruckMoving color="purple" />
                </div>
              </span>
            </div>
            <div className="p-5 rounded-lg border border-gray-300 shadow-md flex flex-col gap-2">
              <p className="text-green-500 font-bold">สำเร็จ</p>
              <span className="w-full flex items-center justify-between">
                <p className="font-bold text-xl">
                  {" "}
                  {Number(orderAvg?.allRecevied || 0).toLocaleString()}
                </p>
                <div className="p-2 rounded-full border border-green-600">
                  <FaCheck color="green" />
                </div>
              </span>
            </div>
            <div className="p-5 rounded-lg border border-gray-300 shadow-md flex flex-col gap-2">
              <p className="text-red-500 font-bold">ยกเลิก</p>
              <span className="w-full flex items-center justify-between">
                <p className="font-bold text-xl">
                  {" "}
                  {Number(orderAvg?.allCancel || 0).toLocaleString()}
                </p>
                <div className="p-2 rounded-full border border-red-600">
                  <FaTimes color="red" />
                </div>
              </span>
            </div>
          </div>
        </div>

        <p className="mt-5">ผลการค้นหา {total.toLocaleString()} คำสั่งซื้อ</p>
        {/* search */}
        <div className="w-full mt-3 grid lg:grid-cols-7 grid-cols-2 gap-2">
          <div className="p-1.5 px-3 col-span-2 text-[0.85rem] rounded-md flex items-center gap-2 border border-gray-300">
            <FaSearch />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              type="text"
              className="w-[90%]"
              placeholder="ค้นหาลูกค้า"
            />
          </div>
          <div title="สถานะ" className="relative inline-block">
            <select
              onChange={(e) => {
                setSearchStatus(e.target.value);
                setPage(1);
              }}
              value={searchStatus}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            >
              <option value={"all"} className="text-sm">
                ทั้งหมด
              </option>
              <option value={"pending"} className="text-sm">
                รอการยืนยัน
              </option>
              <option value={"sending"} className="text-sm">
                กำลังจัดส่ง
              </option>

              <option value={"recevied"} className="text-sm">
                สำเร็จแล้ว
              </option>
              <option value={"cancel"} className="text-sm">
                ยกเลิก
              </option>
            </select>
            <label
              htmlFor="select-row"
              className="p-2 px-3.5 rounded-lg border border-gray-300 shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <MdInfoOutline size={17} />
              <p className="text-sm hidden lg:inline-flex">
                สถานะ :{" "}
                {searchStatus === "all"
                  ? "ทั้งหมด"
                  : searchStatus === "pending"
                  ? "รอการยืนยีน"
                  : searchStatus === "sending"
                  ? "กำลังจัดส่ง"
                  : searchStatus === "recevied"
                  ? "สำเร็จ"
                  : "ยกเลิก"}
              </p>
            </label>
          </div>
          <div title="เรียงตาม" className="relative inline-block">
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
                คำสั่งซื้อล่าสุด
              </option>
              <option
                value={JSON.stringify({ createdAt: "asc" })}
                className="text-sm"
              >
                คำสั่งซื้อเก่าสุด
              </option>
              <option
                value={JSON.stringify({ bill_price: "desc" })}
                className="text-sm"
              >
                ยอดรวมมากสุด
              </option>
              <option
                value={JSON.stringify({ bill_productPeace: "desc" })}
                className="text-sm"
              >
                จำนวนสินค้าเยอะที่สุด
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
          <div title="เลือกจำนวนที่แสดง" className="relative inline-block">
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
            className="flex text-sm items-center p-2 border border-gray-300 rounded-md justify-center gap-2"
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

        <div className="mt-3.5 w-full flex flex-col p-6 rounded-lg border border-gray-300 shadow-md shadow-gray-300">
          <div className="w-full mb-3 items-center hidden text-[0.9rem] lg:flex  pb-3 border-b border-blue-300">
            <p className="w-[7%] text-start">ลำดับ</p>
            <p className="w-[28%] text-start">คำสั่งซื้อ</p>
            <p className="w-[20%] text-start">ลูกค้า</p>
            <span className="w-[10%] flex items-center justify-center text-center gap-2">
              <p>วันที่สั่งซื้อ</p>
            </span>
            <span className="w-[10%] flex items-center justify-center text-center gap-2">
              <p>ยอดรวม</p>
              <FaCaretUp
                className="cursor-pointer"
                onClick={() => setSort(JSON.stringify({ bill_price: "asc" }))}
                size={15}
              />
            </span>
            <span className="w-[10%] flex items-center justify-center text-center gap-2">
              <p>สถานะ</p>
            </span>
            <p className="w-[15%] text-center">ตรวจสอบ</p>
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
            ) : orderList?.length > 0 ? (
              orderList?.map((o, index) => (
                <div
                  key={uuid()}
                  onClick={() => handleLookOrder(o?.bill_id)}
                  className="cursor-pointer grid grid-cols-1 text-[0.9rem] border-b border-blue-100 hover:bg-blue-50 w-full lg:flex gap-2 lg:gap-0 items-center py-2"
                >
                  <p className="w-full lg:w-[7%] lg:text-start">
                    {index + (page - 1) * 10 + 1}
                  </p>
                  <div className="w-full lg:w-[28%] flex flex-col gap-1 items-start">
                    <p className="text-blue-600 w-full text-sm">{o?.bill_id}</p>
                    <span className="flex items-center gap-3 text-sm">
                      <p className="p-1.5 rounded-md border bg-green-50 text-green-600 border-green-200">
                        {o?.pm_method}{" "}
                      </p>{" "}
                      <p className="text-sm text-gray-700">
                        {o?.bill_productList} รายการ {o?.bill_productPeace} ชิ้น
                      </p>
                    </span>
                  </div>
                  <div className="w-full lg:w-[20%] flex justify-start flex-col gap-1 lg:text-start break-words">
                    <p className="font-bold">
                      {o?.user?.title_type}
                      {o?.user?.first_name} {o?.user?.last_name}
                    </p>
                    <p>{o?.user?.tel}</p>
                  </div>

                  <p className="w-full lg:w-[10%] lg:text-center">
                    {new Date(o?.bill_date).toLocaleDateString("th-TH")}
                  </p>
                  <p className="w-full lg:w-[10%] lg:text-center font-bold">
                    ฿{Number(o?.bill_price || 0).toLocaleString()}
                  </p>
                  <div className="w-full lg:w-[10%] flex items-center justify-center">
                    <span
                      className={`flex items-center gap-2 p-1 justify-center rounded-md w-fit text-sm ${
                        o?.status_pm === "pending"
                          ? "text-orange-400 bg-orange-100 shadow-md"
                          : o?.status_pm === "sending"
                          ? "text-purple-500 bg-purple-100 shadow-md"
                          : o?.status_pm === "recevied"
                          ? "text-green-500 bg-green-100 shadow-md"
                          : "text-red-500 bg-red-100 shadow-md"
                      }`}
                    >
                      {o?.status_pm === "pending" ? (
                        <>
                          <FaClock />
                          <p>รอยืนยัน</p>
                        </>
                      ) : o?.status_pm === "sending" ? (
                        <>
                          <FaTruck />
                          <p>กำลังจัดส่ง</p>
                        </>
                      ) : o?.status_pm === "recevied" ? (
                        <>
                          {" "}
                          <FaCheck />
                          <p>สำเร็จ</p>
                        </>
                      ) : (
                        <>
                          <FaTimes />
                          <p>ยกเลิก</p>
                        </>
                      )}
                    </span>
                  </div>

                  <span className="w-full lg:w-[15%] lg:flex justify-center items-center">
                    <button className="underline text-blue-500">ตรวจสอบ</button>
                  </span>
                </div>
              ))
            ) : (
              <div
                key={uuid()}
                className="w-full flex items-center justify-center h-full flex-col gap-2 text-gray-400"
              >
                <FiFolderMinus size={50} />
                <p>ไม่พบคำสั่งซื้อ</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <div className="lg:w-1/2 z-50 bg-white h-[680px] relative w-full overflow-auto p-7 flex flex-col rounded-lg shadow-md shadow-gray-400">
          {getingOrder ? (
            <div className="w-full flex flex-col h-full items-center justify-center gap-1 bg-gray-200">
              <Loader />
              <p>กำลังโหลด...</p>
            </div>
          ) : (
            <>
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-2.5 right-2.5 p-2.5 rounded-md hover:bg-gray-100 flex items-center gap-2"
              >
                <FaTimes size={20} />
              </button>
              <div className="w-full p-5 rounded-lg border border-gray-300 shadow-md flex flex-col">
                <div className="w-full flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <p className="text-lg font-bold">รายละเอียดคำสั่งซื้อ</p>
                    <p className="text-blue-500 font-bold">{order?.bill_id}</p>
                  </div>
                  <span
                    className={`flex flex-col p-1.5 px-2 rounded-md shadow-md lg:flex-row items-center gap-2 text-sm ${
                      order?.status_pm === "pending"
                        ? "text-orange-400 bg-orange-100"
                        : order?.status_pm === "sending"
                        ? "text-purple-500 bg-purple-100"
                        : order?.status_pm === "recevied"
                        ? "text-green-500 bg-green-100"
                        : "text-red-500 bg-red-100"
                    }`}
                  >
                    {order?.status_pm === "pending" ? (
                      <>
                        <FaClock />
                        <p>รอยืนยัน</p>
                      </>
                    ) : order?.status_pm === "sending" ? (
                      <>
                        <FaTruck />
                        <p>กำลังจัดส่ง</p>
                      </>
                    ) : order?.status_pm === "recevied" ? (
                      <>
                        {" "}
                        <FaCheck />
                        <p>ได้รับแล้ว</p>
                      </>
                    ) : (
                      <>
                        <FaTimes />
                        <p>ยกเลิก</p>
                      </>
                    )}
                  </span>
                </div>
                <div className="flex lg:flex-row flex-col gap-3 lg:items-center w-full mt-5 justify-between">
                  <div className="flex items-center gap-2.5">
                    <FaCalendar color="green" />
                    <span className="flex flex-col">
                      <p className="text-sm text-gray-500">วันที่สั่งซื้อ</p>
                      <p>
                        {new Date(order?.bill_date).toLocaleDateString("th-TH")}
                      </p>
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <FaCreditCard color="blue" />
                    <span className="flex flex-col">
                      <p className="text-sm text-gray-500">วิธีชำระเงิน</p>
                      <p>{order?.pm_method}</p>
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <FaBox color="orange" />
                    <span className="flex flex-col">
                      <p className="text-sm text-gray-500">จำนวนสินค้า</p>
                      <p>
                        {Number(order?.bill_productPeace || 0).toLocaleString()}{" "}
                        ชิ้น
                      </p>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col mt-5 p-5 border border-gray-300 shadow-md rounded-lg">
                <p className="text-lg font-bold w-full pb-3 border-b border-blue-200">
                  ลูกค้า
                </p>
                <div className="w-full mt-3 grid gap-2">
                  <span className="flex items-start gap-2.5 pb-3 border-b border-gray-300">
                    <FaUser color="blue" />
                    <div className="flex flex-col">
                      <p className="text-sm text-gray-600">ชื่อ - นามสกุล :</p>
                      <p className="font-bold">
                        {order?.user?.title_type}
                        {order?.user?.first_name} {order?.user?.last_name}
                      </p>
                    </div>
                  </span>
                  <span className="flex items-start gap-2.5 pb-3 border-b border-gray-300">
                    <FaPhone color="green" />
                    <div className="flex flex-col">
                      <p className="text-sm text-gray-600">โทร :</p>
                      <p className="">{order?.user?.tel}</p>
                    </div>
                  </span>
                  <span className="flex items-start gap-2.5 pb-3 border-b border-gray-300">
                    <FaEnvelope color="red" />
                    <div className="flex flex-col">
                      <p className="text-sm text-gray-600">อีเมล :</p>
                      <p className="">{order?.user?.email}</p>
                    </div>
                  </span>
                  <span className="flex items-center gap-2.5 pb-3 border-b border-gray-300">
                    <FaCity color="orange" size={20} />
                    <div className="flex flex-col">
                      <p className="text-sm text-gray-600">ที่อยู่ :</p>
                      <p className="break-words text-sm">
                        {order?.user?.address?.split("/=/").join(" ")}
                      </p>
                    </div>
                  </span>
                </div>
              </div>

              <div className="flex flex-col mt-5 p-5 border border-gray-300 shadow-md rounded-lg">
                <p className="text-lg font-bold w-full pb-3 border-b border-blue-200">
                  รายการสินค้า
                </p>
                <div className="w-full mt-3 flex flex-col h-[300px] overflow-auto">
                  {order?.order_details?.map((d) => (
                    <div
                      key={d?.detail_id}
                      className="w-full flex flex-col lg:flex-row lg:items-center py-2 border-b border-gray-300"
                    >
                      <div className="lg:w-1/2 w-full flex items-center gap-2">
                        <div className="w-[65px] h-[65px] border border-gray-200 rounded-md overflow-hidden">
                          <img
                            src={
                              envConfig.imgURL + d?.product?.imgs[0]?.url ||
                              NO_IMG_PRODUCT
                            }
                            className="w-full h-full object-cover "
                            alt=""
                          />
                        </div>
                        <div className="flex flex-col lg:w-4/5 w-1/2 lg:flex-row lg:items-center gap-1">
                          <div className="flex flex-col gap-0.5 lg:h-[65px] lg:w-[65%] w-full ">
                            <p className=" text-gray-800 text-[0.85rem] break-words text-start">
                              {d?.product?.pro_name}
                            </p>
                            <p className="text-gray-500 text-sm">
                              สี : {d?.color}
                            </p>
                            <p className="text-gray-500 text-sm">
                              ขนาด : {d?.size}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center  lg:mt-0  w-full lg:w-1/2 justify-end gap-16 px-5">
                        <span className="flex flex-col items-center">
                          <p className="text-sm text-gray-600">จำนวน</p>
                          <p> {Number(d?.quantity || 0).toLocaleString()}</p>
                        </span>
                        <span className="flex flex-col items-center">
                          <p className="text-sm text-gray-600">ราคารวม</p>
                          <p className="text-orange-600">
                            ฿ {Number(d?.total_amount || 0).toLocaleString()}
                          </p>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="w-full mt-5 flex flex-col p-5 rounded-lg border border-gray-300 shadow-lg gap-3.5">
                <p className="text-lg font-bold w-full pb-3 border-b border-blue-300">
                  ยอดชำระทั้งหมด
                </p>

                <span className="w-full flex justify-between ">
                  <p className="text-gray-600 text-sm">รวมราคาสินค้า</p>
                  <p className="text-lg text-orange-500">
                    ฿{Number(order?.bill_totalamount || 0).toLocaleString()}
                  </p>
                </span>
                <span className="w-full flex justify-between ">
                  <p className="text-gray-600 text-sm">ค่าจัดส่ง</p>
                  <p className="text-lg ">
                    ฿{Number(order?.bill_freighttotal || 0).toLocaleString()}
                  </p>
                </span>

                <span className="pt-3.5 border-t border-blue-300 w-full flex items-center justify-between">
                  <p className="text-lg font-bold"> รวมทั้งหมด</p>
                  <p className="text-lg font-bold text-green-500">
                    ฿{Number(order?.bill_price || 0).toLocaleString()}
                  </p>
                </span>
              </div>

              {order?.pm_method === "QR Promptpay" && order?.slip_pm && (
                <div className="w-full mt-5 p-5 flex flex-col border border-gray-300 shadow-md">
                  <p className="text-lg font-bold w-full pb-3 border-b border-blue-300">
                    หลักฐานการชำระเงิน
                  </p>
                  <span className="flex my-2.5 items-center gap-2 text-sm text-green-600">
                    <FaCheckCircle />
                    <p>
                      ชำระเมื่อวันที่ :{" "}
                      {new Date(order?.bill_pm).toLocaleDateString("th-TH")}
                    </p>
                  </span>
                  <div className="w-full">
                    <img
                      src={envConfig.imgURL + order?.slip_pm}
                      className="w-full h-auto"
                      alt=""
                    />
                  </div>
                </div>
              )}

              {order?.status_pm === "pending" && (
                <p className="py-2.5 text-sm text-red-500 mt-5">
                  *คำสั่งซื้อที่ไม่ได้อยู่ในสถานะ รอยืนยัน จะไม่สามารถยกเลิกได้
                </p>
              )}
              <div className="mt-3.5 w-full flex lg:items-center justify-between lg:flex-row flex-col gap-3">
                <div className="flex items-center flex-col lg:flex-row gap-2">
                  <p className="text-gray-500">ดำเนินการ:</p>
                  <div className="flex items-center gap-2.5 text-sm lg:text-[1rem]">
                    {order?.status_pm === "pending" ? (
                      <>
                        <button
                          onClick={() =>
                            handleUpdateOrderStatus("cancel", order?.bill_id)
                          }
                          className="rounded-md p-3 hover:bg-red-600 px-5 bg-red-500 text-white border border-gray-200"
                        >
                          ยกเลิกคำสั่งซื้อ
                        </button>
                        <button
                          onClick={() =>
                            handleUpdateOrderStatus("sending", order?.bill_id)
                          }
                          className="rounded-md p-3 hover:bg-green-600 px-5 bg-green-500 text-white border border-gray-200"
                        >
                          ยืนยันคำสั่งซื้อ
                        </button>
                      </>
                    ) : order?.status_pm === "sending" ? (
                      <>
                        {" "}
                        <button className="rounded-md p-3  px-5 bg-gray-200 border border-gray-200">
                          ออเดอร์อยู่ระหว่างการจัดส่ง รอลูกค้ายืนยันรับสินค้า
                        </button>
                      </>
                    ) : order?.status_pm === "recevied" ? (
                      <>
                        <button className="rounded-md p-3 flex items-center gap-2 bg-green-100 px-5 text-green-600 border border-gray-200">
                          <FaCheckCircle color="green" />
                          <p>
                            การสั่งซื้อสำเร็จ
                            ลูกค้าได้รับสินค้าและบวกเพิ่มยอดขายแล้ว!
                          </p>
                        </button>
                      </>
                    ) : (
                      <></>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </Modal>
    </>
  );
};
export default Orders;
