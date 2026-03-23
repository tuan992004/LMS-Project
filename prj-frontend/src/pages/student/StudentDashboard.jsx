import { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/userAuthStore';
import { api } from '../../lib/axios';
import { useNavigate } from 'react-router-dom';

export const StudentDashboard = () => {
    const user = useAuthStore((s) => s.user);
    const [courses, setCourses] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        api.get("/courses/my-enrolled")
           .then(res => setCourses(res.data))
           .catch(err => console.error(err));
    }, []);

    const completedLessons = 12; // Placeholder for now

    return (
        <div style={{ padding: '3rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827', marginBottom: '1rem' }}>
                My Learning Dashboard
            </h2>
            <p style={{ color: '#4b5563', marginBottom: '2rem' }}>
                Welcome back, {user?.fullname}. Let's continue your learning journey.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
                    <h3 style={{ fontSize: '0.875rem', color: '#6b7280', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Enrolled Courses</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827' }}>{courses.length}</p>
                </div>
                <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
                    <h3 style={{ fontSize: '0.875rem', color: '#6b7280', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Completed Lessons</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827' }}>{completedLessons}</p>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '3rem', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>Recent Courses</h3>
                <button 
                    onClick={() => navigate("/student/courses")}
                    style={{ backgroundColor: 'transparent', color: '#3b82f6', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    View All
                </button>
            </div>
            
            {courses.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
                    {courses.slice(0, 3).map((course) => (
                        <div 
                            key={course.courseid || course.id} 
                            style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', cursor: 'pointer' }}
                            onClick={() => navigate(`/course/${course.courseid || course.id}/lesson/new`)} /* Assuming student accesses lesson similarly */
                        >
                            <h4 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>{course.title}</h4>
                            <p style={{ fontSize: '0.875rem', color: '#4b5563', marginBottom: '1rem' }}>
                                {course.description || "A comprehensive course designed to improve your knowledge."}
                            </p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#4b5563' }}>PROGRESS: 35%</span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p style={{ color: '#6b7280' }}>You haven't enrolled in any courses yet.</p>
            )}
        </div>
    );
};