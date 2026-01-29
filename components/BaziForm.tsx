"use client";

import React, { useState, useEffect, useRef } from "react";
import { UserInput, Gender, ShiChenName } from "@/types";
import {
  calculateBazi,
  validateBaziCalculationInput,
} from "@/lib/bazi-calculator";
import { SHI_CHEN_LIST } from "@/lib/constants/shi-chen";
import Button from "./shared/Button";
import SegmentedDateInput, {
  SegmentedDateInputRef,
} from "./shared/SegmentedDateInput";
import "./BaziForm.module.css";

interface BaziFormProps {
  onSubmit: (data: UserInput) => void | Promise<void>;
  initialData?: Partial<UserInput>;
}

export default function BaziForm({ onSubmit, initialData }: BaziFormProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [gender, setGender] = useState<Gender>(initialData?.gender || "Male");
  const [birthDate, setBirthDate] = useState("");
  const [shiChen, setShiChen] = useState<ShiChenName>("子时");
  const [calculatedData, setCalculatedData] = useState<UserInput | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState<string>("");
  const dateInputRef = useRef<SegmentedDateInputRef>(null);

  useEffect(() => {
    if (birthDate && shiChen && gender) {
      handleCalculate();
    }
  }, [birthDate, shiChen, gender]);

  const handleCalculate = () => {
    setError("");
    setCalculating(true);
    try {
      const dateObj = new Date(birthDate);
      const validation = validateBaziCalculationInput({
        birthDate: dateObj,
        shiChen,
        gender,
      });
      if (!validation.valid) {
        setError(validation.error || "输入信息无效");
        setCalculatedData(null);
        return;
      }
      const result = calculateBazi({
        birthDate: dateObj,
        shiChen,
        gender,
      });
      const userData: UserInput = {
        name,
        gender,
        birthYear: result.birthYear,
        birthDate: birthDate,
        yearPillar: result.yearPillar,
        monthPillar: result.monthPillar,
        dayPillar: result.dayPillar,
        hourPillar: result.hourPillar,
        startAge: result.startAge,
      };
      setCalculatedData(userData);
    } catch (err: unknown) {
      setError(`计算失败，请检查输入信息${err}`);
      setCalculatedData(null);
    } finally {
      setCalculating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate date input before submission
    const dateValidation = dateInputRef.current?.validate();
    if (dateValidation && !dateValidation.valid) {
      setError(dateValidation.error);
      return;
    }

    if (!calculatedData) {
      setError("请先填写出生日期和时辰");
      return;
    }

    // Additional check: ensure birthDate hasn't been tampered with
    const calculatedBirthDate = calculatedData.birthDate;
    if (birthDate !== calculatedBirthDate) {
      setError("出生日期已修改，请重新计算八字");
      setCalculatedData(null);
      return;
    }

    onSubmit(calculatedData);
  };

  return (
    <div className="relative font-song bg-rice-paper p-6 md:p-12 lg:p-16 rounded-xl shadow-2xl border-[6px] border-double border-[#8b7e66] mx-auto max-w-5xl">
      <div className="absolute top-0 left-0 w-full h-4 bg-linear-to-b from-[#8b7e66]/10 to-transparent"></div>

      <form onSubmit={handleSubmit} className="relative z-10 space-y-12">
        {/* 标题 */}
        <div className="text-center mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#2c1810] mb-4 font-song tracking-widest flex items-center justify-center gap-3 sm:gap-4 md:gap-6 whitespace-nowrap overflow-hidden px-2">
            <span className="text-red-800 opacity-80 text-lg sm:text-xl md:text-2xl shrink-0">
              ◈
            </span>
            <span className="text-sm sm:text-lg md:text-xl font-bold text-[#4a3b32] font-song whitespace-nowrap overflow-hidden text-ellipsis">
              请输入您的出生信息
            </span>
            <span className="text-red-800 opacity-80 text-lg sm:text-xl md:text-2xl shrink-0">
              ◈
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24">
          {/* 左侧区域 */}
          <div className="space-y-12">
            {/* 姓名 */}
            <div className="group">
              <label className="block text-base sm:text-lg md:text-xl font-bold text-[#4a3b32] mb-4 font-song pl-2 border-l-4 border-[#b22222] whitespace-nowrap overflow-hidden text-ellipsis">
                姓名{" "}
                <span className="text-sm font-normal text-gray-500 align-middle ml-2">
                  （可选）
                </span>
              </label>
              <div className="relative mt-2">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="请输入姓名"
                  className="w-full bg-transparent border-b-2 border-[#8b7e66] px-2 py-3 text-2xl text-[#2c1810] placeholder-[#c2bba8] focus:outline-none focus:border-[#b22222] transition-colors font-song"
                />
              </div>
            </div>

            {/* 性别 */}
            <div>
              <label className="block text-base sm:text-lg md:text-xl font-bold text-[#4a3b32] mb-6 font-song pl-2 border-l-4 border-[#b22222] whitespace-nowrap overflow-hidden text-ellipsis">
                性别 <span className="text-[#b22222] align-top">*</span>
              </label>
              <div className="flex gap-8">
                <button
                  type="button"
                  onClick={() => setGender("Male")}
                  className={`flex-1 py-4 px-6 rounded-lg border-2 transition-all duration-300 relative overflow-hidden group shadow-sm ${
                    gender === "Male"
                      ? "bg-[#8B3A3A] text-[#F5F2E9] border-[#5e2626] shadow-md transform -translate-y-1"
                      : "bg-transparent text-[#5d4037] border-[#8b7e66] hover:bg-[#8b7e66]/10"
                  }`}
                >
                  <span className="relative z-10 flex items-center justify-center gap-3 font-song text-xl tracking-widest">
                    <span className="opacity-80 text-sm border border-current rounded-sm px-1 py-0.5">
                      乾造
                    </span>{" "}
                    男
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setGender("Female")}
                  className={`flex-1 py-4 px-6 rounded-lg border-2 transition-all duration-300 relative overflow-hidden group shadow-sm ${
                    gender === "Female"
                      ? "bg-[#4A6A6A] text-[#F5F2E9] border-[#2f4545] shadow-md transform -translate-y-1"
                      : "bg-transparent text-[#5d4037] border-[#8b7e66] hover:bg-[#8b7e66]/10"
                  }`}
                >
                  <span className="relative z-10 flex items-center justify-center gap-3 font-song text-xl tracking-widest">
                    <span className="opacity-80 text-sm border border-current rounded-sm px-1 py-0.5">
                      坤造
                    </span>{" "}
                    女
                  </span>
                </button>
              </div>
            </div>

            {/* 出生日期 - 重点修改区域 */}
            <div>
              <label className="block text-base sm:text-lg md:text-xl font-bold text-[#4a3b32] mb-6 font-song pl-2 border-l-4 border-[#b22222] whitespace-nowrap overflow-hidden text-ellipsis">
                出生日期 (公历){" "}
                <span className="text-[#b22222] align-top">*</span>
              </label>

              <div className="custom-date-input-wrapper w-full">
                <SegmentedDateInput
                  ref={dateInputRef}
                  value={birthDate}
                  onChange={setBirthDate}
                  minYear={1900}
                  maxYear={2100}
                />
              </div>
            </div>
          </div>

          {/* 右侧：时辰选择 */}
          <div>
            <label className="block text-base sm:text-lg md:text-xl font-bold text-[#4a3b32] mb-6 font-song pl-2 border-l-4 border-[#b22222]">
              出生时辰 <span className="text-[#b22222] align-top">*</span>
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 md:gap-5">
              {SHI_CHEN_LIST.map((sc) => {
                const isSelected = shiChen === sc.name;
                return (
                  <button
                    key={sc.name}
                    type="button"
                    onClick={() => setShiChen(sc.name as ShiChenName)}
                    className={`relative py-3 rounded border-2 transition-all duration-300 flex flex-col items-center justify-center h-24
                        ${
                          isSelected
                            ? "border-[#8B3A3A] bg-[#8B3A3A] text-[#F5F2E9] shadow-lg transform -translate-y-1"
                            : "border-[#c2bba8] bg-transparent text-[#5d4037] hover:border-[#8b7e66] hover:bg-[#8b7e66]/5"
                        }
                      `}
                  >
                    <div
                      className={`absolute top-2 bottom-2 left-1.5 w-1px ${isSelected ? "bg-white/20" : "bg-[#c2bba8]/30"}`}
                    ></div>
                    <div
                      className={`absolute top-2 bottom-2 right-1.5 w-1px ${isSelected ? "bg-white/20" : "bg-[#c2bba8]/30"}`}
                    ></div>

                    <div className="font-song text-xl font-bold z-10">
                      {sc.name}
                    </div>
                    <div
                      className={`text-xs mt-1 z-10 ${isSelected ? "text-[#eaddcf]" : "text-[#8b7e66]"}`}
                    >
                      {sc.range}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 计算结果区域 */}
        {(calculating || calculatedData) && (
          <div className="mt-12 pt-12 border-t-2 border-dashed border-[#8b7e66]/30">
            {calculating && (
              <div className="text-center text-xl text-[#8b7e66] font-song animate-pulse tracking-widest">
                ⟡ 正在排盘推演 ⟡
              </div>
            )}

            {calculatedData && !calculating && (
              <div className="animate-fade-in-up">
                <h3 className="font-bold lg:text-3xl md:text-2xl sm:text-xl text-sm text-[#2f4545] text-center mb-10 font-song tracking-[0.2em] whitespace-nowrap">
                  — 八字排盘结果 —
                </h3>

                <div className="grid grid-cols-4 gap-8 md:gap-16 max-w-4xl mx-auto px-4">
                  {[
                    { label: "年柱", val: calculatedData.yearPillar },
                    { label: "月柱", val: calculatedData.monthPillar },
                    { label: "日柱", val: calculatedData.dayPillar },
                    { label: "时柱", val: calculatedData.hourPillar },
                  ].map((item, idx) => (
                    <div key={idx} className="flex flex-col items-center group">
                      <span className="text-sm text-[#8b7e66] mb-3 font-serif tracking-widest group-hover:text-[#b22222] transition-colors">
                        {item.label}
                      </span>
                      <div className="text-4xl md:text-5xl font-bold text-[#2c2c2c] font-calligraphy leading-tight">
                        {item.val.split("").map((char, i) => (
                          <span key={i} className="block">
                            {char}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-center mt-12">
                  <div className="inline-block px-8 py-3 border-t border-b border-[#8b7e66]/50">
                    <span className="text-[#5c7a6b] text-lg font-song mr-4">
                      起运年龄
                    </span>
                    <span className="text-3xl font-bold text-[#b22222] font-calligraphy">
                      {calculatedData.startAge} 岁
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="text-[#a8071a] text-center text-lg font-song bg-red-50/50 py-2 border-t border-b border-red-100">
            {error}
          </div>
        )}

        <div className="pt-8 flex justify-center">
          <Button
            type="submit"
            disabled={!calculatedData || calculating}
            className={`
                w-full md:w-1/2 py-5 text-2xl font-bold rounded-full shadow-xl transition-all duration-300 font-song tracking-[0.3em]
                ${
                  calculatedData
                    ? "bg-[#8B3A3A] hover:bg-[#9e4242] text-[#F5F2E9] ring-4 ring-[#8B3A3A]/20"
                    : "bg-[#d1cbb8] text-[#999] cursor-not-allowed"
                }
              `}
          >
            {calculatedData ? "点击以生成K线图" : "请先完善信息"}
          </Button>
        </div>
      </form>
    </div>
  );
}
