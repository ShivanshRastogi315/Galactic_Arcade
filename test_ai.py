import os
from dotenv import load_dotenv
import google.generativeai as genai
import PyPDF2  # <-- Our new PDF library

# 1. Load Credentials
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("🚨 ERROR: Python cannot find the API key in the .env file!")
    exit()

genai.configure(api_key=api_key)

# 2. PDF Extraction Function
def extract_text_from_pdf(pdf_path):
    text = ""
    try:
        # Open the PDF file in read-binary mode
        with open(pdf_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            # Loop through every page and extract the text
            for page in reader.pages:
                text += page.extract_text() + "\n"
        return text
    except FileNotFoundError:
        print(f"🚨 ERROR: Could not find '{pdf_path}'. Did you put it in the folder?")
        exit()

# 3. Define our Dungeon Master Rules (System Prompt)
system_prompt = """
ROLE: You are an expert AI Game Master and Educational Syllabus Parser. 

TASK: Convert the provided academic syllabus text into a structured RPG campaign map. You must analyze the academic concepts and translate them into a logical sequence of game events.

INSTRUCTIONS:
1. Parse the text and identify the overarching "Modules" or "Units." Treat these as map 'Regions'.
2. Identify the core sub-topics within those modules. Treat these as individual 'Quests'.
3. Identify the final, most complex, or culminating concept of each module. Treat this as the 'Boss Fight' for that Region.
4. Assign an 'xp_reward' (Experience Points) to each quest based on estimated difficulty (e.g., 50 XP for basic theory, 200 XP for complex applications).
5. Establish 'prerequisites' by listing the exact names of quests that must be completed before unlocking the current one.

OUTPUT FORMAT:
Return ONLY a valid JSON object. Do not use markdown blocks (like ```json).
Schema required:
{
  "campaign_name": "Course Name",
  "total_regions": 1,
  "regions": [
    {
      "region_name": "Unit Name",
      "region_order": 1,
      "quests": [{"quest_id": "q1", "quest_name": "Topic", "description": "RPG desc", "xp_reward": 50, "prerequisites": []}],
      "boss_fight": {"boss_name": "Final Topic", "description": "RPG desc", "xp_reward": 500, "weakness": "Study tip"}
    }
  ]
}
"""

# 4. Initialize the AI model
model = genai.GenerativeModel(
    model_name="gemini-2.5-flash",
    system_instruction=system_prompt,
    generation_config={"response_mime_type": "application/json"}
)

# 5. Execute the Workflow
print("📖 Reading the PDF...")
# Point it to the file you just dropped in the folder
real_syllabus_text = extract_text_from_pdf("syllabus.pdf")

print("🧙‍♂️ Summoning the Dungeon Master (Waiting for AI response)...")
# Pass the extracted text instead of the dummy string
response = model.generate_content(real_syllabus_text)

print("\n--- 🗺️ RPG MAP GENERATED FROM PDF ---")
print(response.text)