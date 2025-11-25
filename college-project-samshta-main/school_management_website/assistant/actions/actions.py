from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from typing import Any, Text, Dict
import os
import logging

logger = logging.getLogger(__name__)

class ActionNavigate(Action):
    def name(self) -> Text:
        return "action_navigate"
    

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]):
        # Identify role from sender_id set by your backend: "<session>|<role>"
        sid = tracker.sender_id or "anon|guest"
        role = (sid.split("|")[-1] if "|" in sid else "guest").lower()
        intent = (tracker.get_intent_of_latest_message() or "").lower()

        def say(msg: str):
            dispatcher.utter_message(json_message={"type": "answer", "say": msg})

        # If not logged in, never navigate—just guide
        if role == "guest":
            say("You're not logged in. Login first, then use the left menu.")
            return []

        # Role-specific guide text
        if role == "admin":
            GUIDE = {
                "dashboard": "📊 Admin Dashboard: shows total schools, staff, and students. Use it for a quick overview and to jump to specific school details.",
                "tables": "📋 Admin Tables: view all schools/units with their counts. Use search to find a unit; click a row to view full details.",
                "charts": "📈 Admin Charts: see trends for enrolment, staff, and budgets. Set School/Year filters, then hover over lines to see exact values.",
                "budgets": "💰 Admin Budgets: compare allocated vs spent money by year/month. Pick School + Year, then use Export to download the filtered data.",
                "notifications": "🔔 Admin Notifications: send messages and forms to Principals and Teachers. Create custom forms to gather information or issue instructions.",
                "admin": "Admin panel has Dashboard, Tables, Charts, Budgets, and Notifications. Ask me 'Explain charts', 'How to use tables', or 'What is shown on dashboard?'",
                "login": "Use the Login form: enter your email and password, then press Login.",
            }

        elif role == "teacher":
            GUIDE = {
                "dashboard": "📊 Teacher Dashboard: view your assigned students and classes. See attendance, grades, and performance metrics at a glance.",
                "charts": "📈 Teacher Charts: view student performance trends over time. See pass/fail distribution, attendance patterns, and class statistics.",
                "students": "👥 Teacher Students: view list of all students in your classes. Click on a student to see detailed profile, attendance, and grades.",
                "notifications": "🔔 Teacher Notifications: receive updates from Principal/Admin. You can also send messages to students and parents.",
                "profile": "👤 Teacher Profile: view and update your profile information. Manage your contact details and preferences.",
                "teacher": "Teacher panel has Dashboard, Charts, Students, Notifications, and Profile. Ask me 'Show my students', 'View charts', or 'How to update my profile?'",
                "login": "Use the Login form: enter your email and password, then press Login.",
            }

        elif role == "principal":
            GUIDE = {
                "dashboard": "📊 Principal Dashboard: view school overview with total staff and students. See key metrics for your school at a glance.",
                "charts": "📈 Principal Charts: view trends for admissions, budgets, and performance. Monitor school growth and resource allocation over time.",
                "tables": "📋 Principal Tables: view staff roster and student list. Search and filter to find specific staff or students.",
                "budgets": "💰 Principal Budgets: manage school budget - compare planned vs spent. Track income sources and expense categories.",
                "notifications": "🔔 Principal Notifications: send updates to staff and teachers. Create forms to collect information or send announcements.",
                "principal": "Principal panel has Dashboard, Charts, Tables, Budgets, and Notifications. Ask me 'Show my staff', 'View budgets', or 'How to send notifications?'",
                "login": "Use the Login form: enter your email and password, then press Login.",
            }

        else:
            # Unknown role - provide generic guide
            say("I can help you navigate the school management system. Please log in first to access your role-specific features.")
            return []

        # Map intent to appropriate guidance
        msg = None
        if "chart" in intent:           msg = GUIDE.get("charts")
        elif "table" in intent:         msg = GUIDE.get("tables")
        elif "budget" in intent:        msg = GUIDE.get("budgets")
        elif "dashboard" in intent:     msg = GUIDE.get("dashboard")
        elif "notification" in intent:  msg = GUIDE.get("notifications")
        elif "student" in intent:       msg = GUIDE.get("students")
        elif "profile" in intent:       msg = GUIDE.get("profile")
        elif "admin" in intent:         msg = GUIDE.get("admin")
        elif "teacher" in intent:       msg = GUIDE.get("teacher")
        elif "principal" in intent:     msg = GUIDE.get("principal")
        elif "login" in intent:         msg = GUIDE.get("login")

        if not msg:
            msg = GUIDE.get(role)

        say(msg)
        return []


