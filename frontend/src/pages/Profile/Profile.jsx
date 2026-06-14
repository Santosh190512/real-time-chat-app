import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, LogOut, Save } from "lucide-react";

import { logout } from "../../redux/auth/authSlice";
import { profileThunk, updateProfileThunk } from "../../redux/auth/authThunk";

export default function Profile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading, error } = useSelector((state) => state.auth);
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [bio, setBio] = useState("");
  const [image, setImage] = useState(null);
  const [saved, setSaved] = useState(false);

  const getErrorMessage = () => {
    if (!error) return null;
    if (typeof error === "string") return error;
    if (error.detail) return error.detail;

    const flattenError = (value) => {
      if (!value) return null;
      if (typeof value === "string") return value;
      if (Array.isArray(value)) return flattenError(value[0]);
      if (typeof value === "object") {
        const [key, nestedValue] = Object.entries(value)[0] || [];
        const nestedMessage = flattenError(nestedValue);
        return key && nestedMessage ? `${key}: ${nestedMessage}` : nestedMessage;
      }
      return null;
    };

    const firstValue = Object.values(error)[0];
    if (Array.isArray(firstValue)) return firstValue[0];
    if (typeof firstValue === "string") return firstValue;
    return flattenError(error) || "Profile update failed. Please check backend migration and server logs.";
  };

  useEffect(() => {
    dispatch(profileThunk());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      setName(user.name || user.username || "");
      setPhoneNumber(user.phone_number || "");
      setBio(user.bio || "");
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaved(false);
    let data = {
      name,
      phone_number: phoneNumber,
      bio,
    };

    if (image) {
      data = new FormData();
      data.append("name", name);
      data.append("phone_number", phoneNumber);
      data.append("bio", bio);
      data.append("profile_picture", image);
    }

    const result = await dispatch(updateProfileThunk(data));
    if (updateProfileThunk.fulfilled.match(result)) {
      setSaved(true);
      setImage(null);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-4">
        <Link to="/" className="rounded-full p-2 text-slate-300 no-underline hover:bg-slate-800 hover:text-white">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="m-0 text-lg font-semibold">Edit Profile</h1>
        <button type="button" onClick={handleLogout} className="rounded-full border-0 bg-transparent p-2 text-red-400 hover:bg-slate-800">
          <LogOut className="h-5 w-5" />
        </button>
      </header>

      <main className="mx-auto grid max-w-md gap-6 px-4 py-8">
        <div className="grid justify-items-center gap-3">
          {user?.profile_picture ? (
            <img src={user.profile_picture} alt="" className="h-28 w-28 rounded-full object-cover" />
          ) : (
            <div className="flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 text-4xl font-bold">
              {(name || "U")[0]?.toUpperCase()}
            </div>
          )}
          <label className="cursor-pointer rounded-xl bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-700">
            Change Photo
            <input type="file" accept="image/*" className="hidden" onChange={(e) => setImage(e.target.files[0])} />
          </label>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4 rounded-3xl border border-slate-800 bg-slate-900 p-5">
          {error && <p className="m-0 rounded-xl bg-red-950/60 px-3 py-2 text-sm text-red-300">{getErrorMessage()}</p>}
          {saved && <p className="m-0 rounded-xl bg-emerald-950/60 px-3 py-2 text-sm text-emerald-300">Profile saved successfully.</p>}

          <label className="grid gap-2 text-sm font-semibold text-slate-300">
            Name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-xl border border-slate-800 bg-slate-800 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
              placeholder="Your name"
            />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-slate-300">
            Phone Number
            <input
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
              className="rounded-xl border border-slate-800 bg-slate-800 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
              placeholder="Phone number"
            />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-slate-300">
            Bio
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows="4"
              className="resize-none rounded-xl border border-slate-800 bg-slate-800 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
              placeholder="About you"
            />
          </label>

          <button type="submit" disabled={loading} className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-70">
            <Save className="h-5 w-5" />
            {loading ? "Saving..." : "Save Profile"}
          </button>
        </form>
      </main>
    </div>
  );
}
