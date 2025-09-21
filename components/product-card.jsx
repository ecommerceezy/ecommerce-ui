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
  showCart = true,
}) => {
  const router = useRouter();
  const { setCart } = useAppContext();

  const handleCardClick = (id) => {
    router.push(`/product-detail/${id}`);
  };

  if (!pro_id || !pro_name || !pro_price || !categories || !imgs) return null;

  return (
    <div
      onClick={() => handleCardClick(pro_id)}
      className="relative w-auto flex flex-col shadow-md border cursor-pointer transition-all duration-300 hover:shadow-gray-400 hover:scale-102 border-gray-200 rounded-md"
    >
      {promotion && (
        <span className="absolute top-0 right-0 p-1 font-bold px-1.5 text-xs text-red-600 border border-yellow-500 bg-red-100/85">
          - 50 %
        </span>
      )}
      <div className="w-full h-[200px] lg:h-[180px] border-b border-gray-300">
        <img
          src={envConfig.imgURL + imgs[0]?.url}
          className="w-full h-full object-cover"
          alt=""
        />
      </div>
      <div className="bg-white p-3 flex flex-col w-full break-words gap-1.5">
        <p className="w-full text-wrap text-sm lg:text-[0.9rem] text-gray-800 leading-5">
          {pro_name}
        </p>
        <p className="text-xs lg:text-sm text-gray-500">
          {categories?.map((c) => c?.name).join(",")}
        </p>
        <span className="w-full flex items-center justify-between">
          <p className="text-lg font-bold text-orange-500">
            {Number(pro_price).toLocaleString()}฿
          </p>
     
        </span>
      </div>
    </div>
  );
};
export default ProductCard;