class ActionLLMAnswer(Action):
    """Local fallback/knowledge lookup action.

    - Searches assistant/knowledge/*.md for matching docs.
    - If none found, tries to match known school names (fuzzy) and returns a helpful template.
    - Supports a simple Marathi reply when user asks for 'in Marathi' or uses Marathi keywords.
    """

    def name(self) -> Text:
        return "action_llm_answer"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]):
        user_text = (tracker.latest_message or {}).get("text", "") or ""
        text = user_text.lower()

        # Resolve knowledge directory relative to this file
        base = os.path.dirname(__file__)  # assistant/actions
        knowledge_dir = os.path.normpath(os.path.join(base, "..", "knowledge"))

        # load known schools from lookup file if available
        lookup_file = os.path.normpath(os.path.join(base, "..", "data", "lookup", "schools.txt"))
        known_schools = []
        try:
            with open(lookup_file, "r", encoding="utf-8") as f:
                known_schools = [l.strip() for l in f if l.strip()]
        except Exception:
            known_schools = []

        def say_text(msg: str):
            dispatcher.utter_message(text=msg)

        # Simple file-name match first
        best_match = None
        if os.path.isdir(knowledge_dir):
            for fname in os.listdir(knowledge_dir):
                if not fname.lower().endswith('.md'):
                    continue
                key = os.path.splitext(fname)[0].lower()
                for part in key.replace('-', ' ').replace('_', ' ').split():
                    if part and part in text:
                        best_match = os.path.join(knowledge_dir, fname)
                        break
                if best_match:
                    break

        # If no file matched by name, do a naive content search
        if not best_match and os.path.isdir(knowledge_dir):
            for fname in os.listdir(knowledge_dir):
                if not fname.lower().endswith('.md'):
                    continue
                path = os.path.join(knowledge_dir, fname)
                try:
                    with open(path, 'r', encoding='utf-8') as f:
                        content = f.read().lower()
                        tokens = [w for w in text.split() if len(w) > 2][:3]
                        if any(t in content for t in tokens):
                            best_match = path
                            break
                except Exception:
                    continue

        if best_match:
            try:
                with open(best_match, 'r', encoding='utf-8') as f:
                    body = f.read().strip()
                    reply = body.split('\n\n')[0][:1000]
                    say_text(reply)
                    return []
            except Exception:
                say_text("I found a doc but couldn't read it right now.")
                return []

        # Last-resort: attempt to handle school-name questions using fuzzy matching
        try:
            candidates = [s for s in known_schools if s]
            if candidates:
                import difflib
                # First try with user_text as-is (preserves case for mixed case names)
                match = difflib.get_close_matches(user_text, candidates, n=1, cutoff=0.5)
                # If no match, try lowercase matching
                if not match:
                    match = difflib.get_close_matches(text, [c.lower() for c in candidates], n=1, cutoff=0.5)
                    # Map back to original case
                    if match:
                        match_lower = match[0]
                        for s in candidates:
                            if s.lower() == match_lower:
                                match = [s]
                                break
                
                if match:
                    school = match[0]
                    en = (
                        f"📋 {school} is one of the units in your system. To view full details: open Dashboard, "
                        f"click the school card for {school}, or go to Tables and search '{school}'. You'll find staff lists, "
                        f"student counts, contact details, and recent activity."
                    )
                    mr = (
                        f"📋 {school} ही आपल्या प्रणालीतील एक युनिट आहे. तपशील पाहण्यासाठी Dashboard उघडा, {school} कार्डवर क्लिक करा "
                        f"किंवा Tables मध्ये '{school}' शोधा. तुम्हाला कर्मचारी व विद्यार्थी माहिती आणि संपर्क तपशील दिसतील."
                    )
                    # Check if user specifically requested Marathi
                    def is_marathi_request(s: str) -> bool:
                        for ch in s:
                            if '\u0900' <= ch <= '\u097F':  # Devanagari range
                                return True
                        return "marathi" in s.lower() or "मराठी" in s
                    
                    if is_marathi_request(user_text):
                        say_text(mr)
                        return []
                    say_text(en)
                    return []
        except Exception:
            pass

        say_text(
            "I couldn't find a matching document. Try asking something like 'show charts' or 'explain budgets', "
            "or open Dashboard/Tables and select a school to see details. If you want a Marathi reply, add 'in Marathi' to your question."
        )
        return []


