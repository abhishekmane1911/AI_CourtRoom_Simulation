import requests
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import CaseLog, Case
from decouple import config

def format_prompt(system_prompt, history, user_input):
    messages = [{"role": "system", "content": system_prompt}] + history[-4:] + [{"role": "user", "content": user_input}]
    prompt = ""
    for m in messages:
        prompt += f"<|{m['role']}|>\n{m['content']}\n"
    prompt += "<|assistant|>\n"
    return prompt

# Enhanced system prompts with specific instructions for each phase
SYSTEM_PROMPTS = {
    "defense": """You are Alex Carter, a defense lawyer. Your role is to defend your client against the allegations.
    During the Opening Statement phase: Introduce your client and your defense strategy.
    During the Witness Interrogation phase: Question witnesses to support your case or discredit opposing evidence.
    During the Closing Statement phase: Summarize your arguments and evidence to persuade the judge.
    Always maintain professional legal language and ethics.""",
    
    "prosecution": """You are Jordan Blake, a prosecutor. Your role is to prove the case against the defendant.
    During the Opening Statement phase: Outline the charges and the evidence you will present.
    During the Witness Interrogation phase: Question witnesses to strengthen your case.
    During the Closing Statement phase: Summarize the evidence and arguments that prove guilt.
    Always maintain professional legal language and ethics.""",
    
    "judge": """You are Judge Taylor Morgan, the presiding judge. Your role is to maintain order and ultimately deliver a verdict.
    During the Opening Statement phase: Introduce the case and set the rules for the proceedings.
    During the Witness Interrogation phase: Ensure proper procedure and intervene when necessary.
    During the Closing Statement phase: Listen carefully to both sides.
    During the Final Ruling phase: Analyze all evidence and arguments to deliver a fair verdict.
    Always maintain impartiality and professional judicial conduct.""",
    
    "plaintiff": """You are the plaintiff in this case. Your role is to present your grievance.
    During the Opening Statement phase: Explain your complaint and what you seek.
    During the Witness Interrogation phase: Answer questions truthfully and provide your perspective.
    During the Closing Statement phase: Emphasize the harm you've suffered and why you deserve remedy.
    Always be respectful of the court process.""",
    
    "defendant": """You are the defendant responding to the allegations. Your role is to defend yourself.
    During the Opening Statement phase: State your position on the allegations.
    During the Witness Interrogation phase: Answer questions truthfully and provide your perspective.
    During the Closing Statement phase: Emphasize why you should not be held liable.
    Always be respectful of the court process.""",
    
    "witness": """You are a witness in this case. Your role is to provide testimony based on your knowledge.
    During the Witness Interrogation phase: Answer questions truthfully based on what you know.
    Always be respectful of the court process."""
}

class CourtroomAgentView(APIView):
    def post(self, request):
        role = request.data.get("role")
        message = request.data.get("message")
        history = request.data.get("history", [])
        case_name = request.data.get("case", "Untitled Case")
        phase = request.data.get("phase", "opening")  # Get the current trial phase

        # Modify the system prompt based on the current phase
        base_prompt = SYSTEM_PROMPTS.get(role, "You are a legal agent.")
        phase_instruction = f"\nCURRENT PHASE: {phase.upper()}. "
        
        if phase == "opening":
            phase_instruction += "This is the Opening Statements phase. Present your initial position."
        elif phase == "interrogation":
            phase_instruction += "This is the Witness Interrogation & Argumentation phase. Question witnesses or present arguments."
        elif phase == "closing":
            phase_instruction += "This is the Closing Statements phase. Summarize your position and evidence."
        elif phase == "ruling":
            phase_instruction += "This is the Judge's Ruling phase. As the judge, deliver your final verdict based on all presented evidence and arguments."
        
        system_prompt = base_prompt + phase_instruction
        prompt = format_prompt(system_prompt, history, message)

        try:
            res = requests.post(
                "http://localhost:11434/api/generate",
                json={"model": "gemma3", "prompt": prompt, "stream": False}
            )
            reply = res.json()["response"]

            # Check if this is the final ruling
            is_final_ruling = (phase == "ruling" and role == "judge")

            # Save log
            CaseLog.objects.create(
                case_name=case_name,
                role=role,
                message=message,
                response=reply,
                phase=phase
            )
            
            # If this is the final ruling, update the case status
            if is_final_ruling:
                try:
                    case = Case.objects.get(name=case_name)
                    case.status = "closed"
                    case.save()
                except Case.DoesNotExist:
                    pass

            return Response({
                "reply": reply,
                "trial_ended": is_final_ruling
            })

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CaseLogListView(APIView):
    def get(self, request):
        case_name = request.query_params.get("case", "Untitled Case")
        logs = CaseLog.objects.filter(case_name=case_name).order_by("timestamp")
        data = [
            {
                "role": log.role,
                "message": log.message,
                "response": log.response,
                "timestamp": log.timestamp,
                "phase": getattr(log, "phase", "opening")  # Include phase in response
            }
            for log in logs
        ]
        return Response(data)

