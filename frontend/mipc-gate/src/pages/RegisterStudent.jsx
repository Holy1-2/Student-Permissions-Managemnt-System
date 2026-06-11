import { useState, useEffect } from 'react';
import { UserPlus, ShieldCheck, Loader2, CreditCard, Trash2, Edit2, X, Save, Users } from 'lucide-react';
// Assuming these helper endpoints are exported alongside registerNewStudent in your api.js file
import { registerNewStudent, getAllStudents, updateStudent, deleteStudent } from '../lib/api';

const RegisterStudent = () => {
  // --- Form State ---
  const [formData, setFormData] = useState({ name: '', combination: 'SOD', class_level: 'Level 5', rfid_card_number: '' });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  // --- Student Data Table States ---
  const [students, setStudents] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [editRowId, setEditRowId] = useState(null);
  const [editFormData, setEditFormData] = useState({ name: '', combination: '', class_level: '', rfid_card_number: '' });

  // Load students from database on component mount
  useEffect(() => {
    fetchStudentsList();
  }, []);

  const fetchStudentsList = async () => {
    setTableLoading(true);
    try {
      // Expecting an array directly or structured data property wrapper
      const data = await getAllStudents();
      setStudents(data.students || data.data || data || []);
    } catch (err) {
      console.error("Kunanirwa gushaka abanyeshuri:", err);
    } finally {
      setTableLoading(false);
    }
  };

  // --- Create Action ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const data = await registerNewStudent(formData);
      setStatus({ type: 'success', msg: `Byahuye! Umunyeshuri yanditswe neza.` });
      setFormData({ name: '', combination: 'SOD', class_level: 'Level 5', rfid_card_number: '' });
      fetchStudentsList(); // Refresh list immediately
    } catch (err) {
      setStatus({ type: 'error', msg: err.response?.data?.message || err.message || 'Haza ikibazo mukubika.' });
    } finally {
      setLoading(false);
    }
  };

  // --- Delete Action ---
  const handleDelete = async (id) => {
    if (!window.confirm("Murifuza gusiba uyu munyeshuri burundu?")) return;
    try {
      await deleteStudent(id);
      // Optimistically clean UI array list mapping state
      setStudents(students.filter(student => (student.id !== id && student.student_id !== id)));
    } catch (err) {
      alert(err.response?.data?.message || "Gusiba umunyeshuri b yanze.");
    }
  };

  // --- Inline Edit Setup Trigger ---
  const handleEditClick = (student) => {
    const sId = student.id || student.student_id;
    setEditRowId(sId);
    setEditFormData({
      name: student.name,
      combination: student.combination,
      class_level: student.class_level,
      rfid_card_number: student.rfid_card_number || ''
    });
  };

  // --- Save / Update Action ---
  const handleUpdateSubmit = async (id) => {
    try {
      await updateStudent(id, editFormData);
      
      // Map down the active state matrix array block directly
      setStudents(students.map(student => {
        const sId = student.id || student.student_id;
        if (sId === id) {
          return { ...student, ...editFormData };
        }
        return student;
      }));
      setEditRowId(null);
    } catch (err) {
      alert(err.response?.data?.message || "Guhindura amakuru byanze.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 lg:grid lg:grid-cols-12 lg:gap-6 lg:space-y-0">
      
      {/* LEFT COLUMN: Registration Input Form Layout Wrapper */}
      <div className="space-y-6 lg:col-span-4">
        <div className="bg-blue-600 p-5 text-white flex items-center gap-3 shadow-md shadow-blue-600/10 rounded-t-2xl">
          <UserPlus size={20} />
          <div>
            <h2 className="text-base font-bold">Kwinjiza Umunyeshuri Mushya</h2>
            <p className="text-[11px] text-blue-100">Kwandika abanyeshuri bashya muri database y'ishuri bikozwe n'Ubuyobozi.</p>
          </div>
        </div>

        <div className="bg-white rounded-b-2xl border border-t-0 border-slate-200/80 p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Amazina y'Umunyeshuri</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="Urugero: Mugisha Shami Kevin"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 bg-white focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Ishami (Combination)</label>
                <select
                  value={formData.combination}
                  onChange={e => setFormData({...formData, combination: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 bg-white cursor-pointer focus:outline-none focus:border-blue-600"
                >
                  <option value="SOD">SOFTWARE DEVELOPMENT</option>
                  <option value="MCE">NETWORKING INTERNET TECH</option>
                  <option value="ACC">ACCOUNTING</option>
                  <option value="CEL">ELECTRICAL TECHNOLOGY</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Urwego (Level)</label>
                <select
                  value={formData.class_level}
                  onChange={e => setFormData({...formData, class_level: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 bg-white cursor-pointer focus:outline-none focus:border-blue-600"
                >
                  <option value="Level 3">Level 3</option>
                  <option value="Level 4">Level 4</option>
                  <option value="Level 5">Level 5</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1 flex items-center gap-1">
                <CreditCard size={12} className="text-blue-600" /> Card UID / RFID Serial
              </label>
              <input
                type="text"
                value={formData.rfid_card_number}
                onChange={e => setFormData({...formData, rfid_card_number: e.target.value})}
                placeholder="Genda u-scane ikarita cyangwa uyiandike"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 font-mono text-xs text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-blue-600 transition-all"
              />
            </div>

            {status && (
              <div className={`p-3 rounded-xl text-xs font-bold border ${status.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
                {status.msg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white text-xs font-bold py-3 rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50 shadow-sm"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
              <span>Emeza umunyeshuri</span>
            </button>
          </form>
        </div>
      </div>

      {/* RIGHT COLUMN: Database Registry Real-time Data Table View */}
      <div className="space-y-4 lg:col-span-8">
        <div className="bg-blue-600 p-5 text-white flex items-center justify-between shadow-md rounded-t-2xl">
          <div className="flex items-center gap-3">
            <Users size={20} className="text-white" />
            <div>
              <h2 className="text-base font-bold">Urutonde rw'Abanyeshuri</h2>
              <p className="text-[11px] text-blue-100">Abanyeshuri bose banditse muri sisitemu bafite amakarita ya RFID.</p>
            </div>
          </div>
          <span className="bg-slate-800 border border-slate-700 px-3 py-1 text-xs font-mono font-bold text-white rounded-full">
            Total: {students.length}
          </span>
        </div>

        <div className="bg-white rounded-b-2xl border border-t-0 border-slate-200/80 shadow-sm overflow-x-auto">
          {tableLoading ? (
            <div className="p-12 flex flex-col items-center justify-center gap-2 text-slate-500">
              <Loader2 size={24} className="animate-spin text-blue-600" />
              <p className="text-xs font-semibold">Gushaka abanyeshuri biri gukorwa...</p>
            </div>
          ) : students.length === 0 ? (
            <div className="p-12 text-center text-xs font-medium text-slate-400">
              Nta munyeshuri n'umwe araboneka muri database.
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                  <th className="px-6 py-3.5">Amazina</th>
                  <th className="px-4 py-3.5">Ishami</th>
                  <th className="px-4 py-3.5">Urwego</th>
                  <th className="px-6 py-3.5">RFID Card UID</th>
                  <th className="px-6 py-3.5 text-right">Ibikorwa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                {students.map((student) => {
                  const currentId = student.id || student.student_id;
                  const isEditing = editRowId === currentId;

                  return (
                    <tr key={currentId} className="hover:bg-slate-50/80 transition-all">
                      {/* Student Name Column */}
                      <td className="px-6 py-3">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editFormData.name}
                            onChange={e => setEditFormData({ ...editFormData, name: e.target.value })}
                            className="px-2 py-1.5 w-full rounded-lg border border-slate-300 bg-white text-xs font-semibold focus:outline-none focus:border-blue-600"
                          />
                        ) : (
                          <div className="text-slate-900 text-xs font-bold">{student.name}</div>
                        )}
                      </td>

                      {/* Combination Column */}
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <select
                            value={editFormData.combination}
                            onChange={e => setEditFormData({ ...editFormData, combination: e.target.value })}
                            className="px-2 py-1.5 rounded-lg border border-slate-300 bg-white text-xs focus:outline-none focus:border-blue-600"
                          >
                            <option value="SOD">SOD</option>
                            <option value="MCE">MCE</option>
                            <option value="ACC">ACC</option>
                            <option value="CEL">CEL</option>
                          </select>
                        ) : (
                          <span className="bg-blue-50 text-blue-700 px-2.5 py-1 text-[10px] font-extrabold rounded-md uppercase">
                            {student.combination}
                          </span>
                        )}
                      </td>

                      {/* Class Level Column */}
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <select
                            value={editFormData.class_level}
                            onChange={e => setEditFormData({ ...editFormData, class_level: e.target.value })}
                            className="px-2 py-1.5 rounded-lg border border-slate-300 bg-white text-xs focus:outline-none focus:border-blue-600"
                          >
                            <option value="Level 3">Level 3</option>
                            <option value="Level 4">Level 4</option>
                            <option value="Level 5">Level 5</option>
                          </select>
                        ) : (
                          <span className="text-slate-600 font-medium">{student.class_level}</span>
                        )}
                      </td>

                      {/* RFID Card Serial Column */}
                      <td className="px-6 py-3 font-mono text-[11px]">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editFormData.rfid_card_number}
                            onChange={e => setEditFormData({ ...editFormData, rfid_card_number: e.target.value })}
                            className="px-2 py-1.5 w-full rounded-lg border border-slate-300 bg-white font-mono text-xs focus:outline-none focus:border-blue-600"
                          />
                        ) : (
                          student.rfid_card_number ? (
                            <span className="text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200/50">
                              {student.rfid_card_number}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic font-sans font-normal text-[11px]">Nta karita</span>
                          )
                        )}
                      </td>

                      {/* Action Interface Buttons Column */}
                      <td className="px-6 py-3 text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleUpdateSubmit(currentId)}
                              title="Bika impinduka"
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                            >
                              <Save size={15} />
                            </button>
                            <button
                              onClick={() => setEditRowId(null)}
                              title="Kureka"
                              className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg transition-all"
                            >
                              <X size={15} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleEditClick(student)}
                              title="Guhindura amakuru"
                              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            >
                              <Edit2 size={15} />
                            </button>
                            <button
                              onClick={() => handleDelete(currentId)}
                              title="Gusiba uyu munyeshuri"
                              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterStudent;