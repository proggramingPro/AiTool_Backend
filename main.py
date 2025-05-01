from fastapi import FastAPI, Request
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch

app = FastAPI()

# Load DeepSeek-Coder 1.3B model from Hugging Face
model_id = "deepseek-ai/deepseek-coder-1.3b-instruct"
tokenizer = AutoTokenizer.from_pretrained(model_id)
model = AutoModelForCausalLM.from_pretrained(
    model_id,
    torch_dtype=torch.float16,  # Use FP16 for better performance on GPU
    device_map="auto"  # Automatically use GPU if available
)

class PromptRequest(BaseModel):
    prompt: str

@app.post("/generate")
async def generate_code(req: PromptRequest):
    input_text = f"<|user|>\n{req.prompt}\n<|assistant|>"
    inputs = tokenizer(input_text, return_tensors="pt").to(model.device)
    
    # Generate code based on the prompt
    outputs = model.generate(
        **inputs,
        max_new_tokens=512,   # Adjust token length as per your need
        do_sample=True,       # Enable sampling for varied output
        temperature=0.7       # Adjust temperature for creativity/variance in output
    )

    # Decode the generated output and strip unnecessary tokens
    result = tokenizer.decode(outputs[0], skip_special_tokens=True)

    # Return only the code generated after "<|assistant|>"
    return { "result": result.split("<|assistant|>")[-1].strip() }

