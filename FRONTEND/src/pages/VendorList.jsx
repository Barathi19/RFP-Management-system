import { useEffect, useState } from 'react';
import { Plus, Mail, Phone, Users } from 'lucide-react';
import { CreateVendor, GetAllVendor } from '../service/vendor';

const VendorList = () => {
    const [vendors, setVendors] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [newVendor, setNewVendor] = useState({ name: '', email: '', mobile: '', category: '', contactName: "", note: "" });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchVendors();
    }, []);

    const fetchVendors = async () => {
        try {
            const res = await GetAllVendor()
            setVendors(res.data);
        } catch (error) {
            console.error("Error fetching vendors:", error);
        }
    };

    const handleAddVendor = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await CreateVendor(newVendor);
            setNewVendor({ name: '', email: '', phone: '', category: '' });
            setShowForm(false);
            fetchVendors();
        } catch (error) {
            console.error("Error adding vendor:", error);
            let errMsg = "";
            if (Array.isArray(error.response.data.details)) {
                errMsg = error.response.data.details.map(detail => detail.message).join("\n");
            } else {
                errMsg = error.response.data.message;
            }

            alert(`Failed to add vendor:
                ${errMsg || "Something went wrong"}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Vendor Management</h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Vendor
                </button>
            </div>

            {showForm && (
                <div className="mb-8 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4">Add New Vendor</h3>
                    <form onSubmit={handleAddVendor} className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <input
                            type="text"
                            placeholder="Vendor Name"
                            required
                            value={newVendor.name}
                            onChange={e => setNewVendor({ ...newVendor, name: e.target.value })}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        />
                        <input
                            type="email"
                            placeholder="Email Address"
                            required
                            value={newVendor.email}
                            onChange={e => setNewVendor({ ...newVendor, email: e.target.value })}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        />
                        <input
                            type="text"
                            placeholder="Contact Name"
                            value={newVendor.contactName}
                            required
                            onChange={e => setNewVendor({ ...newVendor, contactName: e.target.value })}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        />
                        <input
                            type="text"
                            placeholder="Mobile"
                            required
                            value={newVendor.mobile}
                            onChange={e => setNewVendor({ ...newVendor, mobile: e.target.value })}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        />
                        <input
                            type="text"
                            placeholder="Category (e.g. Hardware)"
                            value={newVendor.category}
                            required
                            onChange={e => setNewVendor({ ...newVendor, category: e.target.value })}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        />

                        <input
                            type="text"
                            placeholder="Note"
                            value={newVendor.note}
                            onChange={e => setNewVendor({ ...newVendor, note: e.target.value })}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        />
                        <div className="md:col-span-2 flex justify-end gap-2">
                            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                            <button type="submit" disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                                {loading ? 'Saving...' : 'Save Vendor'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {vendors.map((vendor) => (
                            <tr key={vendor._id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center">
                                            <Users className="w-5 h-5" />
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">{vendor.name}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900 flex items-center"><Mail className="w-4 h-4 mr-1 text-gray-400" /> {vendor.email}</div>
                                    {vendor.phone && <div className="text-sm text-gray-500 flex items-center mt-1"><Phone className="w-4 h-4 mr-1 text-gray-400" /> {vendor.phone}</div>}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                        {vendor.category || 'General'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    Active
                                </td>
                            </tr>
                        ))}
                        {vendors.length === 0 && (
                            <tr>
                                <td colSpan="4" className="px-6 py-12 text-center text-gray-500">No vendors found. Add one to get started.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default VendorList;
