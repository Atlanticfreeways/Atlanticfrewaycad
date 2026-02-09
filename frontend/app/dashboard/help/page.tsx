'use client';

import { DashboardShell } from '@/components/layout/DashboardShell';
import { Button } from '@/components/ui/button';
import { Mail, MessageCircle, HelpCircle, FileText, ExternalLink } from 'lucide-react';

export default function HelpPage() {
    const faqs = [
        {
            question: "How do I create a new virtual card?",
            answer: "Navigate to 'My Cards' and click 'Issue New Card'. Select 'Virtual' as the card type and follow the prompts."
        },
        {
            question: "What are KYC tiers?",
            answer: "KYC tiers determine your monthly spending limits. Basic tier allows $5k/month, Standard tier allows $50k/month, Turbo allows $100k/month, and Business allows $20M/month."
        },
        {
            question: "How does JIT (Just-in-Time) funding work?",
            answer: "When you make a transaction, our system automatically transfers funds from your wallet to your card in real-time, ensuring instant authorization."
        },
        {
            question: "Can I export my transaction data?",
            answer: "Yes! Go to Settings > Privacy and click 'Request Data Export' to download all your data in JSON format (GDPR compliance)."
        },
        {
            question: "How do I upgrade my KYC tier?",
            answer: "Go to your Profile page and click 'Upgrade KYC Tier'. You'll need to submit additional verification documents."
        },
        {
            question: "What is bulk card issuance?",
            answer: "Business accounts can create multiple cards at once by uploading a CSV file under Business > Bulk Issuance."
        }
    ];

    return (
        <DashboardShell>
            <div className="p-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white">Help Center</h1>
                    <p className="text-slate-400 mt-2">Find answers to common questions or contact support</p>
                </div>

                {/* Contact Options */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white">
                        <Mail className="w-8 h-8 mb-3" />
                        <h3 className="text-lg font-semibold mb-2">Email Support</h3>
                        <p className="text-sm text-blue-100 mb-3">Get help via email within 24 hours</p>
                        <Button variant="secondary" className="w-full">
                            support@atlanticfrewaycard.com
                        </Button>
                    </div>
                    <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-6 text-white">
                        <MessageCircle className="w-8 h-8 mb-3" />
                        <h3 className="text-lg font-semibold mb-2">Live Chat</h3>
                        <p className="text-sm text-green-100 mb-3">Chat with our team in real-time</p>
                        <Button variant="secondary" className="w-full">
                            Start Chat
                        </Button>
                    </div>
                    <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-6 text-white">
                        <FileText className="w-8 h-8 mb-3" />
                        <h3 className="text-lg font-semibold mb-2">Documentation</h3>
                        <p className="text-sm text-purple-100 mb-3">Browse our full documentation</p>
                        <Button variant="secondary" className="w-full flex items-center gap-2">
                            View Docs
                            <ExternalLink className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                    <h2 className="text-2xl font-semibold text-white mb-6">Frequently Asked Questions</h2>
                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <details
                                key={index}
                                className="group bg-slate-900/50 rounded-lg border border-slate-700 overflow-hidden"
                            >
                                <summary className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-slate-700/30 transition-all">
                                    <span className="font-medium text-white">{faq.question}</span>
                                    <HelpCircle className="w-5 h-5 text-slate-400 group-open:text-blue-400 transition-colors" />
                                </summary>
                                <div className="px-6 py-4 border-t border-slate-700 text-slate-400">
                                    {faq.answer}
                                </div>
                            </details>
                        ))}
                    </div>
                </div>

                {/* Status */}
                <div className="mt-8 bg-green-900/20 rounded-xl p-6 border border-green-700">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <div>
                            <h3 className="font-semibold text-green-400">All Systems Operational</h3>
                            <p className="text-sm text-slate-400">All services are running normally</p>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardShell>
    );
}
