import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { phoneLoginThunk } from "../../redux/auth/authThunk";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({ name: "", phone_number: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(phoneLoginThunk(formData));

    if (phoneLoginThunk.fulfilled.match(result)) {
      navigate("/");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-white">
      <form onSubmit={handleSubmit} className="grid w-full max-w-md gap-4 rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl shadow-black/30">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-xl font-black">C</div>
        <div className="text-center">
          <h1 className="m-0 text-3xl font-bold">Login with phone</h1>
          <p className="mt-2 text-sm text-slate-400">Development mode: OTP skipped.</p>
        </div>
        {error && <p className="m-0 rounded-2xl bg-red-950/60 px-3 py-2.5 text-red-300">{error.detail || "Login failed"}</p>}
        <input
          className="w-full rounded-xl border border-slate-800 bg-slate-800 px-5 py-3 outline-none placeholder:text-slate-400 focus:border-blue-500"
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          className="w-full rounded-xl border border-slate-800 bg-slate-800 px-5 py-3 outline-none placeholder:text-slate-400 focus:border-blue-500"
          type="tel"
          name="phone_number"
          placeholder="Phone number"
          value={formData.phone_number}
          onChange={handleChange}
          required
        />
        <button type="submit" disabled={loading} className="cursor-pointer rounded-xl bg-blue-600 px-4 py-3 font-bold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-65">
          {loading ? "Continuing..." : "Continue"}
        </button>
        <p className="text-center text-slate-400">
          New user? <Link to="/register" className="font-bold text-blue-400 no-underline">Create account</Link>
        </p>
      </form>
    </div>
  );
}
