import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../auth/useAuth';

const initialForm = {
    monto_base: '',
    puntos_base: '',
    activo: true,
};

function ConfiguracionPuntosPage() {
    const { usuario } = useAuth();

    const [configuraciones, setConfiguraciones] = useState([]);
    const [form, setForm] = useState(initialForm);
    const [editingId, setEditingId] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [mensaje, setMensaje] = useState('');

    const fetchConfiguraciones = async () => {
        const res = await api.get('/configuracion-puntos');
        setConfiguraciones(res.data || []);
    };

    const recargarConfiguraciones = async () => {
        try {
        setLoading(true);
        await fetchConfiguraciones();
        } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'No se pudieron cargar las configuraciones');
        } finally {
        setLoading(false);
        }
    };

    useEffect(() => {
        const loadInitialData = async () => {
        try {
            await fetchConfiguraciones();
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'No se pudieron cargar las configuraciones');
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

    const resetForm = () => {
        setEditingId(null);
        setForm(initialForm);
    };

    const handleEdit = (config) => {
        setEditingId(config.id);
        setForm({
        monto_base: config.monto_base,
        puntos_base: config.puntos_base,
        activo: config.activo,
        });
        setError('');
        setMensaje('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMensaje('');

        try {
        const payload = {
            monto_base: Number(form.monto_base),
            puntos_base: Number(form.puntos_base),
            activo: form.activo,
        };

        if (editingId) {
            await api.put(`/configuracion-puntos/${editingId}`, payload);
            setMensaje('Configuración actualizada correctamente');
        } else {
            await api.post('/configuracion-puntos', payload);
            setMensaje('Configuración creada correctamente');
        }

        resetForm();
        await recargarConfiguraciones();
        } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'No se pudo guardar la configuración');
        }
    };

    const handleActivar = async (id) => {
        try {
        setError('');
        setMensaje('');

        await api.patch(`/configuracion-puntos/${id}/activar`);
        setMensaje('Configuración activada correctamente');
        await recargarConfiguraciones();
        } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'No se pudo activar la configuración');
        }
    };

    return (
        <div>
        <h2 className="mb-4">Configuración de puntos</h2>

        {error && <div className="alert alert-danger">{error}</div>}
        {mensaje && <div className="alert alert-success">{mensaje}</div>}

        {usuario?.rol === 'ADMIN' && (
            <div className="card shadow-sm mb-4">
            <div className="card-body">
                <h5 className="mb-3">
                {editingId ? 'Editar configuración' : 'Crear configuración'}
                </h5>

                <form onSubmit={handleSubmit}>
                <div className="row g-3">
                    <div className="col-md-4">
                    <label className="form-label">Monto base</label>
                    <input
                        type="number"
                        name="monto_base"
                        className="form-control"
                        value={form.monto_base}
                        onChange={handleChange}
                        required
                        min="0.01"
                        step="0.01"
                    />
                    </div>

                    <div className="col-md-4">
                    <label className="form-label">Puntos base</label>
                    <input
                        type="number"
                        name="puntos_base"
                        className="form-control"
                        value={form.puntos_base}
                        onChange={handleChange}
                        required
                        min="1"
                    />
                    </div>

                    <div className="col-md-4 d-flex align-items-end">
                    <div className="form-check mb-2">
                        <input
                        type="checkbox"
                        name="activo"
                        className="form-check-input"
                        checked={form.activo}
                        onChange={handleChange}
                        id="activoConfig"
                        />
                        <label htmlFor="activoConfig" className="form-check-label">
                        Activa
                        </label>
                    </div>
                    </div>
                </div>

                <div className="d-flex gap-2 mt-3">
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
            <h5 className="mb-3">Listado de configuraciones</h5>

            {loading ? (
                <p>Cargando...</p>
            ) : configuraciones.length === 0 ? (
                <p className="text-muted mb-0">No hay configuraciones cargadas.</p>
            ) : (
                <div className="table-responsive">
                <table className="table align-middle">
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>Monto base</th>
                        <th>Puntos base</th>
                        <th>Activa</th>
                        {usuario?.rol === 'ADMIN' && <th>Acciones</th>}
                    </tr>
                    </thead>
                    <tbody>
                    {configuraciones.map((config) => (
                        <tr key={config.id}>
                        <td>{config.id}</td>
                        <td>{config.monto_base}</td>
                        <td>{config.puntos_base}</td>
                        <td>{config.activo ? 'Sí' : 'No'}</td>
                        {usuario?.rol === 'ADMIN' && (
                            <td className="d-flex gap-2">
                            <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => handleEdit(config)}
                            >
                                Editar
                            </button>

                            {!config.activo && (
                                <button
                                className="btn btn-sm btn-outline-success"
                                onClick={() => handleActivar(config.id)}
                                >
                                Activar
                                </button>
                            )}
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

export default ConfiguracionPuntosPage;