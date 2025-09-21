"use client";
import {
  FaCartPlus,
  FaChevronLeft,
  FaChevronRight,
  FaMinus,
  FaPlus,
} from "react-icons/fa";
import { AiFillMinusCircle, AiFillPlusCircle } from "react-icons/ai";
import Link from "next/link";
import ProductCard from "@/components/product-card";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { popup } from "@/libs/alert-popup";
import axios from "axios";
import { envConfig } from "@/config/env-config";
import Loading from "@/layout/loading";
import { NO_IMG_PRODUCT } from "@/app/admin/product/page";
import { v4 as uuid } from "uuid";
import { cartFunc } from "@/libs/cart";
import { useAppContext } from "@/context/app-context";
import useGetSeesion from "@/hooks/useGetSession";

const ShopDetail = () => {
  const { user } = useGetSeesion();
  const params = useParams();
  const { id } = params;
  const [mainImg, setMainImg] = useState(NO_IMG_PRODUCT);
  const [count, setCount] = useState(1);
  const [colorOptions, setColorOptions] = useState([]);
  const [sizeOptions, setSizeOptions] = useState([]);
  const [selectColor, setSelectColor] = useState();
  const [selectSize, setSelectSize] = useState();
  const { setCart } = useAppContext();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState(null);
  const fetchProduct = async (id) => {
    setLoading(true);
    try {
      const res = await axios.get(envConfig.apiURL + `/guest/product/${id}`);
      if (res.status === 200) {
        setProduct(res.data);
        setMainImg(envConfig.imgURL + res?.data?.imgs[0]?.url);
        setColorOptions(res?.data?.pro_color?.split(","));
        if (res?.data?.pro_color?.split(",").length < 2) {
          setSelectColor(res?.data?.pro_color);
        }
        const sizes = res.data.pro_size?.split(",");
        setSizeOptions(sizes);
        if (sizes.length < 2) {
          setSelectSize(res.data.pro_size);
        }
      }
    } catch (error) {
      console.error(error);
      popup.err();
    } finally {
      setLoading(false);
    }
  };

  const changeMainImg = (url) => {
    setMainImg(envConfig.imgURL + url);
  };

  const handleSaveToCart = () => {
    if (colorOptions.length > 1 && !selectColor) {
      popup.warning("กรุณาเลือกสี");
      return false;
    }
    if (sizeOptions.length > 1 && !selectSize) {
      popup.warning("กรุณาเลือกขนาด");
      return false;
    }

    const options = {
      color: selectColor,
      size: selectSize,
    };
    cartFunc.addToCartWithOptions(product, options, count, product?.pro_number);

    const carts = JSON.parse(localStorage.getItem("cart"));
    setCart(carts.length);

    return true;
  };

  const [sameCtgProduct, setSameCtgProduct] = useState([]);
  const fetchSameCtgProduct = async (id) => {
    try {
      const res = await axios.get(
        envConfig.apiURL + `/guest/same-ctg-product/${id}`
      );
      if (res.status === 200) {
        setSameCtgProduct(res.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
    }
  };
  const [otherProduct, setOtherProduct] = useState([]);
  const fetchOtherProduct = async (id) => {
    try {
      const res = await axios.get(
        envConfig.apiURL + `/guest/notsame-ctg-product/${id}`
      );
      if (res.status === 200) {
        setOtherProduct(res.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchSameCtgProduct(product?.categories?.map((p) => p.id)?.join(","));
  }, [product]);

  useEffect(() => {
    fetchOtherProduct(sameCtgProduct.map((s) => s?.pro_id));
  }, [sameCtgProduct]);

  useEffect(() => {
    fetchProduct(id);
  }, [id]);

  if (loading) return <Loading />;
  if (!product) return null;

  return (
    <div className="w-full items-center flex flex-col lg:mt-32 mt-80">
      {/* this product detail */}
      <div className="lg:w-[72%] w-[95%] bg-white p-3 mt-10 flex lg:flex-row flex-col gap-8 shadow-sm">
        {/* img */}
        <div className="lg:w-[40%] w-full flex flex-col">
          <div className="w-full h-[300px] lg:h-[400px]">
            <img src={mainImg} className="w-full h-full object-cover" alt="" />
          </div>
          <div className="w-full relative ">
            <div className="w-full flex items-center justify-between z-30 absolute top-12">
              <button className="py-2.5 px-2 bg-black/25 hover:bg-black/45">
                <FaChevronLeft color="white" />
              </button>
              <button className="py-2.5 px-2 bg-black/25 hover:bg-black/45">
                <FaChevronRight color="white" />
              </button>
            </div>
            <div className="w-full relative h-[100px] mt-3 overflow-hidden">
              <div className="absolute z-10 top-0 left-0 flex items-center gap-2.5 w-auto">
                {product?.imgs?.map((img) => (
                  <div
                    key={uuid()}
                    onMouseEnter={() => changeMainImg(img?.url)}
                    className="cursor-pointer border border-gray-200 hover:border-2 hover:border-blue-500 w-[100px] h-[100px] bg-red-500"
                  >
                    <img
                      src={
                        img?.url ? envConfig.imgURL + img?.url : NO_IMG_PRODUCT
                      }
                      className="w-full h-full object-cover"
                      alt=""
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* detail */}
        <div className="lg:w-[55%] w-full flex flex-col gap pt-3 lg:pt-0 lg:border-none border-t border-blue-300">
          <p className="text-lg w-full break-words">{product?.pro_name}</p>

          {/* promotion */}
          {/* <span className="flex flex-col mt-3">
            <p className="w-full p-1.5 px-3 text-white bg-orange-500 text-sm">
              โปรโมชันราคาพิเศษ
            </p>
            <span className="p-3 px-5 bg-gradient-to-r from-gray-100 to-blue-100 w-full flex items-center gap-2.5">
              <p className="text-2xl font-bold text-red-500">฿50</p>
              <p className="text-gray-600 line-through">฿100</p>
              <p className="p-1 text-sm px-3 border-2 border-yellow-500 bg-red-500 text-white">
                -50%
              </p>
            </span>
          </span> */}

          {/* normal price */}
          <div className="w-full mt-5 pt-5 border-t-4 border-blue-500 flex items-center justify-between gap-10">
            <p className="text-gray-600 text-sm w-[15%]">ราคา</p>

            <div className="flex items-end gap-1.5 w-[80%]">
              <p className=" text-3xl break-all text-blue-500 font-bold">
                {Number(product?.pro_price || 0).toLocaleString()}฿
              </p>
              <p className="">/ หน่วย</p>
            </div>
          </div>

          {/* about product */}
          <div className="w-full mt-10 flex items-start justify-between gap-10">
            <p className="text-gray-600 text-sm w-[15%]">หมวดหมู่</p>

            <p className="w-[80%] text-sm break-all ">
              {product?.categories?.map((p) => p.name)?.join(",")}
            </p>
          </div>

          {/* about product */}
          <div className="w-full mt-10 flex items-start justify-between gap-10">
            <p className="text-gray-600 text-sm w-[15%]">เกี่ยวกับสินค้า</p>

            <p className="w-[80%] text-sm break-all ">{product?.pro_details}</p>
          </div>

          {/* obtions */}
          <div className="w-full mt-10 flex items-start justify-between gap-10">
            <p className="text-gray-600 text-sm w-[15%]">สี</p>
            <div className="w-[80%] grid grid-cols-3 gap-3">
              {colorOptions.map((c) => (
                <button
                  key={uuid()}
                  onClick={() => setSelectColor(c)}
                  className={`${
                    selectColor === c && "bg-blue-500 text-white"
                  } p-1.5  px-2.5 text-sm border border-gray-300`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div className="w-full mt-10 flex items-start justify-between gap-10">
            <p className="text-gray-600 text-sm w-[15%]">ขนาด</p>
            <div className="w-[80%] grid grid-cols-3 gap-3">
              {sizeOptions.map((s) => (
                <button
                  key={uuid()}
                  onClick={() => setSelectSize(s)}
                  className={`${
                    selectSize === s && "bg-blue-500 text-white"
                  } p-1.5  px-2.5 text-sm border border-gray-300`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* count */}
          <div className="w-full mt-10 flex items-start justify-between gap-10">
            <p className="text-gray-600 text-sm w-[15%]">จำนวน</p>
            <div className="w-[80%] flex items-center-safe">
              <button
                onClick={() => setCount((prev) => (prev <= 1 ? 1 : prev - 1))}
                className="p-2 px-2.5 hover:bg-blue-500 hover:text-white text-blue-600  text-sm border border-gray-300"
              >
                <AiFillMinusCircle size={18} />
              </button>
              <p className="p-[0.2rem] text-lg px-6 border-y border-gray-300 text-blue-600">
                {count}
              </p>
              <button
                onClick={() => setCount((prev) => prev + 1)}
                className="p-2 px-2.5 hover:bg-blue-500 hover:text-white text-blue-600  text-sm border border-gray-300"
              >
                <AiFillPlusCircle size={18} />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-5 mt-10">
            <button
              onClick={handleSaveToCart}
              className="p-3 px-5 border border-blue-500 hover:bg-white bg-sky-100 text-blue-600 flex items-center gap-3.5"
            >
              <FaCartPlus size={20} />
              <p className="text-sm">เพิ่มไปยังรถเข็น</p>
            </button>
            <button
              onClick={() => {
                const ok = handleSaveToCart();
                if (!ok) return;
                if (!user) {
                  return router.push("/");
                }
                router.push("/checkout");
              }}
              className="p-3 px-20 border border-blue-500 hover:bg-blue-500 text-white bg-blue-600"
            >
              <p className="text-sm">ซื้อสินค้า</p>
            </button>
          </div>
        </div>
      </div>

      {/* product same category */}
      <div className="mt-8 lg:w-[72%] w-[95%]">
        <span className="w-full border-b border-blue-600 bg-white rounded-tr-lg rounded-tl-lg flex items-center justify-between">
          <p className="p-3 ">
            สินค้าในหมวดหมู่{" "}
            {product?.categories?.map((p) => p.name)?.join(",")}
          </p>
          <Link
            href="/search"
            className="flex items-center gap-2 text-blue-600 text-sm p-1.5 px-2  hover:underline"
          >
            ดูเพิ่มเติม
            <FaChevronRight size={18} />
          </Link>
        </span>
        <div className="mt-3 grid lg:grid-cols-6 grid-cols-2 gap-3">
          {sameCtgProduct.map((s) => (
            <ProductCard key={s?.pro_id} {...s} />
          ))}
        </div>
      </div>

      <div className="mt-8 lg:w-[72%] w-[95%]">
        <span className="w-full border-b border-blue-600 bg-white rounded-tr-lg rounded-tl-lg flex items-center justify-between">
          <p className="p-3 ">สินค้าที่คุณอาจสนใจ</p>
          <Link
            href="/search"
            className="flex items-center gap-2 text-blue-600 text-sm p-1.5 px-2  hover:underline"
          >
            ดูเพิ่มเติม
            <FaChevronRight size={18} />
          </Link>
        </span>
        <div className="mt-3 grid lg:grid-cols-6 grid-cols-2 gap-3">
          {otherProduct.map((o) => (
            <ProductCard key={o?.pro_id} {...o} />
          ))}
        </div>
      </div>
    </div>
  );
};
export default ShopDetail;
