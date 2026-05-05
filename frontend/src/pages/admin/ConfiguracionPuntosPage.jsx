import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../auth/useAuth';
import FormLabel from '../../components/FormLabel';
import BackToDashboard from '../../components/BackToDashboard';
import ConfirmModal from '../../components/ConfirmModal';
import { showToast } from '../../components/showToast';

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
    const [confirmAction, setConfirmAction] = useState(null);

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
        showToast(err.response?.data?.message || 'No se pudieron cargar las configuraciones', 'error');
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
            showToast(err.response?.data?.message || 'No se pudieron cargar las configuraciones', 'error');
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
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
        const payload = {
            monto_base: Number(form.monto_base),
            puntos_base: Number(form.puntos_base),
            activo: form.activo,
        };

        if (editingId) {
            await api.put(`/configuracion-puntos/${editingId}`, payload);
            showToast('Configuración actualizada', 'success');
        } else {
            await api.post('/configuracion-puntos', payload);
            showToast('Configuración creada', 'success');
        }

        resetForm();
        await recargarConfiguraciones();
        } catch (err) {
        console.error(err);
        showToast(err.response?.data?.message || 'No se pudo guardar la configuración', 'error');
        }
    };

    const activarConfiguracion = async (id) => {
        try {
        await api.patch(`/configuracion-puntos/${id}/activar`);
        showToast('Configuración activada', 'success');
        await recargarConfiguraciones();
        } catch (err) {
        console.error(err);
        showToast(err.response?.data?.message || 'No se pudo activar la configuración', 'error');
        }
    };

    const handleActivar = (id) => {
        setConfirmAction({
        message: '¿Querés activar esta configuración?',
        onConfirm: () => activarConfiguracion(id),
        });
    };

    const handleConfirm = () => {
        const action = confirmAction?.onConfirm;
        setConfirmAction(null);
        action?.();
    };

    return (
        <div>
        <BackToDashboard />
        <h2 className="mb-4">Configuración de puntos</h2>

        {usuario?.rol === 'ADMIN' && (
            <div className="card shadow-sm mb-4">
            <div className="card-body">
                <h5 className="mb-3">
                {editingId ? 'Editar configuración' : 'Crear configuración'}
                </h5>

                <form onSubmit={handleSubmit}>
                <div className="row g-3">
                    <div className="col-md-4">
                    <FormLabel htmlFor="monto_base" required>Monto base</FormLabel>
                    <input
                        id="monto_base"
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
                    <FormLabel htmlFor="puntos_base" required>Puntos base</FormLabel>
                    <input
                        id="puntos_base"
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
        <ConfirmModal
            show={Boolean(confirmAction)}
            message={confirmAction?.message}
            onConfirm={handleConfirm}
            onCancel={() => setConfirmAction(null)}
        />
        </div>
    );
}

export default ConfiguracionPuntosPage;