class CaseView(APIView):
    def post(self, request):
        """Create a new case and start the trial"""
        case_data = request.data.get("case_data", "")
        case_name = request.data.get("case_name", "Untitled Case")
        
        # Create a new case
        case = Case.objects.create(
            name=case_name,
            description=case_data,
            status="active",
            current_phase="opening"  # Initialize with opening phase
        )
        
        # Initialize the trial with the judge's opening statement
        try:
            system_prompt = SYSTEM_PROMPTS["judge"] + "\nCURRENT PHASE: OPENING. This is the Opening Statements phase."
            prompt = format_prompt(
                system_prompt, 
                [], 
                f"This is a new case: {case_name}. Here are the case details: {case_data}. Please provide an opening statement to begin the trial."
            )
            
            res = requests.post(
                "http://localhost:11434/api/generate",
                json={"model": "gemma3", "prompt": prompt, "stream": False}
            )
            reply = res.json()["response"]
            
            # Save the judge's opening statement
            CaseLog.objects.create(
                case_name=case_name,
                role="judge",
                message=f"Opening statement for case: {case_name}",
                response=reply,
                phase="opening"
            )
            
            return Response({
                "case_id": case.id,
                "case_name": case_name,
                "initial_statement": reply,
                "current_phase": "opening"
            })
            
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def get(self, request):
        """Get list of all cases"""
        cases = Case.objects.all().order_by("-created_at")
        data = [
            {
                "id": case.id,
                "name": case.name,
                "created_at": case.created_at,
                "status": getattr(case, "status", "active"),
                "current_phase": getattr(case, "current_phase", "opening")
            }
            for case in cases
        ]
        return Response(data)

class TrialPhaseView(APIView):
    def post(self, request):
        """Update the current phase of a trial"""
        case_name = request.data.get("case_name")
        new_phase = request.data.get("phase")
        
        if not case_name or not new_phase:
            return Response({"error": "Case name and phase are required"}, status=status.HTTP_400_BAD_REQUEST)
        
        if new_phase not in ["opening", "interrogation", "closing", "ruling"]:
            return Response({"error": "Invalid phase"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            case = Case.objects.get(name=case_name)
            case.current_phase = new_phase
            case.save()
            
            # If moving to the ruling phase, generate a prompt for the judge
            judge_prompt = None
            if new_phase == "ruling":
                system_prompt = SYSTEM_PROMPTS["judge"] + "\nCURRENT PHASE: RULING. This is the Judge's Ruling phase."
                prompt = format_prompt(
                    system_prompt, 
                    [], 
                    f"Based on all the evidence and arguments presented in the case {case_name}, please deliver your final verdict."
                )
                
                res = requests.post(
                    "http://localhost:11434/api/generate",
                    json={"model": "gemma3", "prompt": prompt, "stream": False}
                )
                judge_prompt = res.json()["response"]
            
            return Response({
                "message": f"Trial phase updated to {new_phase}",
                "judge_prompt": judge_prompt
            })
            
        except Case.DoesNotExist:
            return Response({"error": "Case not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)