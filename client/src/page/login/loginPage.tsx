import React, { useState } from "react";
import { z } from "zod";

// Define the login schema using Zod
const loginSchema = z.object({
  username: z.string(),
  password: z.string().min(8).max(255),
});

// Define the Login component
export default function Login() {
  // Define state variables for form data and form error
  const [formData, setFormData] = useState<LoginForm>({
    username: "",
    password: "",
  });
  const [isFormError, setIsFormError] = useState<boolean>(false);

  // Handle form submission
  const onSubmit = () => {
    // Validate form data against the login schema
    const validation = loginSchema.safeParse(formData);

    if (!validation.success) {
      // If validation fails, set form error flag
      setIsFormError(true);
    } else {
      // If validation succeeds, proceed with sign-in
      // Here you would typically call your authentication API
      // For demonstration, I'm just logging success
      console.log("Sign-in successful");
    }
  };

  // Handle input change for username field
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, username: e.target.value });
  };

  // Handle input change for password field
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, password: e.target.value });
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-12 bg-white gap-8">
      <div className="w-full flex flex-col items-start justify-start gap-2">
        <label className="font-bold">Username</label>
        <input
          className="w-full mb-1 rounded-full py-1.5 px-3 border border-gray-100 text-sm placeholder:text-sm"
          placeholder="Enter username"
          value={formData.username}
          onChange={handleUsernameChange}
        />
        <label className="font-bold">Password</label>
        <input
          className="w-full rounded-full py-1.5 px-3 border border-gray-100 placeholder:text-sm"
          placeholder="Enter password"
          type="password"
          value={formData.password}
          onChange={handlePasswordChange}
        />
      </div>
      {isFormError ? (
        <p className="text-red-400">Invalid username or password</p>
      ) : (
        <></>
      )}
      <button
        onClick={onSubmit}
        className="rounded-full py-1.5 px-6 bg-[#006664] text-white text-sm"
      >
        Sign In
      </button>
    </main>
  );
}

// Define LoginForm type
type LoginForm = {
  username: string;
  password: string;
};
