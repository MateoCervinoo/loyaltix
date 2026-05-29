import { useEffect, useState } from 'react';
import api from '../../api/axios';
import FormLabel from '../../components/FormLabel';

const initialForm = {
    nombre: '',
};

function ProfesionesPage() {
    const [profesiones, setProfesiones] = useState([]);
    const [form, setForm] = useState(initialForm);
    const [editingId, setEditingId] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [mensaje, setMensaje] = useState('');

    const fetchProfesiones = async () => {
        const res = await api.get('/profesiones');
        setProfesiones(res.data || []);
    };

    const recargar = async () => {
        try {
        setLoading(true);
        await fetchProfesiones();
        } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'No se pudieron cargar las profesiones');
        } finally {
        setLoading(false);
        }
    };

    useEffect(() => {
        const loadInitialData = async () => {
        try {
            await fetchProfesiones();
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'No se pudieron cargar las profesiones');
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

    const handleEdit = (profesion) => {
        setEditingId(profesion.id);
        setForm({
        nombre: profesion.nombre || '',
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
            await api.put(`/profesiones/${editingId}`, form);
            setMensaje('Profesión actualizada correctamente');
        } else {
            await api.post('/profesiones', form);
            setMensaje('Profesión creada correctamente');
        }

        resetForm();
        await recargar();
        } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'No se pudo guardar la profesión');
        }
    };

    return (
        <div>
                <h2 className="mb-4">Profesiones</h2>

        {error && <div className="alert alert-danger">{error}</div>}
        {mensaje && <div className="alert alert-success">{mensaje}</div>}

        <div className="card shadow-sm mb-4">
            <div className="card-body">
            <h5 className="mb-3">
                {editingId ? 'Editar profesión' : 'Crear profesión'}
            </h5>

            <form onSubmit={handleSubmit}>
                <div className="row g-3">
                <div className="col-md-6">
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
            <h5 className="mb-3">Listado de profesiones</h5>

            {loading ? (
                <p>Cargando...</p>
            ) : profesiones.length === 0 ? (
                <p className="text-muted mb-0">No hay profesiones cargadas.</p>
            ) : (
                <div className="table-responsive">
                <table className="table align-middle">
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Acciones</th>
                    </tr>
                    </thead>
                    <tbody>
                    {profesiones.map((profesion) => (
                        <tr key={profesion.id}>
                        <td>{profesion.id}</td>
                        <td>{profesion.nombre}</td>
                        <td>
                            <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleEdit(profesion)}
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

export default ProfesionesPage;