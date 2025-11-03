# Backend setup
1. Create and activate a virtual environment:

python -m venv venv
source venv/bin/activate

2. Install dependencies:

pip install -r requirements.txt

3. Create a `.env` file:

OPENAI_API_KEY=sk-yourkeyhere

4. Run the server:

uvicorn app:app --reload