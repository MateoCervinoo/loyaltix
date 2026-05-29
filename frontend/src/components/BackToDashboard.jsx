import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';

function BackToDashboard() {
    const { usuario } = useAuth();
    const navigate = useNavigate();

    if (!usuario) return null;

    // Map roles to dashboard route
    let dashboardRoute = '/';
    switch (usuario.rol) {
      case 'ADMIN':
        dashboardRoute = '/admin';
        break;
      case 'VENDEDOR':
        dashboardRoute = '/vendedor';
        break;
      case 'CLIENTE':
        dashboardRoute = '/cliente';
        break;
      default:
        dashboardRoute = '/';
    }

    // Consistent button content
    return (
      <div className="mb-3">
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm"
          style={{fontWeight:500, display:'inline-flex', alignItems:'center', gap:'.5em'}}
          onClick={() => navigate(dashboardRoute)}
        >
          <span aria-hidden="true" style={{fontSize:'1.2em', lineHeight:1}}>←</span> Volver al Dashboard
        </button>
      </div>
    );
}

export default BackToDashboard;
