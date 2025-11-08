// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import axios from 'axios';

// export default function Tables() {
//   const { unitId } = useParams();
//   const navigate = useNavigate();
//   const [units, setUnits] = useState([]);
//   const [selectedUnit, setSelectedUnit] = useState(unitId || '');
//   const [teachers, setTeachers] = useState([]);
//   const [students, setStudents] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [searchTeachers, setSearchTeachers] = useState('');
//   const [searchStudents, setSearchStudents] = useState('');

//   useEffect(() => {
//     const fetchUnits = async () => {
//       try {
//         const token = localStorage.getItem('token');
//         const response = await axios.get('http://localhost:5000/api/admin/units', {
//           headers: { Authorization: `Bearer ${token}` }
//         });
//         setUnits(response.data);
//         setLoading(false);
//       } catch (err) {
//         console.error('Error fetching units:', err);
//         setError(err.response?.data?.message || 'Failed to load units');
//         setLoading(false);
//       }
//     };

//     fetchUnits();
//   }, []);

//   useEffect(() => {
//     const fetchData = async () => {
//       if (!selectedUnit) return;
      
//       setLoading(true);
//       try {
//         const token = localStorage.getItem('token');
//         const [teachersRes, studentsRes] = await Promise.all([
//           axios.get(`http://localhost:5000/api/admin/units/${selectedUnit}/teachers`, {
//             headers: { Authorization: `Bearer ${token}` }
//           }),
//           axios.get(`http://localhost:5000/api/admin/units/${selectedUnit}/students`, {
//             headers: { Authorization: `Bearer ${token}` }
//           })
//         ]);

//         setTeachers(teachersRes.data);
//         setStudents(studentsRes.data);
//         setLoading(false);
//       } catch (err) {
//         console.error('Error:', err);
//         setError(err.response?.data?.error || 'Failed to fetch data');
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [selectedUnit]);

//   const handleUnitChange = (value) => {
//     setSelectedUnit(value);
//     if (value) {
//       navigate(`/admin/tables/${value}`);
//     } else {
//       navigate('/admin/tables');
//     }
//   };

//   if (loading && !units.length) return <div className="text-center mt-5">Loading...</div>;
//   if (error) return <div className="alert alert-danger m-5">{error}</div>;

//   return (
//     <div className="container-fluid p-4">
//       <h2 className="mb-4">School Data Tables</h2>

//       {/* Unit Selection */}
//       <div className="mb-4">
//         <label className="form-label">Select School</label>
//         <select 
//           className="form-select" 
//           value={selectedUnit} 
//           onChange={(e) => handleUnitChange(e.target.value)}
//         >
//           <option value="">Select a school</option>
//           {units.map(unit => (
//             <option key={unit.unit_id} value={unit.unit_id}>
//               School {unit.unit_id} - SEMIS: {unit.semis_no}
//             </option>
//           ))}
//         </select>
//       </div>

//       {selectedUnit && (
//         <>
//           {/* Teachers Table */}
//           <div className="card mb-4">
//             <div className="card-header bg-primary text-white">
//               <h4 className="mb-0">Teachers</h4>
//             </div>
//             <div className="card-body">
//               <input
//                 type="text"
//                 className="form-control mb-3"
//                 placeholder="Search teachers..."
//                 value={searchTeachers}
//                 onChange={(e) => setSearchTeachers(e.target.value)}
//               />
//               <div className="table-responsive">
//                 <table className="table table-bordered table-hover">
//                   <thead>
//                     <tr>
//                       <th>Name</th>
//                       <th>Email</th>
//                       <th>Phone</th>
//                       <th>Subject</th>
//                       <th>Qualification</th>
//                       <th>Joining Date</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {teachers
//                       .filter(teacher => 
//                         Object.values(teacher).some(val => 
//                           String(val).toLowerCase().includes(searchTeachers.toLowerCase())
//                         )
//                       )
//                       .map(teacher => (
//                         <tr key={teacher.staff_id}>
//                           <td>{teacher.full_name}</td>
//                           <td>{teacher.email}</td>
//                           <td>{teacher.phone}</td>
//                           <td>{teacher.subject}</td>
//                           <td>{teacher.qualification}</td>
//                           <td>{new Date(teacher.joining_date).toLocaleDateString()}</td>
//                         </tr>
//                       ))}
//                     {teachers.length === 0 && (
//                       <tr>
//                         <td colSpan="6" className="text-center">No teachers found</td>
//                       </tr>
//                     )}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           </div>

//           {/* Students Table */}
//           <div className="card">
//             <div className="card-header bg-success text-white">
//               <h4 className="mb-0">Students</h4>
//             </div>
//             <div className="card-body">
//               <input
//                 type="text"
//                 className="form-control mb-3"
//                 placeholder="Search students..."
//                 value={searchStudents}
//                 onChange={(e) => setSearchStudents(e.target.value)}
//               />
//               <div className="table-responsive">
//                 <table className="table table-bordered table-hover">
//                   <thead>
//                     <tr>
//                       <th>Roll Number</th>
//                       <th>Name</th>
//                       <th>Standard</th>
//                       <th>Division</th>
//                       <th>Parent Name</th>
//                       <th>Parent Phone</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {students
//                       .filter(student => 
//                         Object.values(student).some(val => 
//                           String(val).toLowerCase().includes(searchStudents.toLowerCase())
//                         )
//                       )
//                       .map(student => (
//                         <tr key={student.student_id}>
//                           <td>{student.roll_number}</td>
//                           <td>{student.full_name}</td>
//                           <td>{student.standard}</td>
//                           <td>{student.division}</td>
//                           <td>{student.parent_name}</td>
//                           <td>{student.parent_phone}</td>
//                         </tr>
//                       ))}
//                     {students.length === 0 && (
//                       <tr>
//                         <td colSpan="6" className="text-center">No students found</td>
//                       </tr>
//                     )}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           </div>
//         </>
//       )}
//     </div>
//   );
// }

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

