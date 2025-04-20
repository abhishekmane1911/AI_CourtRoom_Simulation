import json
import os

def format_conversation_for_training(conversation):
    formatted_data = []
    
    # Group messages by role for context
    for turn in conversation:
        # Format the prompt and completion
        system_prompt = f"You are a {turn['role']} in a court proceeding. Maintain appropriate legal language and demeanor."
        
        # Get previous turns for context (up to 3 turns)
        start_idx = max(0, turn['turn'] - 3)
        context = conversation[start_idx:turn['turn']-1]
        context_str = "\n".join([f"{msg['role']}: {msg['content']}" for msg in context])
        
        # Format the training example
        prompt = f"""<|system|>
{system_prompt}

<|context|>
{context_str}

<|user|>
Continue the court proceedings as {turn['role']}.

<|assistant|>"""

        completion = f"{turn['content']}\n"
        
        formatted_data.append({
            "prompt": prompt,
            "completion": completion
        })
    
    return formatted_data

def main():
    # Read the case file
    with open('/Users/abhishek/Desktop/Machine Learning/Cyn_court/frontend/data/case1.json', 'r') as f:
        case_data = json.load(f)
    
    # Extract and format the conversation
    conversation = case_data['trial_conversation']
    training_data = format_conversation_for_training(conversation)
    
    # Save formatted data
    output_dir = '/Users/abhishek/Desktop/Machine Learning/Cyn_court/training'
    os.makedirs(output_dir, exist_ok=True)
    
    with open(f'{output_dir}/training_data.jsonl', 'w') as f:
        for example in training_data:
            f.write(json.dumps(example) + '\n')

if __name__ == "__main__":
    main()