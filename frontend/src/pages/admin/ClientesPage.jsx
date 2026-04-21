import { useEffect, useState } from 'react';
import api from '../../api/axios';
import FormLabel from '../../components/FormLabel';
import BackToDashboard from '../../components/BackToDashboard';

const initialForm = {
    nombre: '',
    apellido: '',
    telefono: '',
    institucion_id: '',
    profesion_id: '',
};

function ClientesPage() {
    const [clientes, setClientes] = useState([]);
    const [instituciones, setInstituciones] = useState([]);
    const [profesiones, setProfesiones] = useState([]);

    const [form, setForm] = useState(initialForm);
    const [editingId, setEditingId] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [mensaje, setMensaje] = useState('');

    const fetchClientes = async () => {
        const res = await api.get('/clientes');
        setClientes(res.data || []);
    };

    const fetchAuxiliares = async () => {
        const [institucionesRes, profesionesRes] = await Promise.all([
        api.get('/instituciones'),
        api.get('/profesiones'),
        ]);

        setInstituciones(institucionesRes.data || []);
        setProfesiones(profesionesRes.data || []);
    };

    const recargarTodo = async () => {
        try {
        setLoading(true);
        await Promise.all([fetchClientes(), fetchAuxiliares()]);
        } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'No se pudieron cargar los datos');
        } finally {
        setLoading(false);
        }
    };

    useEffect(() => {
        const loadInitialData = async () => {
        try {
            await Promise.all([fetchClientes(), fetchAuxiliares()]);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'No se pudieron cargar los datos');
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

    const handleEdit = (cliente) => {
        setEditingId(cliente.id);
        setForm({
        nombre: cliente.nombre || '',
        apellido: cliente.apellido || '',
        telefono: cliente.telefono || '',
        institucion_id: cliente.institucion_id || '',
        profesion_id: cliente.profesion_id || '',
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
            nombre: form.nombre,
            apellido: form.apellido,
            telefono: form.telefono,
            institucion_id: Number(form.institucion_id),
            profesion_id: Number(form.profesion_id),
        };

        if (editingId) {
            await api.put(`/clientes/${editingId}`, payload);
            setMensaje('Cliente actualizado correctamente');
        } else {
            await api.post('/clientes', payload);
            setMensaje('Cliente creado correctamente');
        }

        resetForm();
        await recargarTodo();
        } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'No se pudo guardar el cliente');
        }
    };

    const getInstitucionNombre = (id) => {
        return instituciones.find((i) => i.id === id)?.nombre || '-';
    };

    const getProfesionNombre = (id) => {
        return profesiones.find((p) => p.id === id)?.nombre || '-';
    };

    return (
        <div>
        <BackToDashboard />
        <h2 className="mb-4">Clientes</h2>

        {error && <div className="alert alert-danger">{error}</div>}
        {mensaje && <div className="alert alert-success">{mensaje}</div>}

        <div className="card shadow-sm mb-4">
            <div className="card-body">
            <h5 className="mb-3">
                {editingId ? 'Editar cliente' : 'Crear cliente'}
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

                <div className="col-md-6">
                    <FormLabel htmlFor="apellido" required>Apellido</FormLabel>
                    <input
                    id="apellido"
                    type="text"
                    name="apellido"
                    className="form-control"
                    value={form.apellido}
                    onChange={handleChange}
                    required
                    />
                </div>

                <div className="col-md-6">
                    <FormLabel htmlFor="telefono" required>Teléfono</FormLabel>
                    <input
                    id="telefono"
                    type="text"
                    name="telefono"
                    className="form-control"
                    value={form.telefono}
                    onChange={handleChange}
                    required
                    />
                </div>

                <div className="col-md-6">
                    <FormLabel htmlFor="institucion_id" required>Institución</FormLabel>
                    <select
                    id="institucion_id"
                    name="institucion_id"
                    className="form-select"
                    value={form.institucion_id}
                    onChange={handleChange}
                    required
                    >
                    <option value="">Seleccionar institución</option>
                    {instituciones.map((inst) => (
                        <option key={inst.id} value={inst.id}>
                        {inst.nombre}
                        </option>
                    ))}
                    </select>
                </div>

                <div className="col-md-6">
                    <FormLabel htmlFor="profesion_id" required>Profesión</FormLabel>
                    <select
                    id="profesion_id"
                    name="profesion_id"
                    className="form-select"
                    value={form.profesion_id}
                    onChange={handleChange}
                    required
                    >
                    <option value="">Seleccionar profesión</option>
                    {profesiones.map((prof) => (
                        <option key={prof.id} value={prof.id}>
                        {prof.nombre}
                        </option>
                    ))}
                    </select>
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
            <h5 className="mb-3">Listado de clientes</h5>

            {loading ? (
                <p>Cargando...</p>
            ) : clientes.length === 0 ? (
                <p className="text-muted mb-0">No hay clientes cargados.</p>
            ) : (
                <div className="table-responsive">
                <table className="table align-middle">
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Apellido</th>
                        <th>Teléfono</th>
                        <th>Institución</th>
                        <th>Profesión</th>
                        <th>Acciones</th>
                    </tr>
                    </thead>
                    <tbody>
                    {clientes.map((cliente) => (
                        <tr key={cliente.id}>
                        <td>{cliente.id}</td>
                        <td>{cliente.nombre}</td>
                        <td>{cliente.apellido}</td>
                        <td>{cliente.telefono}</td>
                        <td>{getInstitucionNombre(cliente.institucion_id)}</td>
                        <td>{getProfesionNombre(cliente.profesion_id)}</td>
                        <td>
                            <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleEdit(cliente)}
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

export default ClientesPage;