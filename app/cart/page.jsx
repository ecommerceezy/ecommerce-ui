"use client";
import ProductCard from "@/components/product-card";
import { envConfig } from "@/config/env-config";
import Loading from "@/layout/loading";
import { popup } from "@/libs/alert-popup";
import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AiFillMinusCircle, AiFillPlusCircle } from "react-icons/ai";
import { FaShoppingBag, FaShoppingCart, FaTrash } from "react-icons/fa";
import { NO_IMG_PRODUCT } from "../admin/product/page";
import { cartFunc } from "@/libs/cart";
import useGetSeesion from "@/hooks/useGetSession";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/context/app-context";

const Page = () => {
  const [loading, setLoading] = useState(false);
  const [cartProduct, setCartProduct] = useState([]);
  const { user, checking } = useGetSeesion();
  const router = useRouter();
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalPeace, setTotalPeace] = useState(0);

  const [ortherProduct, setOtherProduct] = useState();
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(envConfig.apiURL + "/guest/get-products");
      if (res.status === 200) {
        setOtherProduct(res.data);
      }
    } catch (error) {
      console.error(error);
      popup.err();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

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

      setCartProduct(data);
    } catch (error) {
      console.error(error);
      popup.err();
    }
  };

  useEffect(() => {
    getProduct();
  }, []);

  const handleMoreCount = (product, pro_number, option) => {
    cartFunc.addProduct(product, false, pro_number, option);
    getProduct();
  };

  const handleMinusCount = (product, option) => {
    cartFunc.minusProduct(product, option);
    getProduct();
  };

  const deleteProduct = (id) => {
    cartFunc.deleteProduct(id);
    getProduct();
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
    <div className="lg:w-[73%] w-full lg:mt-40 mt-24">
      <div className="w-full flex items-center bg-white border border-gray-200">
        <p className="p-5 w-1/2 text-gray-700 text-sm">สินค้า</p>
        <div className="flex items-center w-1/2 justify-between">
          <p className="pl-10 flex-1 text-gray-700 text-sm">ราคาต่อชิ้น</p>
          <p className="pl-10 flex-1 text-gray-700 text-sm">จำนวน</p>
          <p className="pl-10 flex-1 ml-3 text-gray-700 text-sm">ราคารวม</p>
          <p className="pl-10 flex-1 text-gray-700 text-sm">แอคชัน</p>
        </div>
      </div>

      {cartProduct?.map((c) => {
        // console.log(JSON.stringify(c));
        return (
          <div
            key={c?.pro_id}
            className="mt-5 w-full border border-gray-200 bg-white p-3 flex lg:flex-row flex-col items-center gap-2"
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
            <div className="lg:w-1/2 w-full grid grid-cols-2 lg:flex items-center justify-around">
              <span className="flex items-center gap-2">
                <p className="text-orange-600">
                  {Number(c?.pro_price).toLocaleString()}฿
                </p>
                <p className="text-sm text-gray-500 lg:hidden">/ หน่วย</p>
              </span>
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-500 lg:hidden">จำนวน:</p>
                <div className="flex items-center">
                  <button
                    onClick={() =>
                      handleMinusCount(c, {
                        color: c?.color,
                        size: c?.size,
                      })
                    }
                    className="p-1.5 hover:bg-blue-500 hover:text-white text-blue-600  text-sm border border-gray-300"
                  >
                    <AiFillMinusCircle size={18} />
                  </button>
                  <p className="p-[0.2rem] text-[0.97rem] px-6 border-y border-gray-300 text-blue-600">
                    {`${c?.count}`}
                  </p>
                  <button
                    onClick={() =>
                      handleMoreCount(c, c?.pro_number, {
                        color: c?.color,
                        size: c?.size,
                      })
                    }
                    className="p-1.5 hover:bg-blue-500 hover:text-white text-blue-600  text-sm border border-gray-300"
                  >
                    <AiFillPlusCircle size={18} />
                  </button>
                </div>
              </div>

              <span className="flex items-center gap-2">
                <p className="text-sm text-gray-500 lg:hidden">ราคารวม:</p>
                <p className="text-orange-600 text-xl font-bold">
                  {(Number(c?.count) * Number(c?.pro_price)).toLocaleString()}฿
                </p>
              </span>
              <button
                onClick={() => deleteProduct(c?.pro_id)}
                className="flex items-center gap-2 hover:text-blue-500 text-sm"
              >
                <FaTrash />
                <p>ลบ</p>
              </button>
            </div>
          </div>
        );
      })}

      <div className="mt-10 w-full p-5 border flex flex-col lg:flex-row lg:items-center justify-between border-gray-200 bg-white">
        <p className="text-blue-600">
          ทั้งหมด {cartProduct?.length?.toLocaleString()} รายการ{" "}
          {totalPeace.toLocaleString()} ชิ้น
        </p>
        <div className="flex items-center gap-2">
          <p>รวมราคาสินค้าทั้งหมด:</p>
          <p className="text-xl font-bold text-orange-600">
            ฿{totalAmount.toLocaleString()}
          </p>
          <button
            disabled={checking}
            onClick={() => {
              if (user) {
                router.push("/checkout");
              } else {
                router.push("/auth/sign-in");
              }
            }}
            className="p-2.5 px-7 bg-blue-500 ml-3 text-white hover:bg-blue-600"
          >
            สั่งสินค้า
          </button>
        </div>
      </div>

      <div className="w-full mt-14 flex border-b-4 border-blue-400 p-4 font-bold justify-center text-blue-600 bg-white">
        สินค้าอื่นๆที่น่าสนใจ
      </div>
      <div className="mt-3 w-full grid md:grid-cols-6 grid-cols-3 gap-2.5 gap-y-3">
        {ortherProduct?.map((p) => (
          <ProductCard key={p?.pro_id} {...p} showCart={false} />
        ))}
      </div>
    </div>
  );
};
export default Page;
