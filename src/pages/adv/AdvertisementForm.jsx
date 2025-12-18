import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify'; // Assuming you use react-toastify

const AdvertisementForm = ({ initialValues = {}, onSubmit, onCancel, districts = [] }) => {
  const [form, setForm] = useState(initialValues || {});

  useEffect(() => {
    setForm(initialValues || {});
  }, [initialValues]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    if (name === 'districtSelect') {
      const selected = districts.find((d) => d.id.toString() === value);
      if (selected) {
        setForm((prev) => ({
          ...prev,
          targetLocation: selected.name,
          targetDistrictIds: selected.id,
          districtId: selected.id,
          districtName: selected.name,
          radiusKm: 50,
        }));
      }
    } else if (type === 'file') {
      const file = files?.[0];
      if (file) {
        setForm((prev) => ({ ...prev, [name]: file }));
      }
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();

    Object.entries(form).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        // ✅ Fix 1: Handle banner image (file or existing URL)
        if (key === 'bannerImage' && val instanceof File) {
          formData.append('bannerImage', val);
        } else if (key === 'bannerImageUrl') {
          formData.append('bannerImageUrl', val);
        }

        // ✅ Fix 2: Handle video file
        else if (key === 'videoFile' && val instanceof File) {
          formData.append('videoFile', val);
        }

        // ✅ Fix 3: Handle datetime (backend expects ISO format)
        else if (key === 'validFrom' || key === 'validUntil') {
          formData.append(key, new Date(val).toISOString().slice(0, 16));
        }

        // ✅ Normal fields
        else {
          formData.append(key, val);
        }
      }
    });

    // ✅ Fix 4: Ensure required fields (like curl)
    if (!formData.get('radiusKm')) formData.append('radiusKm', '10.0');
    if (!formData.get('targetLocation') && form.districtName) {
      formData.append('targetLocation', form.districtName + ', Madhya Pradesh');
    }
    if (!formData.get('latitude')) formData.append('latitude', '22.7196');
    if (!formData.get('longitude')) formData.append('longitude', '75.8577');

    onSubmit(formData);
  };


  const minFrom = new Date().toISOString().slice(0, 16);
  const minUntil = form.validFrom ? new Date(form.validFrom).toISOString().slice(0, 16) : minFrom;

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-6 rounded shadow"
    >
      <div>
        <label className="block font-medium">Title *</label>
        <input
          name="title"
          value={form.title || ''}
          onChange={handleChange}
          required
          maxLength={100}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div className="md:col-span-2">
        <label className="block font-medium">Description *</label>
        <textarea
          name="description"
          value={form.description || ''}
          onChange={handleChange}
          required
          maxLength={1000}
          rows={3}
          className="w-full border rounded px-3 py-2"
        />
      </div>

       <div>
        <label className="block font-medium text-gray-700 mb-2">Banner Image</label>
        {initialValues.bannerImageUrl && (
          <img
            src={initialValues.bannerImageUrl}
            alt="Banner Preview"
            className="mb-2 w-full max-w-xs h-40 object-cover rounded-md border"
          />
        )}
        <input
          type="file"
          name="bannerImage"
          accept="image/*"
          onChange={handleChange}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100
            cursor-pointer"
        />
        <p className="text-xs text-gray-400 mt-1">Max size: 5 MB | Allowed formats: jpg, png, gif</p>
      </div>

      {/* Video File */}
      {/* <div>
        <label className="block font-medium text-gray-700 mb-2">Video File</label>
        {videoPreview && (
          <video
            src={videoPreview}
            controls
            className="mb-2 w-full max-w-xs h-40 object-cover rounded-md border"
          />
        )}
        <input
          type="file"
          name="videoFile"
          accept="video/*"
          onChange={handleChange}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-green-50 file:text-green-700
            hover:file:bg-green-100
            cursor-pointer"
        />
        <p className="text-xs text-gray-400 mt-1">Max size: 5 MB | Allowed formats: mp4, mov, avi</p>
      </div> */}

      <div>
        <label className="block font-medium">Website URL</label>
        <input
          name="websiteUrl"
          type="url"
          value={form.websiteUrl || ''}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block font-medium">WhatsApp Number</label>
        <input
          name="whatsappNumber"
          type="tel"
          value={form.whatsappNumber || ''}
          onChange={handleChange}
          pattern="^\+?[0-9]{10,15}$"
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block font-medium">Phone Number</label>
        <input
          name="phoneNumber"
          type="tel"
          value={form.phoneNumber || ''}
          onChange={handleChange}
          pattern="^\+?[0-9]{10,15}$"
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block font-medium">Email</label>
        <input
          name="emailAddress"
          type="email"
          value={form.emailAddress || ''}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      {['instagramUrl', 'facebookUrl', 'youtubeUrl', 'linkedinUrl', 'twitterUrl'].map((field) => (
        <div key={field}>
          <label className="block font-medium capitalize">
            {field.replace('Url', '').replace(/([A-Z])/g, ' $1')}
          </label>
          <input
            name={field}
            value={form[field] || ''}
            onChange={handleChange}
            type="url"
            className="w-full border rounded px-3 py-2"
          />
        </div>
      ))}

      <div className="md:col-span-2">
        <label className="block font-medium">Additional Info</label>
        <textarea
          name="additionalInfo"
          value={form.additionalInfo || ''}
          onChange={handleChange}
          rows={2}
          maxLength={1000}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div className="md:col-span-2">
        <label className="block font-medium">Target District *</label>
        <select
          name="districtSelect"
          value={form.districtId || ''}
          onChange={handleChange}
          required
          className="w-full border rounded px-3 py-2"
        >
          <option value="">Select District</option>
          {districts.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>

      {!form.districtId && (
        <div>
          <label className="block font-medium">Radius (km) *</label>
          <input
            name="radiusKm"
            type="number"
            value={form.radiusKm || ''}
            onChange={handleChange}
            min={0}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>
      )}

      <div>
        <label className="block font-medium">Valid From *</label>
        <input
          type="datetime-local"
          name="validFrom"
          value={form.validFrom || ''}
          onChange={handleChange}
          required
          min={minFrom}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block font-medium">Valid Until *</label>
        <input
          type="datetime-local"
          name="validUntil"
          value={form.validUntil || ''}
          onChange={handleChange}
          required
          min={minUntil}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div className="md:col-span-2 flex justify-end gap-4 mt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border rounded bg-gray-100 hover:bg-gray-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 !text-white rounded hover:bg-blue-700"
        >
          {initialValues?.id ? 'Update Advertisement' : 'Create Advertisement'}
        </button>
      </div>
    </form>
  );
};

export default AdvertisementForm;
