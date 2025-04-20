import requests
import os

def create_modelfile(modelfile_path: str):
    # Define the content of the Modelfile
    modelfile_content = '''FROM gemma3

# System prompt for legal proceedings
SYSTEM """You are an AI trained to participate in court proceedings. You understand legal terminology, court etiquette, and can emulate various roles including judges, attorneys, and witnesses. Maintain professional conduct and appropriate legal language at all times."""

# Training parameters
PARAMETER temperature 0.7
PARAMETER top_p 0.9
PARAMETER stop "<|user|>" "<|assistant|>" "<|system|>"

# Load training data
FILE /training/training_data.jsonl
'''

    try:
        with open(modelfile_path, 'w') as f:
            f.write(modelfile_content)
        print(f"✅ Modelfile created at: {modelfile_path}")
    except Exception as e:
        print(f"❌ Failed to write Modelfile: {e}")

def main():
    # Set paths
    base_path = '/Users/abhishek/Desktop/Machine Learning/Cyn_court'
    modelfile_path = os.path.join(base_path, 'Modelfile')

    # Create Modelfile
    create_modelfile(modelfile_path)

    # Make API request to Ollama
    print("🚀 Starting fine-tuning process...")

    try:
        response = requests.post(
            'http://localhost:11434/api/create',
            json={
                'name': 'courtroom-gemma',
                'path': modelfile_path
            }
        )
        if response.status_code == 200:
            print("✅ Model fine-tuning completed successfully!")
        else:
            print(f"❌ Error during fine-tuning: {response.status_code} - {response.text}")
    except requests.exceptions.RequestException as err:
        print(f"❌ Request failed: {err}")

if __name__ == "__main__":
    main()