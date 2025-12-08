// import React, { useEffect, useState, useMemo } from "react";
// import axios from "axios";
// import {
//   PieChart, Pie, Tooltip, Legend, ResponsiveContainer, Cell,
//   BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line
// } from "recharts";
// import { useTranslation } from "react-i18next";

// const GENDER_COLORS = ["#278BCD", "#E9B949"];
// const PASS_COLORS = ["#56C596", "#F37272"];
// const COLORS = ["#278BCD", "#E9B949", "#56C596", "#F37272", "#6d69fa", "#f2bb8e"];

// const cardStyle = {
//   background: "#fff",
//   padding: 20,
//   borderRadius: 8,
//   border: "1px solid #e0e0e0",
//   boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
// };

// const titleStyle = {
//   fontSize: 16,
//   fontWeight: 600,
//   marginBottom: 16,
//   color: "#212b36"
// };

// function formatNumber(n) {
//   return n && !isNaN(n) ? n.toLocaleString() : n;
// }

// export default function Charts({ unitId }) {
//   const { t } = useTranslation();
//   const [loading, setLoading] = useState(true);
//   const [analytics, setAnalytics] = useState(null);
//   const [selectedYear, setSelectedYear] = useState("");

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
//         // Set default year here directly once
//         const allYears = [
//           ...new Set([
//             ...(res.data.allStudents?.map(s => s.academic_year) || []),
//             ...(res.data.payments?.map(p => p.fiscal_year) || [])
//           ])
//         ]
//           .filter(Boolean)
//           .sort()
//           .reverse();

//         if (allYears.length > 0) {
//           setSelectedYear(allYears[0]);
//         }

//         setLoading(false);
//       })
//       .catch(err => {
//         console.error("Failed to fetch analytics:", err);
//         setLoading(false);
//       });
//   }, [unitId]);

//   // All years for dropdown (sorted descending) - MUST BE BEFORE EARLY RETURN
//   const allYears = useMemo(() => {
//     if (!analytics) return [];
//     const years = [
//       ...new Set([
//         ...(analytics.allStudents?.map(s => s.academic_year) || []),
//         ...(analytics.payments?.map(p => p.fiscal_year) || [])
//       ])
//     ]
//       .filter(Boolean)
//       .sort()
//       .reverse();
//     return years.length > 0 ? years : ["2024-25"];
//   }, [analytics]);

//   // ========== TREND DATA (All Past Years) - MUST BE BEFORE EARLY RETURN
//   // Salary paid trend across all financial years
//   const salaryTrendData = useMemo(() => {
//     if (!analytics?.payments || analytics.payments.length === 0) return [];
//     const yearMap = {};
//     analytics.payments.forEach(p => {
//       if (!yearMap[p.fiscal_year]) {
//         yearMap[p.fiscal_year] = 0;
//       }
//       yearMap[p.fiscal_year] += Number(p.total) || 0;
//     });
//     return Object.keys(yearMap)
//       .sort()
//       .map(year => ({
//         year,
//         salary: Math.round(yearMap[year])
//       }));
//   }, [analytics]);

//   // Fees collected trend across all academic years
//   const feesTrendData = useMemo(() => {
//     if (!analytics?.allStudents || analytics.allStudents.length === 0) return [];
//     const yearMap = {};
//     analytics.allStudents.forEach(s => {
//       if (!yearMap[s.academic_year]) {
//         yearMap[s.academic_year] = 0;
//       }
//       yearMap[s.academic_year] += 5000;
//     });
//     return Object.keys(yearMap)
//       .sort()
//       .map(year => ({
//         year,
//         fees: Math.round(yearMap[year])
//       }));
//   }, [analytics]);

//   // Students by class
//   const studentsByClass = useMemo(() => {
//     return analytics?.studentsByClass?.map(row => ({
//       standard: row.standard,
//       count: parseInt(row.count, 10)
//     })) || [];
//   }, [analytics]);

//   // Admissions per year
//   const admissionsData = useMemo(() => {
//     return analytics?.admissions?.map(row => ({
//       year: String(row.year),
//       count: parseInt(row.count, 10)
//     })) || [];
//   }, [analytics]);

//   // Students for selected year
//   const yearStudents = useMemo(() => {
//     return analytics?.allStudents?.filter(s => s.academic_year === selectedYear) || [];
//   }, [analytics, selectedYear]);

