import { useEffect, useState } from 'react';
import api from '../../api/axios';

const initialForm = {
    nombre: '',
    direccion: '',
    telefono: '',
};

function InstitucionesPage() {
    const [instituciones, setInstituciones] = useState([]);
    const [form, setForm] = useState(initialForm);
    const [editingId, setEditingId] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [mensaje, setMensaje] = useState('');

    const fetchInstituciones = async () => {
        const res = await api.get('/instituciones');
        setInstituciones(res.data || []);
    };

    const recargar = async () => {
        try {
        setLoading(true);
        await fetchInstituciones();
        } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'No se pudieron cargar las instituciones');
        } finally {
        setLoading(false);
        }
    };

    useEffect(() => {
        const loadInitialData = async () => {
        try {
            await fetchInstituciones();
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'No se pudieron cargar las instituciones');
        } finally {
            setLoading(false);
        }
        };

        loadInitialData();
    }, []);

    const handleChange = (e) => {
        setForm({
        ...form,
        [e.target.name]: e.target.value,
        });
    };

    const resetForm = () => {
        setEditingId(null);
        setForm(initialForm);
    };

    const handleEdit = (institucion) => {
        setEditingId(institucion.id);
        setForm({
        nombre: institucion.nombre || '',
        direccion: institucion.direccion || '',
        telefono: institucion.telefono || '',
        });
        setError('');
        setMensaje('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMensaje('');

        try {
        if (editingId) {
            await api.put(`/instituciones/${editingId}`, form);
            setMensaje('Institución actualizada correctamente');
        } else {
            await api.post('/instituciones', form);
            setMensaje('Institución creada correctamente');
        }

        resetForm();
        await recargar();
        } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'No se pudo guardar la institución');
        }
    };

    return (
        <div>
        <h2 className="mb-4">Instituciones</h2>

        {error && <div className="alert alert-danger">{error}</div>}
        {mensaje && <div className="alert alert-success">{mensaje}</div>}

        <div className="card shadow-sm mb-4">
            <div className="card-body">
            <h5 className="mb-3">
                {editingId ? 'Editar institución' : 'Crear institución'}
            </h5>

            <form onSubmit={handleSubmit}>
                <div className="row g-3">
                <div className="col-md-4">
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

                <div className="col-md-4">
                    <label className="form-label">Dirección</label>
                    <input
                    type="text"
                    name="direccion"
                    className="form-control"
                    value={form.direccion}
                    onChange={handleChange}
                    />
                </div>

                <div className="col-md-4">
                    <label className="form-label">Teléfono</label>
                    <input
                    type="text"
                    name="telefono"
                    className="form-control"
                    value={form.telefono}
                    onChange={handleChange}
                    />
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

        <div className="card shadow-sm">
            <div className="card-body">
            <h5 className="mb-3">Listado de instituciones</h5>

            {loading ? (
                <p>Cargando...</p>
            ) : instituciones.length === 0 ? (
                <p className="text-muted mb-0">No hay instituciones cargadas.</p>
            ) : (
                <div className="table-responsive">
                <table className="table align-middle">
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Dirección</th>
                        <th>Teléfono</th>
                        <th>Acciones</th>
                    </tr>
                    </thead>
                    <tbody>
                    {instituciones.map((institucion) => (
                        <tr key={institucion.id}>
                        <td>{institucion.id}</td>
                        <td>{institucion.nombre}</td>
                        <td>{institucion.direccion}</td>
                        <td>{institucion.telefono}</td>
                        <td>
                            <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleEdit(institucion)}
                            >
                            Editar
                            </button>
                        </td>
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

export default InstitucionesPage;