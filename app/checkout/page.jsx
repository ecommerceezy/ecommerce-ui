"use client";
import Loader from "@/components/loader";
import Modal from "@/components/model";
import { envConfig } from "@/config/env-config";
import useGetSeesion from "@/hooks/useGetSession";
import Loading from "@/layout/loading";
import { popup } from "@/libs/alert-popup";
import axios from "axios";
import Link from "next/link";
import { use, useEffect, useState } from "react";
import {
  FaMapMarked,
  FaMapMarker,
  FaMapPin,
  FaShoppingBag,
  FaShoppingCart,
  FaTimes,
  FaTrash,
  FaUpload,
} from "react-icons/fa";
import { NO_IMG_PRODUCT } from "../admin/product/page";
import { useRouter } from "next/navigation";

const Page = () => {
  const [showModal, setShowModal] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [cartProduct, setCartProduct] = useState([]);
  const { user, checking } = useGetSeesion();
  const [data, setData] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalPeace, setTotalPeace] = useState(0);
  const [totalFreight, setTotalFreight] = useState(0);
  const [slip, setSlip] = useState("");
  const [slipFile, setSlipFile] = useState(null);
  const router = useRouter();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(envConfig.apiURL + "/user/check-out-data", {
        withCredentials: true,
      });
      if (res.status === 200) {
        setData(res.data);
      }
    } catch (error) {
      console.error(error);
      popup.err(error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, [user]);

  const getProduct = async () => {
    const cart = localStorage.getItem("cart");
    if (!cart || cart.length === 0) return;

    try {
      const data = JSON.parse(cart);

      // รวมจำนวนชิ้น
      const totalPeace = data.reduce((total, item) => total + item.count, 0);
      setTotalPeace(totalPeace);

      // รวมราคารวมทั้งหมด
      const totalAmount = data.reduce(
        (total, item) => total + item.count * item?.pro_price,
        0
      );
      setTotalAmount(totalAmount);

      const totalFreight = data?.reduce(
        (total, item) => Math.ceil((total + item?.freight) / data.length),
        0
      );
      console.log("🚀 ~ getProduct ~ totalFreight:", totalFreight);
      setTotalFreight(totalFreight);
      setCartProduct(data);
    } catch (error) {
      console.error(error);
      popup.err();
    }
  };

  useEffect(() => {
    getProduct();
  }, []);

  const [confirming, setConfirming] = useState(false);
  const getQrCode = async () => {
    setConfirming(true);
    try {
      const amount = totalAmount + totalFreight;

      const res = await axios.get(
        envConfig.apiURL + `/user/qrcode-promptpay/${amount}`,
        { withCredentials: true }
      );
      if (res.status === 200) {
        setQrCode(res.data);
        setShowModal(true);
      }
    } catch (error) {
      console.error(error);
      popup.err();
    } finally {
      setConfirming(false);
    }
  };

  const handleConfirmOrder = () => {
    getProduct();
    if (!data?.email) {
      popup.err("ไม่พบอีเมลผู้ซื้อ");
      return false;
    }
    if (!data?.address) {
      popup.err("ไม่พบที่อยู่ผู้ซื้อ");
      return false;
    }
    if (paymentMethod === 0) {
      popup.err("กรุณาเลือกรูปแบบการชำระเงิน");
      return false;
    }
    if (paymentMethod === 2) {
      getQrCode();
      return false;
    }

    if (paymentMethod === 1) {
      createOrder();
    }
  };

  const slipPicker = (e) => {
    const file = e.target.files[0];
    setSlip(URL.createObjectURL(file));
    setSlipFile(file);
  };

  const createOrder = async () => {
    const { isConfirmed: lastConfirm } = await popup.confirmPopUp(
      "ยืนยันคำสั่งซื้อ?",
      "ฉันเข้าใจเงื่อนไขการสั่งซื้อแล้ว",
      "สังซื้อ"
    );
    if (!lastConfirm) return;

    setConfirming(true);
    try {
      const formData = new FormData();
      formData.append("cart-product", JSON.stringify(cartProduct));
      formData.append(
        "payment-method",
        paymentMethod === 1 ? "เก็บปลายทาง" : "QR Promptpay"
      );
      formData.append("totalProductList", cartProduct.length);
      formData.append("totalPeace", totalPeace);
      formData.append("totalProductPrice", totalAmount);
      formData.append("totalFreight", totalFreight);
      formData.append("totalPay", totalFreight + totalAmount);
      formData.append("user_id", user?.user_id);
      if (paymentMethod === 2 && slipFile) {
        formData.append("slip", slipFile);
      }

      const res = await axios.post(
        envConfig.apiURL + "/user/create-order",
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (res.status === 200) {
        localStorage.removeItem("cart");
        popup.success("สั่งซื้อสำเร็จ!");
        router.push("/profile/order-history");
      }
    } catch (error) {
      console.error(error);
      popup.err();
    } finally {
      setConfirming(false);
    }
  };

  if (loading) return <Loading />;
  if (cartProduct?.length < 1)
    return (
      <div className="lg:w-[73%] w-full lg:mt-40 mt-24 h-[500px] flex flex-col gap-1 text-gray-600 items-center justify-center bg-white">
        <FaShoppingCart size={70} />
        <p>ไม่พบสินค้าในตะกร้า</p>
        <Link
          href="/search"
          className="p-2 px-3 mt-5 rounded-md shadow-md bg-blue-500 text-white flex items-center gap-2"
        >
          <FaShoppingBag />
          <p>ช็อปเลย!</p>
        </Link>
      </div>
    );
  return (
    <>
      {" "}
      <div className="lg:w-[73%] w-full flex flex-col items-center mt-44 lg:mt-36">
        <div className="mt-3 p-5 border-t-2 flex flex-col lg:flex-row gap-3 border-red-500 w-full bg-white">
          <div className="flex flex-col gap-1 pb-3 lg:pr-3 border-b lg:border-b-0 lg:border-r border-red-500 w-full lg:w-1/6">
            <span className="flex items-center gap-2">
              <FaMapMarker color="blue" size={20} />
              <p className="text-blue-600">ที่อยู่จัดส่ง</p>
            </span>
            <p className="font-bold">
              {data?.title_type}
              {data?.first_name} {data?.last_name}
            </p>
            {data?.email ? (
              <p className="break-words text-sm">อีเมล:{data?.email}</p>
            ) : (
              <Link
                href="/profile/user"
                className="text-red-500 hover:underline"
              >
                เพิ่มอีเมล
              </Link>
            )}
          </div>
          <div className="w-full lg:w-[70%] break-words">
            {data?.address?.split("/=/")?.join(" ")}
          </div>
          <Link
            href="/profile/address"
            className="text-blue-500 hover:underline"
          >
            เปลี่ยน
          </Link>
        </div>

        <div className="w-full mt-8 p-5 bg-white flex flex-col gap-3.5 items-start">
          <p className="text-lg pb-5 w-full border-b border-gray-300 mb-3">
            สั่งซื้อสินค้า
          </p>

          {cartProduct.map((c) => (
            <div
              key={c?.pro_id}
              className="w-full flex flex-col lg:flex-row lg:items-center pb-3 border-b border-gray-300"
            >
              <Link
                href={`/product-detail/${c?.pro_id}`}
                className="lg:w-1/2 w-full flex items-center gap-2"
              >
                <div className="w-[100px] h-[100px] border border-gray-200">
                  <img
                    src={
                      c?.imgs
                        ? envConfig.imgURL + c?.imgs[0]?.url
                        : NO_IMG_PRODUCT
                    }
                    className="w-full h-full object-cover"
                    alt=""
                  />
                </div>
                <div className="flex flex-col lg:w-4/5 w-1/2 lg:flex-row lg:items-center gap-1">
                  <div className="flex flex-col gap-0.5 lg:h-[100px] lg:w-[65%] w-full ">
                    <p className=" text-gray-800 text-[0.85rem] break-words text-start">
                      {c?.pro_name}
                    </p>
                    <p className="text-gray-500 text-sm">สี : {c?.color}</p>
                    <p className="text-gray-500 text-sm">ขนาด : {c?.size}</p>
                  </div>

                  <p className="text-gray-500 text-sm">
                    {c?.categories?.map((c) => c?.name)?.join(",")}
                  </p>
                </div>
              </Link>
              <div className="flex items-center mt-2 lg:mt-0  w-full lg:w-1/2 justify-between px-5">
                <span className="flex flex-col items-center">
                  <p className="text-sm text-gray-600">ราคาต่อหน่วย</p>
                  <p>฿{Number(c?.pro_price).toLocaleString()}</p>
                </span>
                <span className="flex flex-col items-center">
                  <p className="text-sm text-gray-600">จำนวน</p>
                  <p> {Number(c?.count).toLocaleString()}</p>
                </span>
                <span className="flex flex-col items-center">
                  <p className="text-sm text-gray-600">ราคารวม</p>
                  <p className="text-orange-600">
                    ฿{" "}
                    {(Number(c?.count) * Number(c?.pro_price)).toLocaleString()}
                  </p>
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="w-full mt-8 p-5 border border-gray-200 bg-white flex items-center justify-between">
          <p>วิธีชำระเงิน</p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (slip) {
                  return popup.warning("พบว่ามีการอัปโหลดสลิปแล้ว");
                }
                setPaymentMethod(1);
                getProduct();
              }}
              className={`${
                paymentMethod === 1 && "bg-blue-500 text-white"
              } p-2 px-3 text-sm lg:text-[1rem] border border-gray-400 hover:bg-gray-300`}
            >
              เก็บปลายทาง
            </button>
            <button
              onClick={() => {
                setPaymentMethod(2);
                getProduct();
              }}
              className={`${
                paymentMethod === 2 && "bg-blue-500 text-white"
              } p-2 px-3 text-sm lg:text-[1rem] border border-gray-400 hover:bg-gray-300`}
            >
              QR พร้อมเพย์
            </button>
          </div>
        </div>
        <div className="w-full bg-gradient-to-r from-blue-50 to-sky-50 p-5 border border-gray-300 flex items-end justify-between">
          <p className="text-red-500">
            *คำสั่งซื้อที่ไม่ได้อยู่ในสถานะ "รอยืนยัน" จะไม่สามารถยกเลิกได้{" "}
          </p>
          <div className="lg:w-1/3 w-full flex flex-col gap-3">
            <span className="w-full flex items-center justify-between">
              <p>สินค้าทั้งหมด</p>
              <p>{cartProduct?.length?.toLocaleString()} รายการ</p>
            </span>
            <span className="w-full flex items-center justify-between">
              <p>จำนวน</p>
              <p>
                {totalPeace.toLocaleString()}
                ชิ้น
              </p>
            </span>
            <span className="w-full flex items-center justify-between">
              <p>รวมราคาสินค้า</p>
              <p>฿{totalAmount.toLocaleString()}</p>
            </span>
            <span className="w-full flex items-center justify-between">
              <p>ค่าจัดส่ง</p>
              <p>฿{totalFreight.toLocaleString()}</p>
            </span>
            <span className="w-full flex items-center justify-between">
              <p>ยอดชำระทั้งหมด</p>
              <p className="text-xl font-bold text-orange-500">
                ฿{(totalAmount + totalFreight).toLocaleString()}
              </p>
            </span>

            <button
              disabled={confirming}
              onClick={handleConfirmOrder}
              className="mt-5 p-3 text-center flex items-center justify-center bg-blue-500 text-white hover:bg-blue-600"
            >
              {confirming ? (
                <Loader />
              ) : paymentMethod === 2 ? (
                "ชำระเงิน"
              ) : (
                "ยืนยันคำสั่งซื้อ"
              )}
            </button>
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
          <p>สแกนเพื่อชำระเงิน</p>

          <div className="w-full lg:w-2/3 mt-3 relative">
            <img
              src={qrCode || NO_IMG_PRODUCT}
              className="object-cover w-full  h-full rounded-lg border border-gray-300 shadow-md"
              alt=""
            />
          </div>

          <div className="flex items-center gap-2">
            <label
              htmlFor="pick-slip"
              className="p-2.5 mt-5 cursor-pointer hover:bg-blue-600 text-sm flex items-center gap-2 rounded-md bg-blue-500 text-white"
            >
              <FaUpload />
              <p>{slip ? "เปลี่ยนรูป" : "อัปโหลดสลิป"}</p>
              <input
                type="file"
                onChange={slipPicker}
                className="hidden"
                id="pick-slip"
              />
            </label>
            {slip && (
              <button
                onClick={() => setSlip("")}
                className="p-2.5 mt-5 cursor-pointer hover:bg-red-600 text-sm flex items-center gap-2 rounded-md bg-red-500 text-white"
              >
                <FaTrash />
                <p>ลบรูป</p>
              </button>
            )}
          </div>

          {slip && (
            <div className="w-full lg:w-2/3 mt-3 p-1 rounded-md border border-gray-300">
              <img src={slip} className="w-full h-auto" alt="" />
            </div>
          )}
          {slip && (
            <>
              <p className="text-sm w-full text-red-500 mt-5">
                *คำสั่งซื้อที่ไม่ได้อยู่ในสถานะ "รอยืนยัน" จะไม่สามารถยกเลิกได้{" "}
              </p>
              <button
                disabled={confirming}
                onClick={createOrder}
                className="w-full mt-3 hover:bg-blue-600 p-3 rounded-md bg-blue-500 text-white"
              >
                {confirming ? "กำลังดำเนินการ..." : "ยืนยันคำสั่งซื้อ"}
              </button>
            </>
          )}
        </div>
      </Modal>
    </>
  );
};
export default Page;
