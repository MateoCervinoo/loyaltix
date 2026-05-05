import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../auth/useAuth';
import FormLabel from '../../components/FormLabel';
import BackToDashboard from '../../components/BackToDashboard';
import ConfirmModal from '../../components/ConfirmModal';
import { showToast } from '../../components/showToast';

const initialForm = {
    nombre: '',
    descripcion: '',
    imagen_url: '',
    puntos_requeridos: '',
    activo: true,
    profesion_id: '',
};

function BeneficiosPage() {
    const { usuario } = useAuth();

    const [beneficios, setBeneficios] = useState([]);
    const [profesiones, setProfesiones] = useState([]);
    const [form, setForm] = useState(initialForm);
    const [editingId, setEditingId] = useState(null);

    const [loading, setLoading] = useState(true);
    const [confirmAction, setConfirmAction] = useState(null);

    const fetchBeneficios = async () => {
        const res = await api.get('/beneficios');
        setBeneficios(res.data || []);
    };

    const fetchProfesiones = async () => {
        const res = await api.get('/profesiones');
        setProfesiones(res.data || []);
    };

    const recargarBeneficios = async () => {
        try {
        setLoading(true);
        await fetchBeneficios();
        } catch (err) {
        console.error(err);
        showToast(err.response?.data?.message || 'No se pudieron cargar los beneficios', 'error');
        } finally {
        setLoading(false);
        }
    };

    useEffect(() => {
        const loadInitialData = async () => {
        try {
            await fetchBeneficios();
            if (usuario?.rol === 'ADMIN') {
                await fetchProfesiones();
            }
        } catch (err) {
            console.error(err);
            showToast(err.response?.data?.message || 'No se pudieron cargar los beneficios', 'error');
        } finally {
            setLoading(false);
        }
        };

        loadInitialData();
    }, [usuario?.rol]);

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
        profesion_id: beneficio.profesion_id || '',
        });
    };

    const resetForm = () => {
        setEditingId(null);
        setForm(initialForm);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
        const payload = {
            ...form,
            puntos_requeridos: Number(form.puntos_requeridos),
            profesion_id: form.profesion_id === '' ? null : Number(form.profesion_id),
        };

        if (editingId) {
            await api.put(`/beneficios/${editingId}`, payload);
            showToast('Beneficio actualizado', 'success');
        } else {
            await api.post('/beneficios', payload);
            showToast('Beneficio creado', 'success');
        }

        resetForm();
        await recargarBeneficios();
        } catch (err) {
        console.error(err);
        showToast(err.response?.data?.message || 'No se pudo guardar el beneficio', 'error');
        }
    };

    const toggleBeneficio = async (id) => {
        try {
        await api.patch(`/beneficios/${id}/toggle-activo`);
        showToast('Estado actualizado', 'success');
        await recargarBeneficios();
        } catch (err) {
        console.error(err);
        showToast(err.response?.data?.message || 'No se pudo cambiar el estado', 'error');
        }
    };

    const handleToggle = (id) => {
        setConfirmAction({
        message: '¿Querés cambiar el estado de este beneficio?',
        onConfirm: () => toggleBeneficio(id),
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
        <h2 className="mb-4">Beneficios</h2>

        {usuario?.rol === 'ADMIN' && (
            <div className="card shadow-sm mb-4">
            <div className="card-body">
                <h5 className="mb-3">
                {editingId ? 'Editar beneficio' : 'Crear beneficio'}
                </h5>

                <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <FormLabel htmlFor="nombre" required>Nombre</FormLabel>
                    <input
                    id="nombre"
                    type="text"
                    name="nombre"
                    className="form-control"
                    value={form.nombre}
                    onChange={handleChange}
                    required
                    />
                </div>

                <div className="mb-3">
                    <FormLabel htmlFor="descripcion">Descripción</FormLabel>
                    <input
                    id="descripcion"
                    type="text"
                    name="descripcion"
                    className="form-control"
                    value={form.descripcion}
                    onChange={handleChange}
                    />
                </div>

                <div className="mb-3">
                    <FormLabel htmlFor="imagen_url">URL de imagen</FormLabel>
                    <input
                    id="imagen_url"
                    type="text"
                    name="imagen_url"
                    className="form-control"
                    value={form.imagen_url}
                    onChange={handleChange}
                    placeholder="https://..."
                    />
                </div>

                <div className="mb-3">
                    <FormLabel htmlFor="puntos_requeridos" required>Puntos requeridos</FormLabel>
                    <input
                    id="puntos_requeridos"
                    type="number"
                    name="puntos_requeridos"
                    className="form-control"
                    value={form.puntos_requeridos}
                    onChange={handleChange}
                    required
                    min="1"
                    />
                </div>

                <div className="mb-3">
                    <FormLabel htmlFor="profesion_id">Categoría</FormLabel>
                    <select
                    id="profesion_id"
                    name="profesion_id"
                    className="form-select"
                    value={form.profesion_id}
                    onChange={handleChange}
                    >
                    <option value="">General</option>
                    {profesiones.map((profesion) => (
                        <option key={profesion.id} value={profesion.id}>
                        {profesion.nombre}
                        </option>
                    ))}
                    </select>
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
                        <th>Categoría</th>
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
                        <td>{beneficio.Profesion?.nombre || 'General'}</td>
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
        <ConfirmModal
            show={Boolean(confirmAction)}
            message={confirmAction?.message}
            onConfirm={handleConfirm}
            onCancel={() => setConfirmAction(null)}
        />
        </div>
    );
}

export default BeneficiosPage;
