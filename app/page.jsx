"use client";
import ProductCard from "@/components/product-card";
import { envConfig } from "@/config/env-config";
import { useAppContext } from "@/context/app-context";
import Loading from "@/layout/loading";
import { popup } from "@/libs/alert-popup";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  FaArrowLeft,
  FaArrowRight,
  FaChevronLeft,
  FaChevronRight,
  FaProductHunt,
  FaShoppingBasket,
} from "react-icons/fa";

const bannersImg = [
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cHJvZHVjdHxlbnwwfHwwfHx8MA%3D%3D",
  "https://images.unsplash.com/file-1707885205802-88dd96a21c72image?w=416&dpr=2&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1549049950-48d5887197a0?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fHByb2R1Y3R8ZW58MHx8MHx8fDA%3D",
  "https://images.unsplash.com/photo-1615397349754-cfa2066a298e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fHByb2R1Y3R8ZW58MHx8MHx8fDA%3D",
  "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fHByb2R1Y3R8ZW58MHx8MHx8fDA%3D",
];

const Home = () => {
  const [screenWidth, setScreenWidth] = useState();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [products, setPorduct] = useState([]);
  const { setSearchCtgs } = useAppContext();
  const handleCtgClick = (id) => {
    setSearchCtgs((prev) =>
      prev.find((p) => p === id) ? prev.filter((p) => p !== id) : [id, ...prev]
    );
    router.push("/search");
  };

  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () =>
    setCurrentIndex((prev) => (prev + 1) % bannersImg.length);

  const prevSlide = () =>
    setCurrentIndex((prev) => (prev === 0 ? bannersImg.length - 1 : prev - 1));

  // auto slide ทุก 5 วิ
  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchCTG = async () => {
    setLoading(true);
    try {
      const res = await axios.get(envConfig.apiURL + "/guest/get-ctg");
      if (res.status === 200) {
        setCategories(res.data);
      }
    } catch (error) {
      console.error(error);
      popup.err();
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(envConfig.apiURL + "/guest/get-products");
      if (res.status === 200) {
        setPorduct(res.data);
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
    fetchProducts();
  }, []);

  useEffect(() => {
    // ฟังก์ชันสำหรับอัปเดตค่า
    const handleResize = () => setScreenWidth(window.innerWidth - 100);

    // เซ็ตค่าตอน mount
    handleResize();

    // ฟัง event resize
    window.addEventListener("resize", handleResize);

    // cleanup ตอน unmount
    return () => window.removeEventListener("resize", handleResize);
  }, []);


  if (loading) return <Loading />;

  return (
    <div className="w-full items-center justify-center pb-5 flex flex-col lg:mt-36 mt-80">
      {/* banner */}
      <div className="w-full lg:px-56 items-center justify-center bg-white border-b border-gray-300 py-6 pb-8 flex lg:flex-row flex-col gap-3">
        <div
          className={`relative lg:w-[800px] lg:mx-0 h-[220px] lg:h-[270px] border overflow-hidden`}
        >
          <div className="w-full absolute top-24 flex items-center justify-between z-10">
            <button
              onClick={prevSlide}
              className="px-1.5 py-5 bg-black/10 hover:bg-black/25 text-white"
            >
              <FaArrowLeft />
            </button>
            <button
              onClick={nextSlide}
              className="px-1.5 py-5 bg-black/10 hover:bg-black/25 text-white"
            >
              <FaArrowRight />
            </button>
          </div>
          <div
            style={{
              transition: "all 0.8s ease",
              transform: `translateX(-${currentIndex * 765}px)`,
              width: `${bannersImg.length * 100}%`,
            }}
            className="absolute w-auto h-full flex"
          >
            {bannersImg.map((b, index) => (
              <div key={index} className={`w-[800px] h-full bg-black`}>
                <img src={b} className="w-full h-full object-cover" alt="" />
              </div>
            ))}
            \
          </div>
        </div>
        <div
          className={`flex flex-col gap-3 lg:w-[300px] w-[${screenWidth}px]`}
        >
          <div className="w-full lg:h-[130px] h-[200px] border">
            <img
              src="https://cdn.pixabay.com/photo/2024/04/17/18/40/ai-generated-8702726_1280.jpg"
              className="w-full h-full object-cover"
              alt=""
            />
          </div>
          <div className="w-full lg:h-[125px] h-[200px] border">
            <img
              src="https://images.unsplash.com/photo-1615396899839-c99c121888b0?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fHByb2R1Y3R8ZW58MHx8MHx8fDA%3D"
              className="w-full h-full object-cover"
              alt=""
            />
          </div>
        </div>
      </div>

      {/* category */}
      <div className="lg:w-[72%] w-[95%] bg-white mt-5 rounded-md border border-gray-300 shadow-sm overflow-hidden">
        <span className="w-full flex items-center justify-between p-3 pb-5 border-b border-gray-300 text-gray-700">
          <p> หมวดหมู่</p>
          <Link
            href="/search"
            className="flex items-center gap-2 text-blue-600 text-sm p-1.5 px-2  hover:underline"
          >
            ดูเพิ่มเติม
            <FaChevronRight size={18} />
          </Link>
        </span>
        <div className="w-full grid md:grid-cols-5 grid-cols-4 items-center">
          {categories.map((c) => (
            <button
              key={c?.id}
              onClick={() => handleCtgClick(c?.id)}
              className="p-5 flex flex-col gap-2 border border-gray-200 bg-gray-50 hover:bg-blue-100"
            >
              {/* <div className="w-full md:h-[60px] h-[80px] rounded-lg overflow-hidden shadow-md">
              <img
                src="https://cdn.pixabay.com/photo/2024/04/29/04/21/tshirt-8726716_1280.jpg"
                className="w-full h-full object-cover"
                alt=""
              />
            </div> */}

              <p>{c?.name}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="lg:w-[72%] w-[95%] mt-8 flex border-b-4 border-blue-400 p-4 font-bold justify-center text-blue-600 bg-white">
        สินค้าแนะนำ
      </div>
      <div className="mt-3 lg:w-[72%] w-[95%] grid md:grid-cols-6 grid-cols-3 gap-2.5 gap-y-3">
        {products.map((p) => (
          <ProductCard key={p?.pro_id} {...p} />
        ))}
      </div>

      <Link
        href="/search"
        className="text-[0.9rem] gap-2 p-3 bg-white mt-16 px-24 border border-gray-200 hover:bg-blue-500 hover:text-white"
      >
        คลิกเพื่อดูสินค้าเพิ่มเติม
      </Link>
    </div>
  );
};
export default Home;
