import os
import subprocess
import sys
from dotenv import load_dotenv

load_dotenv()

subprocess.run([
    sys.executable, "-m", "uvicorn",
    "api.main:app",
    "--host", "0.0.0.0",
    "--port", "8000"
], env=os.environ)
