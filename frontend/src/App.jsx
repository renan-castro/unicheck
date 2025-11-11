import { React } from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home/Home";
import TeacherForm from "./pages/teacherForm/teacherForm";
import StudentForm from "./pages/studentForm/studentForm";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/teacher-form" element={<TeacherForm />} />
      <Route path="/student-form" element={<StudentForm />} />
    </Routes>
  );
}
