import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Subadminprofile = () => {
  const navigate = useNavigate();

  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("subAdminToken");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const [form, setForm] = useState({
    name: "",
    phoneNumber: "",
  });

  /* ================= FETCH PROFILE ================= */
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(
          "https://api.nearprop.com/api/v1/users/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const result = await res.json();

        if (result.success) {
          setProfile(result.data);
          setForm({
            name: result.data.name || "",
            phoneNumber: result.data.phoneNumber || "",
          });
        }
      } catch (error) {
        console.error("Profile fetch failed", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  /* ================= UPDATE PROFILE ================= */
  const handleUpdate = async () => {
    setSaving(true);

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("phoneNumber", form.phoneNumber);

      if (imageFile) {
        formData.append("profileImage", imageFile);
      }

      const res = await fetch(
        "https://api.nearprop.com/api/v1/users/profile-update",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const result = await res.json();

      if (result.success) {
        alert("Profile updated successfully");
        setProfile(result.data);
        setImageFile(null);
      } else {
        alert(result.message || "Update failed");
      }
    } catch (error) {
      console.error("Update error", error);
      alert("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-gray-600">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-sm text-indigo-600 hover:underline"
      >
        ← Back
      </button>

      <div className="max-w-xl mx-auto bg-white rounded-xl shadow-md p-6">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-6">
          {/* Avatar */}
          <div className="p-[3px] rounded-full bg-gradient-to-r from-purple-500 to-indigo-600">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-white">
              <img
                src={
                  imageFile
                    ? URL.createObjectURL(imageFile)
                    : profile?.profileImageUrl ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        profile?.name
                      )}`
                }
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <h2 className="mt-4 text-xl font-semibold">
            {profile?.name}
          </h2>
          <p className="text-sm text-gray-500">{profile?.email}</p>

          {/* Roles */}
          <div className="flex gap-2 mt-2 flex-wrap justify-center">
            {profile?.roles?.map((role) => (
              <span
                key={role}
                className="px-3 py-1 text-xs rounded-full bg-indigo-100 text-indigo-700"
              >
                {role}
              </span>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="text-sm text-gray-600">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
              className="w-full mt-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Email (readonly) */}
          <div>
            <label className="text-sm text-gray-600">Email</label>
            <input
              type="email"
              value={profile?.email}
              disabled
              className="w-full mt-1 px-3 py-2 border rounded-md bg-gray-100"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="text-sm text-gray-600">Phone Number</label>
            <input
              type="text"
              value={form.phoneNumber}
              onChange={(e) =>
                setForm({
                  ...form,
                  phoneNumber: e.target.value,
                })
              }
              className="w-full mt-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="text-sm text-gray-600">
              Profile Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setImageFile(e.target.files[0])
              }
              className="w-full mt-1 text-sm"
            />
          </div>
        </div>

        {/* Action */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleUpdate}
            disabled={saving}
            className="px-5 py-2 text-sm rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:opacity-90 transition disabled:opacity-50"
          >
            {saving ? "Updating..." : "Update Profile"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Subadminprofile;
