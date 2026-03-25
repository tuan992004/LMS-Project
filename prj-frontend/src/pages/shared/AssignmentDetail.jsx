import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../lib/axios';
import { useAuthStore } from '../../stores/userAuthStore';
import { toast } from 'sonner';
import { ArrowLeft, CheckCircle, FileText, Upload, Clock, GraduationCap, X, ChevronRight, File } from 'lucide-react';

export const AssignmentDetail = () => {
    const { assignment_id } = useParams();
    const { user } = useAuthStore();
    const navigate = useNavigate();

    const [assignment, setAssignment] = useState(null);
    const [loading, setLoading] = useState(true);

    // STUDENT STATE
    const [mySubmission, setMySubmission] = useState(null);
    const [submitContent, setSubmitContent] = useState("");
    const [submitFile, setSubmitFile] = useState(null);

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
            if (isStudent) {
                const subRes = await api.get(`/assignments/${assignment_id}/my-submission`);
                setMySubmission(subRes.data);
                if (subRes.data) {
                    setSubmitContent(subRes.data.content || "");
                }
            } else {
                const subsRes = await api.get(`/assignments/${assignment_id}/submissions`);
                setAllSubmissions(subsRes.data);
            }
        } catch (error) {
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

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <Loader2 className="h-12 w-12 animate-spin text-[var(--accent-primary)] mb-4" />
            <p className="text-[var(--text-secondary)] font-bold animate-pulse">Đang tải dữ liệu bài tập...</p>
        </div>
    );

    return (
        <div className="p-8 max-w-5xl mx-auto min-h-screen">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-bold mb-8 transition-colors group"
            >
                <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" /> 
                Quay lại
            </button>

            <header className="glass-card p-10 mb-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent-primary)] opacity-[0.03] rounded-full -mr-32 -mt-32"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 rounded-2xl bg-[var(--accent-primary)] text-white shadow-lg shadow-indigo-500/20">
                            <FileText className="h-8 w-8" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-[var(--text-primary)] tracking-tight">Quản lý bài tập</h1>
                            <p className="text-[var(--text-secondary)] font-medium mt-1">Hệ thống quản lý nộp bài và chấm điểm trực tuyến.</p>
                        </div>
                    </div>
                </div>
            </header>

            {isStudent ? (
                // STUDENT VIEW
                <div className="glass-card p-10">
                    <div className="flex items-center gap-3 mb-8 border-b border-[var(--border-color)] pb-4">
                        <GraduationCap className="h-6 w-6 text-[var(--accent-primary)]" />
                        <h2 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">Trạng thái bài làm</h2>
                    </div>

                    {mySubmission?.status === 'graded' ? (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 p-8 rounded-[2rem] mb-10 flex flex-col md:flex-row gap-8 items-start md:items-center">
                            <div className="flex-1">
                                <h3 className="text-emerald-500 font-black uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4" /> Bài làm đã được chấm điểm
                                </h3>
                                <div className="flex items-baseline gap-2 mb-2">
                                    <span className="text-6xl font-black text-[var(--text-primary)] tracking-tighter">{mySubmission.grade}</span>
                                    <span className="text-[var(--text-secondary)] font-bold">/ 100</span>
                                </div>
                                <p className="text-[var(--text-secondary)] font-medium italic">
                                    " {mySubmission.feedback || "Không có nhận xét chi tiết."} "
                                </p>
                            </div>
                            {mySubmission.file_url && (
                                <a 
                                    href={mySubmission.file_url} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    className="bg-white/50 hover:bg-white/80 px-6 py-4 rounded-2xl border border-emerald-500/20 flex items-center gap-3 text-emerald-600 font-bold transition-all shadow-sm active:scale-95"
                                >
                                    <File className="h-5 w-5" /> Tải / Xem Phụ Lục
                                </a>
                            )}
                        </div>
                    ) : mySubmission?.status === 'submitted' ? (
                        <div className="bg-amber-500/10 border border-amber-500/20 p-8 rounded-[2rem] mb-10 flex items-center gap-4">
                            <Clock className="h-8 w-8 text-amber-500" />
                            <div>
                                <h3 className="text-amber-600 font-black uppercase tracking-widest text-xs">Đã nộp bài</h3>
                                <p className="text-[var(--text-secondary)] font-medium">Đang chờ giảng viên chấm điểm. Bạn vẫn có thể nộp lại nếu cần.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] p-8 rounded-[2rem] mb-10 flex items-center gap-4">
                            <FileText className="h-8 w-8 text-[var(--text-secondary)] opacity-40" />
                            <div>
                                <h3 className="text-[var(--text-secondary)] font-black uppercase tracking-widest text-xs">Chưa nộp bài</h3>
                                <p className="text-[var(--text-secondary)] font-medium">Hạn nộp đang đến gần, vui lòng hoàn thành bài làm sớm.</p>
                            </div>
                        </div>
                    )}

                    {!mySubmission || mySubmission.status === 'submitted' ? (
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 mb-4">
                                <h3 className="text-xl font-bold text-[var(--text-primary)]">{mySubmission ? 'Cập nhật bài làm' : 'Nộp bài mới'}</h3>
                                <div className="h-px flex-1 bg-[var(--border-color)]"></div>
                            </div>
                            
                            <div className="space-y-4">
                                <label className="block text-xs font-black uppercase tracking-widest text-[var(--text-secondary)]">Nội dung / Ghi chú</label>
                                <textarea
                                    value={submitContent}
                                    onChange={(e) => setSubmitContent(e.target.value)}
                                    placeholder="Nhập vào nội dung bài làm hoặc ghi chú cho giảng viên..."
                                    className="w-full h-48 px-6 py-4 rounded-3xl border border-[var(--border-color)] bg-white/40 focus:bg-white/60 focus:ring-2 focus:ring-[var(--accent-primary)] outline-none transition-all text-[var(--text-primary)] font-medium resize-none"
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="block text-xs font-black uppercase tracking-widest text-[var(--text-secondary)]">File đính kèm</label>
                                <div className="relative group">
                                    <input
                                        type="file"
                                        onChange={(e) => setSubmitFile(e.target.files[0])}
                                        className="w-full px-6 py-12 rounded-3xl border-2 border-dashed border-[var(--border-color)] bg-white/20 hover:bg-white/40 transition-all cursor-pointer text-[var(--text-secondary)] font-bold text-center file:hidden"
                                    />
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity">
                                        <Upload className="h-8 w-8 mb-2 text-[var(--accent-primary)]" />
                                        <span className="text-sm">{submitFile ? submitFile.name : 'Nhấp hoặc kéo thả file vào đây'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <button
                                    onClick={handleStudentSubmit}
                                    className="bg-[var(--text-primary)] text-[var(--bg-primary)] px-12 py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:opacity-90 transition-all shadow-2xl active:scale-95 flex items-center gap-2"
                                >
                                    <Upload className="h-5 w-5" />
                                    {mySubmission ? 'Nộp lại bài' : 'Nộp bài ngay'}
                                </button>
                            </div>
                        </div>
                    ) : null}
                </div>
            ) : (
                // INSTRUCTOR VIEW
                <div className="glass-card p-0 overflow-hidden shadow-2xl">
                    <div className="p-8 border-b border-[var(--border-color)] bg-white/30 backdrop-blur-md flex justify-between items-center">
                        <h2 className="text-2xl font-black text-[var(--text-primary)] tracking-tight flex items-center gap-3">
                            <FileText className="h-6 w-6 text-[var(--accent-primary)]" />
                            Danh sách bài nộp
                        </h2>
                        <span className="px-4 py-1.5 rounded-full bg-[var(--text-primary)] text-[var(--bg-primary)] text-xs font-black tracking-widest uppercase shadow-lg">
                            {allSubmissions.length} submissions
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)]">
                                    <th className="px-8 py-5 text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest">Sinh viên</th>
                                    <th className="px-8 py-5 text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest">Trạng thái</th>
                                    <th className="px-8 py-5 text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest">Điểm số</th>
                                    <th className="px-8 py-5 text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest text-right">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border-color)]">
                                {allSubmissions.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-8 py-20 text-center">
                                            <FileText className="h-12 w-12 text-[var(--text-secondary)] opacity-10 mx-auto mb-4" />
                                            <p className="text-[var(--text-secondary)] font-bold uppercase tracking-widest text-sm">Chưa có sinh viên nào nộp bài</p>
                                        </td>
                                    </tr>
                                ) : (
                                    allSubmissions.map(sub => (
                                        <tr key={sub.id} className="hover:bg-white/40 transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] flex items-center justify-center font-black text-sm">
                                                        {sub.fullname.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors">{sub.fullname}</div>
                                                        <div className="text-[10px] text-[var(--text-secondary)] font-mono">{sub.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`
                                                    px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase border
                                                    ${sub.status === 'graded' 
                                                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                                                        : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}
                                                `}>
                                                    {sub.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 font-black text-[var(--text-primary)]">
                                                {sub.grade !== null ? (
                                                    <div className="flex items-baseline gap-1">
                                                        <span className="text-xl">{sub.grade}</span>
                                                        <span className="text-[10px] text-[var(--text-secondary)]">/ 100</span>
                                                    </div>
                                                ) : <span className="text-[var(--text-secondary)] opacity-30 italic">--</span>}
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <button
                                                    onClick={() => {
                                                        setGradingTarget(sub);
                                                        setGradeScore(sub.grade || "");
                                                        setGradeFeedback(sub.feedback || "");
                                                    }}
                                                    className="px-6 py-2.5 rounded-xl bg-[var(--bg-secondary)] text-[var(--text-primary)] font-bold text-xs uppercase tracking-widest hover:bg-[var(--text-primary)] hover:text-white transition-all shadow-sm active:scale-95"
                                                >
                                                    Chấm điểm
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Grading Modal */}
            {gradingTarget && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="glass-card p-10 w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl relative animate-in zoom-in-95 duration-200">
                        <button 
                            onClick={() => setGradingTarget(null)}
                            className="absolute right-8 top-8 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                        >
                            <X className="h-6 w-6" />
                        </button>

                        <div className="mb-8 pr-12">
                            <h3 className="text-3xl font-black text-[var(--text-primary)] tracking-tight mb-2">Chấm điểm bài làm</h3>
                            <p className="text-[var(--text-secondary)] font-medium">Sinh viên: <span className="text-[var(--text-primary)] font-bold">{gradingTarget.fullname}</span></p>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-8 pr-2 custom-scrollbar">
                            <div className="space-y-4">
                                <label className="block text-xs font-black uppercase tracking-widest text-[var(--text-secondary)]">Nội dung bài làm</label>
                                <div className="bg-white/30 border border-[var(--border-color)] p-6 rounded-3xl backdrop-blur-sm relative">
                                    <p className="text-[var(--text-primary)] font-medium leading-relaxed whitespace-pre-wrap">
                                        {gradingTarget.content || "Không có nội dung text đi kèm."}
                                    </p>
                                    {gradingTarget.file_url && (
                                        <div className="mt-6 pt-6 border-t border-[var(--border-color)]">
                                            <a 
                                                href={gradingTarget.file_url} 
                                                target="_blank" 
                                                rel="noreferrer" 
                                                className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-[var(--accent-primary)] text-white font-bold transition-all shadow-lg shadow-indigo-500/20 active:scale-95 hover:brightness-110"
                                            >
                                                <FileText className="h-5 w-5" /> Xem File Đính Kèm
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                                <div className="md:col-span-1">
                                    <label className="block text-xs font-black uppercase tracking-widest text-[var(--text-secondary)] mb-4">Điểm số</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={gradeScore}
                                            onChange={(e) => setGradeScore(e.target.value)}
                                            placeholder="0"
                                            className="w-full px-6 py-4 rounded-2xl border border-[var(--border-color)] bg-white/40 focus:bg-white/60 focus:ring-2 focus:ring-[var(--accent-primary)] outline-none transition-all text-2xl font-black text-[var(--text-primary)] text-center"
                                        />
                                        <div className="absolute top-1/2 -right-4 -translate-y-1/2 text-xs font-bold text-[var(--text-secondary)]">/ 100</div>
                                    </div>
                                </div>
                                <div className="md:col-span-3">
                                    <label className="block text-xs font-black uppercase tracking-widest text-[var(--text-secondary)] mb-4">Nhận xét giảng viên</label>
                                    <textarea
                                        value={gradeFeedback}
                                        onChange={(e) => setGradeFeedback(e.target.value)}
                                        placeholder="Nhập vào lời khuyên hoặc góp ý cho sinh viên..."
                                        className="w-full h-32 px-6 py-4 rounded-2xl border border-[var(--border-color)] bg-white/40 focus:bg-white/60 focus:ring-2 focus:ring-[var(--accent-primary)] outline-none transition-all text-[var(--text-primary)] font-medium resize-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 pt-10 border-t border-[var(--border-color)] mt-8">
                            <button 
                                onClick={() => setGradingTarget(null)} 
                                className="flex-1 py-4 rounded-2xl bg-[var(--bg-secondary)] text-[var(--text-primary)] font-bold uppercase tracking-widest text-xs transition-all active:scale-95"
                            >
                                Hủy bỏ
                            </button>
                            <button 
                                onClick={handleInstructorGrade} 
                                className="flex-[2] py-4 rounded-2xl bg-[var(--text-primary)] text-[var(--bg-primary)] font-bold uppercase tracking-widest text-xs transition-all shadow-xl active:scale-95 hover:opacity-90 flex items-center justify-center gap-2"
                            >
                                <CheckCircle className="h-5 w-5" /> Lưu điểm số
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const Loader2 = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4"/><path d="m16.2 7.8 2.9-2.9"/><path d="M18 12h4"/><path d="m16.2 16.2 2.9 2.9"/><path d="M12 18v4"/><path d="m4.9 19.1 2.9-2.9"/><path d="M2 12h4"/><path d="m4.9 4.9 2.9 2.9"/></svg>
);
