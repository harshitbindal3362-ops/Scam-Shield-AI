Here is my project link:

https://scam-shield-ai--Jhhbhhj3.replit.app



🛡️ Agentic Scam Honey-Pot System


A state-driven, autonomous Honey-Pot system designed to detect, engage, and extract intelligence from scam conversations in a controlled and ethical manner.

Unlike traditional detection systems, this project actively interacts with scammers using a believable, non-technical persona to uncover actionable fraud artifacts such as UPI IDs, phone numbers, bank details, and phishing links.

🚀 Features:


🔍 Scam Detection Engine

    *Lightweight hybrid detection using rule-based patterns
    *Identifies UPI fraud, phishing, and bank threats

🤖 Agentic Conversation Engine

    *Finite-state machine (NOT random chat)
    *Multi-turn, goal-driven conversations
    *Human-like, safe persona

🎯 Active Intelligence Extraction

    *Extracts:
       ->UPI IDs
       ->Phone numbers
       ->Bank account numbers
       ->Phishing URLs
    *Tracks source message and confidence

🔁 Lifecycle Management

    *Controlled session flow:
        INIT → TRUST_BUILD → CONFUSION → COMPLIANCE_SIMULATION → TARGETED_EXTRACTION → EXIT

📊 Structured Output

    *Returns clean JSON with:
      ->Scam detection result
      ->Extracted intelligence
      ->Engagement metrics

🧠 How It Works:

1. Detection
    Incoming messages are analyzed using pattern matching to identify scam intent.
2. Agent Behavior
    A finite-state controller ensures:
     ->Purposeful replies
     ->No random responses
     ->Controlled progression
3. Extraction
    Each message is scanned for:
     ->Financial identifiers
     ->Contact details
     ->Malicious links
4. Exit Strategy
    The system disengages safely after extracting useful intelligence.

🧍 Persona Design

The system simulates:
    ->A non-technical, slightly confused user
    ->Cooperative but cautious behavior
    ->No real transactions or sensitive actions
Example:
"I tried sending money but it's not working. Can you help?"

⚖️ Ethical Considerations

   ❌ No real payments or OTP sharing
   ❌ No impersonation of real individuals  
   ❌ No harmful or illegal activity
   ✅ Safe disengagement after extraction

🛠️ Tech Stack

    ->Python
    ->FastAPI
    ->Regex-based NLP
    ->Stateful session management

🏁 Summary

    This project demonstrates a shift from passive scam detection to active, agentic defense, where conversations are controlled,             purposeful, and intelligence-driven.
