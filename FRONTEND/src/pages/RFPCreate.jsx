import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Save, ArrowLeft, Loader2 } from 'lucide-react';
import { GenerateRFP, CreateRFP } from '../service/rfp';

const RFPCreate = () => {
    const navigate = useNavigate();
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState('input');
    const [formData, setFormData] = useState({
        title: '',
        items: [],
        budgetTotal: '',
        deliveryDays: '',
        originalRequest: ''
    });

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        setLoading(true);
        try {
            const response = await GenerateRFP({ text: prompt });
            setFormData({
                ...response.data,
                originalRequest: prompt
            });
            setStep('review');
        } catch (error) {
            console.error("Error generating RFP:", error);
            alert("Failed to generate RFP structure. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            await CreateRFP(formData);
            navigate('/');
        } catch (error) {
            console.error("Error saving RFP:", error);
            alert("Failed to save RFP.");
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-6 flex items-center">
                <button onClick={() => navigate('/')} className="mr-4 text-gray-500 hover:text-gray-700">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <h1 className="text-3xl font-bold text-gray-900">Create New RFP</h1>
            </div>

            {step === 'input' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                    <div className="mb-6">
                        <label className="block text-lg font-medium text-gray-700 mb-2">
                            Describe your needs
                        </label>
                        <p className="text-gray-500 text-sm mb-4">
                            Be as specific as possible. e.g., "I need 20 laptops, 16GB RAM, and 15 monitors. Budget is $50k, needed in 30 days."
                        </p>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            rows={6}
                            className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-base"
                            placeholder="Type your requirements here..."
                        />
                    </div>

                    <div className="flex justify-end">
                        <button
                            onClick={handleGenerate}
                            disabled={loading || !prompt.trim()}
                            className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Sparkles className="w-5 h-5 mr-2" />}
                            {loading ? 'AI is working...' : 'Generate Draft'}
                        </button>
                    </div>
                </div>
            )}

            {step === 'review' && (
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6 border-b border-gray-100 pb-4">
                            Review AI Generated Draft
                        </h2>

                        <div className="grid gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">RFP Title</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Budget</label>
                                    <input
                                        type="number"
                                        value={formData.budgetTotal}
                                        onChange={(e) => setFormData({ ...formData, budgetTotal: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Timeline</label>
                                    <input
                                        type="text"
                                        value={formData.deliveryDays}
                                        onChange={(e) => setFormData({ ...formData, deliveryDays: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Line Items</label>
                                <div className="border border-gray-200 rounded-lg overflow-hidden">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specs</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {formData.items.map((item, index) => (
                                                <tr key={index}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.name || item.description}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {item.specs && typeof item.specs === 'object'
                                                            ? Object.entries(item.specs).map(([key, value]) => `${key}: ${value}`).join(', ')
                                                            : (item.specs || 'N/A')}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantity}</td>
                                                </tr>
                                            ))}
                                            {formData.items.length === 0 && (
                                                <tr>
                                                    <td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500">No items detected</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end space-x-4">
                            <button
                                onClick={() => setStep('input')}
                                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                            >
                                Back to Edit
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex items-center px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                            >
                                <Save className="w-4 h-4 mr-2" />
                                Create RFP
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RFPCreate;
