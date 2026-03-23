import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../lib/axios';
import { useAuthStore } from '../../stores/userAuthStore';
import { toast } from 'sonner';
import { ArrowLeft, CheckCircle, FileText, Upload } from 'lucide-react';

export const AssignmentDetail = () => {
    const { assignment_id } = useParams();
    const { user } = useAuthStore();
    const navigate = useNavigate();

    const [assignment, setAssignment] = useState(null);
    const [loading, setLoading] = useState(true);

    // STUDENT STATE
    const [mySubmission, setMySubmission] = useState(null);
    const [submitContent, setSubmitContent] = useState("");
    const [submitFile, setSubmitFile] = useState("");

    // INSTRUCTOR STATE
    const [allSubmissions, setAllSubmissions] = useState([]);
    const [gradingTarget, setGradingTarget] = useState(null);
    const [gradeScore, setGradeScore] = useState("");
    const [gradeFeedback, setGradeFeedback] = useState("");

    const isStudent = user?.role === 'student';

    useEffect(() => {
        fetchAssignmentData();
    }, [assignment_id]);

    const fetchAssignmentData = async () => {
        try {
            // Unluckily the API doesn't have a get single assignment endpoint currently
            // So we fetch all for the course and find it OR we could add a new endpoint.
            // Wait, we don't have course_id in the URL if it's just /assignment/:id
            // Let me fetch submissions and infer it, or we need a quick endpoint.
            // Since we don't have `api.get('/assignments/:id')`, let's just create it on backend or pass state.
            // FOR NOW: just fetching submissions. If instructor, fetch all. If student, fetch mine.
            
            if (isStudent) {
                const subRes = await api.get(`/assignments/${assignment_id}/my-submission`);
                setMySubmission(subRes.data);
                if (subRes.data) {
                    setSubmitContent(subRes.data.content);
                    setSubmitFile(subRes.data.file_url);
                }
            } else {
                const subsRes = await api.get(`/assignments/${assignment_id}/submissions`);
                setAllSubmissions(subsRes.data);
            }
        } catch (error) {
            // 404 is fine for my-submission if not submitted yet
            if (error.response?.status !== 404) {
                toast.error("Lỗi khi tải dữ liệu bài tập");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleStudentSubmit = async () => {
        if (!submitContent && !submitFile) {
            toast.error("Vui lòng nhập nội dung hoặc đính kèm link bài làm.");
            return;
        }
        try {
            const formData = new FormData();
            formData.append('content', submitContent);
            if (submitFile) formData.append('file', submitFile);

            await api.post(`/assignments/${assignment_id}/submit`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            toast.success("Nộp bài thành công!");
            fetchAssignmentData();
        } catch (e) {
            toast.error("Lỗi nộp bài");
        }
    };

    const handleInstructorGrade = async () => {
        if (!gradeScore) {
            toast.error("Vui lòng nhập điểm.");
            return;
        }
        try {
            await api.patch(`/assignments/submissions/${gradingTarget.id}/grade`, {
                grade: gradeScore,
                feedback: gradeFeedback
            });
            toast.success("Đã chấm điểm thành công!");
            setGradingTarget(null);
            setGradeScore("");
            setGradeFeedback("");
            fetchAssignmentData();
        } catch (e) {
            toast.error("Lỗi khi chấm điểm");
        }
    };

    if (loading) return <div style={{ padding: '3rem' }}>Đang tải...</div>;

    return (
        <div style={{ padding: '3rem', maxWidth: '1000px', margin: '0 auto', color: 'black' }}>
            <button 
                onClick={() => navigate(-1)} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', fontWeight: 'bold' }}
            >
                <ArrowLeft size={18} /> Quay lại
            </button>

            <header style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '1rem', border: '1px solid #e5e7eb', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <FileText size={28} /> Quản lý bài tập
                </h1>
                <p style={{ color: '#4b5563' }}>Vui lòng kiểm tra kỹ yêu cầu trước khi thao tác.</p>
            </header>

            {isStudent ? (
                // STUDENT VIEW
                <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '1rem', border: '1px solid #e5e7eb' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Trạng thái nộp bài</h2>
                    
                    {mySubmission?.status === 'graded' ? (
                        <div style={{ backgroundColor: '#f0fdf4', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid #bbf7d0', marginBottom: '2rem' }}>
                            <h3 style={{ color: '#166534', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                <CheckCircle size={20} /> Bài làm đã được chấm điểm!
                            </h3>
                            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827', margin: '0 0 0.5rem 0' }}>{mySubmission.grade} / 100</p>
                            <p style={{ color: '#4b5563', margin: 0 }}><strong>Nhận xét:</strong> {mySubmission.feedback || "Không có nhận xét."}</p>
                            {mySubmission.file_url && (
                                <a href={mySubmission.file_url} target="_blank" rel="noreferrer" style={{ display: 'inline-block', marginTop: '1rem', color: '#166534', fontWeight: 'bold', textDecoration: 'underline' }}>
                                    <FileText size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }}/> Tải / Xem Phụ Lục Bài Làm
                                </a>
                            )}
                        </div>
                    ) : mySubmission?.status === 'submitted' ? (
                        <div style={{ backgroundColor: '#fefce8', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #fef08a', color: '#854d0e', marginBottom: '2rem' }}>
                            Đã nộp bài. Đang chờ giảng viên chấm điểm...
                        </div>
                    ) : (
                        <div style={{ backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb', color: '#4b5563', marginBottom: '2rem' }}>
                            Chưa nộp bài.
                        </div>
                    )}

                    {!mySubmission || mySubmission.status === 'submitted' ? (
                        <div>
                            <h3 style={{ marginBottom: '1rem' }}>{mySubmission ? 'Cập nhật bài làm' : 'Nộp bài mới'}</h3>
                            <textarea 
                                value={submitContent}
                                onChange={(e) => setSubmitContent(e.target.value)}
                                placeholder="Nhập vào nội dung bài làm hoặc ghi chú cho giảng viên..."
                                style={{ width: '100%', height: '150px', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #d1d5db', marginBottom: '1rem', resize: 'vertical' }}
                            />
                            <input 
                                type="file"
                                onChange={(e) => setSubmitFile(e.target.files[0])}
                                style={{ width: '100%', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #d1d5db', backgroundColor: '#f9fafb', marginBottom: '1.5rem' }}
                            />
                            <button 
                                onClick={handleStudentSubmit}
                                style={{ backgroundColor: 'black', color: 'white', padding: '0.75rem 2rem', borderRadius: '0.5rem', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
                            >
                                <Upload size={18} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} /> 
                                {mySubmission ? 'Nộp lại bài' : 'Nộp bài'}
                            </button>
                        </div>
                    ) : null}
                </div>
            ) : (
                // INSTRUCTOR VIEW
                <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '1rem', border: '1px solid #e5e7eb' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Danh sách bài nộp ({allSubmissions.length})</h2>
                    
                    {allSubmissions.length === 0 ? (
                        <p style={{ color: '#6b7280' }}>Chưa có sinh viên nào nộp bài.</p>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                                    <th style={{ padding: '1rem', color: '#6b7280' }}>Sinh viên</th>
                                    <th style={{ padding: '1rem', color: '#6b7280' }}>Trạng thái</th>
                                    <th style={{ padding: '1rem', color: '#6b7280' }}>Điểm</th>
                                    <th style={{ padding: '1rem', color: '#6b7280', textAlign: 'right' }}>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allSubmissions.map(sub => (
                                    <tr key={sub.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ fontWeight: 'bold' }}>{sub.fullname}</div>
                                            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{sub.email}</div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{
                                                padding: '4px 12px',
                                                borderRadius: '999px',
                                                fontSize: '0.75rem',
                                                fontWeight: 'bold',
                                                backgroundColor: sub.status === 'graded' ? '#dcfce7' : '#fef9c3',
                                                color: sub.status === 'graded' ? '#166534' : '#854d0e'
                                            }}>
                                                {sub.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem', fontWeight: 'bold' }}>
                                            {sub.grade !== null ? `${sub.grade}/100` : '-'}
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                                            <button 
                                                onClick={() => {
                                                    setGradingTarget(sub);
                                                    setGradeScore(sub.grade || "");
                                                    setGradeFeedback(sub.feedback || "");
                                                }}
                                                style={{ color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                                            >
                                                Xem & Chấm điểm
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* Grading Modal */}
            {gradingTarget && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                    <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '1rem', width: '500px', maxWidth: '90%' }}>
                        <h2 style={{ marginBottom: '1rem' }}>Chấm điểm: {gradingTarget.fullname}</h2>
                        
                        <div style={{ backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', maxHeight: '200px', overflowY: 'auto' }}>
                            <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>Nội dung bài làm:</p>
                            <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{gradingTarget.content || "Không có nội dung text."}</p>
                            {gradingTarget.file_url && (
                                <a href={gradingTarget.file_url} target="_blank" rel="noreferrer" style={{ display: 'inline-block', marginTop: '1rem', color: '#2563eb', fontWeight: 'bold' }}>
                                    <FileText size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }}/> Tải File Đính Kèm
                                </a>
                            )}
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Điểm (0-100):</label>
                            <input 
                                type="number" 
                                value={gradeScore} 
                                onChange={(e) => setGradeScore(e.target.value)} 
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #d1d5db' }}
                            />
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Nhận xét:</label>
                            <textarea 
                                value={gradeFeedback} 
                                onChange={(e) => setGradeFeedback(e.target.value)} 
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #d1d5db', height: '100px' }}
                            />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                            <button onClick={() => setGradingTarget(null)} style={{ padding: '0.75rem 1.5rem', borderRadius: '0.5rem', border: '1px solid #d1d5db', background: 'white', cursor: 'pointer' }}>Hủy</button>
                            <button onClick={handleInstructorGrade} style={{ padding: '0.75rem 1.5rem', borderRadius: '0.5rem', border: 'none', background: 'black', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>Lưu điểm</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
