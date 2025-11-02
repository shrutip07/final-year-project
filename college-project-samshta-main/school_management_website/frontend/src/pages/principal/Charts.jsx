// import React, { useEffect, useState, useMemo } from "react";
// import axios from "axios";
// import {
//   PieChart, Pie, Tooltip, Legend, ResponsiveContainer, Cell,
//   BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line
// } from "recharts";

// const GENDER_COLORS = ["#278BCD", "#E9B949"];
// const PASS_COLORS = ["#56C596", "#F37272"];
// const COLORS = ["#278BCD", "#E9B949", "#56C596", "#F37272", "#6d69fa", "#f2bb8e"];

// function formatNumber(n) {
//   return n && !isNaN(n) ? n.toLocaleString() : n;
// }

// export default function Charts({ unitId }) {
//   const [loading, setLoading] = useState(true);
//   const [analytics, setAnalytics] = useState(null);

//   // Payments/year state
//   const [selectedFiscalYear, setSelectedFiscalYear] = useState("");

//   // Academic year for gender/pass pies
//   const [currentYear, setCurrentYear] = useState(""); // <-- always call at top

//   // Fetch analytics
//   useEffect(() => {
//     if (!unitId) return;
//     setLoading(true);
//     const token = localStorage.getItem("token");
//     axios
//       .get(`http://localhost:5000/api/principal/analytics?unit_id=${unitId}`, {
//         headers: { Authorization: `Bearer ${token}` }
//       })
//       .then(res => {
//         setAnalytics(res.data);
//         // default fiscal year for payments
//         const fiscalYears = [...new Set(res.data.payments.map(p => p.fiscal_year))];
//         setSelectedFiscalYear(fiscalYears[fiscalYears.length - 1] || "");
//         setLoading(false);
//       })
//       .catch(() => setLoading(false));
//   }, [unitId]);

//   // Get all academic years (using useMemo so available on every render)
//   const allStudents = analytics?.allStudents || [];
//   const yearsList = useMemo(
//     () => Array.from(new Set(allStudents.map(s => s.academic_year).filter(Boolean))).sort().reverse(),
//     [allStudents]
//   );

//   // Set currentYear *after* data loads & when years change!
//   useEffect(() => {
//     if (yearsList.length > 0 && (!currentYear || !yearsList.includes(currentYear))) {
//       setCurrentYear(yearsList[0]);
//     }
//     // eslint-disable-next-line
//   }, [yearsList]);

//   if (loading || !analytics) return <div>Loading charts...</div>;

//   // Students by class
//   const studentsByClass = analytics.studentsByClass.map(row => ({
//     standard: row.standard,
//     count: parseInt(row.count, 10)
//   }));

//   // Admissions per year
//   const admissionsData = analytics.admissions.map(row => ({
//     year: String(row.year),
//     count: parseInt(row.count, 10)
//   }));

//   // Students and gender/pass for the current academic year
//   const yearStudents = allStudents.filter(s => s.academic_year === currentYear);
//   const genderData = [
//     { name: "Male", value: yearStudents.filter(s => s.gender?.toLowerCase() === "male").length },
//     { name: "Female", value: yearStudents.filter(s => s.gender?.toLowerCase() === "female").length }
//   ];
//   const passData = [
//     { name: "Passed", value: yearStudents.filter(s => s.passed === true).length },
//     { name: "Failed", value: yearStudents.filter(s => s.passed === false).length }
//   ];

//   // Budget vs Expense bar chart
//   const budgetYearMap = {};
//   analytics.budgets.forEach(b => {
//     budgetYearMap[b.fiscal_year] = b;
//   });
//   const budgetVsExpense = Object.keys(budgetYearMap).map(year => ({
//     year,
//     Budget: Number(budgetYearMap[year].income || 0),
//     Expenses: Number(budgetYearMap[year].expenses || 0),
//     Surplus: Number(budgetYearMap[year].surplus || 0)
//   }));

//   // Payments pie chart by fiscal year
//   const fiscalYears = [...new Set(analytics.payments.map(p => p.fiscal_year))];
//   const expenseCategories = analytics.payments
//     .filter(p => p.fiscal_year === selectedFiscalYear)
//     .map((p, i) => ({ ...p, total: Number(p.total) }));

