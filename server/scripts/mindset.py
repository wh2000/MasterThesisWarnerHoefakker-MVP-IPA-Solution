from openai import OpenAI
from client import client
from utils import get_boolean_completion, get_response
from nltk.tokenize import word_tokenize
import json
import sys

def extract_span(text, span_text, debug=False):
    # Check if span_text is empty and return an empty list if it is
    if not span_text.strip():
        if debug:
            print("Empty span_text provided; returning empty list.")
        return []
    # Span extraction
    # Tokenize text for more accurate span finding
    tokens = word_tokenize(text)
    text_pos = 0
    token_spans = []
    for token in tokens:
        token_pos = text.find(token, text_pos)
        token_spans.append((token, token_pos, token_pos + len(token)))
        text_pos = token_pos + len(token)

    # Splitting the text using "," as the delimiter
    examples = span_text.split(", ")

    if debug:
        print("List of sentences to handle: ", examples)

    # Find spans for each example in the text
    example_spans = []
    for feature in examples:
        feature_tokens = word_tokenize(feature)
        start_index = next((span[1] for span in token_spans if span[0] == feature_tokens[0]), None)
        # Ensure the end index search starts after the start index
        if start_index is not None:
            end_index = next((span[2] for span in token_spans if span[0] == feature_tokens[-1] and span[1] >= start_index), None)
            if end_index is not None:
                example_spans.append([start_index, end_index])
            
    if debug:
        print("Extracted spans: ", example_spans)
    return example_spans

# Schema for mindsets
schema = {
    "type": "object",  # The top-level type is an object
    "properties": {
        "mindsets": {  # Define 'mindsets' as a property of the object, which is an array
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "mindset": {
                        "type": "string",
                        "description": "Label identifying the type of mindset."
                    },
                    "value": {
                        "type": "number",
                        "description": "Value between zero and one that represents how strongly the mindset is exhibited."
                    },
                    "explanation": {
                        "type": "string",
                        "description": "A concise explanation describing how examples from the text may instill this mindset, limited to no more than three sentences."
                    },
                    "span": {
                        "type": "string",
                        "description": "List of examples as words, phrases or sentences from the text that demonstrate the mindset."
                    }
                },
                "required": ["mindset", "value", "explanation", "span"]
            }
        }
    },
    "required": ["mindsets"]  # Ensure the 'mindsets' array itself is a required property of the top-level object
}


def run_mindset_analysis(text):
    instruction = f"""Please analyze the text provided and identify any mindsets instilled in readers by specific words, phrases, or usage. For each mindset, provide a score between 0 (no presence) and 1 (strong presence), cite direct quotations from the text as examples, and give a concise explanation detailing how the text might instill the mindset in readers, focusing on the psychological mechanisms involved.

    Return the analysis in the following JSON format:
        {{
            "mindsets": [
                {{
                    "mindset": "defensive",
                    "value": 0.2,
                    "examples": “On Tuesday, drills were held to check if hospitals could handle a surge.”,
                    "explanation": "The conduct of drills to test hospital readiness suggests a defensive mindset aimed at protecting against potential threats. While preparation is generally positive, the context implies it's more about defense than about improving or optimizing processes proactively"
                }},
                {{
                    "mindset": "negative",
                    "value": 0.3,
                    "examples": “But reports of the surge in China and the memories of two deadly Covid waves in 2020 and 2021 in India have made many people fearful.”,
                    "explanation": "This sentence shows fear and concern about potential negative outcomes based on past experiences. The focus on fear due to previous traumatic events indicates a predisposition towards expecting negative results or dwelling on negative aspects, which is characteristic of a Negative Mindset."
                }}
            ]
        }}
    
    Please ensure each mindset is fully addressed before moving on to the next.
    
    """

    message = f"Text: {text}"

    functions=[
            {"name": "get_mindsets", "parameters": schema}
    ]

    response = get_response(instruction, message, temp=0, functions=functions) # Now this is in JSON string format

    try:
        response_dict = json.loads(response)
        # print("Response dictionary: ", response_dict)
    except json.JSONDecodeError as e:
        print("Failed to decode JSON:", e)
        print("Response causing issue:", response)
        return 
    
    # Accessing the list of mindsets
    mindsets_list = response_dict['mindsets']
    results = []
    # Iterating through each bias in the list
    for mindset in mindsets_list:
        feature_spans = mindset['span']
        example_spans = extract_span(text, feature_spans)

        statement = f"The {mindset['mindset']} is evident in the text."
        # confidence = get_boolean_completion(statement, text)

        results.append({
            "attribute": "mindset",
            "value": {"attribute": mindset['mindset'], "value": mindset['value']},
            "explanation": mindset['explanation'],
            "span": example_spans,
            "confidence": 0.5 # round(confidence[1][1], 2)
        })

    return json.dumps(results, indent=4)

# Example text:
prompt = """Experts have told the BBC that the current Covid surge in China is "unlikely" to impact India, but they urged people to stay cautious and wear masks.

India has stepped up surveillance after a spike in cases in neighbouring China.

People travelling from China and four other Asian countries now have to produce a Covid-19 negative test report before entering India.

On Tuesday, drills were held to check if hospitals could handle a surge.

According to government data, India currently has only around 3,400 active coronavirus cases. But reports of the surge in China and the memories of two deadly Covid waves in 2020 and 2021 in India have made many people fearful."""

# prompt = sys.argv[1]

test = run_mindset_analysis(prompt)

print(test)
