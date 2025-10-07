"use client";
import Loader from "@/components/loader";
import Modal from "@/components/model";
import ProductCard from "@/components/product-card";
import { envConfig } from "@/config/env-config";
import { useAppContext } from "@/context/app-context";
import { popup } from "@/libs/alert-popup";
import axios from "axios";
import { debounce } from "lodash";
import { useEffect, useMemo, useState } from "react";
import {
  FaArrowLeft,
  FaArrowRight,
  FaFilter,
  FaList,
  FaSearch,
  FaShoppingBag,
  FaTimes,
  FaTrash,
} from "react-icons/fa";
import { v4 as uuid } from "uuid";

const Search = () => {
  const [showResponSiveMenu, setShowResponsiveMenu] = useState(false);
  const [inputMinPrice, setInputMinPrice] = useState(0);
  const [inputMaxPrice, setInputMaxPrice] = useState(0);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(0);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPage, setTotalPage] = useState(1);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState(JSON.stringify({ sell_count: "desc" }));

  const { search, searchCtgs, setSearchCtgs } = useAppContext();

  const forwardPage = () => {
    if (page >= totalPage) return;
    setPage(page + 1);
  };

  const prevPage = () => {
    if (page <= 1) return;
    setPage(page - 1);
  };

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

  useEffect(() => {
    fetchCTG();
    fetchProduct();
  }, []);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const fetchProduct = async (
    search,
    sort = JSON.stringify({ sell_count: "desc" }),
    page,
    minPrice,
    maxPrice,
    searchCtgs
  ) => {
    setLoading(true);
    try {
      const res = await axios.get(envConfig.apiURL + "/guest/search-product", {
        params: {
          search,
          sort,
          page,
          minPrice,
          maxPrice,
          searchCtgs,
        },
      });
      if (res.status === 200) {
        setProducts(res.data.product);
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
    debounceSearch(
      search,
      sort,
      page,
      minPrice,
      maxPrice,
      searchCtgs.join(",")
    );
  }, [search, sort, page, minPrice, maxPrice, searchCtgs]);

  const handleSelectCtg = (id) => {
    setSearchCtgs((prev) =>
      prev.find((p) => p === id) ? prev.filter((p) => p !== id) : [id, ...prev]
    );
  };

  const handleSearchByPrice = () => {
    // ไม่ให้ NaN
    if (isNaN(inputMinPrice) || isNaN(inputMaxPrice)) {
      return popup.err("กรุณากรอกราคาเป็นตัวเลข");
    }

    if (inputMinPrice < 0 || inputMaxPrice < 0) {
      return popup.err("ราคาต้องไม่ติดลบ");
    }

    if (inputMaxPrice > 0 && inputMinPrice > inputMaxPrice) {
      return popup.err("ราคาต่ำสุดต้องน้อยกว่าราคาสูงสุด");
    }

    setPage(1);
    setMinPrice(inputMinPrice || 0);
    setMaxPrice(inputMaxPrice || 0);
  };

  const resetSearch = () => {
    setMinPrice(0);
    setMaxPrice(0);
    setInputMaxPrice(0);
    setInputMinPrice(0);
    setSearchCtgs([]);
    setSort(JSON.stringify({ sell_count: "desc" }));
    setPage(1);
  };

  return (
    <>
      <div className="w-full px-5 mt-[21rem]  lg:w-[72%] flex flex-col lg:flex-row lg:mt-44 ">
        {/* search */}
        <div
          className={`${
            showResponSiveMenu ? "z-[99999]" : ""
          } transition-all duration-300 flex flex-col lg:w-1/5 w-full pr-3 lg:border-r border-gray-300 relative`}
        >
          {showResponSiveMenu && (
            <button
              onClick={() => setShowResponsiveMenu(false)}
              className="absolute top-3 right-5"
            >
              <FaTimes size={20} />
            </button>
          )}

          <div className="flex items-center gap-2 border-b border-gray-300 pb-3">
            <FaFilter />
            <p>ค้นหาสินค้า</p>
          </div>
          <button
            onClick={() => setShowResponsiveMenu(true)}
            className="p-2 px-3 lg:hidden flex items-center gap-2 bg-blue-500 text-white w-fit mt-2 rounded-md"
          >
            <FaSearch />
            <p>เครื่องมือค้นหา</p>
          </button>
          <div
            className={`${
              showResponSiveMenu ? "" : "hidden"
            } lg:flex flex-col mt-3 pb-5 border-b border-gray-300`}
          >
            <p className="mt-5 text-sm text-gray-700">หมวดหมู่สินค้า</p>
            {categories.map((c) => (
              <div key={uuid()} className=" flex items-center gap-2.5 mt-3">
                <input
                  type="checkbox"
                  checked={searchCtgs.includes(c?.id)}
                  onChange={() => handleSelectCtg(c?.id)}
                />
                <p>{c?.name}</p>
              </div>
            ))}
          </div>
          <div
            className={`lg:flex hidden flex-col mt-3 pb-5 border-b border-gray-300`}
          >
            <p className="mt-5 text-sm text-gray-700">ช่วงราคา</p>
            <div className="flex items-center gap-2.5 mt-3">
              <input
                value={inputMinPrice === 0 ? "" : inputMinPrice}
                onChange={(e) => setInputMinPrice(Number(e.target.value))}
                className="bg-white p-2 rounded-md w-[43%] border border-gray-400"
                placeholder="ราคาต่ำสุด"
                type="number"
              />
              <p>-</p>
              <input
                value={inputMaxPrice === 0 ? "" : inputMaxPrice}
                onChange={(e) => setInputMaxPrice(Number(e.target.value))}
                className="bg-white p-2 rounded-md w-[43%] border border-gray-400"
                placeholder="ราคาสูงสุด"
                type="number"
              />
            </div>
            <button
              onClick={handleSearchByPrice}
              className="text-white w-full p-2 bg-blue-500 mt-4 hover:bg-blue-600"
            >
              ตกลง
            </button>
          </div>
          <div className="mt-2 py-2">
            <button
              onClick={resetSearch}
              className="flex items-center gap-2 p-2.5 hover:bg-blue-600 text-white rounded-md text-sm bg-blue-500"
            >
              <FaTrash />
              <p>ล้างการค้นหา</p>
            </button>
          </div>
        </div>

        <div className="lg:w-[80%] w-full h-fit bg-white mt-3 lg:mt-0">
          {search && (
            <span className="flex items-center gap-2 p-3 text-xl">
              <p>ค้นหา:</p>
              <p className="text-blue-500">{search}</p>
            </span>
          )}
          <div className="w-full flex items-center justify-between p-3 border-b border-gray-200">
            <div title="เรียง" className="relative inline-block">
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setPage(1);
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              >
                <option
                  value={JSON.stringify({ pro_price: "asc" })}
                  className="text-sm"
                >
                  ถูกสุด
                </option>
                <option
                  value={JSON.stringify({ createdAt: "desc" })}
                  className="text-sm"
                >
                  ใหม่ล่าสุด
                </option>
                <option
                  value={JSON.stringify({ sell_count: "desc" })}
                  className="text-sm"
                >
                  สินค้าขายดี
                </option>
              </select>
              <label
                htmlFor="select-row"
                className="p-2 px-3.5 rounded-lg border border-blue-500 text-white bg-blue-500 shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <FaList size={17} />
                <p className="text-sm hidden lg:inline-flex">เรียง</p>
              </label>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={prevPage}
                className="p-2 bg-blue-500 text-white rounded-md"
              >
                <FaArrowLeft />
              </button>
              <p>
                หน้า {page} จาก {totalPage}
              </p>
              <button
                onClick={forwardPage}
                className="p-2 bg-blue-500 text-white rounded-md"
              >
                <FaArrowRight />
              </button>
            </div>
          </div>
          <p className="p-4">ผลการค้นหา ({total} ชิ้น)</p>
          <div className="mt-1 grid lg:grid-cols-5 w-full h-full  grid-cols-2 gap-3.5 p-2 px-3">
            {loading ? (
              <div className="flex flex-col gap-1 items-center p-5">
                <FaShoppingBag color="gray" size={50} />
                <p>กำลังโหลด...</p>
              </div>
            ) : products?.length > 0 ? (
              products?.map((p) => <ProductCard key={uuid()} {...p} />)
            ) : (
              <></>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
export default Search;