//   return (
//     <div style={{ padding: 24 }}>
//       <div style={{
//         display: "flex", justifyContent: "space-between",
//         alignItems: "center", marginBottom: 24
//       }}>
//         <h2>Unit Dashboard</h2>
//       </div>
//       <div style={{
//         display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
//         gridGap: 32
//       }}>
//         {/* STUDENTS BY CLASS */}
//         <div style={{ background: "#23242a", padding: 20, borderRadius: 12 }}>
//           <h4>Students by Class</h4>
//           <ResponsiveContainer width="100%" height={210}>
//             <BarChart data={studentsByClass}>
//               <CartesianGrid strokeDasharray="3 3" stroke="#313355" />
//               <XAxis dataKey="standard"/>
//               <YAxis/>
//               <Tooltip/>
//               <Bar dataKey="count" fill="#14b8a6"/>
//             </BarChart>
//           </ResponsiveContainer>
//         </div>

//         {/* Student Admissions by Year */}
//         <div style={{ background: "#23242a", padding: 20, borderRadius: 12 }}>
//           <h4>Admissions per Year</h4>
//           <ResponsiveContainer width="100%" height={210}>
//             <LineChart data={admissionsData}>
//               <CartesianGrid strokeDasharray="3 3" stroke="#313355" />
//               <XAxis dataKey="year"/>
//               <YAxis/>
//               <Tooltip/>
//               <Line type="monotone" dataKey="count" stroke="#38bdf8" />
//             </LineChart>
//           </ResponsiveContainer>
//         </div>

//         {/* Budget vs Expenses */}
//         <div style={{ background: "#23242a", padding: 20, borderRadius: 12 }}>
//           <h4>Budget vs. Expenses</h4>
//           <ResponsiveContainer width="100%" height={210}>
//             <BarChart data={budgetVsExpense}>
//               <CartesianGrid strokeDasharray="3 3" stroke="#313355" />
//               <XAxis dataKey="year"/>
//               <YAxis/>
//               <Tooltip/>
//               <Legend/>
//               <Bar dataKey="Budget" fill="#38bdf8"/>
//               <Bar dataKey="Expenses" fill="#fbbf24"/>
//             </BarChart>
//           </ResponsiveContainer>
//         </div>

//         {/* Gender distribution pie */}
//         <div style={{ background: "#23242a", padding: 20, borderRadius: 12 }}>
//           <h4>
//             Students by Gender&nbsp;
//             <select
//               style={{maxWidth:120, background:"#23242a", color:"#fff"}}
//               value={currentYear}
//               onChange={e => setCurrentYear(e.target.value)}
//             >
//               {yearsList.map(year => (
//                 <option value={year} key={year}>{year}</option>
//               ))}
//             </select>
//           </h4>
//           <ResponsiveContainer width="100%" height={210}>
//             <PieChart>
//               <Pie
//                 data={genderData}
//                 dataKey="value"
//                 nameKey="name"
//                 cx="50%"
//                 cy="52%"
//                 outerRadius={80}
//                 label={({name, value}) => `${value}`}
//                 labelLine={false}
//               >
//                 {genderData.map((entry, idx) => (
//                   <Cell key={entry.name} fill={GENDER_COLORS[idx % GENDER_COLORS.length]} />
//                 ))}
//               </Pie>
//               <Legend verticalAlign="bottom" iconType="circle" />
//               <Tooltip/>
//             </PieChart>
//           </ResponsiveContainer>
//         </div>

//         {/* Pass/Fail pie */}
//         <div style={{ background: "#23242a", padding: 20, borderRadius: 12 }}>
//           <h4>Pass/Fail Distribution</h4>
//           <ResponsiveContainer width="100%" height={210}>
//             <PieChart>
//               <Pie
//                 data={passData}
//                 dataKey="value"
//                 nameKey="name"
//                 cx="50%"
//                 cy="52%"
//                 outerRadius={80}
//                 label={({name, value}) => `${value}`}
//                 labelLine={false}
//               >
//                 {passData.map((entry, idx) => (
//                   <Cell key={entry.name} fill={PASS_COLORS[idx % PASS_COLORS.length]} />
//                 ))}
//               </Pie>
//               <Legend verticalAlign="bottom" iconType="circle" />
//               <Tooltip/>
//             </PieChart>
//           </ResponsiveContainer>
//         </div>

