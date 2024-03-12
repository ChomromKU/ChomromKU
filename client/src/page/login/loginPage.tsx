import React, { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { z } from "zod";
import close from "../../images/close.svg";
import logo from "../../images/logo.svg"

const loginSchema = z.object({
  username: z.string(),
  password: z.string().min(8).max(255),
});

export default function LoginPage() {
  const { login } = useAuth();
  const [formData, setFormData] = useState<LoginForm>({
    username: "",
    password: "",
  });
  const [isFormError, setIsFormError] = useState<boolean>(false);

  const onSubmit = () => {
    const validation = loginSchema.safeParse(formData);

    if (!validation.success) {
      setIsFormError(true);
    } else {
      const { username, password } = formData;
      if(username === "username" && password === "password") {
        login({ id: 1, stdId: "test_id", stdCode: "test_code", titleTh: "-", titleEn: "-", firstNameTh:"test_name", lastNameTh:"-", firstNameEn:"test name", lastNameEn:"-", campusNameTh:"-", campusNameEn:"-"});
        console.log(formData);
      } else {
        setIsFormError(true);
      }
    }
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, username: e.target.value });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, password: e.target.value });
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-12 bg-white gap-8">
      <div>
        <a href={"/"}>
          <img
              className="absolute top-0 right-0 mr-6 mt-[80px]"
              src={close}
              alt={"close"}
              height={16}
              width={16}
          />
        </a>
        <div className="min-h-[50%] min-w-[50%]">
            <img alt="chomromku" src={logo} className="w-[200px] h-auto" />
        </div>
      </div>
      <div className="w-full flex flex-col items-start justify-start gap-2">
        <label className="font-bold">บัญชีผู้ใช้เครือข่ายนนทรี</label>
        <input
          className="w-full mb-1 rounded-full py-1.5 px-3 border border-gray-100 text-sm placeholder:text-sm"
          placeholder="เช่น b63xxxxxxxx หรือ regxxx"
          value={formData.username}
          onChange={handleUsernameChange}
        />
        <label className="font-bold">รหัสผ่าน</label>
        <input
          className="w-full rounded-full py-1.5 px-3 border border-gray-100 placeholder:text-sm"
          placeholder="รหัสผ่านบัญชีผู้ใช้เครือข่ายนนทรี"
          type="password"
          value={formData.password}
          onChange={handlePasswordChange}
        />
      </div>
      {isFormError ? (
        <p className="text-red-400">บัญชีผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง</p>
      ) : (
        <></>
      )}
      <button
        onClick={onSubmit}
        className="rounded-full py-1.5 px-6 bg-[#006664] text-white text-sm"
      >
        เข้าสู่ระบบ
      </button>
    </main>
  );
}

type LoginForm = Record<"username" | "password", string>;
