import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      // Common fields
      name: "Name",
      email: "Email",
      phone: "Phone",
      qualification: "Qualification",
      full_name: "Full Name",
      address: "Address",
      dob: "Date of Birth",
      gender: "Gender",
      status: "Status",
      loading: "Loading",
      updated_at: "Last Updated",

      // School related
      select_school: "Select School",
      select_a_school: "Select a school",
      unit_id: "Unit ID",
      
      // Teacher related
      teachers: "Teachers",
      teacher_profile: "Teacher Profile",
      subject: "Subject",
      designation: "Designation",
      joining_date: "Joining Date",
      tenure_start_date: "Tenure Start Date",
      tenure_end_date: "Tenure End Date",
      active: "Active",
      retired: "Retired",
      on_leave: "On Leave",
      no_teachers_found: "No teachers found",

      // Student related
      students: "Students",
      roll_no: "Roll No",
      standard: "Standard",
      division: "Division",
      parent_name: "Parent Name",
      parent_phone: "Parent Phone",
      no_students_found: "No students found",

      // Principal related
      principal_profile: "Principal Profile",

      // Navigation & Actions
      dashboard: "Dashboard",
      profile: "Profile",
      logout: "Logout",
      select_tab: "Select Tab",
      edit_profile: "Edit Profile",
      save_changes: "Save Changes",
      cancel: "Cancel",
      back_to_dashboard: "Back to Dashboard",

      // Status messages
      loading_profile: "Loading Profile...",
      failed_load_profile: "Failed to load profile",
      failed_load_students: "Failed to load students",
      failed_load_units: "Failed to load units",
      failed_update: "Failed to update",
      all_fields_required: "All fields are required",
      onboarding_failed: "Onboarding failed",

      // Notifications
      notifications: "Notifications",
      no_notifications: "No notifications found",
      notification_title: "Notifications",
      mark_as_read: "Mark as read"
    }
  },
  mr: {
    translation: {
      // Common fields
      name: "नाव",
      email: "ईमेल",
      phone: "फोन",
      qualification: "शैक्षणिक पात्रता",
      full_name: "पूर्ण नाव",
      address: "पत्ता",
      dob: "जन्मतारीख",
      gender: "लिंग",
      status: "स्थिती",
      loading: "लोड करत आहे",
      updated_at: "अखेरचे अपडेट",

      // School related
      select_school: "शाळा निवडा",
      select_a_school: "एक शाळा निवडा",
      unit_id: "युनिट आयडी",

      // Teacher related
      teachers: "शिक्षक",
      teacher_profile: "शिक्षक प्रोफाइल",
      subject: "विषय",
      designation: "पद",
      joining_date: "कार्यारंभ दिनांक",
      tenure_start_date: "कालावधी सुरू दिनांक",
      tenure_end_date: "कालावधी समाप्ती दिनांक",
      active: "कार्यरत",
      retired: "सेवानिवृत्त",
      on_leave: "रजेवर",
      no_teachers_found: "कोणतेही शिक्षक सापडले नाहीत",

      // Student related
      students: "विद्यार्थी",
      roll_no: "हजेरी क्रमांक",
      standard: "इयत्ता",
      division: "तुकडी",
      parent_name: "पालकांचे नाव",
      parent_phone: "पालकांचा फोन",
      no_students_found: "कोणतेही विद्यार्थी सापडले नाहीत",

      // Principal related
      principal_profile: "मुख्याध्यापक प्रोफाइल",

      // Navigation & Actions
      dashboard: "डॅशबोर्ड",
      profile: "प्रोफाइल",
      logout: "लॉगआउट",
      select_tab: "टॅब निवडा",
      edit_profile: "प्रोफाइल संपादित करा",
      save_changes: "बदल जतन करा",
      cancel: "रद्द करा",
      back_to_dashboard: "डॅशबोर्डवर परत जा",

      // Status messages
      loading_profile: "प्रोफाइल लोड करत आहे...",
      failed_load_profile: "प्रोफाइल लोड करण्यात अयशस्वी",
      failed_load_students: "विद्यार्थी लोड करण्यात अयशस्वी",
      failed_load_units: "युनिट्स लोड करण्यात अयशस्वी",
      failed_update: "अपडेट करण्यात अयशस्वी",
      all_fields_required: "सर्व फील्ड्स आवश्यक आहेत",
      onboarding_failed: "ऑनबोर्डिंग अयशस्वी",

      // Notifications
      notifications: "सूचनाएँ",
      no_notifications: "कोई सूचना नहीं मिली",
      notification_title: "सूचनाएँ",
      mark_as_read: "पढ़ा के रूप में चिह्नित करें"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;