//         {/* Payments pie chart for fiscal year */}
//         <div style={{ background: "#23242a", padding: 20, borderRadius: 12 }}>
//           <h4>Expense Breakdown&nbsp;
//             <select style={{maxWidth:100, background:"#23242a", color:"#fff"}}
//                     value={selectedFiscalYear}
//                     onChange={e => setSelectedFiscalYear(e.target.value)}>
//               {fiscalYears.map(y => <option key={y} value={y}>{y}</option>)}
//             </select>
//           </h4>
//           <ResponsiveContainer width="100%" height={210}>
//             <PieChart>
//               <Pie
//                 data={expenseCategories}
//                 dataKey="total"
//                 nameKey="category"
//                 innerRadius={50}
//                 outerRadius={80}
//                 label={({category, total}) => `${category}: ${total}`}
//                 labelLine={false}
//               >
//                 {expenseCategories.map((entry, idx) => (
//                   <Cell key={entry.category} fill={COLORS[idx % COLORS.length]}/>
//                 ))}
//               </Pie>
//               <Legend/>
//               <Tooltip/>
//             </PieChart>
//           </ResponsiveContainer>
//         </div>
//       </div>
//     </div>
//   );
// }

import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  PieChart, Pie, Tooltip, Legend, ResponsiveContainer, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line
} from "recharts";

const GENDER_COLORS = ["#278BCD", "#E9B949"];
const PASS_COLORS = ["#56C596", "#F37272"];
const COLORS = ["#278BCD", "#E9B949", "#56C596", "#F37272", "#6d69fa", "#f2bb8e"];