//   const genderData = useMemo(() => [
//     { name: "Male", value: yearStudents.filter(s => s.gender?.toLowerCase() === "male").length },
//     { name: "Female", value: yearStudents.filter(s => s.gender?.toLowerCase() === "female").length }
//   ], [yearStudents]);

//   const passData = useMemo(() => [
//     { name: "Passed", value: yearStudents.filter(s => s.passed === true).length },
//     { name: "Failed", value: yearStudents.filter(s => s.passed === false).length }
//   ], [yearStudents]);

//   // Payments by category for selected year
//   const expenseCategories = useMemo(() => {
//     return analytics?.payments
//       ?.filter(p => p.fiscal_year === selectedYear)
//       .map((p, i) => ({ ...p, total: Number(p.total) })) || [];
//   }, [analytics, selectedYear]);

//   // Budget vs Expense
//   const budgetVsExpense = useMemo(() => {
//     return analytics?.budgets?.map(b => ({
//       year: b.fiscal_year,
//       Budget: Number(b.income || 0),
//       Expenses: Number(b.expenses || 0),
//       Surplus: Number(b.surplus || 0)
//     })) || [];
//   }, [analytics]);

//   const fiscalYears = useMemo(() => {
//     return [...new Set(analytics?.payments?.map(p => p.fiscal_year) || [])];
//   }, [analytics]);

//   // NOW the early return - after all hooks
//   if (loading || !analytics) return <div style={{ padding: 24 }}>{t("loading")}...</div>;

//   return (
//     <div style={{ padding: 24 }}>
//       <div style={{
//         display: "flex", justifyContent: "space-between",
//         alignItems: "center", marginBottom: 32
//       }}>
//         <h2>{t("charts")}</h2>
//         <div>
//           <label style={{ marginRight: 12, fontWeight: 500 }}>{t("financial_year_label")}</label>
//           <select
//             value={selectedYear}
//             onChange={(e) => setSelectedYear(e.target.value)}
//             style={{
//               padding: "8px 12px",
//               borderRadius: 6,
//               border: "1px solid #ddd",
//               fontSize: 14,
//               fontWeight: 500
//             }}
//           >
//             {allYears.map(year => (
//               <option value={year} key={year}>{year}</option>
//             ))}
//           </select>
//         </div>
//       </div>

//       {/* SECTION 1: TREND CHARTS (All Past Years) */}
//       <div style={{ marginBottom: 48 }}>
//         <h3 style={{ marginBottom: 24, color: "#212b36" }}>{t("financial_trends")}</h3>
//         <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
//           {/* Salary Trend */}
//           <div style={cardStyle}>
//             <div style={titleStyle}>{t("salary_trend")}</div>
//             <ResponsiveContainer width="100%" height={280}>
//               <LineChart data={salaryTrendData}>
//                 <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
//                 <XAxis dataKey="year" />
//                 <YAxis />
//                 <Tooltip 
//                   formatter={(value) => `₹${formatNumber(value)}`}
//                   contentStyle={{ background: "#fff", border: "1px solid #ccc", borderRadius: 6 }}
//                 />
//                 <Legend />
//                 <Line 
//                   type="monotone" 
//                   dataKey="salary" 
//                   stroke="#f57c00" 
//                   strokeWidth={2}
//                   dot={{ fill: "#f57c00", r: 5 }}
//                   activeDot={{ r: 7 }}
//                   name={t("salary_paid")}
//                 />
//               </LineChart>
//             </ResponsiveContainer>
//           </div>

//           {/* Fees Trend */}
//           <div style={cardStyle}>
//             <div style={titleStyle}>{t("fees_trend")}</div>
//             <ResponsiveContainer width="100%" height={280}>
//               <LineChart data={feesTrendData}>
//                 <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
//                 <XAxis dataKey="year" />
//                 <YAxis />
//                 <Tooltip 
//                   formatter={(value) => `₹${formatNumber(value)}`}
//                   contentStyle={{ background: "#fff", border: "1px solid #ccc", borderRadius: 6 }}
//                 />
//                 <Legend />
//                 <Line 
//                   type="monotone" 
//                   dataKey="fees" 
//                   stroke="#2e7d32" 
//                   strokeWidth={2}
//                   dot={{ fill: "#2e7d32", r: 5 }}
//                   activeDot={{ r: 7 }}
//                   name={t("fees_collected")}
//                 />
//               </LineChart>
//             </ResponsiveContainer>
//           </div>
//         </div>
//       </div>

