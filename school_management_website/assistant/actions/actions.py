from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from typing import Any, Text, Dict

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
            say("You’re not logged in. Login first, then use the left menu on the Admin panel.")
            return []

        # Admin-focused guide text (no navigation)
        GUIDE = {
            "dashboard": (
                "Admin → Dashboard: shows total schools, staff, and students. "
                "Use it for a quick overview and to jump to details."
            ),
            "tables": (
                "Admin → Tables: list of schools/units with counts. "
                "Use search to find a unit; click a row to view its details."
            ),
            "charts": (
                "Admin → Charts: trends for enrolment, staff, and budgets. "
                "Set School/Year filters first, then hover lines to see exact values."
            ),
            "budgets": (
                "Admin → Budgets: allocated vs spent by year/month. "
                "Pick School + Year. Use Export to download the filtered table."
            ),
            "admin": (
                "Admin panel has Dashboard, Tables, Charts, and Budgets in the left menu. "
                "Ask me 'Explain tables' or 'How to use budgets?'"
            ),
            "login": "Use the Login form: enter email and password, then press Login.",
        }

        msg = None
        if "chart" in intent:       msg = GUIDE["charts"]
        elif "table" in intent:     msg = GUIDE["tables"]
        elif "budget" in intent:    msg = GUIDE["budgets"]
        elif "dashboard" in intent: msg = GUIDE["dashboard"]
        elif "admin" in intent:     msg = GUIDE["admin"]
        elif "login" in intent:     msg = GUIDE["login"]

        if not msg:
            msg = ("Tell me what you need on Admin—e.g., 'Explain charts', 'How to use tables', "
                   "or 'What is shown on the dashboard?'")

        say(msg)
        return []
