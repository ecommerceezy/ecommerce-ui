"use client";
import { useEffect, useMemo, useState } from "react";
import { FiFolderMinus } from "react-icons/fi";
import Switch from "react-switch";
import {
  FaCaretUp,
  FaCheck,
  FaChevronDown,
  FaChevronLeft,
  FaChevronRight,
  FaClock,
  FaEdit,
  FaEnvelope,
  FaEye,
  FaEyeSlash,
  FaHourglassHalf,
  FaIdCard,
  FaLock,
  FaPlus,
  FaReceipt,
  FaRegListAlt,
  FaSearch,
  FaTimes,
  FaTrash,
  FaTruck,
  FaTruckMoving,
  FaUser,
  FaUserCheck,
  FaUsers,
  FaUsersSlash,
} from "react-icons/fa";
import { MdInfoOutline } from "react-icons/md";
import { v4 as uuid } from "uuid";
import { Controller, useForm } from "react-hook-form";
import Modal from "@/components/model";
import Link from "next/link";
import { isValidEmail } from "@/libs/validate-input";
import Loader from "@/components/loader";
import { popup } from "@/libs/alert-popup";
import axios from "axios";
import { envConfig } from "@/config/env-config";
import { debounce } from "lodash";
import { generateSecurePassword } from "@/app/profile/account/page";
import Loading from "@/layout/loading";

