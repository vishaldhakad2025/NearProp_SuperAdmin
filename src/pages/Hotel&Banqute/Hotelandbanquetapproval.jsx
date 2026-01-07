import React, { useState, useEffect } from 'react';
import { toastSuccess, toastWarning } from '../../utils/toast';
import { useNavigate } from 'react-router-dom';

function HotelAndBanquetApproval() {
    const [activeTab, setActiveTab] = useState('banquets'); // 'hotels' or 'banquets'
    const [pendingHotels, setPendingHotels] = useState([]);
    const [pendingBanquets, setPendingBanquets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [confirmBox, setConfirmBox] = useState({
        open: false,
        id: null,
        type: null
    });

    const navigate = useNavigate();
    // Reject Modal State
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [rejectReason, setRejectReason] = useState('');

    const API_BASE = 'https://hotel-banquet.nearprop.in';

    const TOKEN = localStorage.getItem("token");

    const fetchPendingData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [hotelRes, banquetRes] = await Promise.all([
                fetch(`${API_BASE}/api/hotels/pending/aprovels`),
                fetch(`${API_BASE}/api/banquet-halls/pending/aprovels`)
            ]);

            if (!hotelRes.ok) throw new Error('Failed to fetch hotels');
            if (!banquetRes.ok) throw new Error('Failed to fetch banquets');

            const hotelData = await hotelRes.json();
            const banquetData = await banquetRes.json();

            setPendingHotels(hotelData.data || []);
            setPendingBanquets(banquetData.data || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    const handleView = (id, type) => {
        if (type === "hotel") {
            navigate(`/api/hotels/${id}`);
        } else if (type === "banquet") {
            navigate(`/api/banquet-halls/${id}`);
        }
    };
    useEffect(() => {
        fetchPendingData();
    }, []);

    const getTypeFromTab = (tab) => tab === 'hotels' ? 'hotel' : 'banquet';

    const handleApprove = async (id, type) => {
        const endpoint =
            type === "hotel"
                ? `${API_BASE}/api/hotels/${id}/verify`
                : `${API_BASE}/api/banquet-halls/${id}/verify`;

        try {
            const response = await fetch(endpoint, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${TOKEN}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    verificationStatus: "verified",
                    rejectReason: "",
                }),
            });

            toastSuccess(` Approved successfully `)

            if (!response.ok) throw new Error(`Failed to approve ${type}`);
            fetchPendingData();
        } catch (err) {
            console.error(err);
        }
    };


    const handleReject = async () => {
        if (!rejectReason.trim()) {
            toastWarning('Please provide a reason for rejection');
            return;
        }

        const { id, type } = selectedItem;
        const endpoint = type === 'hotel'
            ? `${API_BASE}/api/hotels/${id}/verify`
            : `${API_BASE}/api/banquet-halls/${id}/verify`;

        try {
            const response = await fetch(endpoint, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${TOKEN}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    verificationStatus: 'rejected',
                    rejectReason: rejectReason
                }),

            });

            toastSuccess("Rejected successfully")
            if (!response.ok) throw new Error(`Failed to reject ${type}`);

            setShowRejectModal(false);
            setSelectedItem(null);
            setRejectReason('');
            fetchPendingData();
        } catch (err) {
            toastWarning("Failed to Approve , Please try agian.")
        }
    };

    const openRejectModal = (item, tab) => {
        const type = getTypeFromTab(tab);
        const idKey = type === 'hotel' ? 'hotelId' : 'banquetHallId';
        setSelectedItem({ id: item[idKey], name: item.name, type });
        setRejectReason('');
        setShowRejectModal(true);
    };

    if (loading) {
        return <div style={{ padding: '40px', textAlign: 'center', fontSize: '18px' }}>Loading pending approvals...</div>;
    }

    if (error) {
        return <div style={{ padding: '40px', color: 'red', textAlign: 'center' }}>Error: {error}</div>;
    }

    const data = activeTab === 'hotels' ? pendingHotels : pendingBanquets;
    const noDataMessage = activeTab === 'hotels' ? 'No pending hotels for approval.' : 'No pending banquet halls for approval.';

    return (
        <div style={{ padding: '30px', fontFamily: 'Arial, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
            <h1 className="text-center text-3xl sm:text-4xl font-extrabold mb-8 
               bg-gradient-to-r from-indigo-600 to-purple-600 
               bg-clip-text text-transparent">
                Admin Hotel & Banquets Approval Dashboard
            </h1>

            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '2px solid #eee', marginBottom: '30px' }}>
                <button
                    onClick={() => setActiveTab('banquets')}
                    style={{
                        padding: '12px 24px',
                        fontSize: '16px',
                        border: 'none',
                        background: activeTab === 'banquets' ? '#4CAF50' : '#f0f0f0',
                        color: activeTab === 'banquets' ? 'white' : '#333',
                        cursor: 'pointer',
                        borderRadius: '8px 8px 0 0',
                        marginRight: '10px'
                    }}
                >
                    Banquet Halls ({pendingBanquets.length})
                </button>
                <button
                    onClick={() => setActiveTab('hotels')}
                    style={{
                        padding: '12px 24px',
                        fontSize: '16px',
                        border: 'none',
                        background: activeTab === 'hotels' ? '#2196F3' : '#f0f0f0',
                        color: activeTab === 'hotels' ? 'white' : '#333',
                        cursor: 'pointer',
                        borderRadius: '8px 8px 0 0'
                    }}
                >
                    Hotels ({pendingHotels.length})
                </button>
            </div>

            {/* Table */}
            {data.length === 0 ? (
                <p style={{ textAlign: 'center', fontSize: '18px', color: '#666', padding: '50px' }}>
                    {noDataMessage}
                </p>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderRadius: '8px' }}>
                        <thead style={{ backgroundColor: '#f7f7f7' }}>
                            <tr>
                                <th style={thStyle}>Id</th>
                                <th style={thStyle}>Name</th>
                                <th style={thStyle}>City</th>
                                <th style={thStyle}>{activeTab === 'hotels' ? 'Star Rating' : 'Capacity'}</th>
                                <th style={thStyle}>Contact</th>
                                <th style={thStyle}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((item) => {
                                const id = activeTab === 'hotels' ? item.hotelId : item.banquetHallId;
                                const type = getTypeFromTab(activeTab);
                                return (
                                    <tr key={id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={tdStyle}>{item.hotelId || item.banquetHallId}</td>
                                        <td style={tdStyle}>{item.name}</td>
                                        <td style={tdStyle}>{item.city || item.location?.city || '-'}</td>
                                        <td style={tdStyle}>
                                            {activeTab === 'hotels'
                                                ? `${item.starRating || '-'} Star`
                                                : item.capacity || '-'}
                                        </td>
                                        <td style={tdStyle}>{item.contactNumber || item.phone || '-'}</td>
                                        <td style={tdStyle}>
                                            <button
                                                onClick={() => handleView(id, type)}
                                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 
             text-white rounded-lg text-sm font-medium"
                                            >
                                                View
                                            </button>

                                            <button
                                                onClick={() => setConfirmBox({ open: true, id, type })}
                                                className="px-4 py-2 bg-green-600 text-white  hover:bg-green-700 g-3 mr-3"
                                            >
                                                Approve
                                            </button>

                                            <button
                                                onClick={() => openRejectModal(item, activeTab)}
                                                style={{ ...actionBtn, backgroundColor: '#f44336' }}
                                            >
                                                Reject
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Reject Modal */}
            {showRejectModal && selectedItem && (
                <div style={modalOverlay}>
                    <div style={modalContent}>
                        <h2 style={{ marginTop: 0, color: '#333' }}>
                            Reject {selectedItem.type === 'hotel' ? 'Hotel' : 'Banquet Hall'}
                        </h2>
                        <p style={{ margin: '10px 0', color: '#555' }}>
                            <strong>{selectedItem.name}</strong> will be rejected.
                        </p>
                        <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
                            Reason for Rejection <span style={{ color: 'red' }}>*</span>
                        </label>
                        <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="Please explain why this listing is being rejected..."
                            style={{
                                width: '100%',
                                height: '120px',
                                padding: '12px',
                                borderRadius: '6px',
                                border: '1px solid #ccc',
                                fontSize: '14px',
                                resize: 'vertical'
                            }}
                        />
                        <div style={{ marginTop: '20px', textAlign: 'right' }}>
                            <button
                                onClick={() => {
                                    setShowRejectModal(false);
                                    setSelectedItem(null);
                                    setRejectReason('');
                                }}
                                style={{ ...modalBtn, backgroundColor: '#aaa' }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReject}
                                style={{ ...modalBtn, backgroundColor: '#f44336', marginLeft: '10px' }}
                            >
                                Confirm Reject
                            </button>
                        </div>
                    </div>
                </div>
            )}


            {confirmBox.open && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 w-[90%] max-w-sm shadow-xl">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                            Confirm Approval
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to approve this {confirmBox.type}?
                        </p>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setConfirmBox({ open: false })}
                                className="px-4 py-2  border-gray-300 hover:bg-gray-100"
                            >
                                No
                            </button>

                            <button
                                onClick={() => {
                                    handleApprove(confirmBox.id, confirmBox.type);
                                    setConfirmBox({ open: false });
                                }}
                                className="px-4 py-2  bg-green-600 text-white hover:bg-green-200"
                            >
                                Yes, Approve
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

// Styles
const thStyle = { padding: '14px', textAlign: 'left', borderBottom: '2px solid #ddd', fontWeight: 'bold' };
const tdStyle = { padding: '14px', textAlign: 'left', borderBottom: '1px solid #eee' };

const actionBtn = {
    padding: '8px 16px',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px'
};

const modalOverlay = {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
};

const modalContent = {
    background: 'white',
    padding: '30px',
    borderRadius: '12px',
    width: '90%',
    maxWidth: '500px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
};

const modalBtn = {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '6px',
    color: 'white',
    cursor: 'pointer',
    fontSize: '15px'
};

export default HotelAndBanquetApproval;