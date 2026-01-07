import React, { useEffect, useState } from "react";
import { toastSuccess, toastWarning } from "../../utils/toast";

const API_BASE = "https://api.nearprop.com";

const rolesList = [
    "ADMIN",
    "USER",
    "SELLER",
    "DEVELOPER",
    "ADVISOR",
    "FRANCHISEE",
];

export default function Adminnotifications() {
    const token = localStorage.getItem("token");

    /* ---------------- FORM STATES ---------------- */
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [image, setImage] = useState(null);
    const [sendTo, setSendTo] = useState("ALL");
    const [roles, setRoles] = useState([]);
    const [userIds, setUserIds] = useState("");

    /* ---------------- LOCATION DATA ---------------- */
    const [allDistricts, setAllDistricts] = useState([]); // full API data
    const [states, setStates] = useState([]);             // unique states
    const [districts, setDistricts] = useState([]);       // filtered districts

    const [state, setState] = useState("");
    const [districtId, setDistrictId] = useState("");

    /* ---------------- FETCH ALL DISTRICTS ONCE ---------------- */
    useEffect(() => {
        fetch(`${API_BASE}/api/property-districts`)
            .then(res => res.json())
            .then(res => {
                const data = Array.isArray(res?.data) ? res.data : [];

                setAllDistricts(data);

                // unique states निकालना
                const uniqueStates = [...new Set(data.map(d => d.state))];
                setStates(uniqueStates);
            })
            .catch(err => {
                console.error("District API error:", err);
                setAllDistricts([]);
                setStates([]);
            });
    }, []);

    /* ---------------- FILTER DISTRICTS BY STATE ---------------- */
    useEffect(() => {
        if (!state) {
            setDistricts([]);
            setDistrictId("");
            return;
        }

        const filtered = allDistricts.filter(
            d => d.state === state
        );

        setDistricts(filtered);
        setDistrictId("");
    }, [state, allDistricts]);

    /* ---------------- SUBMIT ---------------- */
    const handleSubmit = async () => {
        const formData = new FormData();

        if (image) {
            formData.append("image", image);
        }

        formData.append("title", title);
        formData.append("body", body);
        formData.append("sendTo", sendTo);

        // roles (multiple)
        roles.forEach(r => formData.append("roles", r));

        // state & district
        if (state) formData.append("state", state);
        if (districtId) formData.append("districtId", districtId);

        // users
        userIds
            .split(",")
            .map(id => id.trim())
            .filter(Boolean)
            .forEach(id => formData.append("userIds", id));

        try {
            const res = await fetch(
                `${API_BASE}/api/v1/admin/notifications`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: formData,
                }
            );

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed");

            toastSuccess("✅ Notification sent successfully");

            // reset
            setTitle("");
            setBody("");
            setImage(null);
            setRoles([]);
            setState("");
            setDistrictId("");
            setUserIds("");
            setSendTo("ALL");
        } catch (err) {
           toastWarning("Failed to send notificaiton , Please try again some time")
        }
    };

    /* ---------------- UI ---------------- */
    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow border">
                <div className="px-6 py-4 border-b flex justify-between items-center">
                    <h2 className="text-lg font-bold">📢 Admin Notification</h2>
                </div>

                <div className="p-6 g-4  space-y-5">
                    {/* Title */}
                    <input
                        className="w-full border rounded-lg px-3 py-2"
                        placeholder="Title"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                    />
                    <br />

                    {/* Body */}
                    <textarea
                        className="w-full border rounded-lg px-3 mt-4 py-2"
                        rows={4}
                        placeholder="Message"
                        value={body}
                        onChange={e => setBody(e.target.value)}
                    />

                    {/* Image */}
                    <input
                        type="file"
                        accept="image/*"
                        onChange={e => setImage(e.target.files[0])}
                    />

                    {/* Send To */}
                    {/* <select
                        className="w-full border rounded-lg px-3 py-2"
                        value={sendTo}
                        onChange={e => setSendTo(e.target.value)}
                    >
                        <option value="ALL">ALL</option>
                        <option value="ROLE">ROLE</option>
                        <option value="STATE">STATE</option>
                        <option value="DISTRICT">DISTRICT</option>
                        <option value="USERS">USERS</option>
                    </select>
                    <br /> */}
                    {/* Roles */}
                    {/* <div className="flex flex-wrap gap-2">
                        {rolesList.map(r => (
                            <button
                                key={r}
                                type="button"
                                onClick={() =>
                                    setRoles(prev =>
                                        prev.includes(r)
                                            ? prev.filter(x => x !== r)
                                            : [...prev, r]
                                    )
                                }
                                className={`px-3 py-1 rounded-full border text-sm ${roles.includes(r)
                                    ? "bg-orange-500 text-white"
                                    : "bg-gray-50"
                                    }`}
                            >
                                {r}
                            </button>
                        ))}
                    </div> */}

                    {/* State */}
                    {/* <select
                        className="w-full border rounded-lg px-3 py-2"
                        value={state}
                        onChange={e => setState(e.target.value)}
                    >
                        <option value="">Select State</option>
                        {states.map(s => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select> */}

                    {/* District */}
                    {/* <select
                        className="w-full border rounded-lg px-3 py-2"
                        value={districtId}
                        onChange={e => setDistrictId(e.target.value)}
                        disabled={!state}
                    >
                        <option value="">Select District</option>
                        {districts.map(d => (
                            <option key={d.id} value={d.id}>
                                {d.name} ({d.city})
                            </option>
                        ))}
                    </select> */}

                    {/* Users */}
                    {/* <input
                        className="w-full border rounded-lg px-3 py-2"
                        placeholder="User IDs (1,2,3)"
                        value={userIds}
                        onChange={e => setUserIds(e.target.value)}
                    /> */}
                    <br />
                    <button
                        onClick={handleSubmit}
                        className="w-full bg-orange-500 text-white py-2 rounded-lg font-semibold"
                    >
                        🚀 Send Notification
                    </button>
                </div>
            </div>
        </div>
    );
}