class ActionLocalizedUtter(Action):
    """Selects the correct language variant from domain responses.

    - Detects Marathi by checking for Devanagari characters or the word 'marathi'/'मराठी' in the user text.
    - Maps the current intent to a response key and sends the English or Marathi text accordingly.
    - Falls back to a short default message when no response template is available.
    """

    def name(self) -> Text:
        return "action_localized_utter"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]):
        # Robust intent extraction: read from latest.parse_data first, then fallback to get_intent_of_latest_message
        latest = tracker.latest_message or {}
        parse_data = latest.get("parse_data", {})
        intent_dict = parse_data.get("intent", {})
        intent_name = intent_dict.get("name") if isinstance(intent_dict, dict) else None
        
        # Fallback to get_intent_of_latest_message if parse_data doesn't have intent
        if not intent_name:
            intent_name = tracker.get_intent_of_latest_message()
        
        intent = (intent_name or "").lower()
        
        # Log for debugging
        logger.info(f"ActionLocalizedUtter: detected intent='{intent}' from parse_data={intent_name is not None}")
        
        # Check if this is an ask_in_marathi intent - if so, skip localized_utter
        if intent == "ask_in_marathi":
            return []

        user_text = (latest.get("text", "") or "").strip()
        text = user_text

        # simple Marathi detection: presence of Devanagari characters or explicit keyword
        def looks_like_marathi(s: str) -> bool:
            if not s:
                return False
            low = s.lower()
            # Check for "in marathi" phrase or "marathi" keyword
            if "in marathi" in low or "marathi" in low or "मराठी" in s or "मराठीत" in s:
                return True
            # check for Devanagari range
            for ch in s:
                if '\u0900' <= ch <= '\u097F':
                    return True
            return False

        user_lang = "mr" if looks_like_marathi(text) else "en"

        # map intents to response keys defined in domain.yml
        intent_to_response = {
            "greet": "utter_greet",
            "goodbye": "utter_goodbye",
            "request_login": "utter_request_login",
            "request_password_reset": "utter_request_password_reset",
            "request_signup": "utter_request_signup",
            "request_logout": "utter_request_logout",
            "see_charts": "utter_see_charts",
            "use_charts": "utter_use_charts",
            "see_tables": "utter_see_tables",
            "use_tables": "utter_use_tables",
            "see_budgets": "utter_see_budgets",
            "use_budgets": "utter_use_budgets",
            "see_notifications": "utter_see_notifications",
            "use_notifications": "utter_use_notifications",
            "see_dashboard": "utter_see_dashboard",
            "request_help": "utter_request_help",
            "request_feedback": "utter_request_feedback",
            "ask_school_info": "utter_ask_school_info",
            "ask_fees": "utter_ask_fees",
            "ask_admissions": "utter_ask_admissions",
            "create_form": "utter_create_form",
            # Teacher-specific intents
            "ask_teacher_students": "utter_ask_teacher_students",
            "ask_teacher_profile": "utter_ask_teacher_profile",
            "ask_teacher_charts": "utter_ask_teacher_charts",
            "ask_teacher_attendance": "utter_ask_teacher_attendance",
            "ask_teacher_grades": "utter_ask_teacher_grades",
            "ask_teacher_notifications": "utter_ask_teacher_notifications",
        }

        response_key = intent_to_response.get(intent)

        # Defensive fallback: some trained models or older data may yield
        # alternative intent names (e.g. howto_charts, howto_tables, etc.)
        # or unexpected variations. If we didn't find a mapping above,
        # try a small substring-based heuristic to map to the expected
        # response keys so the assistant still replies sensibly.
        if not response_key and intent:
            if "chart" in intent:
                response_key = "utter_see_charts"
            elif "table" in intent:
                response_key = "utter_see_tables"
            elif "budget" in intent:
                response_key = "utter_see_budgets"
            elif "notification" in intent:
                response_key = "utter_see_notifications"
            elif "login" in intent:
                response_key = "utter_request_login"
            elif "dashboard" in intent:
                response_key = "utter_see_dashboard"
            # Teacher-specific fallbacks - improved matching
            elif "student" in intent:
                # Check user text for teacher context
                user_text_lower = text.lower()
                if "my" in user_text_lower or "view" in user_text_lower or "show" in user_text_lower or "see" in user_text_lower:
                    response_key = "utter_ask_teacher_students"
            elif "profile" in intent:
                user_text_lower = text.lower()
                if "my" in user_text_lower or "update" in user_text_lower or "edit" in user_text_lower:
                    response_key = "utter_ask_teacher_profile"
            elif "attendance" in intent:
                user_text_lower = text.lower()
                if "my" in user_text_lower or "teacher" in user_text_lower:
                    response_key = "utter_ask_teacher_attendance"
            elif "grade" in intent:
                user_text_lower = text.lower()
                if "my" in user_text_lower or "teacher" in user_text_lower:
                    response_key = "utter_ask_teacher_grades"
        
        # Log response key selection
        logger.info(f"ActionLocalizedUtter: intent='{intent}' -> response_key='{response_key}', user_lang='{user_lang}'")

        responses = (domain or {}).get("responses", {})
        messages = responses.get(response_key, []) if response_key else []

        if messages:
            # domain responses are lists of dicts with 'text' (we added English then Marathi)
            # prefer Marathi variant when detected and available
            try:
                if user_lang == "mr" and len(messages) > 1:
                    msg_obj = messages[1]
                else:
                    msg_obj = messages[0]
                # messages in YAML may be plain strings or dicts; handle both
                if isinstance(msg_obj, dict):
                    reply_text = msg_obj.get("text") or str(msg_obj)
                else:
                    reply_text = str(msg_obj)
            except Exception:
                reply_text = None

            if reply_text:
                dispatcher.utter_message(text=reply_text)
                return []

        # fallback small message (localized)
        if user_lang == "mr":
            dispatcher.utter_message(text="मला क्षमस्व — मला त्या प्रश्नाचे उत्तर सापडले नाही. थोडे वेगळे शब्द वापरून पुन्हा विचारा किंवा 'in Marathi' म्हणा.")
        else:
            dispatcher.utter_message(text="Sorry — I couldn't find a ready response for that. Try rephrasing or add 'in Marathi' if you'd like a Marathi reply.")

        return []


