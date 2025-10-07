import { envConfig } from "@/config/env-config";
import { useAppContext } from "@/context/app-context";
import { useRouter } from "next/navigation";

const ProductCard = ({
  pro_id,
  pro_name,
  pro_price,
  categories,
  pro_number,
  imgs,
  promotion,
  sell_count,
  unit,
}) => {
  const router = useRouter();

  const handleCardClick = (id) => {
    router.push(`/product-detail/${id}`);
  };

  if (!pro_id || !pro_name || !pro_price || !categories || !imgs) return null;

  return (
    <div
      onClick={() => handleCardClick(pro_id)}
      className="relative w-auto flex flex-col shadow-md border cursor-pointer transition-all duration-300 hover:shadow-gray-400 hover:scale-102 border-gray-300 overflow-hidden rounded-md"
    >
      {/* สินค้าหมด */}
      {pro_number < 1 && (
        <div className="absolute top-0 left-0 w-full h-full z-10 rounded-md bg-gradient-to-b from-black/70 to-black/40 flex items-center justify-center flex-col gap-3 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-red-400 drop-shadow-md">
              สินค้าหมด
            </h1>
          </div>
          <p className="text-sm text-gray-200">โปรดเลือกสินค้ารายการอื่น</p>
        </div>
      )}
      {promotion?.discount && (
        <span className="absolute top-0 right-0 p-1 font-bold px-1.5 text-xs text-red-600 border border-yellow-500 bg-red-100/85">
          - {promotion?.discount} %
        </span>
      )}
      <div className="w-full h-[200px] lg:h-[180px] border-b border-gray-300">
        <img
          src={envConfig.imgURL + imgs[0]?.url}
          className="w-full h-full object-cover"
          alt=""
        />
      </div>
      <div className="bg-white p-3 flex flex-col w-full break-words gap-1">
        <p className="w-full text-wrap text-sm lg:text-[0.9rem] text-gray-800 leading-5">
          {pro_name}
        </p>
        <p className="text-xs lg:text-sm text-gray-500">
          {categories?.map((c) => c?.name).join(",")?.length > 23
            ? categories
                ?.map((c) => c?.name)
                .join(",")
                ?.slice(0, 23) + "..."
            : categories?.map((c) => c?.name).join(",")}
        </p>
        <p className="text-xs text-gray-700">
          เหลือ {pro_number?.toLocaleString()} {unit || "ชิ้น"}
        </p>
        <p className="text-xs text-gray-700">
          ขายแล้ว {sell_count?.toLocaleString()} ชิ้น
        </p>
        <span className="w-full flex items-end gap-1.5">
          <p
            className={`text-lg  ${
              promotion?.discount ? "line-through" : "font-bold"
            }`}
          >
            {Number(pro_price).toLocaleString()}฿
          </p>
          {promotion?.discount && (
            <p className="text-xl font-bold text-red-500">
              {(
                pro_price -
                Math.round((Number(promotion?.discount) / 100) * pro_price)
              ).toLocaleString()}
              ฿
            </p>
          )}
        </span>
      </div>
    </div>
  );
};
export default ProductCard;
