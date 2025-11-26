Prerequisites

Before you begin, ensure you have the following installed:
Python 3.7+ (3.8 or higher recommended)
pip (Python package manager)
Git (for cloning the repository)
Sufficient disk space for model weights and datasets

System Requirements

RAM: Minimum 4GB (8GB+ recommended for batch processing)
GPU: Optional but recommended for faster inference (NVIDIA GPU with CUDA support)
OS: Windows, macOS, or Linux

🚀 Installation
Step 1: Clone the Repository
bash
git clone https://github.com/Soundarya21-age/Classfier.git
cd Classfier
Step 2: Create a Virtual Environment (Recommended)
bash
# Using venv
python -m venv venv

# Activate the virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
Step 3: Install Dependencies
bash
pip install -r requirements.txt
Or install the required packages manually:
pip install tensorflow
pip install keras
pip install opencv-python
pip install numpy
pip install pandas
pip install matplotlib
pip install scikit-learn

Step 4: 
bash
For node modules: npm install
For firebase authentication
In Frontend: npm install firebase
In Backend: pip install firebase-admin

Step 5:
Add this files for firebase authentication credentials:
Frontend: .env.local
Backend: .env and serviceAccountKey


Step 5:
To RUN bash: 
Frontend : npm run dev
Backend: uvicorn main:app --reload --host 0.0.0.0 --port 8000
