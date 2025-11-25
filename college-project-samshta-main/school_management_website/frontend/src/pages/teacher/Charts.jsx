import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import ChatWidget from "../../components/ChatWidget";

const GENDER_COLORS = ["#278BCD", "#E9B949"];
const PASS_COLORS = ["#56C596", "#F37272"];

export default function Charts() {
  const { t } = useTranslation();
  const [allYears, setAllYears] = useState([]);
  const [academicYear, setAcademicYear] = useState("");
  const [genderData, setGenderData] = useState([]);
  const [passData, setPassData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchYears() {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/teacher/academic-years", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAllYears(res.data);
        if (res.data.length > 0) setAcademicYear(res.data[0]);
      } catch (err) {}
    }
    fetchYears();
  }, []);

  useEffect(() => {
    if (!academicYear) return;
    async function fetchData() {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `http://localhost:5000/api/teacher/students?academic_year=${encodeURIComponent(academicYear)}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const students = res.data || [];
        const males = students.filter(s => s.gender?.toLowerCase() === "male").length;
        const females = students.filter(s => s.gender?.toLowerCase() === "female").length;
        setGenderData([
          { name: "Male", value: males },
          { name: "Female", value: females }
        ]);
        const passed = students.filter(s => s.passed === true).length;
        const failed = students.filter(s => s.passed === false).length;
        setPassData([
          { name: "Passed", value: passed },
          { name: "Failed", value: failed }
        ]);
        setLoading(false);
      } catch (err) {
        setGenderData([]);
        setPassData([]);
        setLoading(false);
      }
    }
    fetchData();
  }, [academicYear]);

  return (
    <>
    <div style={{
      background: "#23242a",
      minHeight: "100vh",
      padding: "32px 0",
      color: "#fff"
    }}>
      <div className="container" style={{ maxWidth: 990 }}>
        <h2 className="mb-4" style={{ color: "#fff" }}>{t("charts_dashboard") || "Charts Dashboard"}</h2>
        <div className="mb-3">
          <label>
            <strong>{t("select_academic_year") || "Select Academic Year"}</strong>
          </label>
          <select
            className="form-control"
            style={{ maxWidth: 220, display: "inline-block", marginLeft: 15, marginBottom: "18px" }}
            value={academicYear}
            onChange={e => setAcademicYear(e.target.value)}
          >
            {allYears.map(year => (
              <option value={year} key={year}>{year}</option>
            ))}
          </select>
        </div>
        <div style={{
          display: "flex",
          justifyContent: "center",
          gap: "25px",
          flexWrap: "wrap"
        }}>
          {/* Gender Pie */}
          <div style={{
            background: "#2A2C34",
            borderRadius: 10,
            width: 340,
            padding: "18px 8px 6px 8px",
            boxShadow: "0 2px 18px 1px #04141d"
          }}>
            <h4 style={{ color: "#fff", textAlign: "center", fontSize: "20px", fontWeight: 500, marginBottom: 0 }}>
              Students by Gender
            </h4>
            {loading ? (
              <div style={{textAlign: "center"}}>Loading...</div>
            ) : (
              <ResponsiveContainer width="100%" height={210}>
                <PieChart>
                  <Pie
                    data={genderData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="52%"
                    outerRadius={80}
                    label={({ name, value }) => `${value}`}
                    labelLine={false}
                  >
                    {genderData.map((entry, idx) => (
                      <Cell key={entry.name} fill={GENDER_COLORS[idx % GENDER_COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    formatter={(value, entry, idx) =>
                      <span style={{ color: "#ddd", fontWeight: 500 }}>{value}</span>
                    }
                  />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          {/* Pass Pie */}
          <div style={{
            background: "#2A2C34",
            borderRadius: 10,
            width: 340,
            padding: "18px 8px 6px 8px",
            boxShadow: "0 2px 18px 1px #04141d"
          }}>
            <h4 style={{ color: "#fff", textAlign: "center", fontSize: "20px", fontWeight: 500, marginBottom: 0 }}>
              Pass/Fail Distribution
            </h4>
            {loading ? (
              <div style={{textAlign: "center"}}>Loading...</div>
            ) : (
              <ResponsiveContainer width="100%" height={210}>
                <PieChart>
                  <Pie
                    data={passData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="52%"
                    outerRadius={80}
                    label={({ name, value }) => `${value}`}
                    labelLine={false}
                  >
                    {passData.map((entry, idx) => (
                      <Cell key={entry.name} fill={PASS_COLORS[idx % PASS_COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    formatter={(value, entry, idx) =>
                      <span style={{ color: "#ddd", fontWeight: 500 }}>{value}</span>
                    }
                  />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
    <ChatWidget />
    </>
  );
}
