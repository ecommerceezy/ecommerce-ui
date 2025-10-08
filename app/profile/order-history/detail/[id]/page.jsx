"use client";
import { NO_IMG_PRODUCT } from "@/app/admin/product/page";
import DownloadInvoiceButton from "@/components/invoice-pdf";
import Modal from "@/components/model";
import { envConfig } from "@/config/env-config";
import Loading from "@/layout/loading";
import { popup } from "@/libs/alert-popup";
import axios from "axios";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  AiFillCheckCircle,
  AiFillClockCircle,
  AiOutlineSearch,
} from "react-icons/ai";
import {
  FaArrowLeft,
  FaBox,
  FaCalendar,
  FaCheck,
  FaClock,
  FaCreditCard,
  FaEye,
  FaTimes,
  FaTruck,
  FaUpload,
} from "react-icons/fa";

const OrderDetails = () => {
  const params = useParams();
  const [showModal, setShowModal] = useState(false);
  const { id } = params;
  const [loading, setLoading] = useState(false);
  const [slip, setSlip] = useState("");
  const [showSlipReturnModal, setShowSlipReturnModal] = useState(false);
  const [slipReturn, setSlipReturn] = useState("");

  const [order, setOrder] = useState(null);
  const fetchOrder = async (id) => {
    setLoading(true);
    try {
      const res = await axios.get(
        envConfig.apiURL + `/user/order-detail/${id}`,
        { withCredentials: true }
      );
      if (res.status === 200) {
        setOrder(res.data);
        console.log("🚀 ~ fetchOrder ~ res.data:", res.data);
        setSlip(envConfig.imgURL + res?.data?.slip_pm);
        setSlipReturn(envConfig.imgURL + res?.data?.slip_return);
      }
    } catch (error) {
      console.error(error);
      popup.err();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder(id);
  }, [id]);

  const [updating, setUpdating] = useState(false);
  const [newSlipFile, setNewSlipFile] = useState(null);
  const pickNewSlip = (e) => {
    const file = e.target.files[0];
    setSlip(URL.createObjectURL(file));
    setNewSlipFile(file);
  };

  const updateSlip = async (id) => {
    if (!newSlipFile) {
      return popup.err("ไม่พบไฟล์รูปภาพ");
    }
    const { isConfirmed } = await popup.confirmPopUp(
      "เปลี่ยนหลักฐานการชำระเงิน",
      "คำสั่งซื้อที่อยู่ในสถานะจัดส่งจะไม่สามารถเปลี่ยนหลักฐานการชำระเงินได้",
      "เปลี่ยนรูป"
    );
    if (!isConfirmed) return;
    setUpdating(true);
    try {
      const formData = new FormData();

      formData.append("newslip", newSlipFile);

      const res = await axios.put(
        envConfig.apiURL + `/user/update-slip/${id}`,
        formData,
        { withCredentials: true }
      );
      if (res.status === 200) {
        popup.success("บันทึกรูปภาพแล้ว");
        fetchOrder(id);
      }
    } catch (error) {
      console.error(error);
      popup.err();
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateOrderStatus = async (status, orderId) => {
    const { isConfirmed } = await popup.confirmPopUp(
      status === "cancel"
        ? "ยกเลิกคำสั่งซื้อนี้"
        : status === "recevied"
        ? "ฉันได้รับสินค้าแล้ว"
        : status === "return_pending"
        ? "ยืนยันส่งคำขอคืนเงิน"
        : "ได้รับเงินคืนแล้ว",
      status === "cancel"
        ? "ต้องการยกเลิกคำสั่งซื้อนี้หรือไม่"
        : status === "recevied"
        ? "กดยืนยันหากคุณได้รับสินค้าแล้ว"
        : status === "return_pending"
        ? "คุณต้องการส่งคำขอคืนเงินใช่หรือไม่"
        : "ฉันได้ตรวจสอบและได้รับเงินคืนแล้ว",
      status === "cancel" ? "ยกเลิกคำสั่งซื้อ" : "ยืนยัน"
    );
    if (!isConfirmed) return;

    setLoading(true);
    try {
      const res = await axios.put(
        envConfig.apiURL + `/user/update-order-status`,
        { status, orderId },
        { withCredentials: true }
      );
      if (res.status === 200) {
        popup.success(
          status === "cancel"
            ? "ยกเลิกออเดอร์แล้ว"
            : status === "recevied"
            ? "ขอบคุณที่ไว้ใจใช้บริการของเรา"
            : status === "return_pending"
            ? "ระบบได้รับคำขอคืนเงินของคุณแล้ว จะทำการตรวจสอบและติดต่อกลับผ่านอีเมลโดยเร็วที่สุด"
            : "ขอบคุณที่ไว้ใจใช้บริการของเรา"
        );
        fetchOrder(orderId);
      }
    } catch (error) {
      console.error(error);
      popup.err();
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <>
      {" "}
      <div className="w-full h-auto flex flex-col">
        <Link
          href="/profile/order-history"
          className="mb-3 flex items-center gap-2"
        >
          <FaArrowLeft />
          <p>ย้อนกลับ</p>
        </Link>
        <div className="w-full p-5 rounded-lg border border-gray-300 shadow-md flex flex-col">
          <div className="w-full flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <p className="text-lg font-bold">รายละเอียดคำสั่งซื้อ</p>
              <p className="text-blue-500 font-bold">{order?.bill_id}</p>
            </div>
            <div className="flex flex-col gap-1 items-end">
              <span
                className={`flex w-fit flex-col p-1.5 px-2 rounded-md shadow-md lg:flex-row items-center gap-2 text-sm ${
                  order?.status_pm === "pending"
                    ? "text-orange-500 bg-orange-100"
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
              {order?.status_pm === "return_pending" && (
                <span className="flex items-center gap-2 text-xs text-orange-500 p-0.5 rounded-md bg-red-50">
                  <AiOutlineSearch />
                  <p className=" ">อยู่ระหว่างตรวจสอบคำขอคืนเงิน</p>
                </span>
              )}
              {order?.status_pm === "return_sending" && (
                <span className="flex items-center gap-2 text-xs text-green-500 p-0.5 rounded-md bg-green-50">
                  <AiFillClockCircle />
                  <p className=" ">หลักฐานการคืนเงินถูกอัปโหลดแล้ว</p>
                </span>
              )}
              {order?.status_pm === "return_confirmed" && (
                <span className="flex items-center gap-2 text-xs text-blue-500 p-0.5 rounded-md bg-blue-50">
                  <AiFillCheckCircle />
                  <p className=" ">ได้รับเงินคืนแล้ว</p>
                </span>
              )}
            </div>
          </div>
          <div className="flex lg:flex-row flex-col gap-3 lg:items-center w-full mt-5 justify-between">
            <div className="flex items-center gap-2.5">
              <FaCalendar color="green" />
              <span className="flex flex-col">
                <p className="text-sm text-gray-500">วันที่สั่งซื้อ</p>
                <p>{new Date(order?.bill_date).toLocaleDateString("th-TH")}</p>
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
                  {Number(order?.bill_productPeace || 0).toLocaleString()} ชิ้น
                </p>
              </span>
            </div>
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
                className="w-full flex flex-col lg:flex-row lg:items-start py-2 border-b border-gray-300"
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
                      <p className="text-gray-500 text-sm">สี : {d?.color}</p>
                      <p className="text-gray-500 text-sm">ขนาด : {d?.size}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-start  lg:mt-0  w-full lg:w-1/2 justify-end gap-16 px-5">
                  <span className="flex flex-col items-center">
                    <p className="text-sm text-gray-600">จำนวน</p>
                    <p> {Number(d?.quantity || 0).toLocaleString()}</p>
                  </span>
                  <span className="flex flex-col items-center">
                    <p className="text-sm text-gray-600">ราคารวม</p>
                    <p
                      className={`text-black ${
                        d?.product?.promotion?.discount &&
                        "text-sm line-through"
                      }`}
                    >
                      ฿{Number(d?.total_amount || 0)?.toLocaleString()}
                    </p>
                    {d?.product?.promotion?.discount && (
                      <p className="text-red-500">
                        ฿{" "}
                        {d?.product?.promotion?.discount
                          ? (
                              (d?.product?.pro_price -
                                Math.round(
                                  (Number(d?.product?.promotion?.discount) /
                                    100) *
                                    d?.product?.pro_price
                                )) *
                              d?.quantity
                            ).toLocaleString()
                          : (
                              Number(d?.quantity) *
                              Number(d?.product?.pro_price)
                            ).toLocaleString()}
                      </p>
                    )}
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
            <p className="text-lg text-black">
              ฿{Number(order?.bill_totalamount || 0).toLocaleString()}
            </p>
          </span>
          <span className="w-full flex justify-between ">
            <p className="text-gray-600 text-sm">รวมราคาส่วนลด</p>
            <p className="text-lg ">
              ฿{Number(order?.bill_totalDiscount || 0).toLocaleString()}
            </p>
          </span>
          <span className="w-full flex justify-between ">
            <p className="text-gray-600 text-sm">รวมราคาสินค้าหลักหักส่วนลด</p>
            <p className="text-lg ">
              ฿
              {Number(
                order?.bill_totalamount - order?.bill_totalDiscount || 0
              ).toLocaleString()}
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
            <p className="text-lg font-bold ">
              ฿{Number(order?.bill_price || 0).toLocaleString()}
            </p>
          </span>
        </div>

        <div className="mt-5 w-full flex lg:items-center justify-between lg:flex-row flex-col gap-3">
          {order?.pm_method === "QR Promptpay" && (
            <div className="flex items-center gap-2">
              {" "}
              <button
                onClick={() => {
                  setShowModal(true);
                  setSlip(envConfig.imgURL + order.slip_pm);
                }}
                className="p-2 px-3 flex items-center justify-center gap-2 border border-gray-300 hover:bg-blue-500 hover:text-white text-sm"
              >
                <FaEye />
                <p>ดูสลิป</p>
              </button>
              {order?.status_pm === "return_sending" && (
                <button
                  onClick={() => {
                    setShowSlipReturnModal(true);
                  }}
                  className="p-2 px-3 flex items-center justify-center gap-2 border border-gray-300 hover:bg-orange-500 hover:text-white text-sm"
                >
                  <FaEye />
                  <p>ดูหลักฐานการคืนเงิน</p>
                </button>
              )}
              {order?.status_pm === "return_confirmed" && (
                <button
                  onClick={() => {
                    setShowSlipReturnModal(true);
                  }}
                  className="p-2 px-3 flex items-center justify-center gap-2 border border-gray-300 hover:bg-orange-500 hover:text-white text-sm"
                >
                  <FaEye />
                  <p>ดูหลักฐานการคืนเงิน</p>
                </button>
              )}
            </div>
          )}
          <div className="flex items-center flex-col lg:flex-row gap-2">
            <p className="text-gray-500">ดำเนินการ:</p>
            <div className="flex items-center gap-2.5 text-sm lg:text-[1rem]">
              {order?.status_pm === "pending" ? (
                <>
                  <button
                    onClick={() => handleUpdateOrderStatus("cancel", id)}
                    className="p-3 hover:bg-red-600 px-5 bg-red-500 text-white border border-gray-200"
                  >
                    ยกเลิกคำสั่งซื้อ
                  </button>
                  {order?.status_pm === "pending" &&
                    order?.pm_method === "QR Promptpay" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdateOrderStatus(
                            "return_pending",
                            order?.bill_id
                          );
                        }}
                        className="p-3 hover:bg-orange-600 px-5 bg-orange-500 text-white border border-gray-200"
                      >
                        ส่งคำขอคืนเงิน
                      </button>
                    )}
                </>
              ) : order?.status_pm === "sending" ? (
                <>
                  {" "}
                  <button className="p-3  px-5 bg-gray-200 border border-gray-200">
                    ออเดอร์อยู่ระหว่างการจัดส่งไม่สามารถยกเลิกได้
                  </button>
                  <button
                    onClick={() => handleUpdateOrderStatus("recevied", id)}
                    className="p-3 hover:bg-green-600 px-5 bg-green-500 text-white border border-gray-200"
                  >
                    ได้รับสินค้าแล้ว
                  </button>
                </>
              ) : (
                <>
                  {order?.status_pm === "recevied" && (
                    <DownloadInvoiceButton bill={order} />
                  )}
                  {order?.status_pm === "return_sending" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpdateOrderStatus(
                          "return_confirmed",
                          order?.bill_id
                        );
                      }}
                      className="p-3 hover:bg-green-600 px-5 bg-green-500 text-white border border-gray-200"
                    >
                      ยืนยันได้รับเงินคืนแล้ว
                    </button>
                  )}

                  <Link
                    href="/search"
                    className="p-3 hover:bg-blue-600 px-5 bg-blue-500 text-white border border-gray-200"
                  >
                    ซื้ออีกครั้ง
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <div className="relative lg:w-1/3 w-full h-[90%] overflow-auto p-5 border border-gray-300 flex flex-col items-center rounded-md shadow-gray-400 z-50 bg-white">
          <button
            onClick={() => setShowModal(false)}
            className="p-1.5 px-2 rounded-md absolute top-3 right-3 hover:bg-gray-200"
          >
            <FaTimes size={20} />
          </button>
          <p>หลักฐานการชำระเงิน</p>

          <div className="flex items-center gap-2">
            {slip && order.status_pm === "pending" && (
              <label
                htmlFor="pick-slip"
                className="p-2.5 mt-5 cursor-pointer hover:bg-blue-600 text-sm flex items-center gap-2 rounded-md bg-blue-500 text-white"
              >
                <FaUpload />
                <p>{slip ? "แก้ไขรูป" : "อัปโหลดสลิป"}</p>
                <input
                  type="file"
                  onChange={pickNewSlip}
                  className="hidden"
                  id="pick-slip"
                />
              </label>
            )}
          </div>

          {slip && (
            <div className="w-full lg:w-2/3 mt-3 p-1 rounded-md border border-gray-300">
              <img src={slip} className="w-full h-auto" alt="" />
            </div>
          )}
          {slip && order?.status_pm === "pending" && (
            <>
              <button
                disabled={updating}
                onClick={() => updateSlip(order?.bill_id)}
                className="w-full mt-3 hover:bg-blue-600 p-3 rounded-md bg-blue-500 text-white"
              >
                {updating ? "กำลังดำเนินการ..." : "อัปเดตสลิป"}
              </button>
            </>
          )}
        </div>
      </Modal>
      <Modal
        isOpen={showSlipReturnModal}
        onClose={() => setShowSlipReturnModal(false)}
      >
        <div className="relative lg:w-1/3 w-full h-[90%] overflow-auto p-5 border border-gray-300 flex flex-col items-center rounded-md shadow-gray-400 z-50 bg-white">
          <button
            onClick={() => setShowSlipReturnModal(false)}
            className="p-1.5 px-2 rounded-md absolute top-3 right-3 hover:bg-gray-200"
          >
            <FaTimes size={20} />
          </button>
          <p>หลักฐานการคืนเงิน</p>
          <div className="w-full lg:w-2/3 mt-3 p-1 rounded-md border border-gray-300">
            <img src={slipReturn} className="w-full h-auto" alt="" />
          </div>
        </div>
      </Modal>
    </>
  );
};
export default OrderDetails;
