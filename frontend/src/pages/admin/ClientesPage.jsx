import { useEffect, useState } from 'react';
import api from '../../api/axios';
import FormLabel from '../../components/FormLabel';
import BackToDashboard from '../../components/BackToDashboard';
import { showToast } from '../../components/showToast';

const initialForm = {
    nombre: '',
    apellido: '',
    telefono: '',
    email: '',
    institucion_id: '',
    profesion_id: '',
    codigo_externo: '',
};

function ClientesPage() {
    const [clientes, setClientes] = useState([]);
    const [instituciones, setInstituciones] = useState([]);
    const [profesiones, setProfesiones] = useState([]);
    const [busqueda, setBusqueda] = useState('');

    const [form, setForm] = useState(initialForm);
    const [editingId, setEditingId] = useState(null);

    const [loading, setLoading] = useState(true);
    const fetchClientes = async (q = busqueda) => {
        const res = await api.get('/clientes', {
        params: { q },
        });
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
        showToast(err.response?.data?.message || 'No se pudieron cargar los datos', 'error');
        } finally {
        setLoading(false);
        }
    };

    useEffect(() => {
        const loadInitialData = async () => {
        try {
            await fetchAuxiliares();
        } catch (err) {
            console.error(err);
            showToast(err.response?.data?.message || 'No se pudieron cargar los datos', 'error');
        }
        };

        loadInitialData();
    }, []);

    useEffect(() => {
        const loadClientes = async () => {
        try {
            setLoading(true);
            await fetchClientes(busqueda);
        } catch (err) {
            console.error(err);
            showToast(err.response?.data?.message || 'No se pudieron cargar los clientes', 'error');
        } finally {
            setLoading(false);
        }
        };

        loadClientes();
    }, [busqueda]);

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
        email: cliente.email || '',
        institucion_id: cliente.institucion_id || '',
        profesion_id: cliente.profesion_id || '',
        codigo_externo: cliente.codigo_externo || '',
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
        const payload = {
            nombre: form.nombre,
            apellido: form.apellido,
            telefono: form.telefono,
            email: form.email.trim() || null,
            institucion_id: Number(form.institucion_id),
            profesion_id: Number(form.profesion_id),
            codigo_externo: form.codigo_externo,
        };

        if (editingId) {
            await api.put(`/clientes/${editingId}`, payload);
            showToast('Cliente actualizado', 'success');
        } else {
            await api.post('/clientes', payload);
            showToast('Cliente creado', 'success');
        }

        resetForm();
        await recargarTodo();
        } catch (err) {
        console.error(err);
        showToast(err.response?.data?.message || 'No se pudo guardar el cliente', 'error');
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
                    <FormLabel htmlFor="telefono" required>Telefono</FormLabel>
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
                    <FormLabel htmlFor="email">Email</FormLabel>
                    <input
                    id="email"
                    type="email"
                    name="email"
                    className="form-control"
                    value={form.email}
                    onChange={handleChange}
                    />
                </div>

                <div className="col-md-6">
                    <FormLabel htmlFor="institucion_id" required>Institucion</FormLabel>
                    <select
                    id="institucion_id"
                    name="institucion_id"
                    className="form-select"
                    value={form.institucion_id}
                    onChange={handleChange}
                    required
                    >
                    <option value="">Seleccionar institucion</option>
                    {instituciones.map((inst) => (
                        <option key={inst.id} value={inst.id}>
                        {inst.nombre}
                        </option>
                    ))}
                    </select>
                </div>

                <div className="col-md-6">
                    <FormLabel htmlFor="profesion_id" required>Profesion</FormLabel>
                    <select
                    id="profesion_id"
                    name="profesion_id"
                    className="form-select"
                    value={form.profesion_id}
                    onChange={handleChange}
                    required
                    >
                    <option value="">Seleccionar profesion</option>
                    {profesiones.map((prof) => (
                        <option key={prof.id} value={prof.id}>
                        {prof.nombre}
                        </option>
                    ))}
                    </select>
                </div>

                <div className="col-md-6">
                    <FormLabel htmlFor="codigo_externo" required>Codigo Externo</FormLabel>
                    <input
                        type="text"
                        className="form-control"
                        name="codigo_externo"
                        value={form.codigo_externo || ''}
                        onChange={handleChange}
                    />
                    <small className="text-muted">
                        Identificador del sistema de facturacion
                    </small>
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
            <input
                type="text"
                className="form-control mb-3"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por nombre, telefono o codigo..."
            />

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
                        <th>Telefono</th>
                        <th>Email</th>
                        <th>Institucion</th>
                        <th>Profesion</th>
                        <th>Codigo externo</th>
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
                        <td>{cliente.email || '-'}</td>
                        <td>{getInstitucionNombre(cliente.institucion_id)}</td>
                        <td>{getProfesionNombre(cliente.profesion_id)}</td>
                        <td>{cliente.codigo_externo}</td>
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
