import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, ArrowRight } from 'lucide-react';
import { GetAllRFP } from '../service/rfp';

const Dashboard = () => {
    const [rfps, setRfps] = useState([]);
    const [loading, setLoading] = useState(true);

    const getStatusColor = (status) => {
        switch (status) {
            case 'created': return 'bg-blue-100 text-blue-800';
            case 'sent': return 'bg-yellow-100 text-yellow-800';
            case 'replies_received':
            case 'response_received': return 'bg-purple-100 text-purple-800';
            case 'closed': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    useEffect(() => {
        const fetchRFPs = async () => {
            try {
                const response = await GetAllRFP();
                setRfps(response.data);
            } catch (e) {
                console.error("Failed to fetch RFPs", e);
            } finally {
                setLoading(false);
            }
        };
        fetchRFPs();
    }, []);

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Pipeline Overview</h1>

            {loading ? (
                <p>Loading...</p>
            ) : rfps.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-200 shadow-sm">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No RFPs found</h3>
                    <p className="text-gray-500 mb-6">Get started by creating your first procurement request.</p>
                    <Link to="/create-rfp" className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                        Create RFP
                    </Link>
                </div>
            ) : (
                <div className="grid gap-4">
                    {/* List RFPs */}
                    {rfps.map(rfp => (
                        <div key={rfp._id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex justify-between items-center hover:shadow-md transition-shadow">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">{rfp.title}</h3>
                                <div className="flex items-center mt-2 space-x-3">
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(rfp.status)} capitalize`}>
                                        {rfp.status.replace('_', ' ')}
                                    </span>
                                    <span className="text-gray-500 text-sm">{new Date(rfp.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                            <Link to={`/rfp/${rfp._id}`} className="text-indigo-600 hover:text-indigo-800 flex items-center font-medium">
                                View Details <ArrowRight className="w-4 h-4 ml-1" />
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Dashboard;
