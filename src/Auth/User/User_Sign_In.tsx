import React, { useState, useEffect } from "react";
import docuhealth_logo from "../../assets/img/docuhealth_logo.png";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import dashb from "../../assets/img/dashb.png";
import AuthRightSide from "../AuthRightSide";
import { Link, useNavigate } from "react-router-dom";
import { login, setToken } from "../../services/authService";
import toast from "react-hot-toast";
import Input from "../../Components/ui/Input";
import Button from "../../Components/ui/Button";

const USI = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [phone_num, setPhone_Num] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    setInputValue(value);

    if (/^\d+$/.test(value)) {
      // If the value is a valid number
      setPhone_Num(value);
      setEmail("");
    } else if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      // If the value is a valid email
      const lowercasedEmail = value.toLowerCase();
      setEmail(lowercasedEmail);
      setPhone_Num("");
    } else {
      // Reset if neither
      setEmail("");
      setPhone_Num("");
    }
  };

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (showToast) {
      timer = setTimeout(() => {
        toast.success(
          "Kindly exercise patience, while you are being logged in!",
        );
        setShowToast(false); // Reset state after toast is shown
      }, 5000);
    }

    return () => clearTimeout(timer); // Cleanup timeout on unmount
  }, [showToast]);

  const isFormValid =
    (email.trim() !== "" || phone_num.trim() !== "") &&
    password.trim().length >= 1;

  const handleSubmit = async (e: React.SyntheticEvent) => {
    setIsSubmitting(true);
    setShowToast(true);
    e.preventDefault();
    if (isFormValid) {
      // console.log("Form Submitted");
      const userData = {
        ...(email ? { email } : { phone_num }),
        password,
      };

      try {
        const data = await login(userData);

        setToken(data.data.access_token, data.data.role);

        // toast.success("Login successful");

        if (data.data.role === "patient") {
          toast.success("Login successful");

          setTimeout(() => {
            window.location.href = "/user-home-dashboard";
          }, 1000);
        } else {
          toast.error("Invalid credentials for login");
        }
        setIsSubmitting(false);
        setEmail("");
        setPhone_Num("");
        setPassword("");
      } catch (error: any) {
        console.log(error);
        toast.error(
          error.response.data.detail || "Login failed. Please try again.",
        );

        setIsSubmitting(false);

        // Check if HIN exists in the response
        const patientHin = error.response?.data?.hin;
        if (patientHin) {
          setTimeout(() => {
            // Navigate to NIN verification page and pass the HIN
            navigate("/verify-nin", { state: { patient_hin: patientHin } });
          }, 1000);
        }
      } finally {
        setEmail("");
        setPhone_Num("");
        setInputValue("");
        setPassword("");
        setShowToast(false);
      }
    } else {
      toast.error("Please ensure all fields are correct.");
    }
  };
  return (
    <>
      <div className="hidden h-screen sm:flex">
        {/* Left Side */}
        <div className="  w-full flex-1">
          <div className=" hidden sm:flex justify-center items-center py-10 h-screen ">
            <Link to="/">
              <div className=" fixed top-10 left-10  flex gap-1 items-center font-semibold text-docuhealth-primary">
                <img src={docuhealth_logo} alt="Logo" className="w-6" />
                <h1 className="text-xl">DocuHealth</h1>
              </div>
            </Link>
            <div className="w-full ">
              <div className="px-10 w-full">
                <h2 className="text-xl font-semibold pb-1">
                  Sign Into My DocuHealth Account
                </h2>
                <p className="text-gray-600 mb-6 text-sm">
                  Input your correct log-in credentials to get access into your
                  dashboard
                </p>

                <form onSubmit={handleSubmit} className="text-sm">
                  {/* Email Input */}
                  <div className="pb-3">
                    <Input
                      label="Email :"
                      type="text"
                      value={inputValue}
                      onChange={handleInputChange}
                      onInput={handleInputChange}
                      autoComplete="email"
                      required
                      leadingIcon={<FaEnvelope />}
                    />
                  </div>

                  {/* Password Input */}
                  <div className="pb-5">
                    <Input
                      label="Password:"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onInput={(e) => setPassword((e.target as HTMLInputElement).value)}
                      autoComplete="current-password"
                      required
                      leadingIcon={<FaLock />}
                      trailingIcon={showPassword ? <FaEyeSlash /> : <FaEye />}
                      onTrailingIconClick={() => setShowPassword(!showPassword)}
                    />
                  </div>

                  {/* Remember Me Checkbox */}
                  <div className="flex justify-between items-center pb-5">
                    <div id="checkbox">
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        Remember me
                      </label>
                    </div>
                    <div>
                      <Link
                        to="/user-forgot-password"
                        className="underline text-docuhealth-primary"
                      >
                        Forgot Password
                      </Link>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    fullWidth
                    loading={isSubmitting}
                    loadingText="Logging In..."
                    disabled={!isFormValid}
                    onClick={handleSubmit}
                  >
                    Next
                  </Button>
                </form>

                {/* Sign-Up Prompt */}
                <p className="text-center text-sm text-gray-600 mt-4">
                  Haven't Registered Yet?{" "}
                  <Link
                    to="/user-create-account"
                    className="text-docuhealth-primary hover:underline"
                  >
                    Sign Up
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>

        <AuthRightSide />
      </div>

      <div className="h-screen flex flex-col justify-center items-center sm:hidden py-10">
        <Link to="/">
          <div className=" fixed top-10 left-5  flex gap-1 items-center font-semibold text-docuhealth-primary">
            <img src={docuhealth_logo} alt="Logo" className="w-6" />
            <h1 className="text-xl">DocuHealth</h1>
          </div>
        </Link>

        <div className="px-5 w-full">
          <h2 className="text-xl font-semibold pb-1">Sign Into My DocuHealth Account</h2>
          <p className="text-gray-600 mb-6 text-sm">
            Input your correct log-in credentials to get access into your
            dashboard
          </p>

          <form onSubmit={handleSubmit} className="text-sm">
            {/* Email Input */}
            <div className="pb-3">
              <Input
                label="Email :"
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                required
                leadingIcon={<FaEnvelope />}
              />
            </div>

            {/* Password Input */}
            <div className="pb-5">
              <Input
                label="Password:"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                leadingIcon={<FaLock />}
                trailingIcon={showPassword ? <FaEyeSlash /> : <FaEye />}
                onTrailingIconClick={() => setShowPassword(!showPassword)}
              />
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex justify-between items-center pb-5">
              <div id="checkbox">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  Remember me
                </label>
              </div>
              <div>
                <Link
                  to="/user-forgot-password"
                  className="underline text-docuhealth-primary"
                >
                  Forgot Password
                </Link>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              fullWidth
              loading={isSubmitting}
              loadingText="Logging In..."
              disabled={!isFormValid}
              onClick={handleSubmit}
            >
              Next
            </Button>
          </form>

          {/* Sign-Up Prompt */}
          <p className="text-center text-sm text-gray-600 mt-4">
            Haven't Registered Yet?{" "}
            <Link
              to="/user-create-account"
              className="text-docuhealth-primary hover:underline"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default USI;
