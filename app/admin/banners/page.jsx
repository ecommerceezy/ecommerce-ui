"use client";
import Loader from "@/components/loader";
import Modal from "@/components/model";
import { envConfig } from "@/config/env-config";
import { useAppContext } from "@/context/app-context";
import { popup } from "@/libs/alert-popup";
import axios from "axios";
import { useEffect, useState } from "react";
import {
  FaCheck,
  FaEdit,
  FaFolderOpen,
  FaImage,
  FaPlus,
  FaTimes,
  FaTrash,
} from "react-icons/fa";

const Page = () => {
  const { bannerWidth } = useAppContext();
  const [loading, setLoading] = useState(false);

  const [status, setStatus] = useState(0); // active,draft

  const [edit, setEdit] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [preview, setPreview] = useState(null);
  const [fileImage, setFileImage] = useState(null);
  const handlePickImage = (e) => {
    const file = e.target.files[0];
    setFileImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleNewBanner = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setPreview(null);
    setEdit(false);
    setStatus(0);
    setFileImage(null);
  };

  const [saving, setSaving] = useState(false);
  const handleSaveBanner = async () => {
    if (!edit && (!preview || !fileImage)) {
      return popup.err("กรุณาเลือกรูปภาพก่อนบันทึก");
    }
    if (status === 0) {
      return popup.err("กรุณาเลือกสถานะก่อนบันทึก");
    }

    setSaving(true);
    try {
      const api = edit ? `/admin/edit-banner/${edit}` : "/admin/add-banner";
      const payload = new FormData();
      payload.append("image", fileImage);
      payload.append("status", status);
      if (edit && fileImage) {
        payload.append("changeImage", true);
      }
      const res = await axios.post(envConfig.apiURL + api, payload, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.status === 200) {
        popup.success("บันทึกป้ายโฆษณาเรียบร้อย");
        handleCloseModal();
        fetchBanners();
      }
    } catch (error) {
      console.error(error);
      popup.err();
    } finally {
      setSaving(false);
    }
  };

  const [bannersList, setBannerList] = useState([]);
  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await axios.get(envConfig.apiURL + "/guest/get-banners");
      if (res.status === 200) {
        setBannerList(res.data);
      }
    } catch (error) {
      console.error(error);
      popup.err();
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (banner) => {
    setEdit(banner?.id);
    setStatus(Number(banner?.status));
    setPreview(envConfig.imgURL + banner?.img);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    const { isConfirmed } = await popup.confirmPopUp(
      "ลบป้ายโฆษณา",
      "คุณต้องการลบป้ายโฆษณานี้หรือไม่?",
      "ลบ"
    );
    if (!isConfirmed) return;

    setLoading(true);
    try {
      const res = await axios.delete(
        envConfig.apiURL + `/admin/delete-banner/${id}`,
        {
          withCredentials: true,
        }
      );
      if (res.status === 200) {
        popup.success("ลบป้ายโฆษณาเรียบร้อย");
        fetchBanners();
      }
    } catch (error) {
      console.error(error);
      popup.err();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  return (
    <>
      <div className="w-full flex flex-col p-5 rounded-lg bg-white shadow-sm">
        <p className="text-2xl font-bold text-blue-500">จัดการป้ายโฆษณา</p>
        <p className="mt-1">จัดการป้ายโฆษณาที่แสดงหน้ารแรกของร้าน</p>
      </div>

      <div className="mt-5 pt-5 border-t-2 border-blue-500 flex flex-col">
        <button
          onClick={handleNewBanner}
          className="p-3 text-sm rounded-md hover:bg-blue-600 w-fit bg-blue-500 text-white flex items-center gap-2"
        >
          <FaPlus />
          <p>เพิ่มป้ายโฆษณา</p>
        </button>

        <div className="mt-3 w-full flex flex-col p-6 bg-white rounded-lg border border-gray-300 shadow-md shadow-gray-300">
          <div className="w-full mb-3 items-center hidden lg:flex  pb-3 border-b border-blue-300">
            <p className="w-[10%] text-start">ลำดับ</p>
            <p className="w-[50%] text-start">รูปภาพ</p>
            <p className="w-[15%] text-start">สถานะ</p>
            <p className="w-[15%] text-start">แก้ไขล่าสุด</p>
            <p className="w-[10%] text-center">แอคชัน</p>
          </div>
          {loading ? (
            <div className="w-full bg-gray-100 flex flex-col gap-1 py-10 items-center justify-center">
              <Loader />
              <p>กำลังโหลด..</p>
            </div>
          ) : bannersList.length > 0 ? (
            bannersList.map((b, index) => (
              <div
                key={b?.id}
                className="py-2 px-1 flex items-center text-sm text-gray-700"
              >
                <p className="w-[10%] text-start"> {index + 1}</p>
                <div className="w-[50%] p-2 text-start">
                  <img
                    src={envConfig.imgURL + b?.img}
                    className="w-[90%] h-[200px] object-cover  shadow-md rounded-md "
                    alt=""
                  />
                </div>
                <div className="w-[15%]">
                  <p
                    className={`w-fit p-2 text-sm px-3.5 rounded-md ${
                      b?.status == 1
                        ? "bg-green-100 text-green-600"
                        : "bg-gray-100 text-red-500"
                    } shadow-md`}
                  >
                    {b?.status == 1 ? "ใช้งาน" : "ฉบับร่าง"}
                  </p>
                </div>
                <p className="w-[15%] text-start">
                  {new Date(b?.updatedAt).toLocaleDateString("th-TH")}
                </p>
                <div className="w-[10%] text-start justify-center flex items-center gap-5">
                  <FaEdit
                    onClick={() => handleEdit(b)}
                    size={20}
                    className="cursor-pointer hover:text-blue-500"
                  />
                  <FaTrash
                    onClick={() => handleDelete(b?.id)}
                    size={20}
                    className="cursor-pointer hover:text-red-500"
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="w-full py-10 text-gray-700 text-sm flex flex-col gap-1 items-center justify-center">
              <FaFolderOpen size={35} />
              <p>ไม่พบป้ายโฆษณา</p>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={showModal} onClose={handleCloseModal}>
        <div
          style={{ width: `${bannerWidth === 0 ? 1000 : bannerWidth}px` }}
          className="p-5 rounded-lg bg-white shadow-md z-50"
        >
          <span className="w-full mb-3.5 flex items-center justify-between pb-3 border-b-2 border-blue-500">
            <p className="text-lg">เพิ่มป้ายโฆษณาใหม่</p>
            <button
              onClick={handleCloseModal}
              className="p-2 rounded-md hover:bg-gray-300"
            >
              <FaTimes size={20} />
            </button>
          </span>

          <label
            htmlFor="img-picker"
            className="w-full rounded-lg h-[300px] overflow-hidden flex flex-col items-center cursor-pointer hover:bg-gray-200 justify-center text-gray-600 gap-1.5 border border-gray-300"
          >
            <input
              type="file"
              name=""
              id="img-picker"
              onChange={handlePickImage}
              className="hidden"
            />
            {preview ? (
              <img
                src={preview}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <>
                {" "}
                <FaImage size={30} />
                <p>อัปโหลดรูปภาพ</p>
              </>
            )}
          </label>

          <p className="mt-5">สถานะ</p>
          <div className="mt-1 flex items-center gap-2.5">
            <button
              onClick={() => setStatus(1)}
              className={`${
                status === 1 && "bg-blue-500 text-white"
              } p-2.5 px-3 rounded-md text-sm border border-gray-400`}
            >
              <p>ใช้งาน</p>
            </button>
            <button
              onClick={() => setStatus(2)}
              className={`${
                status === 2 && "bg-blue-500 text-white"
              } p-2.5 px-3 rounded-md text-sm border border-gray-400`}
            >
              <p>ฉบับร่าง</p>
            </button>
          </div>

          <button
            disabled={saving}
            onClick={handleSaveBanner}
            className="mt-5 p-2.5 px-3 text-sm rounded-md bg-blue-500 text-white flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader />
                <p>กำลังบันทึก...</p>
              </>
            ) : (
              <>
                {" "}
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
export default Page;
