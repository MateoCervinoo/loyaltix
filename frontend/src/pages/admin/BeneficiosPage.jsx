import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../auth/useAuth';

const initialForm = {
    nombre: '',
    descripcion: '',
    imagen_url: '',
    puntos_requeridos: '',
    activo: true,
};

function BeneficiosPage() {
    const { usuario } = useAuth();

    const [beneficios, setBeneficios] = useState([]);
    const [form, setForm] = useState(initialForm);
    const [editingId, setEditingId] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [mensaje, setMensaje] = useState('');

    const fetchBeneficios = async () => {
        const res = await api.get('/beneficios');
        setBeneficios(res.data || []);
    };

    const recargarBeneficios = async () => {
        try {
        setLoading(true);
        await fetchBeneficios();
        } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'No se pudieron cargar los beneficios');
        } finally {
        setLoading(false);
        }
    };

    useEffect(() => {
        const loadInitialData = async () => {
        try {
            await fetchBeneficios();
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'No se pudieron cargar los beneficios');
        } finally {
            setLoading(false);
        }
        };

        loadInitialData();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({
        ...form,
        [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handleEdit = (beneficio) => {
        setEditingId(beneficio.id);
        setForm({
        nombre: beneficio.nombre,
        descripcion: beneficio.descripcion || '',
        imagen_url: beneficio.imagen_url || '',
        puntos_requeridos: beneficio.puntos_requeridos,
        activo: beneficio.activo,
        });
        setError('');
        setMensaje('');
    };

    const resetForm = () => {
        setEditingId(null);
        setForm(initialForm);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMensaje('');

        try {
        if (editingId) {
            await api.put(`/beneficios/${editingId}`, {
            ...form,
            puntos_requeridos: Number(form.puntos_requeridos),
            });
            setMensaje('Beneficio actualizado correctamente');
        } else {
            await api.post('/beneficios', {
            ...form,
            puntos_requeridos: Number(form.puntos_requeridos),
            });
            setMensaje('Beneficio creado correctamente');
        }

        resetForm();
        await recargarBeneficios();
        } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'No se pudo guardar el beneficio');
        }
    };

    const handleToggle = async (id) => {
        const confirmar = window.confirm('¿Querés cambiar el estado de este beneficio?');
        if (!confirmar) return;

        try {
        setError('');
        setMensaje('');

        await api.patch(`/beneficios/${id}/toggle-activo`);
        setMensaje('Estado del beneficio actualizado');
        await recargarBeneficios();
        } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'No se pudo cambiar el estado');
        }
    };

    return (
        <div>
        <h2 className="mb-4">Beneficios</h2>

        {error && <div className="alert alert-danger">{error}</div>}
        {mensaje && <div className="alert alert-success">{mensaje}</div>}

        {usuario?.rol === 'ADMIN' && (
            <div className="card shadow-sm mb-4">
            <div className="card-body">
                <h5 className="mb-3">
                {editingId ? 'Editar beneficio' : 'Crear beneficio'}
                </h5>

                <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="form-label">Nombre</label>
                    <input
                    type="text"
                    name="nombre"
                    className="form-control"
                    value={form.nombre}
                    onChange={handleChange}
                    required
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Descripción</label>
                    <input
                    type="text"
                    name="descripcion"
                    className="form-control"
                    value={form.descripcion}
                    onChange={handleChange}
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">URL de imagen</label>
                    <input
                    type="text"
                    name="imagen_url"
                    className="form-control"
                    value={form.imagen_url}
                    onChange={handleChange}
                    placeholder="https://..."
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Puntos requeridos</label>
                    <input
                    type="number"
                    name="puntos_requeridos"
                    className="form-control"
                    value={form.puntos_requeridos}
                    onChange={handleChange}
                    required
                    min="1"
                    />
                </div>

                <div className="form-check mb-3">
                    <input
                    type="checkbox"
                    name="activo"
                    className="form-check-input"
                    checked={form.activo}
                    onChange={handleChange}
                    id="activoBeneficio"
                    />
                    <label htmlFor="activoBeneficio" className="form-check-label">
                    Activo
                    </label>
                </div>

                <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-primary">
                    {editingId ? 'Guardar cambios' : 'Crear'}
                    </button>

                    {editingId && (
                    <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={resetForm}
                    >
                        Cancelar
                    </button>
                    )}
                </div>
                </form>
            </div>
            </div>
        )}

        <div className="card shadow-sm">
            <div className="card-body">
            <h5 className="mb-3">Listado</h5>

            {loading ? (
                <p>Cargando...</p>
            ) : beneficios.length === 0 ? (
                <p className="text-muted mb-0">No hay beneficios cargados.</p>
            ) : (
                <div className="table-responsive">
                <table className="table align-middle">
                    <thead>
                    <tr>
                        <th>Imagen</th>
                        <th>Nombre</th>
                        <th>Descripción</th>
                        <th>Puntos</th>
                        <th>Activo</th>
                        {usuario?.rol === 'ADMIN' && <th>Acciones</th>}
                    </tr>
                    </thead>
                    <tbody>
                    {beneficios.map((beneficio) => (
                        <tr key={beneficio.id}>
                        <td>
                            {beneficio.imagen_url ? (
                            <img
                                src={beneficio.imagen_url}
                                alt={beneficio.nombre}
                                style={{
                                width: '60px',
                                height: '60px',
                                objectFit: 'cover',
                                borderRadius: '8px',
                                }}
                            />
                            ) : (
                            '-'
                            )}
                        </td>
                        <td>{beneficio.nombre}</td>
                        <td>{beneficio.descripcion}</td>
                        <td>{beneficio.puntos_requeridos}</td>
                        <td>{beneficio.activo ? 'Sí' : 'No'}</td>
                        {usuario?.rol === 'ADMIN' && (
                            <td className="d-flex gap-2">
                            <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => handleEdit(beneficio)}
                            >
                                Editar
                            </button>
                            <button
                                className="btn btn-sm btn-outline-warning"
                                onClick={() => handleToggle(beneficio.id)}
                            >
                                Toggle activo
                            </button>
                            </td>
                        )}
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>
            )}
            </div>
        </div>
        </div>
    );
}

export default BeneficiosPage;