//       {/* SECTION 2: HISTORICAL CHARTS (All Years) */}
//       <div style={{ marginBottom: 48 }}>
//         <h3 style={{ marginBottom: 24, color: "#212b36" }}>{t("historical_analysis")}</h3>
//         <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
//           {/* Students by Class */}
//           <div style={cardStyle}>
//             <div style={titleStyle}>{t("students_by_class")}</div>
//             <ResponsiveContainer width="100%" height={280}>
//               <BarChart data={studentsByClass}>
//                 <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
//                 <XAxis dataKey="standard"/>
//                 <YAxis/>
//                 <Tooltip contentStyle={{ background: "#fff", border: "1px solid #ccc", borderRadius: 6 }} />
//                 <Bar dataKey="count" fill="#0066cc" radius={[6, 6, 0, 0]} />
//               </BarChart>
//             </ResponsiveContainer>
//           </div>

//           {/* Admissions per Year */}
//           <div style={cardStyle}>
//             <div style={titleStyle}>{t("admissions_per_year")}</div>
//             <ResponsiveContainer width="100%" height={280}>
//               <BarChart data={admissionsData}>
//                 <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
//                 <XAxis dataKey="year"/>
//                 <YAxis/>
//                 <Tooltip contentStyle={{ background: "#fff", border: "1px solid #ccc", borderRadius: 6 }} />
//                 <Bar dataKey="count" fill="#00aa00" radius={[6, 6, 0, 0]} />
//               </BarChart>
//             </ResponsiveContainer>
//           </div>

//           {/* Budget vs Expenses */}
//           <div style={cardStyle}>
//             <div style={titleStyle}>{t("budget_vs_expenses")}</div>
//             <ResponsiveContainer width="100%" height={280}>
//               <BarChart data={budgetVsExpense}>
//                 <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
//                 <XAxis dataKey="year"/>
//                 <YAxis/>
//                 <Tooltip contentStyle={{ background: "#fff", border: "1px solid #ccc", borderRadius: 6 }} />
//                 <Legend />
//                 <Bar dataKey="Budget" fill="#0066cc" radius={[6, 6, 0, 0]}/>
//                 <Bar dataKey="Expenses" fill="#f57c00" radius={[6, 6, 0, 0]}/>
//               </BarChart>
//             </ResponsiveContainer>
//           </div>
//         </div>
//       </div>

//       {/* SECTION 3: CURRENT YEAR CHARTS (Uses Common Dropdown) */}
//       <div>
//         <h3 style={{ marginBottom: 24, color: "#212b36" }}>{t("year_specific")} {selectedYear}</h3>
//         <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
//           {/* Gender Distribution */}
//           <div style={cardStyle}>
//             <div style={titleStyle}>{t("students_by_gender")}</div>
//             <ResponsiveContainer width="100%" height={280}>
//               <PieChart>
//                 <Pie
//                   data={genderData}
//                   dataKey="value"
//                   nameKey="name"
//                   cx="50%"
//                   cy="50%"
//                   outerRadius={80}
//                   label={({name, value}) => `${name}: ${value}`}
//                   labelLine={false}
//                 >
//                   {genderData.map((entry, idx) => (
//                     <Cell key={entry.name} fill={GENDER_COLORS[idx % GENDER_COLORS.length]} />
//                   ))}
//                 </Pie>
//                 <Legend verticalAlign="bottom" />
//                 <Tooltip/>
//               </PieChart>
//             </ResponsiveContainer>
//           </div>

//           {/* Pass/Fail Distribution */}
//           <div style={cardStyle}>
//             <div style={titleStyle}>{t("pass_fail_distribution")}</div>
//             <ResponsiveContainer width="100%" height={280}>
//               <PieChart>
//                 <Pie
//                   data={passData}
//                   dataKey="value"
//                   nameKey="name"
//                   cx="50%"
//                   cy="50%"
//                   outerRadius={80}
//                   label={({name, value}) => `${name}: ${value}`}
//                   labelLine={false}
//                 >
//                   {passData.map((entry, idx) => (
//                     <Cell key={entry.name} fill={PASS_COLORS[idx % PASS_COLORS.length]} />
//                   ))}
//                 </Pie>
//                 <Legend verticalAlign="bottom" />
//                 <Tooltip/>
//               </PieChart>
//             </ResponsiveContainer>
//           </div>

