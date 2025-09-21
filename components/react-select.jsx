"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

// import react-select แบบ dynamic และปิด SSR
export const Select = dynamic(() => import("react-select"), { ssr: false });