export default function Tables() {
  const { t } = useTranslation();
  const { unitId } = useParams();
  const navigate = useNavigate();
  const [units, setUnits] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState(unitId || '');
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTeachers, setSearchTeachers] = useState('');
  const [searchStudents, setSearchStudents] = useState('');

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/admin/units', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUnits(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching units:', err);
        setError(err.response?.data?.message || t('failed_load_units'));
        setLoading(false);
      }
    };

    fetchUnits();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t]);

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedUnit) return;

      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const [teachersRes, studentsRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/admin/units/${selectedUnit}/teachers`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`http://localhost:5000/api/admin/units/${selectedUnit}/students`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        setTeachers(teachersRes.data);
        setStudents(studentsRes.data);
        setLoading(false);
      } catch (err) {
        console.error('Error:', err);
        setError(err.response?.data?.error || t('failed_fetch_data'));
        setLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUnit, t]);

  const handleUnitChange = (value) => {
    setSelectedUnit(value);
    if (value) {
      navigate(`/admin/tables/${value}`);
    } else {
      navigate('/admin/tables');
    }
  };

  if (loading && !units.length) return <div className="text-center mt-5">{t('loading')}...</div>;
  if (error) return <div className="alert alert-danger m-5">{error}</div>;

  return (
    <div className="container-fluid p-4">
      <h2 className="mb-4">{t('school_data_tables')}</h2>

      {/* Unit Selection */}
      <div className="mb-4">
        <label className="form-label">{t('select_school')}</label>
        <select
          className="form-select"
          value={selectedUnit}
          onChange={(e) => handleUnitChange(e.target.value)}
        >
          <option value="">{t('select_a_school')}</option>
          {units.map(unit => (
            <option key={unit.unit_id} value={unit.unit_id}>
              {t("school")} {unit.unit_id} - SEMIS: {unit.semis_no}
            </option>
          ))}
        </select>
      </div>

      {selectedUnit && (
        <>
          {/* Teachers Table */}
          <div className="card mb-4">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">{t('teachers')}</h4>
            </div>
            <div className="card-body">
              <input
                type="text"
                className="form-control mb-3"
                placeholder={t('search_teachers')}
                value={searchTeachers}
                onChange={(e) => setSearchTeachers(e.target.value)}
              />
              <div className="table-responsive">
                <table className="table table-bordered table-hover">
                  <thead>
                    <tr>
                      <th>{t('name')}</th>
                      <th>{t('email')}</th>
                      <th>{t('phone')}</th>
                      <th>{t('subject')}</th>
                      <th>{t('qualification')}</th>
                      <th>{t('joining_date')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teachers
                      .filter(teacher =>
                        Object.values(teacher).some(val =>
                          String(val).toLowerCase().includes(searchTeachers.toLowerCase())
                        )
                      )
                      .map(teacher => (
                        <tr key={teacher.staff_id}>
                          <td>{teacher.full_name}</td>
                          <td>{teacher.email}</td>
                          <td>{teacher.phone}</td>
                          <td>{teacher.subject}</td>
                          <td>{teacher.qualification}</td>
                          <td>{new Date(teacher.joining_date).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    {teachers.length === 0 && (
                      <tr>
                        <td colSpan="6" className="text-center">
                          {t('no_teachers_found')}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Students Table */}
          <div className="card">
            <div className="card-header bg-success text-white">
              <h4 className="mb-0">{t('students')}</h4>
            </div>
            <div className="card-body">
              <input
                type="text"
                className="form-control mb-3"
                placeholder={t('search_students')}
                value={searchStudents}
                onChange={(e) => setSearchStudents(e.target.value)}
              />
              <div className="table-responsive">
                <table className="table table-bordered table-hover">
                  <thead>
                    <tr>
                      <th>{t('roll_number')}</th>
                      <th>{t('name')}</th>
                      <th>{t('standard')}</th>
                      <th>{t('division')}</th>
                      <th>{t('parent_name')}</th>
                      <th>{t('parent_phone')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students
                      .filter(student =>
                        Object.values(student).some(val =>
                          String(val).toLowerCase().includes(searchStudents.toLowerCase())
                        )
                      )
                      .map(student => (
                        <tr key={student.student_id}>
                          <td>{student.roll_number}</td>
                          <td>{student.full_name}</td>
                          <td>{student.standard}</td>
                          <td>{student.division}</td>
                          <td>{student.parent_name}</td>
                          <td>{student.parent_phone}</td>
                        </tr>
                      ))}
                    {students.length === 0 && (
                      <tr>
                        <td colSpan="6" className="text-center">
                          {t('no_students_found')}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
