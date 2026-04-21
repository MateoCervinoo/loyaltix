function MisCanjesCard({ canjes, loading, onVerTodos }) {
    const ultimosCanjes = canjes.slice(0, 5);

    return (
        <div className="card shadow-sm h-100">
        <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="card-title mb-0">Mis canjes</h5>
            <button
                type="button"
                className="btn btn-outline-primary btn-sm"
                onClick={onVerTodos}
                disabled={canjes.length === 0}
            >
                Ver todos
            </button>
            </div>

            {loading ? (
            <p className="mb-0">Cargando canjes...</p>
            ) : ultimosCanjes.length === 0 ? (
            <p className="text-muted mb-0">Todavía no hiciste canjes.</p>
            ) : (
            <div className="table-responsive">
                <table className="table table-sm align-middle mb-0">
                <thead>
                    <tr>
                    <th>Código</th>
                    <th>Beneficio</th>
                    <th>Estado</th>
                    </tr>
                </thead>
                <tbody>
                    {ultimosCanjes.map((canje) => (
                    <tr key={canje.id}>
                        <td>{canje.codigo}</td>
                        <td>{canje.beneficio?.nombre || '-'}</td>
                        <td>{canje.estado}</td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
            )}
        </div>
        </div>
    );
}

export default MisCanjesCard;