import { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/userAuthStore';
import { api } from '../../lib/axios';

export const AdminDashboard = () => {
    const user = useAuthStore((s) => s.user);
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalCourses: 0
    });

    useEffect(() => {
    const fetchStats = async () => {
        try {
            const [usersRes, coursesRes] = await Promise.all([
                api.get("/users"),
                api.get("/courses") // API này nên trả về danh sách tất cả courses
            ]);
            
            setStats({
                totalUsers: usersRes.data.length,
                totalCourses: coursesRes.data.length
            });
        } catch (error) {
            console.error("Failed to fetch stats", error);
        }
    };
    fetchStats();
}, []);

    return (
        <div style={{ padding: '3rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827', marginBottom: '1rem' }}>
                Dashboard
            </h2>
            <p style={{ color: '#4b5563', marginBottom: '2rem' }}>
                Welcome back, {user?.fullname || 'Admin'}.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
                    <h3 style={{ fontSize: '0.875rem', color: '#6b7280', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Total Users</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827' }}>{stats.totalUsers}</p>
                </div>
                <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
                    <h3 style={{ fontSize: '0.875rem', color: '#6b7280', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Total Courses</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827' }}>--</p>
                </div>
            </div>
        </div>
    );
};