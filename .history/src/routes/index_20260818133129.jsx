import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../pages/MainLayout.jsx";
import { useAuthStore } from "../store/StoreProvider.jsx";

import Login from "../pages/Login.jsx";
import MicrosoftCallback from "../pages/MicrosoftCallback.jsx";
import Profile from "../pages/profile.tsx";
import HRReportScreen from "../components/HRReportScreen.jsx";
import EmployeeForm from "../components/EmployeeForm.jsx";
import HRMovementReport from "../components/kernelReport.js";
import RecruitmentScreen from "../pages/RecruitmentScreen.jsx";
import LeaveDashboard from "../pages/LeaveDashboard.jsx";
import LeaveList from "../pages/LeaveList.jsx";
import LeaveTypeConfig from "../pages/LeaveTypeConfig.jsx";
import LeaveApproval from "../pages/LeaveApproval.jsx";
import LeaveRequestForm from "../pages/LeaveRequestForm.jsx";
import TrainingList from "../pages/TrainingList.jsx";
import EmployeeTerminationList from "../pages/EmployeeTerminationList.jsx";
import ResignationLetterForm from "../components/ResignationLetterForm.jsx";
import LeaveRequestList from "../pages/LeaveRequestList.jsx";
import LeaveRequestDetail from "../pages/LeaveRequestDetail.jsx";
import LeaveSummaryTable from "../pages/LeaveSummaryTable.jsx";
import AttendanceScreen from "../pages/AttendanceScreen.jsx";
import ShiftAssignmentPage from "../pages/ShiftAssignmentPage.jsx";
import LeaveTypeCreate from "../components/LeaveTypeCreate.jsx";
import HolidayList from "../pages/HolidayTypeConfig.jsx";
import HolidayCreate from "../components/HolidayCreate.jsx";
import WorkShiftList from "../pages/WorkShiftList.jsx";
import WorkShiftSummary from "../pages/WorkShiftSummary.jsx";
import LeaveRequestSent from "../pages/LeaveRequestSent.jsx";
import LeaveRequestAllList from "../pages/LeaveRequestAllList.jsx";
import WorkShiftRuleList from "../pages/WorkShiftRuleList.jsx";
import ApprovalFlowConfig from "../pages/ApprovalFlowConfig.jsx";
import ApprovalSettingsList from "../pages/ApprovalSettingsList.jsx";
import ApprovalSettingUpdateModal from "../components/ApprovalSettingUpdateModal.jsx";
import AttendanceDailyReport from "../pages/AttendanceDailyReport.jsx";
import LeaveSummaryPage from "../pages/LeaveSummaryPage.jsx";
import DepartmentManagement from "../pages/DepartmentManagement.jsx";
import PositionManagement from "../pages/PositionManagement.jsx";

function PrivateRoute({ children, roles, publicRoute }) {
  const auth = useAuthStore();

  if (!publicRoute && !auth.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && roles.length > 0) {
    const hasRole = roles.some((role) => auth.userRoles.includes(role));
    if (!hasRole) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Redirect root to /login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Route login ngoài MainLayout */}
      <Route path="/login" element={<Login />} />
      <Route path="/callback/microsoft" element={<MicrosoftCallback />} />

      {/* Main Layout for other routes */}
      <Route path="/" element={<MainLayout />}>
        <Route path="profile" element={<Profile />} />
        <Route path="profile/:id" element={<Profile />} />
        <Route path="HR-report" element={<HRReportScreen />} />
        <Route path="employee/new" element={<EmployeeForm />} />
        <Route path="recruitment" element={<RecruitmentScreen />} />
        <Route path="kernel-report" element={<HRMovementReport />} />
        <Route path="leave-dashboard" element={<LeaveDashboard />} />
        <Route path="leave-list" element={<LeaveList />} />
        <Route path="leave-config" element={<LeaveTypeConfig />} />
        <Route path="leave-approval" element={<LeaveApproval />} />     
        <Route path="leave-request-form" element={<LeaveRequestForm />} />
        <Route path="training-list" element={<TrainingList />} />
        <Route path="employee-termination-list" element={<EmployeeTerminationList />} />
        <Route path="resignation-letter-form" element={<ResignationLetterForm />} />
        <Route path="leave-request-list" element={<LeaveRequestList />} />
        <Route path="leave-request-detail/:id" element={<LeaveRequestDetail />} />
        <Route path="leave-summary-table" element={<LeaveSummaryTable />} />
        <Route path="attendance" element={<AttendanceScreen />} />
        <Route path="shift-assignment" element={<ShiftAssignmentPage />} />
        <Route path="leave-types/create" element={<LeaveTypeCreate />} />
        <Route path="holiday-config" element={<HolidayList />} />
        <Route path="work-shifts" element={<WorkShiftList />} />
        <Route path="work-shift-summary" element={<WorkShiftSummary />} />
        <Route path="callback/microsoft" element={<MicrosoftCallback />} />
        <Route path="leave-requests-sent" element={<LeaveRequestSent />} />
        <Route path="leave-requests-all" element={<LeaveRequestAllList />} />
        <Route path="work-shift-rules" element={<WorkShiftRuleList />} />
        <Route path="approval-flow-config" element={<ApprovalFlowConfig />} />
        <Route path="approval-settings" element={<ApprovalSettingsList />} />
        <Route path="approval-settings/update/:id" element={<ApprovalSettingUpdateModal />} />
        <Route path="attendance-daily-report" element={<AttendanceDailyReport />} />
        <Route path="leave-summary" element={<LeaveSummaryPage />} />
        <Route path="departments" element={<DepartmentManagement />} />
        <Route path="positions" element={<PositionManagement />} />
        {/* catch-all route for "Not Found" */}
        {/* <Route path="*" element={<NotFound />} /> */}
      </Route>
    </Routes>
  );
}