class ActionAnswerInMarathi(Action):
    """Explicitly answers the user's previous question in Marathi only.
    
    - Extracts the base intent (non-ask_in_marathi) from current message's intent ranking.
    - If not found in current message, searches conversation history for last non-ask_in_marathi intent.
    - Responds ONLY with the Marathi version of the matching response.
    """

    def name(self) -> Text:
        return "action_answer_in_marathi"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]):
        # Map intents to response keys (same mapping as localized_utter)
        intent_to_response = {
            "greet": "utter_greet",
            "goodbye": "utter_goodbye",
            "request_login": "utter_request_login",
            "request_password_reset": "utter_request_password_reset",
            "request_signup": "utter_request_signup",
            "request_logout": "utter_request_logout",
            "see_charts": "utter_see_charts",
            "use_charts": "utter_use_charts",
            "see_tables": "utter_see_tables",
            "use_tables": "utter_use_tables",
            "see_budgets": "utter_see_budgets",
            "use_budgets": "utter_use_budgets",
            "see_notifications": "utter_see_notifications",
            "use_notifications": "utter_use_notifications",
            "see_dashboard": "utter_see_dashboard",
            "request_help": "utter_request_help",
            "request_feedback": "utter_request_feedback",
            "ask_school_info": "utter_ask_school_info",
            "ask_fees": "utter_ask_fees",
            "ask_admissions": "utter_ask_admissions",
            "create_form": "utter_create_form",
            "ask_teacher_students": "utter_ask_teacher_students",
            "ask_teacher_profile": "utter_ask_teacher_profile",
            "ask_teacher_charts": "utter_ask_teacher_charts",
            "ask_teacher_attendance": "utter_ask_teacher_attendance",
            "ask_teacher_grades": "utter_ask_teacher_grades",
            "ask_teacher_notifications": "utter_ask_teacher_notifications",
        }

        # First, try to extract the base intent from CURRENT message's intent ranking
        # When user says "how to login in marathi", the ranking should have [howto_login, ask_in_marathi]
        response_key = None
        try:
            latest = (tracker.latest_message or {})
            ranking = latest.get("intent_ranking", []) or latest.get("parse_data", {}).get("intent_ranking", [])
            
            # Get the HIGHEST CONFIDENCE non-ask_in_marathi intent
            if ranking:
                for item in ranking:
                    name = item.get("name")
                    if name and name != "ask_in_marathi":
                        response_key = intent_to_response.get(name)
                        if response_key:
                            break
        except Exception:
            pass

        # If not found in current message, search conversation history for previous intent
        if not response_key:
            try:
                events = tracker.events or []
                # Search backwards from most recent
                for i in range(len(events) - 1, -1, -1):
                    event = events[i]
                    # Look for user events with parse_data
                    if event.get("event") == "user":
                        parse_data = event.get("parse_data", {})
                        intent_dict = parse_data.get("intent", {})
                        intent_name = intent_dict.get("name")
                        if intent_name and intent_name != "ask_in_marathi":
                            response_key = intent_to_response.get(intent_name)
                            if response_key:
                                break
            except Exception:
                pass
        responses = (domain or {}).get("responses", {})
        messages = responses.get(response_key, []) if response_key else []

        if messages and len(messages) > 1:
            # Get Marathi version (index 1)
            try:
                msg_obj = messages[1]
                if isinstance(msg_obj, dict):
                    reply_text = msg_obj.get("text") or str(msg_obj)
                else:
                    reply_text = str(msg_obj)
            except Exception:
                reply_text = None

            if reply_text:
                dispatcher.utter_message(text=reply_text)
                return []

        # If no previous intent found or no Marathi response, provide fallback
        dispatcher.utter_message(
            text="मला क्षमस्व, मला पूर्वी आपल्या कोणत्या प्रश्नाचे उत्तर देत होते ते समजले नाही. "
                 "कृपया पुन्हा आपला प्रश्न विचारा."
        )
        return []
