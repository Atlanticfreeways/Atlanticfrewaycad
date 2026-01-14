export function Footer() {
    return (
        <footer className="bg-white border-t border-slate-200 py-4 px-6">
            <div className="flex justify-between items-center text-xs text-slate-500">
                <p>&copy; 2024 Atlantic Financial Technologies. All rights reserved.</p>
                <div className="flex gap-4">
                    <a href="#" className="hover:text-slate-900">Privacy</a>
                    <a href="#" className="hover:text-slate-900">Terms</a>
                    <a href="#" className="hover:text-slate-900">Support</a>
                </div>
            </div>
        </footer>
    );
}
