import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../auth/useAuth';

function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [form, setForm] = useState({
        email: '',
        password: '',
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({
        ...form,
        [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
        const response = await api.post('/auth/login', form);

        const { token, usuario } = response.data;

        login({ token, usuario });

        if (usuario.rol === 'ADMIN' || usuario.rol === 'VENDEDOR') {
            navigate('/dashboard');
        } else if (usuario.rol === 'CLIENTE') {
            navigate('/mi-cuenta');
        } else {
            navigate('/login');
        }
        } catch (err) {
        console.error(err);

        setError(
            err.response?.data?.message || 'No se pudo iniciar sesión'
        );
        } finally {
        setLoading(false);
        }
    };

    return (
        <div className="row justify-content-center">
        <div className="col-md-4">
            <div className="card p-4 shadow-sm">
            <h3 className="mb-3">Iniciar sesión</h3>

            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                    type="email"
                    name="email"
                    className="form-control"
                    value={form.email}
                    onChange={handleChange}
                    required
                />
                </div>

                <div className="mb-3">
                <label className="form-label">Contraseña</label>
                <input
                    type="password"
                    name="password"
                    className="form-control"
                    value={form.password}
                    onChange={handleChange}
                    required
                />
                </div>

                {error && (
                <div className="alert alert-danger py-2" role="alert">
                    {error}
                </div>
                )}

                <button
                type="submit"
                className="btn btn-primary w-100"
                disabled={loading}
                >
                {loading ? 'Ingresando...' : 'Ingresar'}
                </button>
            </form>
            </div>
        </div>
        </div>
    );
}

export default LoginPage;