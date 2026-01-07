import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function Hotelbyid() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchHotel = async () => {
            try {
                const res = await fetch(
                    `https://hotel-banquet.nearprop.in/api/hotels/${id}`
                );

                if (!res.ok) {
                    throw new Error(`HTTP error ${res.status}`);
                }

                const result = await res.json();

                if (result.success) {
                    setData(result.data);
                    document.title = `${result.data.name} - Hotel Details`;
                } else {
                    throw new Error(result.message || "Failed to fetch hotel");
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchHotel();
    }, [id]);

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center text-lg">
                Loading hotel details...
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-screen flex items-center justify-center text-red-500">
                Error: {error}
            </div>
        );
    }

    if (!data) {
        return (
            <div className="h-screen flex items-center justify-center">
                No hotel data found
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 relative">
            {/* Back Button */}
            <button
                onClick={() => navigate(-1)}
                className="fixed top-5 left-5 z-50 bg-blue-500 text-white px-4 py-2 rounded shadow"
            >
                ← Back
            </button>

            <div className="max-w-6xl mx-auto p-5 pt-20 space-y-8">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-10 rounded-xl text-center">
                    <h1 className="text-4xl font-bold">Hotel Name : {data.name}</h1>
                    <p className="mt-3 opacity-90"> Description : {data.description}</p>

                    <div className="flex justify-center gap-6 mt-5 flex-wrap">
                        <span>
                            ⭐ {data.averageRating ?? 0} / 5 ({data.reviewCount ?? 0} reviews)
                        </span>
                        <span
                            className={data.isAvailable ? "text-green-300" : "text-red-300"}
                        >
                            {data.isAvailable ? "Available" : "Not Available"}
                        </span>
                        <span>Status: {data.status}</span>
                    </div>
                </div>

                {/* Location */}
                <div className="bg-white p-6 rounded-xl shadow">
                    <h2 className="text-2xl font-semibold mb-4">Location Details</h2>
                    <p><strong>Address:</strong> {data.address}</p>
                    <p><strong>City:</strong> {data.city}</p>
                    <p><strong>District:</strong> {data.district}</p>
                    <p><strong>State:</strong> {data.state}</p>
                    <p><strong>Pincode:</strong> {data.pincode}</p>
                    {data.location?.coordinates && (
                        <p>
                            <strong>Coordinates:</strong>{" "}
                            {data.location.coordinates[1]}° N,{" "}
                            {data.location.coordinates[0]}° E
                        </p>
                    )}
                </div>

                {/* Contact & Business */}
                <div className="bg-white p-6 rounded-xl shadow grid md:grid-cols-2 gap-4">
                    <div><strong>Phone:</strong> {data.contactNumber}</div>
                    <div><strong>Alternate:</strong> {data.alternateContact || "N/A"}</div>
                    <div><strong>Email:</strong> {data.email}</div>
                    <div><strong>Website:</strong> {data.website || "N/A"}</div>
                    <div><strong>GST:</strong> {data.gst || "N/A"}</div>
                    <div><strong>Registration:</strong> {data.registrationNumber}</div>
                    <div><strong>Hotel Type:</strong> {data.hotelType}</div>
                    <div>
                        <strong>Avg Room Price:</strong>{" "}
                        {data.averageRoomPrice ? `₹${data.averageRoomPrice}` : "N/A"}
                    </div>
                </div>

                {/* Amenities */}
                {data.amenities?.length > 0 && (
                    <div className="bg-white p-6 rounded-xl shadow">
                        <h2 className="text-2xl font-semibold mb-4">Amenities</h2>
                        <div className="flex flex-wrap gap-3">
                            {data.amenities.map((item, index) => (
                                <span
                                    key={index}
                                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                                >
                                    {item}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Rooms */}
                <div className="bg-white p-6 rounded-xl shadow">
                    <h2 className="text-2xl font-semibold mb-4">Rooms</h2>
                    {data.rooms?.length > 0 ? (
                        <ul className="space-y-3">
                            {data.rooms.map((room, index) => (
                                <li key={index} className="bg-gray-50 p-4 rounded">
                                    <strong>{room.name || `Room ${index + 1}`}</strong>
                                    <p className="text-sm text-gray-600">
                                        {room.description || "No description"}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-600">No rooms listed</p>
                    )}
                </div>

                {/* Images */}
                {data.images?.length > 0 && (
                    <div className="bg-white p-6 rounded-xl shadow">
                        <h2 className="text-2xl font-semibold mb-4">Gallery</h2>
                        <div className="grid md:grid-cols-3 gap-4">
                            {data.images.map((img, index) => (
                                <img
                                    key={index}
                                    src={img}
                                    alt="Hotel"
                                    className="w-full h-48 object-cover rounded"
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Owner Info (SAFE) */}
                <div className="bg-blue-50 p-6 rounded-xl shadow">
                    <h2 className="text-2xl font-semibold mb-4">Owner Information</h2>
                    {data.userId ? (
                        <div className="grid md:grid-cols-2 gap-3 text-sm">
                            <div><strong>Name:</strong> {data.userId.name}</div>
                            <div><strong>Email:</strong> {data.userId.email}</div>
                            <div><strong>Mobile:</strong> {data.userId.mobile}</div>
                            <div className="md:col-span-2">
                                <strong>Address:</strong>{" "}
                                {data.userId.address?.street},{" "}
                                {data.userId.address?.city},{" "}
                                {data.userId.address?.state}
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-600">Owner details not available</p>
                    )}
                </div>

                {/* Meta */}
                <div className="bg-white p-6 rounded-xl shadow text-sm text-gray-600">
                    <p><strong>Status:</strong> {data.status}</p>
                    <p><strong>Verification:</strong> {data.verificationStatus}</p>
                    <p><strong>Extra Reels:</strong> {data.extraReels}</p>
                    <p><strong>Created:</strong> {new Date(data.createdAt).toLocaleDateString()}</p>
                    <p><strong>Updated:</strong> {new Date(data.updatedAt).toLocaleDateString()}</p>
                </div>
            </div>
        </div>
    );
}

export default Hotelbyid;