//           {/* Payments by Category */}
//           {expenseCategories.length > 0 && (
//             <div style={cardStyle}>
//               <div style={titleStyle}>{t("payments_by_category")}</div>
//               <ResponsiveContainer width="100%" height={280}>
//                 <PieChart>
//                   <Pie
//                     data={expenseCategories}
//                     dataKey="total"
//                     nameKey="category"
//                     cx="50%"
//                     cy="50%"
//                     outerRadius={80}
//                     label={({category, total}) => `${category}: ₹${formatNumber(total)}`}
//                     labelLine={false}
//                   >
//                     {expenseCategories.map((entry, idx) => (
//                       <Cell key={entry.category} fill={COLORS[idx % COLORS.length]}/>
//                     ))}
//                   </Pie>
//                   <Legend/>
//                   <Tooltip formatter={(value) => `₹${formatNumber(value)}`}/>
//                 </PieChart>
//               </ResponsiveContainer>
//             </div>
//           )}
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
import { useTranslation } from "react-i18next";

const GENDER_COLORS = ["#278BCD", "#E9B949"];
const PASS_COLORS = ["#56C596", "#F37272"];
const COLORS = ["#278BCD", "#E9B949", "#56C596", "#F37272", "#6d69fa", "#f2bb8e"];

const cardStyle = {
  background: "#000000",
  padding: 20,
  borderRadius: 8,
  border: "1px solid #333333",
  boxShadow: "0 1px 3px rgba(0,0,0,0.6)",
  color: "#ffffff"
};


const titleStyle = {
  fontSize: 16,
  fontWeight: 600,
  marginBottom: 16,
  color: "#ffffff"
};

function formatNumber(n) {
  return n && !isNaN(n) ? n.toLocaleString() : n;
}

