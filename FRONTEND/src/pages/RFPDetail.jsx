import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Send, BarChart2, CheckCircle, Mail } from "lucide-react";
import { GetAllVendor } from "../service/vendor";
import { GetRFPById, SendRFP } from "../service/rfp";
import {
  GetProposalRecommendation,
  GetProposalsByRFPId,
} from "../service/proposal";

const RFPDetail = () => {
  const { id } = useParams();
  const [rfp, setRfp] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [comparison, setComparison] = useState(null);
  const [selectedVendors, setSelectedVendors] = useState([]);
  const [proposalsLoading, setProposalsLoading] = useState(false);
  const [comparisonLoading, setComparisonLoading] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fast fetch for RFP and Vendors
        const rfpRes = await GetRFPById(id);
        setRfp(rfpRes.data);

        const vendorsRes = await GetAllVendor();
        setVendors(vendorsRes.data);

        // Start slow fetch for proposals (IMAP sync)
        fetchProposals();
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [id]);

  const fetchProposals = async () => {
    setProposalsLoading(true);
    try {
      const proposalsRes = await GetProposalsByRFPId(id);
      setProposals(proposalsRes.data);
    } catch (error) {
      console.log("No proposals yet or sync error:", error);
    } finally {
      setProposalsLoading(false);
    }
  };

  const handleSend = async () => {
    if (selectedVendors.length === 0) return;
    setSending(true);
    try {
      await SendRFP(id, selectedVendors);
      alert("RFP Sent to selected vendors!");
      // Refresh RFP status
      const rfpRes = await GetRFPById(id);
      setRfp(rfpRes.data);
      setSelectedVendors([])
    } catch (error) {
      console.error("Error sending RFP:", error);
      alert("Failed to send RFP");
    } finally {
      setSending(false);
    }
  };

  const handleCompare = async () => {
    try {
      setComparisonLoading(true);
      const res = await GetProposalRecommendation(id);
      setComparison(res.data.rationale);
    } catch (error) {
      console.error("Error comparing:", error);
      alert("Failed to allow comparison");
    } finally {
      setComparisonLoading(false);
    }
  };

  const toggleVendor = (vendorId) => {
    if (selectedVendors.includes(vendorId)) {
      setSelectedVendors(selectedVendors.filter((v) => v !== vendorId));
    } else {
      setSelectedVendors([...selectedVendors, vendorId]);
    }
  };

  if (!rfp)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {rfp.title}
            </h1>
            <p className="text-gray-500">
              Status:{" "}
              <span className="font-semibold text-indigo-600">
                {rfp.status}
              </span>
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-gray-50 rounded-xl">
            <span className="block text-sm font-medium text-gray-500">
              Budget
            </span>
            <span className="block text-lg font-semibold text-gray-900">
              ${rfp.budgetTotal?.toLocaleString()}
            </span>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl">
            <span className="block text-sm font-medium text-gray-500">
              Timeline
            </span>
            <span className="block text-lg font-semibold text-gray-900">
              {rfp.deliveryDays}
            </span>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Request Items
          </h3>
          <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Item
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Specs
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Qty
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rfp.items.map((item, i) => (
                <tr key={i}>
                  <td className="px-6 py-4">{item.name}</td>
                  <td className="px-6 py-4">
                    {typeof item.specs === "object" && item.specs !== null
                      ? Object.entries(item.specs).map(([key, value]) => (
                          <div key={key}>
                            <span className="font-semibold">{key}: </span>
                            {value}
                          </div>
                        ))
                      : item.specs}
                  </td>
                  <td className="px-6 py-4">{item.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vendor Selection Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <Mail className="w-5 h-5 mr-3 text-gray-400" />
          Send to Vendors
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {vendors.map((vendor) => {
            const isSent =
              rfp.vendorIds &&
              rfp.vendorIds.some(
                (v) => v._id === vendor._id || v === vendor._id
              );
            return (
              <div
                key={vendor._id}
                onClick={() => !isSent && toggleVendor(vendor._id)}
                className={`p-4 rounded-xl border transition-all ${
                  isSent
                    ? "bg-gray-100 border-gray-200 opacity-60 cursor-not-allowed"
                    : selectedVendors.includes(vendor._id)
                    ? "border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600 cursor-pointer"
                    : "border-gray-200 hover:border-indigo-300 cursor-pointer"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      isSent
                        ? "bg-gray-300 border-gray-300"
                        : selectedVendors.includes(vendor._id)
                        ? "bg-indigo-600 border-indigo-600"
                        : "border-gray-300"
                    }`}
                  >
                    {(selectedVendors.includes(vendor._id) || isSent) && (
                      <CheckCircle className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{vendor.name}</p>
                    <p className="text-sm text-gray-500">
                      {vendor.category} {isSent && "(Sent)"}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex justify-end">
          <button
            onClick={handleSend}
            disabled={sending || selectedVendors.length === 0}
            className="flex items-center px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            <Send className="w-4 h-4 mr-2" />
            {sending
              ? "Sending..."
              : `Send to ${selectedVendors.length} Vendors`}
          </button>
        </div>
      </div>

      {/* Received Proposals Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <CheckCircle className="w-5 h-5 mr-3 text-gray-400" />
            Received Proposals ({proposals.length})
          </h2>
          <button
            onClick={fetchProposals}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            disabled={proposalsLoading}
          >
            {proposalsLoading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 mr-2"></div>
            )}
            {proposalsLoading ? "Syncing..." : "Sync Emails"}
          </button>
        </div>

        {proposalsLoading && proposals.length === 0 ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : proposals.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Vendor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Delivery
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Received
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {proposals.map((proposal) => (
                  <tr key={proposal._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {proposal.vendorId?.name || "Unknown"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {proposal.vendorId?.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      $
                      {proposal.parsedResponse?.totalPrice?.toLocaleString() ||
                        0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {proposal.parsedResponse?.deliveryDays || "-"} Days
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {proposal.scores?.overallScore ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {(proposal.scores.overallScore * 100).toFixed(0)}%
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(proposal.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No proposals received yet.
          </div>
        )}
      </div>

      {/* Comparison Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <BarChart2 className="w-5 h-5 mr-3 text-gray-400" />
            AI Comparison & Analysis
          </h2>
          <div className="flex space-x-3">
            <button
              onClick={handleCompare}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              {comparisonLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 mr-2"></div>
              ) : (
                "Refresh Analysis"
              )}
            </button>
          </div>
        </div>

        {comparisonLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : comparison ? (
          <div className="prose max-w-none p-6 bg-indigo-50 rounded-xl">
            <p className="whitespace-pre-wrap text-gray-800 leading-relaxed">
              {comparison}
            </p>
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-500">
              No analysis generated yet. Click refresh to analyze proposals.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RFPDetail;
