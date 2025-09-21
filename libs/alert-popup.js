import Swal from "sweetalert2";

export const popup = {
  err: (mes = "โปรดตรวจเครือข่ายแล้วลองอีกครั้ง") => {
    return Swal.fire("เกิดข้อผิดพลาด", mes, "error");
  },
  success: (mes = "บันทึกข้อมูลแล้ว") => {
    return Swal.fire("สำเร็จ", mes, "success");
  },
  confirmPopUp: (title, mes, confirmButtonText) => {
    return Swal.fire({
      title,
      text: mes,
      confirmButtonText,
      denyButtonText: "ยกเลิก",
      showDenyButton: true,
      icon: "question",
    });
  },
  warning: (mes = "ขออภัยจำนวนสินค้าคงเหลือไม่เพียงพอ", title = "ขออภัย!") => {
    return Swal.fire(title, mes, "warning");
  },
};