export default function Charts({ unitId }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [selectedYear, setSelectedYear] = useState("");

  // Fetch analytics
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

        const allYears = [
          ...new Set([
            ...(res.data.allStudents?.map(s => s.academic_year) || []),
            ...(res.data.payments?.map(p => p.fiscal_year) || [])
          ])
        ]
          .filter(Boolean)
          .sort()
          .reverse();

        if (allYears.length > 0) {
          setSelectedYear(allYears[0]);
        }

        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch analytics:", err);
        setLoading(false);
      });
  }, [unitId]);

  // All years for dropdown (sorted descending)
  const allYears = useMemo(() => {
    if (!analytics) return [];
    const years = [
      ...new Set([
        ...(analytics.allStudents?.map(s => s.academic_year) || []),
        ...(analytics.payments?.map(p => p.fiscal_year) || [])
      ])
    ]
      .filter(Boolean)
      .sort()
      .reverse();
    return years.length > 0 ? years : ["2024-25"];
  }, [analytics]);

  // Salary paid trend across all financial years
  const salaryTrendData = useMemo(() => {
    if (!analytics?.payments || analytics.payments.length === 0) return [];
    const yearMap = {};
    analytics.payments.forEach(p => {
      if (!yearMap[p.fiscal_year]) {
        yearMap[p.fiscal_year] = 0;
      }
      yearMap[p.fiscal_year] += Number(p.total) || 0;
    });
    return Object.keys(yearMap)
      .sort()
      .map(year => ({
        year,
        salary: Math.round(yearMap[year])
      }));
  }, [analytics]);

  // Fees collected trend across all academic years
  const feesTrendData = useMemo(() => {
    if (!analytics?.allStudents || analytics.allStudents.length === 0) return [];
    const yearMap = {};
    analytics.allStudents.forEach(s => {
      if (!yearMap[s.academic_year]) {
        yearMap[s.academic_year] = 0;
      }
      yearMap[s.academic_year] += 5000; // placeholder per student
    });
    return Object.keys(yearMap)
      .sort()
      .map(year => ({
        year,
        fees: Math.round(yearMap[year])
      }));
  }, [analytics]);

  // Students by class
  const studentsByClass = useMemo(() => {
    return analytics?.studentsByClass?.map(row => ({
      standard: row.standard,
      count: parseInt(row.count, 10)
    })) || [];
  }, [analytics]);

  // Admissions per year
  const admissionsData = useMemo(() => {
    return analytics?.admissions?.map(row => ({
      year: String(row.year),
      count: parseInt(row.count, 10)
    })) || [];
  }, [analytics]);

  // Students for selected year
  const yearStudents = useMemo(() => {
    return analytics?.allStudents?.filter(s => s.academic_year === selectedYear) || [];
  }, [analytics, selectedYear]);

  const genderData = useMemo(() => [
    { name: "Male", value: yearStudents.filter(s => s.gender?.toLowerCase() === "male").length },
    { name: "Female", value: yearStudents.filter(s => s.gender?.toLowerCase() === "female").length }
  ], [yearStudents]);

  const passData = useMemo(() => [
    { name: "Passed", value: yearStudents.filter(s => s.passed === true).length },
    { name: "Failed", value: yearStudents.filter(s => s.passed === false).length }
  ], [yearStudents]);

  // Payments by category for selected year
  const expenseCategories = useMemo(() => {
    return analytics?.payments
      ?.filter(p => p.fiscal_year === selectedYear)
      .map(p => ({ ...p, total: Number(p.total) })) || [];
  }, [analytics, selectedYear]);

    // Students by standard for selected academic year
  const studentsByStandardYear = useMemo(() => {
    if (!analytics?.allStudents || !selectedYear) return [];
    const counts = {};
    analytics.allStudents
      .filter(s => s.academic_year === selectedYear)
      .forEach(s => {
        const std = s.standard || "NA";
        counts[std] = (counts[std] || 0) + 1;
      });

    return Object.keys(counts)
      .sort()
      .map(std => ({
        standard: std,
        count: counts[std]
      }));
  }, [analytics, selectedYear]);

  // Budget vs Expense
  const budgetVsExpense = useMemo(() => {
    return analytics?.budgets?.map(b => ({
      year: b.fiscal_year,
      Budget: Number(b.income || 0),
      Expenses: Number(b.expenses || 0),
      Surplus: Number(b.surplus || 0)
    })) || [];
  }, [analytics]);

  const fiscalYears = useMemo(() => {
    return [...new Set(analytics?.payments?.map(p => p.fiscal_year) || [])];
  }, [analytics]);

  if (loading || !analytics) {
    return <div style={{ padding: 24 }}>{t("loading")}...</div>;
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 32
      }}>
        <h2>{t("charts")}</h2>
        <div>
          <label style={{ marginRight: 12, fontWeight: 500 }}>
            {t("financial_year_label")}
          </label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: 6,
              border: "1px solid #ddd",
              fontSize: 14,
              fontWeight: 500
            }}
          >
            {allYears.map(year => (
              <option value={year} key={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      {/* SECTION 1: CURRENT YEAR CHARTS (Year Specific) */}
      <div style={{ marginBottom: 48 }}>
        <h3 style={{ marginBottom: 24, color: "#212b36" }}>
          {t("year_specific")} {selectedYear}
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          {/* Gender Distribution */}
          <div style={cardStyle}>
            <div style={titleStyle}>{t("students_by_gender")}</div>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={genderData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine={false}
                >
                  {genderData.map((entry, idx) => (
                    <Cell key={entry.name} fill={GENDER_COLORS[idx % GENDER_COLORS.length]} />
                  ))}
                </Pie>
                <Legend verticalAlign="bottom" />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Pass/Fail Distribution */}
          <div style={cardStyle}>
            <div style={titleStyle}>{t("pass_fail_distribution")}</div>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={passData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine={false}
                >
                  {passData.map((entry, idx) => (
                    <Cell key={entry.name} fill={PASS_COLORS[idx % PASS_COLORS.length]} />
                  ))}
                </Pie>
                <Legend verticalAlign="bottom" />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Students by Standard (Year specific) */}
<div style={cardStyle}>
  <div style={titleStyle}>{t("students_by_class_year_specific")}</div>
  <ResponsiveContainer width="100%" height={280}>
    <BarChart data={studentsByStandardYear}>
      <CartesianGrid strokeDasharray="3 3" stroke="#444444" />
      {/* use 'standard' here, not 'year' */}
      <XAxis dataKey="standard" stroke="#ffffff" />
      <YAxis stroke="#ffffff" />
      <Tooltip
        formatter={(value) => value}   // just the count
        contentStyle={{
          background: "#111111",
          border: "1px solid #444444",
          borderRadius: 6,
          color: "#ffffff"
        }}
      />
      <Legend wrapperStyle={{ color: "#ffffff" }} />
      <Bar dataKey="count" fill="#6d69fa" radius={[6, 6, 0, 0]} />
    </BarChart>
  </ResponsiveContainer>
</div>


          {/* Payments by Category */}
{expenseCategories.length > 0 && (
  <div style={cardStyle}>
    <div style={titleStyle}>{t("payments_by_category")}</div>
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={expenseCategories}
          dataKey="total"
          nameKey="category"
          cx="50%"
          cy="50%"
          outerRadius={80}
          label={({ category, total }) => `${category}: ₹${formatNumber(total)}`}
          labelLine={false}
        >
          {expenseCategories.map((entry, idx) => (
            <Cell
              key={entry.category}
              fill={COLORS[idx % COLORS.length]}
            />
          ))}
        </Pie>
        <Legend />
        <Tooltip formatter={(value) => `₹${formatNumber(value)}`} />
      </PieChart>
    </ResponsiveContainer>
  </div>


          )}
        </div>
      </div>

      {/* SECTION 2: TREND CHARTS (All Past Years) */}
      <div style={{ marginBottom: 48 }}>
        <h3 style={{ marginBottom: 24, color: "#212b36" }}>{t("financial_trends")}</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          {/* Salary Trend */}
          <div style={cardStyle}>
            <div style={titleStyle}>{t("salary_trend")}</div>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={salaryTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444444" />
<XAxis dataKey="year" stroke="#ffffff" />
<YAxis stroke="#ffffff" />

                <Tooltip
  formatter={(value) => `₹${formatNumber(value)}`}
  contentStyle={{
    background: "#111111",
    border: "1px solid #444444",
    borderRadius: 6,
    color: "#ffffff"
  }}
/>

<Legend
  wrapperStyle={{ color: "#ffffff" }}
/>

                <Line
                  type="monotone"
                  dataKey="salary"
                  stroke="#f57c00"
                  strokeWidth={2}
                  dot={{ fill: "#f57c00", r: 5 }}
                  activeDot={{ r: 7 }}
                  name={t("salary_paid")}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Fees Trend */}
          <div style={cardStyle}>
            <div style={titleStyle}>{t("fees_trend")}</div>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={feesTrendData}>
               <CartesianGrid strokeDasharray="3 3" stroke="#444444" />
<XAxis dataKey="year" stroke="#ffffff" />
<YAxis stroke="#ffffff" />

                <Tooltip
  formatter={(value) => `₹${formatNumber(value)}`}
  contentStyle={{
    background: "#111111",
    border: "1px solid #444444",
    borderRadius: 6,
    color: "#ffffff"
  }}
/>

<Legend
  wrapperStyle={{ color: "#ffffff" }}
/>

                <Line
                  type="monotone"
                  dataKey="fees"
                  stroke="#2e7d32"
                  strokeWidth={2}
                  dot={{ fill: "#2e7d32", r: 5 }}
                  activeDot={{ r: 7 }}
                  name={t("fees_collected")}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* SECTION 3: HISTORICAL CHARTS (All Years) */}
      <div>
        <h3 style={{ marginBottom: 24, color: "#212b36" }}>{t("historical_analysis")}</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          {/* Students by Class */}
          <div style={cardStyle}>
            <div style={titleStyle}>{t("students_by_class")}</div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={studentsByClass}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444444" />
<XAxis dataKey="standard" stroke="#ffffff" />
<YAxis stroke="#ffffff" />

                <Tooltip
  formatter={(value) => `₹${formatNumber(value)}`}
  contentStyle={{
    background: "#111111",
    border: "1px solid #444444",
    borderRadius: 6,
    color: "#ffffff"
  }}
/>

<Legend
  wrapperStyle={{ color: "#ffffff" }}
/>

                <Bar dataKey="count" fill="#0066cc" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Admissions per Year */}
          <div style={cardStyle}>
            <div style={titleStyle}>{t("admissions_per_year")}</div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={admissionsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444444" />
<XAxis dataKey="year" stroke="#ffffff" />
<YAxis stroke="#ffffff" />

                <Tooltip
  formatter={(value) => `₹${formatNumber(value)}`}
  contentStyle={{
    background: "#111111",
    border: "1px solid #444444",
    borderRadius: 6,
    color: "#ffffff"
  }}
/>

<Legend
  wrapperStyle={{ color: "#ffffff" }}
/>

                <Bar dataKey="count" fill="#00aa00" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Budget vs Expenses */}
          <div style={cardStyle}>
            <div style={titleStyle}>{t("budget_vs_expenses")}</div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={budgetVsExpense}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444444" />
<XAxis dataKey="year" stroke="#ffffff" />
<YAxis stroke="#ffffff" />

               <Tooltip
  formatter={(value) => `₹${formatNumber(value)}`}
  contentStyle={{
    background: "#111111",
    border: "1px solid #444444",
    borderRadius: 6,
    color: "#ffffff"
  }}
/>

<Legend
  wrapperStyle={{ color: "#ffffff" }}
/>

                <Legend />
                <Bar dataKey="Budget" fill="#0066cc" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Expenses" fill="#f57c00" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}