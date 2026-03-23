import React, { useState, useEffect } from 'react';
import { api } from '../../lib/axios';
import { useNavigate } from 'react-router-dom';

export const StudentCourses = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        api.get("/courses/my-enrolled")
           .then(res => {
               setCourses(res.data);
               setLoading(false);
           })
           .catch(err => {
               console.error(err);
               setLoading(false);
           });
    }, []);

    return (
        <div style={{ padding: '3rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>
                My Courses
            </h2>
            <p style={{ color: '#4b5563', marginBottom: '3rem' }}>
                Continue learning where you left off.
            </p>

            {loading ? (
                <p style={{ color: '#111827' }}>Đang tải danh sách...</p>
            ) : courses.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
                    {courses.map(course => (
                            <div 
                                key={course.courseid || course.id} 
                                style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', cursor: 'pointer' }}
                                onClick={() => navigate(`/student/course/${course.courseid || course.id}`)} 
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <span style={{ padding: '0.25rem 0.6rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', backgroundColor: '#e0e7ff', color: '#3730a3' }}>
                                    Enrolled
                                </span>
                            </div>
                            <h4 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>{course.title}</h4>
                            <p style={{ fontSize: '0.875rem', color: '#4b5563', marginBottom: '1.5rem' }}>
                                {course.description || "A comprehensive course designed to improve your knowledge."}
                            </p>
                            
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', fontWeight: 'bold', color: '#4b5563', marginTop: 'auto' }}>
                                <span>Progress</span>
                                <span>0%</span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ backgroundColor: 'white', padding: '3rem', borderRadius: '1rem', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '1rem' }}>No Courses Found</h3>
                    <p style={{ color: '#4b5563' }}>
                        You are not currently enrolled in any courses. Check out the available courses and start learning today!
                    </p>
                </div>
            )}
        </div>
    );
};