export default function Charts({ unitId }) {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [selectedFiscalYear, setSelectedFiscalYear] = useState("");
  const [currentYear, setCurrentYear] = useState("");

  useEffect(() => {
    if (!unitId) return;
    setLoading(true);
    const token = localStorage.getItem("token");
    axios
      .get(`http://localhost:5000/api/principal/analytics?unit_id=${unitId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        setAnalytics(res.data);
        const fiscalYears = [...new Set(res.data.payments.map(p => p.fiscal_year))];
        setSelectedFiscalYear(fiscalYears[fiscalYears.length - 1] || "");
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [unitId]);

  const allStudents = analytics?.allStudents || [];
  const yearsList = useMemo(
    () => Array.from(new Set(allStudents.map(s => s.academic_year).filter(Boolean))).sort().reverse(),
    [allStudents]
  );

  useEffect(() => {
    if (yearsList.length > 0 && (!currentYear || !yearsList.includes(currentYear))) {
      setCurrentYear(yearsList[0]);
    }
    // eslint-disable-next-line
  }, [yearsList]);

  if (loading || !analytics) return <div>Loading charts...</div>;

  const studentsByClass = analytics.studentsByClass.map(row => ({
    standard: row.standard,
    count: parseInt(row.count, 10)
  }));

  const admissionsData = analytics.admissions.map(row => ({
    year: String(row.year),
    count: parseInt(row.count, 10)
  }));

  const yearStudents = allStudents.filter(s => s.academic_year === currentYear);
  const genderData = [
    { name: "Male", value: yearStudents.filter(s => s.gender?.toLowerCase() === "male").length },
    { name: "Female", value: yearStudents.filter(s => s.gender?.toLowerCase() === "female").length }
  ];
  const passData = [
    { name: "Passed", value: yearStudents.filter(s => s.passed === true).length },
    { name: "Failed", value: yearStudents.filter(s => s.passed === false).length }
  ];

  const budgetYearMap = {};
  analytics.budgets.forEach(b => {
    budgetYearMap[b.fiscal_year] = b;
  });
  const budgetVsExpense = Object.keys(budgetYearMap).map(year => ({
    year,
    Budget: Number(budgetYearMap[year].income || 0),
    Expenses: Number(budgetYearMap[year].expenses || 0),
    Surplus: Number(budgetYearMap[year].surplus || 0)
  }));

  const fiscalYears = [...new Set(analytics.payments.map(p => p.fiscal_year))];
  const expenseCategories = analytics.payments
    .filter(p => p.fiscal_year === selectedFiscalYear)
    .map((p, i) => ({ ...p, total: Number(p.total) }));

  const cardStyle = {
    background: "#23242a",
    padding: "32px 28px 20px 28px",
    borderRadius: 18,
    minHeight: 330,
    color: "#fff"
  };
  const titleStyle = {
    fontWeight: 700,
    fontSize: 22,
    color: "#fff",
    letterSpacing: "0.02em",
    marginBottom: 20,
    marginTop: 0
  };

  return (
    <div style={{ padding: "24px 0 0 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "0 45px 24px 45px" }}>
        <h1 style={{ fontWeight: 700, fontSize: 32, color: "#23242a" }}>Unit Dashboard</h1>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gridGap: 36,
          margin: "0 38px",
        }}
      >
        {/* Students By Class */}
        <div style={cardStyle}>
          <div style={titleStyle}>Students by Class</div>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={studentsByClass}>
              <CartesianGrid strokeDasharray="3 3" stroke="#313355" />
              <XAxis dataKey="standard"/>
              <YAxis/>
              <Tooltip/>
              <Bar dataKey="count" fill="#14b8a6"/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Admissions Per Year */}
        <div style={cardStyle}>
          <div style={titleStyle}>Admissions per Year</div>
          <ResponsiveContainer width="100%" height={210}>
            <LineChart data={admissionsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#313355" />
              <XAxis dataKey="year"/>
              <YAxis/>
              <Tooltip/>
              <Line type="monotone" dataKey="count" stroke="#38bdf8" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Budget vs. Expenses */}
        <div style={cardStyle}>
          <div style={titleStyle}>Budget vs Expenses</div>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={budgetVsExpense}>
              <CartesianGrid strokeDasharray="3 3" stroke="#313355" />
              <XAxis dataKey="year"/>
              <YAxis/>
              <Tooltip/>
              <Legend/>
              <Bar dataKey="Budget" fill="#38bdf8"/>
              <Bar dataKey="Expenses" fill="#fbbf24"/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Students By Gender */}
        <div style={cardStyle}>
          <div style={{
            ...titleStyle, display: "flex", alignItems: "center"
          }}>
            Students by Gender
            <select
              style={{
                marginLeft: 12,
                background: "#23242a",
                color: "#fff",
                fontWeight: 500,
                fontSize: 17,
                border: "1.2px solid #313355",
                borderRadius: 7,
                padding: "2.5px 11px 2.5px 6px"
              }}
              value={currentYear}
              onChange={e => setCurrentYear(e.target.value)}
            >
              {yearsList.map(year => (
                <option value={year} key={year}>{year}</option>
              ))}
            </select>
          </div>
          <ResponsiveContainer width="100%" height={210}>
            <PieChart>
              <Pie
                data={genderData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="52%"
                outerRadius={80}
                label={({name, value}) => `${value}`}
                labelLine={false}
              >
                {genderData.map((entry, idx) => (
                  <Cell key={entry.name} fill={GENDER_COLORS[idx % GENDER_COLORS.length]} />
                ))}
              </Pie>
              <Legend verticalAlign="bottom" iconType="circle" />
              <Tooltip/>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Pass/Fail Distribution */}
        <div style={cardStyle}>
          <div style={titleStyle}>Pass/Fail Distribution</div>
          <ResponsiveContainer width="100%" height={210}>
            <PieChart>
              <Pie
                data={passData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="52%"
                outerRadius={80}
                label={({name, value}) => `${value}`}
                labelLine={false}
              >
                {passData.map((entry, idx) => (
                  <Cell key={entry.name} fill={PASS_COLORS[idx % PASS_COLORS.length]} />
                ))}
              </Pie>
              <Legend verticalAlign="bottom" iconType="circle" />
              <Tooltip/>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Payments by Category */}
        <div style={cardStyle}>
          <div style={{
            ...titleStyle, display: "flex", alignItems: "center"
          }}>
            Payments by Category
            <select style={{
                marginLeft: 12,
                background: "#23242a",
                color: "#fff",
                fontWeight: 500,
                fontSize: 17,
                border: "1.2px solid #313355",
                borderRadius: 7,
                padding: "2.5px 11px 2.5px 6px"
              }}
              value={selectedFiscalYear}
              onChange={e => setSelectedFiscalYear(e.target.value)}>
              {fiscalYears.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <ResponsiveContainer width="100%" height={210}>
            <PieChart>
              <Pie
                data={expenseCategories}
                dataKey="total"
                nameKey="category"
                innerRadius={50}
                outerRadius={80}
                label={({category, total}) => `${category}: ${total}`}
                labelLine={false}
              >
                {expenseCategories.map((entry, idx) => (
                  <Cell key={entry.category} fill={COLORS[idx % COLORS.length]}/>
                ))}
              </Pie>
              <Legend/>
              <Tooltip/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