const Members = () => {
  const [showModal, setShowModal] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPage, setTotalPage] = useState(1);
  const [search, setSearch] = useState("");
  const [take, setTake] = useState(15);
  const [searchStatus, setSearchStatus] = useState("all");
  const [sort, setSort] = useState(JSON.stringify({ createdAt: "desc" }));
  const [loading, setLoading] = useState(false);
  const [prefix, setPrefix] = useState(0);

  const [fetching, setFetching] = useState(false);
  const [membersAvg, setMembersAvg] = useState(null);
  const fetchAvg = async () => {
    setLoading(true);
    try {
      const res = await axios.get(envConfig.apiURL + "/admin/members/avg", {
        withCredentials: true,
      });
      if (res.status === 200) {
        setMembersAvg(res.data);
      }
    } catch (error) {
      console.error(error);
      popup.err();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvg();
  }, []);

  const [members, setMembers] = useState([]);
  const getMembers = async (page, take, search, searchStatus, sort) => {
    setFetching(true);
    try {
      const res = await axios.get(envConfig.apiURL + "/admin/members", {
        withCredentials: true,
        params: {
          page,
          take,
          search,
          searchStatus,
          sort,
        },
      });

      if (res.status === 200) {
        setMembers(res.data.members);
        setTotal(res?.data?.total);
        setTotalPage(res?.data?.totalPage);
      }
    } catch (error) {
      console.error(error);
      popup.err();
    } finally {
      setFetching(false);
    }
  };

  const debounceSearch = useMemo(() => debounce(getMembers, 700), [getMembers]);

  useEffect(() => {
    debounceSearch(page, take, search, searchStatus, sort);
  }, [page, take, search, searchStatus, sort]);

  const resetAllSearch = () => {
    setPage(1);
    setSort(JSON.stringify({ createdAt: "desc" }));
    setSearchStatus("all");
    setTake(15);
    setSearch("");
  };

  const handleAllowedMember = async (id, isAllowed) => {
    const { isConfirmed } = await popup.confirmPopUp(
      isAllowed ? "ระงับการใช้งานบัญชี" : "เปิดใช้งานบัญชี",
      isAllowed
        ? "ต้องการระงับการใช้งานบัญชีนี้หรือไม่?"
        : "ต้องการเปิดใช้งานบัญชีนี้หรือไม่?",
      isAllowed ? "ระงับ" : "เปิด"
    );
    if (!isConfirmed) return;

    setFetching(true);
    try {
      const res = await axios.put(
        envConfig.apiURL + "/admin/toggle-member",
        { id, isAllowed },
        { withCredentials: true }
      );
      if (res.status === 200) {
        if (isAllowed) {
          popup.warning(
            "ระงับบัญชีแล้ว\nระบบได้ส่งข้อความถึงผู้ใช้งานแล้ว",
            "แจ้งเตือน"
          );
        } else {
          popup.success(
            "เปิดใช้งานบัญชีแล้ว\nระบบได้ส่งข้อความถึงผู้ใช้งานแล้ว"
          );
        }
        fetchAvg();
        getMembers(page, take, search, searchStatus, sort);
      }
    } catch (error) {
      console.error(error);
      popup.err();
    } finally {
      setFetching(false);
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

  const [creating, setCreating] = useState(false);
  const handleCreateUser = async (data) => {
    if (prefix === 0) {
      return popup.err("กรุณาเลือกคำนำหน้า");
    }
    setCreating(true);
    try {
      const payload = {
        ...data,
        title_type: prefix === 1 ? "นาย" : prefix === 2 ? "นาง" : "นางสาว",
        password: generateSecurePassword(),
      };
      const res = await axios.post(
        envConfig.apiURL + "/admin/create-member",
        payload,
        {
          withCredentials: true,
        }
      );
      if (res.data.err) {
        return popup.err(res.data.err);
      }
      if (res.status === 200) {
        popup.success("สมาชิกจะได้รับรหัสผ่านทางอีเมล");
        setShowModal(false);
        reset();
        setPrefix(0);
        getMembers(page, take, search, searchStatus, sort);
      }
    } catch (error) {
      console.error(error);
      popup.err();
    } finally {
      setCreating(false);
    }
  };

  const {
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm({
    defaultValues: {
      email: "",
      first_name: "",
      last_name: "",
    },
  });

  if (loading) return <Loading />;

  return (
    <>
      {" "}
      <div className="w-full p-5 bg-white h-full overflow-auto border border-gray-300">
        <p className="text-2xl font-bold text-blue-500">จัดการสมาชิก</p>
        <p className="mt-1">จัดการข้อมูลสมาชิกและลูกค้าของร้านค้า</p>
        <div className="mt-5 pt-5 border-t-2 border-blue-500 w-full">
          <div className="grid lg:grid-cols-3 grid-cols-1 gap-3.5 w-full">
            <div className="p-5 rounded-lg border border-gray-300 shadow-md flex flex-col gap-2">
              <p className="text-blue-500 font-bold">สมาชิกทั้งหมด</p>
              <span className="w-full flex items-center justify-between">
                <p className="font-bold text-xl">
                  {membersAvg?.allMembers?.toLocaleString()}
                </p>
                <div className="p-2 rounded-full border border-blue-600">
                  <FaUsers color="blue" />
                </div>
              </span>
            </div>

            <div className="p-5 rounded-lg border border-gray-300 shadow-md flex flex-col gap-2">
              <p className="text-green-500 font-bold">สมาชิกใช้งาน</p>
              <span className="w-full flex items-center justify-between">
                <p className="font-bold text-xl">
                  {" "}
                  {membersAvg?.allAllowed?.toLocaleString()}
                </p>
                <div className="p-2 rounded-full border border-green-600">
                  <FaUserCheck color="green" />
                </div>
              </span>
            </div>
            <div className="p-5 rounded-lg border border-gray-300 shadow-md flex flex-col gap-2">
              <p className="text-red-500 font-bold">สมาชิกระงับชั่วคราว</p>
              <span className="w-full flex items-center justify-between">
                <p className="font-bold text-xl">
                  {" "}
                  {membersAvg?.allUnAllowed?.toLocaleString()}
                </p>
                <div className="p-2 rounded-full border border-red-600">
                  <FaUsersSlash color="red" />
                </div>
              </span>
            </div>
          </div>
        </div>

        {/* search */}
        <div className="w-full mt-5 flex items-center justify-between flex-col lg:flex-row">
          <p>ผลการค้นหา ({total} คน)</p>
          <div className="w-full lg:w-1/3 p-2.5 px-3 rounded-md border border-gray-300 shadow-md flex items-center gap-2.5">
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
        </div>
        <div className="w-full mt-3 flex flex-col lg:flex-row justify-between">
          <div className="lg:w-[80%] grid lg:grid-cols-5 grid-cols-2 gap-2">
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
                <option value={"true"} className="text-sm">
                  ใช้งาน
                </option>
                <option value={"false"} className="text-sm">
                  ระงับชั่วคราว
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
                    : searchStatus
                    ? "ใช้งาน"
                    : "ระงับชั่วคราว"}
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
                  สมัครล่าสุด
                </option>
                <option
                  value={JSON.stringify({
                    bill_orders: {
                      _count: "desc",
                    },
                  })}
                  className="text-sm"
                >
                  ซื้อบ่อยที่สุด
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
          <button
            onClick={() => {
              setShowModal(true);
              reset({
                pro_name: "",
                pro_price: "",
                freight: "",
                pro_number: "",
                pro_color: "",
                pro_size: "",
                pro_details: "",
              });
            }}
            className="p-2.5 text-[0.9rem] w-fit mt-3 lg:mt-0 text-white bg-blue-500 hover:bg-blue-600 flex items-center gap-2 rounded-md"
          >
            <FaPlus />
            <p>เพิ่มสมาชิกใหม่</p>
          </button>
        </div>

        <div className="mt-3.5 w-full flex flex-col p-6 rounded-lg border border-gray-300 shadow-md shadow-gray-300">
          <div className="w-full mb-3 items-center hidden text-[0.9rem] lg:flex  pb-3 border-b border-blue-300">
            <p className="w-[7%] text-start">ลำดับ</p>
            <p className="w-[28%] text-start">สมาชิก</p>
            <p className="w-[20%] text-start">จำนวนครั้งสั่งซื้อ</p>
            <span className="w-[22%] flex items-center justify-center text-center gap-2">
              <p>สถานะ</p>
            </span>
            <p className="w-[23%] text-center">ดำเนินการ</p>
          </div>

          <div className="w-full flex flex-col mt-1 h-[500px] overflow-auto">
            {fetching ? (
              <div
                key={uuid()}
                className="flex flex-col w-full py-10 items-center gap-1"
              >
                {" "}
                <div className="w-10 h-10 border-4 border-white/10 border-t-blue-500 rounded-full animate-spin" />
                <p>กำลังโหลด...</p>
              </div>
            ) : members?.length > 0 ? (
              members?.map((m, index) => (
                <div
                  key={uuid()}
                  className="cursor-pointer grid grid-cols-1 text-[0.9rem] border-b border-blue-100 hover:bg-blue-50 w-full lg:flex gap-2 lg:gap-0 items-center py-2"
                >
                  <p className="w-full lg:w-[7%] lg:text-start">
                    {index + (page - 1) * 10 + 1}
                  </p>
                  <div className="w-full lg:w-[28%] flex flex-col gap-1 items-start">
                    <p className="font-bold w-full">
                      {m?.title_type}
                      {m?.first_name} {m?.last_name}
                    </p>
                    <span className="flex items-center gap-3 text-sm">
                      <p className="text-sm text-gray-700">
                        วันที่สมัคร :{" "}
                        {new Date(m?.createdAt).toLocaleDateString("th-TH")}
                      </p>
                    </span>
                  </div>
                  <div className="w-full lg:w-[20%] flex justify-start flex-col gap-1 lg:text-start break-words">
                    <p>{m?._count?.bill_orders?.toLocaleString()} ครั้ง</p>
                  </div>

                  <div className="w-full lg:w-[22%] flex items-center justify-center">
                    <Switch
                      onChange={() =>
                        handleAllowedMember(m?.user_id, m?.allowed)
                      }
                      checked={m?.allowed}
                      onColor="#22c55e" // สีตอนเปิด (เขียว)
                      offColor="#9ca3af" // สีตอนปิด (เทา)
                      handleDiameter={18} // ขนาดปุ่มกลม
                      uncheckedIcon={false}
                      checkedIcon={false}
                    />
                  </div>

                  <span className="w-full lg:w-[23%] lg:flex justify-center items-center">
                    <button className="underline text-red-500">
                      <FaTrash />
                    </button>
                  </span>
                </div>
              ))
            ) : (
              <div
                key={uuid()}
                className="w-full flex items-center justify-center h-full flex-col gap-2 text-gray-400"
              >
                <FiFolderMinus size={50} />
                <p>ไม่สมาชิก</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <div className="w-full relative z-50 text-black lg:w-1/3 rounded-md p-6 border border-gray-300 shadow-md bg-white flex flex-col items-start">
          <button
            onClick={() => {
              setShowModal(false);
              reset();
            }}
            className="p-2 hover:bg-gray-300 rounded-md absolute top-3.5 right-4"
          >
            <FaTimes size={20} />
          </button>
          <p className="pb-2 border-b border-blue-600 w-full">
            ลงทะเบียนสมาชิก
          </p>

          <p className="mt-5 text-gray-600">ข้อมูลทั่วไป</p>

          <p className="text-gray-800 mt-3">คำนำหน้า</p>
          <span className="mt-1.5 flex items-center gap-2">
            <button
              onClick={() => setPrefix(1)}
              className={` ${
                prefix === 1 && "bg-blue-500 text-white"
              } p-1.5 px-4 text-sm rounded-md border border-gray-500`}
            >
              นาย
            </button>
            <button
              onClick={() => setPrefix(2)}
              className={`${
                prefix === 2 && "bg-blue-500 text-white"
              } p-1.5 px-4 text-sm rounded-md border border-gray-500`}
            >
              นาง
            </button>
            <button
              onClick={() => setPrefix(3)}
              className={`${
                prefix === 3 && "bg-blue-500 text-white"
              } p-1.5 px-4 text-sm rounded-md border border-gray-500`}
            >
              นางสาว
            </button>
          </span>

          <span className="w-full grid grid-cols-1 lg:grid-cols-2 gap-3.5 mt-3">
            <div className="flex flex-col">
              <span className="flex items-center gap-2">
                <p className="text-gray-800">ชื่อ</p>
              </span>
              <Controller
                name="first_name"
                control={control}
                rules={{ required: "กรุณากรอกชื่อ" }}
                render={({ field }) => (
                  <input
                    value={field.value}
                    {...field}
                    type="text"
                    placeholder="ชื่อของคุณ"
                    className=" w-full p-2 px-3 rounded-md border border-gray-500 shadow-sm mt-1.5"
                    name=""
                    id=""
                  />
                )}
              />
              {errors.first_name && (
                <small className="text-sm text-red-500 mt-1">
                  {errors.first_name.message}
                </small>
              )}
            </div>
            <div className="flex flex-col">
              <span className="flex items-center gap-2">
                <p className="text-gray-800">นามสกุล</p>
              </span>
              <Controller
                name="last_name"
                control={control}
                rules={{ required: "กรุณากรอกนามสกุล" }}
                render={({ field }) => (
                  <input
                    value={field.value}
                    {...field}
                    type="text"
                    placeholder="นามสกุล"
                    className=" w-full p-2 px-3 rounded-md border border-gray-500 shadow-sm mt-1.5"
                    name=""
                    id=""
                  />
                )}
              />
              {errors.last_name && (
                <small className="text-sm text-red-500 mt-1">
                  {errors.last_name.message}
                </small>
              )}
            </div>
          </span>

          <p className="mt-7 text-gray-600">สร้างบัญชี</p>
          <span className="flex items-center gap-2 mt-3">
            <FaEnvelope color="" />
            <p className="text-gray-800">อีเมล</p>
          </span>
          <Controller
            name="email"
            control={control}
            rules={{
              required: "กรุณาตั้งรหัสผู้ใช้งานหรืออีเมล",
              validate: (value) => {
                if (!isValidEmail(value)) return "อีเมลไม่ถูกต้อง";
              },
            }}
            render={({ field }) => (
              <input
                value={field.value}
                {...field}
                type="text"
                placeholder="กรอกอีเมลของผู้ใช้งาน"
                className=" w-full p-2 px-3 rounded-md border border-gray-500 shadow-sm mt-1.5"
                name=""
                id=""
              />
            )}
          />
          {errors.email && (
            <small className="text-sm text-red-500 mt-1">
              {errors.email.message}
            </small>
          )}

          <p className="py-5 text-red-500">
            *หลังจากลงทะเบียนระบบจะส่งรหัสผ่านไปทางอีเมลของสมาชิก
          </p>
          <button
            disabled={creating}
            onClick={handleSubmit(handleCreateUser)}
            className="w-full mt-5 p-3 rounded-full flex items-center justify-center gap-3 text-white bg-blue-500 hover:bg-blue-600"
          >
            {creating ? (
              <>
                {" "}
                <Loader />
                <p>กำลังตรวจสอบ...</p>
              </>
            ) : (
              <>
                <FaIdCard size={25} />
                <p>ลงทะเบียน</p>
              </>
            )}
          </button>
        </div>
      </Modal>
    </>
  );
};
export default Members;
