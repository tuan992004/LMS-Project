import { useState } from "react"
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import userService from "../../service/userService";

export default function AddUserForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullname: "",
    username: "",
    email: "",
    password: "",
    role: "student"
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async e => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await userService.addUser(form);
      toast.success('User added successfully!');
      navigate('/admin/users');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add user');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div style={{ padding: '3rem', minHeight: 'calc(100vh - 4rem)', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb' }}>
      <div style={{ backgroundColor: 'white', borderRadius: '1.5rem', padding: '3rem', width: '100%', maxWidth: '500px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
        <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#111827', marginBottom: '0.5rem', letterSpacing: '-0.025em' }}>Create New User</h2>
            <p style={{ color: '#6b7280', fontSize: '0.95rem' }}>Fill in the details below to add a new member to the system.</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
              <label style={labelStyle}>Full Name</label>
              <input name="fullname" placeholder="John Doe" onChange={handleChange} required style={inputStyle} />
          </div>
          <div>
              <label style={labelStyle}>Username</label>
              <input name="username" placeholder="johndoe123" onChange={handleChange} required style={inputStyle} />
          </div>
          <div>
              <label style={labelStyle}>Email Address</label>
              <input name="email" type="email" placeholder="john@example.com" onChange={handleChange} required style={inputStyle} />
          </div>
          <div>
              <label style={labelStyle}>Password</label>
              <input name="password" type="password" placeholder="••••••••" onChange={handleChange} required style={inputStyle} />
          </div>
          <div>
              <label style={labelStyle}>Role</label>
              <select name="role" onChange={handleChange} value={form.role} style={inputStyle}>
                <option value="student">Student</option>
                <option value="instructor">Instructor</option>
                <option value="admin">Admin</option>
              </select>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button
                  type="button"
                  onClick={() => navigate('/admin/users')}
                  style={{ flex: 1, padding: '0.875rem', borderRadius: '0.75rem', backgroundColor: '#f3f4f6', color: '#374151', fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.95rem' }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#e5e7eb'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#f3f4f6'}
              >
                  Cancel
              </button>
              <button 
                  type="submit" 
                  disabled={isLoading}
                  style={{ flex: 1, padding: '0.875rem', borderRadius: '0.75rem', backgroundColor: isLoading ? '#9ca3af' : '#111827', color: 'white', fontWeight: 600, border: 'none', cursor: isLoading ? 'not-allowed' : 'pointer', transition: 'all 0.2s', fontSize: '0.95rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  onMouseOver={(e) => { if (!isLoading) e.target.style.backgroundColor = '#000000'; }}
                  onMouseOut={(e) => { if (!isLoading) e.target.style.backgroundColor = '#111827'; }}
              >
                  {isLoading ? 'Creating...' : 'Create User'}
              </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const labelStyle = { display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: '#374151' };
const inputStyle = { width: '100%', padding: '0.875rem 1rem', borderRadius: '0.75rem', border: '1px solid #d1d5db', outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s', fontSize: '0.95rem', backgroundColor: '#f9fafb', color: '#111827' };
