import { useEffect, useState } from 'react';
import api from '../../api/axios';
import ClienteSelectorModal from '../../components/ClienteSelectorModal';
import FormLabel from '../../components/FormLabel';
import BackToDashboard from '../../components/BackToDashboard';

const initialForm = {
    email: '',
    password: '',
    rol: 'CLIENTE',
    cliente_id: '',
    activo: true,
};

function UsuariosPage() {
    const [usuarios, setUsuarios] = useState([]);
    const [clientes, setClientes] = useState([]);

    const [form, setForm] = useState(initialForm);
    const [editingId, setEditingId] = useState(null);

    const [showClienteModal, setShowClienteModal] = useState(false);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [mensaje, setMensaje] = useState('');

    const fetchUsuarios = async () => {
        const res = await api.get('/usuarios');
        setUsuarios(res.data || []);
    };

    const fetchClientes = async () => {
        const res = await api.get('/clientes');
        setClientes(res.data || []);
    };

    const recargarTodo = async () => {
        try {
        setLoading(true);
        await Promise.all([fetchUsuarios(), fetchClientes()]);
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
            await Promise.all([fetchUsuarios(), fetchClientes()]);
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
        const { name, value, type, checked } = e.target;

        const updatedForm = {
        ...form,
        [name]: type === 'checkbox' ? checked : value,
        };

        if (name === 'rol' && value !== 'CLIENTE') {
        updatedForm.cliente_id = '';
        }

        setForm(updatedForm);
    };

    const resetForm = () => {
        setEditingId(null);
        setForm(initialForm);
    };

    const handleEdit = (usuario) => {
        setEditingId(usuario.id);
        setForm({
        email: usuario.email || '',
        password: '',
        rol: usuario.rol || 'CLIENTE',
        cliente_id: usuario.cliente_id || '',
        activo: usuario.activo ?? true,
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
            email: form.email,
            rol: form.rol,
            cliente_id: form.rol === 'CLIENTE' ? Number(form.cliente_id) : null,
            activo: form.activo,
        };

        if (form.password) {
            payload.password = form.password;
        }

        if (editingId) {
            await api.put(`/usuarios/${editingId}`, payload);
            setMensaje('Usuario actualizado correctamente');
        } else {
            await api.post('/usuarios', payload);
            setMensaje('Usuario creado correctamente');
        }

        resetForm();
        await recargarTodo();
        } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'No se pudo guardar el usuario');
        }
    };

    const getClienteTexto = (clienteId) => {
        if (!clienteId) return '-';
        const cliente = clientes.find((c) => Number(c.id) === Number(clienteId));
        if (!cliente) return clienteId;
        return `${cliente.nombre} ${cliente.apellido}`;
    };

    const clienteSeleccionado = clientes.find(
        (c) => Number(c.id) === Number(form.cliente_id)
    );

    const clienteInputDisabled = form.rol !== 'CLIENTE';

    const handleSelectCliente = (cliente) => {
        setForm({
        ...form,
        cliente_id: cliente.id,
        });
        setShowClienteModal(false);
    };

    return (
        <div>
        <BackToDashboard />
        <h2 className="mb-4">Usuarios</h2>

        {error && <div className="alert alert-danger">{error}</div>}
        {mensaje && <div className="alert alert-success">{mensaje}</div>}

        <div className="card shadow-sm mb-4">
            <div className="card-body">
            <h5 className="mb-3">
                {editingId ? 'Editar usuario' : 'Crear usuario'}
            </h5>

            <form onSubmit={handleSubmit}>
                <div className="row g-3">
                <div className="col-md-6">
                    <FormLabel htmlFor="email" required>Email</FormLabel>
                    <input
                    id="email"
                    type="email"
                    name="email"
                    className="form-control"
                    value={form.email}
                    onChange={handleChange}
                    required
                    />
                </div>

                <div className="col-md-6">
                    <FormLabel htmlFor="password" required={!editingId}>
                    {editingId ? 'Nueva contraseña' : 'Contraseña'}
                    </FormLabel>
                    <input
                    id="password"
                    type="password"
                    name="password"
                    className="form-control"
                    value={form.password}
                    onChange={handleChange}
                    required={!editingId}
                    />
                </div>

                <div className="col-md-4">
                    <FormLabel htmlFor="rol" required>Rol</FormLabel>
                    <select
                    id="rol"
                    name="rol"
                    className="form-select"
                    value={form.rol}
                    onChange={handleChange}
                    required
                    >
                    <option value="ADMIN">ADMIN</option>
                    <option value="VENDEDOR">VENDEDOR</option>
                    <option value="CLIENTE">CLIENTE</option>
                    </select>
                </div>

                <div className="col-md-4">
                    <FormLabel htmlFor="cliente_id" required={form.rol === 'CLIENTE'}>
                    Cliente ID
                    </FormLabel>
                    <div className="input-group">
                    <input
                        id="cliente_id"
                        type="number"
                        name="cliente_id"
                        className="form-control"
                        value={form.cliente_id}
                        onChange={handleChange}
                        disabled={clienteInputDisabled}
                        required={form.rol === 'CLIENTE'}
                    />
                    <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setShowClienteModal(true)}
                        disabled={clienteInputDisabled}
                    >
                        Buscar
                    </button>
                    </div>

                    {form.rol === 'CLIENTE' && clienteSeleccionado && (
                    <div className="form-text">
                        Seleccionado: {clienteSeleccionado.nombre} {clienteSeleccionado.apellido}
                    </div>
                    )}
                </div>

                <div className="col-md-4 d-flex align-items-end">
                    <div className="form-check mb-2">
                    <input
                        type="checkbox"
                        name="activo"
                        className="form-check-input"
                        checked={form.activo}
                        onChange={handleChange}
                        id="activoUsuario"
                    />
                    <label htmlFor="activoUsuario" className="form-check-label">
                        Activo
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

        <div className="card shadow-sm">
            <div className="card-body">
            <h5 className="mb-3">Listado de usuarios</h5>

            {loading ? (
                <p>Cargando...</p>
            ) : usuarios.length === 0 ? (
                <p className="text-muted mb-0">No hay usuarios cargados.</p>
            ) : (
                <div className="table-responsive">
                <table className="table align-middle">
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>Email</th>
                        <th>Rol</th>
                        <th>Cliente</th>
                        <th>Activo</th>
                        <th>Acciones</th>
                    </tr>
                    </thead>
                    <tbody>
                    {usuarios.map((usuario) => (
                        <tr key={usuario.id}>
                        <td>{usuario.id}</td>
                        <td>{usuario.email}</td>
                        <td>{usuario.rol}</td>
                        <td>{getClienteTexto(usuario.cliente_id)}</td>
                        <td>{usuario.activo ? 'Sí' : 'No'}</td>
                        <td>
                            <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleEdit(usuario)}
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

        <ClienteSelectorModal
            show={showClienteModal}
            onClose={() => setShowClienteModal(false)}
            onSelect={handleSelectCliente}
        />
        </div>
    );
}

export default UsuariosPage;