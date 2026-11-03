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
import RoleManagement from "../pages/account/RoleManagement.jsx";
import UserManagement from "../pages/account/UserManagement.jsx";
import UserPermissionManagement from "../pages/account/UserPermissionManagement.jsx";
import ProtectedRoute from "../components/auth/ProtectedRoute.jsx";
import { routePermissions } from "../constants/menuConfig";

// Chặn truy cập trang theo quyền khai báo trong menuConfig (path không khai báo => chỉ cần đăng nhập)
const guard = (path, element) => (
  <ProtectedRoute element={element} requiredPermission={routePermissions[path]} />
);

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
        <Route path="profile" element={guard("profile", <Profile />)} />
        <Route path="profile/:id" element={guard("profile/:id", <Profile />)} />
        <Route path="HR-report" element={guard("HR-report", <HRReportScreen />)} />
        <Route path="employee/new" element={guard("employee/new", <EmployeeForm />)} />
        <Route path="recruitment" element={guard("recruitment", <RecruitmentScreen />)} />
        <Route path="kernel-report" element={guard("kernel-report", <HRMovementReport />)} />
        <Route path="leave-dashboard" element={guard("leave-dashboard", <LeaveDashboard />)} />
        <Route path="leave-list" element={guard("leave-list", <LeaveList />)} />
        <Route path="leave-config" element={guard("leave-config", <LeaveTypeConfig />)} />
        <Route path="leave-approval" element={guard("leave-approval", <LeaveApproval />)} />
        <Route path="leave-request-form" element={guard("leave-request-form", <LeaveRequestForm />)} />
        <Route path="training-list" element={guard("training-list", <TrainingList />)} />
        <Route path="employee-termination-list" element={guard("employee-termination-list", <EmployeeTerminationList />)} />
        <Route path="resignation-letter-form" element={guard("resignation-letter-form", <ResignationLetterForm />)} />
        <Route path="leave-request-list" element={guard("leave-request-list", <LeaveRequestList />)} />
        <Route path="leave-request-detail/:id" element={guard("leave-request-detail/:id", <LeaveRequestDetail />)} />
        <Route path="leave-summary-table" element={guard("leave-summary-table", <LeaveSummaryTable />)} />
        <Route path="attendance" element={guard("attendance", <AttendanceScreen />)} />
        <Route path="shift-assignment" element={guard("shift-assignment", <ShiftAssignmentPage />)} />
        <Route path="leave-types/create" element={guard("leave-types/create", <LeaveTypeCreate />)} />
        <Route path="holiday-config" element={guard("holiday-config", <HolidayList />)} />
        <Route path="work-shifts" element={guard("work-shifts", <WorkShiftList />)} />
        <Route path="work-shift-summary" element={guard("work-shift-summary", <WorkShiftSummary />)} />
        <Route path="callback/microsoft" element={<MicrosoftCallback />} />
        <Route path="leave-requests-sent" element={guard("leave-requests-sent", <LeaveRequestSent />)} />
        <Route path="leave-requests-all" element={guard("leave-requests-all", <LeaveRequestAllList />)} />
        <Route path="work-shift-rules" element={guard("work-shift-rules", <WorkShiftRuleList />)} />
        <Route path="approval-flow-config" element={guard("approval-flow-config", <ApprovalFlowConfig />)} />
        <Route path="approval-settings" element={guard("approval-settings", <ApprovalSettingsList />)} />
        <Route path="approval-settings/update/:id" element={guard("approval-settings/update/:id", <ApprovalSettingUpdateModal />)} />
        <Route path="attendance-daily-report" element={guard("attendance-daily-report", <AttendanceDailyReport />)} />
        <Route path="leave-summary" element={guard("leave-summary", <LeaveSummaryPage />)} />
        <Route path="departments" element={guard("departments", <DepartmentManagement />)} />
        <Route path="positions" element={guard("positions", <PositionManagement />)} />
        <Route path="role-management" element={guard("role-management", <RoleManagement />)} />
        <Route path="user-management" element={guard("user-management", <UserManagement />)} />
        <Route path="user-permission-management" element={guard("user-permission-management", <UserPermissionManagement />)} />
        {/* catch-all route for "Not Found" */}
        {/* <Route path="*" element={<NotFound />} /> */}
      </Route>
    </Routes>
  );
}
