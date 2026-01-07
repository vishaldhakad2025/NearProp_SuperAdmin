import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function Banquetbyid() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBanquet = async () => {
            try {
                const res = await fetch(
                    `https://hotel-banquet.nearprop.in/api/banquet-halls/${id}`
                );

                if (!res.ok) {
                    throw new Error(`HTTP Error: ${res.status}`);
                }

                const result = await res.json();

                if (result.success) {
                    setData(result.data);
                } else {
                    throw new Error(result.message || "Failed to fetch data");
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchBanquet();
    }, [id]);

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center text-lg">
                Loading banquet hall details...
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
                No data found
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-5">
            {/* Back Button */}
            <button
                onClick={() => navigate(-1)}
                className="fixed top-5 left-5 bg-blue-500 text-white px-4 py-2 rounded shadow"
            >
                ← Back
            </button>

            <div className="max-w-6xl mx-auto pt-16 space-y-8">
                {/* Header */}
                <div className="bg-indigo-600 text-white p-8 rounded-xl text-center">
                    <h1 className="text-4xl font-bold">{data.name}</h1>
                    <p className="mt-3">{data.description}</p>

                    <div className="flex justify-center gap-6 mt-4 flex-wrap">
                        <span>⭐ {data.rating?.averageRating} / 5</span>
                        <span>
                            Reviews: {data.rating?.totalReviews}
                        </span>
                        <span
                            className={
                                data.isAvailable ? "text-green-300" : "text-red-300"
                            }
                        >
                            {data.isAvailable ? "Available" : "Not Available"}
                        </span>
                        <span>Status: {data.verificationStatus}</span>
                    </div>
                </div>

                {/* Location */}
                <div className="bg-white p-6 rounded-xl shadow">
                    <h2 className="text-2xl font-semibold mb-3">Location Details</h2>
                    <p><strong>Address:</strong> {data.address}</p>
                    <p><strong>City:</strong> {data.city}</p>
                    <p><strong>District:</strong> {data.district}</p>
                    <p><strong>State:</strong> {data.state}</p>
                    <p><strong>Pincode:</strong> {data.pincode}</p>
                    <p>
                        <strong>Coordinates:</strong> {data.latitude}, {data.longitude}
                    </p>
                </div>

                {/* Contact & Business */}
                <div className="bg-white p-6 rounded-xl shadow grid md:grid-cols-2 gap-4">
                    <div><strong>Contact:</strong> {data.contactNumber}</div>
                    <div><strong>Alternate:</strong> {data.alternateContact}</div>
                    <div><strong>Email:</strong> {data.email}</div>
                    <div><strong>Website:</strong> {data.website}</div>
                    <div><strong>GST:</strong> {data.gstNumber}</div>
                    <div><strong>Registration:</strong> {data.registrationNumber}</div>
                    <div><strong>Hall Type:</strong> {data.hallType}</div>
                    <div><strong>Parking:</strong> {data.parkingCapacity}</div>
                    <div><strong>Price Per Plate:</strong> ₹{data.pricePerPlate}</div>
                </div>

                {/* Amenities */}
                {data.amenities?.length > 0 && (
                    <div className="bg-white p-6 rounded-xl shadow">
                        <h2 className="text-2xl font-semibold mb-4">Amenities</h2>
                        <div className="flex flex-wrap gap-3">
                            {data.amenities.map((item, index) => (
                                <span
                                    key={index}
                                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full"
                                >
                                    {item}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Events */}
                {data.events?.length > 0 && (
                    <div className="bg-white p-6 rounded-xl shadow">
                        <h2 className="text-2xl font-semibold mb-4">Supported Events</h2>
                        <ul className="space-y-2">
                            {data.events.map((event, index) => (
                                <li key={index} className="bg-gray-50 p-3 rounded">
                                    {event.eventType}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Seasonal Pricing */}
                {data.seasonalPrice && (
                    <div className="bg-white p-6 rounded-xl shadow">
                        <h2 className="text-2xl font-semibold mb-4">Seasonal Pricing</h2>
                        <p><strong>Wedding:</strong> ₹{data.seasonalPrice.wedding}</p>
                        <p><strong>Festival:</strong> ₹{data.seasonalPrice.festival}</p>
                    </div>
                )}

                {/* Images */}
                {data.images?.length > 0 && (
                    <div className="bg-white p-6 rounded-xl shadow">
                        <h2 className="text-2xl font-semibold mb-4">Gallery</h2>
                        <div className="grid md:grid-cols-3 gap-4">
                            {data.images.map((img, index) => (
                                <img
                                    key={index}
                                    src={img}
                                    alt="Banquet"
                                    className="rounded h-48 w-full object-cover"
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Meta */}
                <div className="bg-white p-6 rounded-xl shadow text-sm text-gray-600">
                    <p><strong>Status:</strong> {data.status}</p>
                    <p><strong>Created:</strong> {new Date(data.createdAt).toLocaleDateString()}</p>
                    <p><strong>Updated:</strong> {new Date(data.updatedAt).toLocaleDateString()}</p>
                </div>
            </div>
        </div>
    );
}

export default Banquetbyid;
