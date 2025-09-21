
import { popup } from "@/libs/alert-popup";
import axios from "axios";
import { useEffect, useState } from "react";

export default function useProvince() {
  const [provinces, setProvinces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [provinceOptions,setProvinceOptions] = useState([]);

  const fetchProvinces = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        "https://raw.githubusercontent.com/kongvut/thai-province-data/master/api_province_with_amphure_tambon.json"
      );
      const province = res.data;
      setProvinces(province);
      const options = province.map((p) => ({
        label:p.name_th,
        value:p.name_th
      }))
      setProvinceOptions(options);
    } catch (err) {
      console.error(err);
      popup.err();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProvinces();
  }, []);

  return {
    provinces,
    loading,
    provinceOptions
  };
}
