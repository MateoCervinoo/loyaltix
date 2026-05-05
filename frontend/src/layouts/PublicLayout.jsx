function PublicLayout({ children }) {
    return (
        <div>
        <main className="container py-4">{children}</main>
        <footer className="text-center py-3">
            LoyalTix v1.1.0 — © 2026
        </footer>
        </div>
    );
}

export default PublicLayout;
