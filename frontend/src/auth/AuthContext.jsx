import { createContext, useState } from 'react';

const AuthContext = createContext();

function AuthProvider({ children }) {
    const [token, setToken] = useState(() => localStorage.getItem('token'));
    const [usuario, setUsuario] = useState(() => {
        const savedUsuario = localStorage.getItem('usuario');
        return savedUsuario ? JSON.parse(savedUsuario) : null;
    });

    const login = ({ token, usuario }) => {
        localStorage.setItem('token', token);
        localStorage.setItem('usuario', JSON.stringify(usuario));
        setToken(token);
        setUsuario(usuario);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        setToken(null);
        setUsuario(null);
    };

    return (
        <AuthContext.Provider value={{ token, usuario, login, logout }}>
        {children}
        </AuthContext.Provider>
    );
}

export { AuthContext, AuthProvider };